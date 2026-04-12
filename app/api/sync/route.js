// app/api/sync/route.js
// ─── BOT SYNC ENDPOINT ─────────────────────────────────────────────────────
// Receives player stats and match reports from the Discord bot.
// Protected by a shared secret (BOT_SYNC_SECRET).
//
// POST /api/sync
// Body: { type: "match_report" | "full_sync", data: {...} }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request) {
  // ── Auth check ──────────────────────────────────────────────────────────
  const authHeader = request.headers.get("authorization");
  const secret = process.env.BOT_SYNC_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, data } = body;

    if (type === "match_report") {
      return await handleMatchReport(data);
    } else if (type === "full_sync") {
      return await handleFullSync(data);
    } else if (type === "season_reset") {
      return await handleSeasonReset();
    } else {
      return NextResponse.json({ error: "Unknown sync type" }, { status: 400 });
    }
  } catch (err) {
    console.error("[Sync API] Error:", err);
    return NextResponse.json({ error: "Sync failed", details: err.message }, { status: 500 });
  }
}

// ─── MATCH REPORT ───────────────────────────────────────────────────────────
// Called after every .report in Discord
async function handleMatchReport(data) {
  const { reportId, orderedPlayers, winnerId } = data;

  if (!orderedPlayers || !Array.isArray(orderedPlayers) || orderedPlayers.length < 2) {
    return NextResponse.json({ error: "Invalid match data" }, { status: 400 });
  }

  // Filter out players with 0 games (guard, bot also filters)
  const validPlayers = orderedPlayers.filter((p) => (p.games ?? 0) > 0);
  if (validPlayers.length < 2) {
    return NextResponse.json({ error: "Not enough valid players" }, { status: 400 });
  }

  // Ensure active season exists
  let season = await prisma.season.findFirst({ where: { isActive: true } });
  if (!season) {
    season = await prisma.season.create({
      data: {
        name: "Season 1",
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });
  }

  // Idempotency: if this reportId already exists, skip
  if (reportId) {
    const existing = await prisma.match.findUnique({ where: { reportId } });
    if (existing) {
      return NextResponse.json({
        success: true,
        message: `Match ${reportId} already synced`,
        skipped: true,
      });
    }
  }

  // Upsert all players in the match
  const playerRecords = {};
  for (const p of validPlayers) {
    const division = getDivision(p.rating);
    const firstPlaceCount = p.first_place ?? p.firstPlace ?? 0;
    const updated = await prisma.player.upsert({
      where: { discordId: p.id },
      update: {
        username: p.name,
        eloRating: Math.round(p.rating),
        division,
        wins: p.wins,
        losses: p.games - p.wins,
        draws: firstPlaceCount,
        favCiv: p.favCiv || null,
      },
      create: {
        username: p.name,
        discordId: p.id,
        eloRating: Math.round(p.rating),
        division,
        wins: p.wins,
        losses: p.games - p.wins,
        draws: firstPlaceCount,
        favCiv: p.favCiv || null,
      },
    });
    playerRecords[p.id] = updated;
  }

  // Find winner DB id
  const winnerRecord = winnerId ? playerRecords[winnerId] : null;

  // Create the Match row (FFA)
  const match = await prisma.match.create({
    data: {
      reportId: reportId || null,
      winnerId: winnerRecord?.id || null,
      status: "completed",
      seasonId: season.id,
      scheduledAt: new Date(),
      completedAt: new Date(),
      result: "ffa",
      notes: reportId ? `Report ID: ${reportId}` : null,
    },
  });

  // Create MatchPlayer rows for every player in placement order
  for (let i = 0; i < validPlayers.length; i++) {
    const p = validPlayers[i];
    const dbPlayer = playerRecords[p.id];
    if (!dbPlayer) continue;
    const pick = data.leaderPicks?.[p.id] || {};
    const ratingAfter = Math.round(p.rating);
    const ratingBefore = Math.round(p.ratingBefore ?? p.rating);
    await prisma.matchPlayer.create({
      data: {
        matchId: match.id,
        playerId: dbPlayer.id,
        placement: p.placement ?? i + 1,
        leader: pick.leader || null,
        civ: pick.civ || null,
        ratingBefore,
        ratingAfter,
        ratingGain: ratingAfter - ratingBefore,
      },
    });
  }

  // Sync any extra players from allPlayers (not in this match)
  if (data.allPlayers) {
    for (const [discordId, p] of Object.entries(data.allPlayers)) {
      if ((p.games ?? 0) === 0) continue;
      const division = getDivision(p.rating);
      const firstPlaceCount = p.first_place ?? p.firstPlace ?? 0;
      await prisma.player.upsert({
        where: { discordId },
        update: {
          username: p.name,
          eloRating: Math.round(p.rating),
          division,
          wins: p.wins,
          losses: p.games - p.wins,
          draws: firstPlaceCount,
        },
        create: {
          username: p.name,
          discordId,
          eloRating: Math.round(p.rating),
          division,
          wins: p.wins,
          losses: p.games - p.wins,
          draws: firstPlaceCount,
        },
      });
    }
  }

  return NextResponse.json({
    success: true,
    message: `Match report ${reportId || ""} synced`,
    matchId: match.id,
    playersRecorded: validPlayers.length,
  });
}
// ─── FULL SYNC ──────────────────────────────────────────────────────────────
// Called for daily reconciliation or manual .sync command
async function handleFullSync(data) {
  const { players: allPlayers, reports } = data;
  // allPlayers: { "discord_id": { name, rating, rd, vol, games, wins, cc_wins, leaders } }

  if (!allPlayers || typeof allPlayers !== "object") {
    return NextResponse.json({ error: "Invalid sync data" }, { status: 400 });
  }

  let updated = 0;

  for (const [discordId, p] of Object.entries(allPlayers)) {
    if ((p.games ?? 0) === 0) continue;
    const division = getDivision(p.rating);

    // Find most-played leader for favCiv
    let favCiv = null;
    if (p.leaders && typeof p.leaders === "object") {
      let maxGames = 0;
      for (const [leader, lStats] of Object.entries(p.leaders)) {
        if (lStats.games > maxGames) {
          maxGames = lStats.games;
          favCiv = leader;
        }
      }
    }

    await prisma.player.upsert({
      where: { discordId },
      update: {
        username: p.name,
        eloRating: Math.round(p.rating),
        division,
        wins: p.wins,
        losses: p.games - p.wins,
        draws: p.first_place ?? p.firstPlace ?? 0,
        favCiv,
      },
      create: {
        username: p.name,
        discordId,
        eloRating: Math.round(p.rating),
        division,
        wins: p.wins,
        losses: p.games - p.wins,
        draws: p.first_place ?? p.firstPlace ?? 0,
        favCiv,
      },
    });
    updated++;
  }

  return NextResponse.json({
    success: true,
    message: "Full sync complete",
    playersUpdated: updated,
  });
}

// ─── SEASON RESET ───────────────────────────────────────────────────────────
async function handleSeasonReset() {
  // Delete all matches
  await prisma.match.deleteMany({});

  // Reset all player stats
  await prisma.player.updateMany({
    data: {
      eloRating: 1500,
      wins: 0,
      losses: 0,
      draws: 0,
      division: "Emperor",
      favCiv: null,
    },
  });

  return NextResponse.json({ success: true, message: "Season reset complete" });
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

function getDivision(rating) {
  if (rating >= 1800) return "Deity";
  if (rating >= 1650) return "Immortal";
  if (rating >= 1500) return "Emperor";
  if (rating >= 1350) return "King";
  return "Prince";
}
