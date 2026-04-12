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
  const { reportId, orderedPlayers, winnerId, isCC, players: playerStats } = data;
  // orderedPlayers: [{id, name, rating, rd, games, wins, cc_wins}, ...]
  // winnerId: Discord user ID of winner
  // playerStats: full stats object for all players in the match

  if (!orderedPlayers || !Array.isArray(orderedPlayers) || orderedPlayers.length < 2) {
    return NextResponse.json({ error: "Invalid match data" }, { status: 400 });
  }

  // Ensure active season exists
  let season = await prisma.season.findFirst({ where: { isActive: true } });
  if (!season) {
    season = await prisma.season.create({
      data: {
        name: "Season 1",
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // +90 days
        isActive: true,
      },
    });
  }

  // Upsert all players in the match
  for (const p of orderedPlayers) {
    const division = getDivision(p.rating);
    await prisma.player.upsert({
      where: { discordId: p.id },
      update: {
        username: p.name,
        eloRating: Math.round(p.rating),
        division,
        wins: p.wins,
        losses: p.games - p.wins,
        draws: p.first_place ?? p.firstPlace ?? 0,
        favCiv: p.favCiv || null,
      },
      create: {
        username: p.name,
        discordId: p.id,
        eloRating: Math.round(p.rating),
        division,
        wins: p.wins,
        losses: p.games - p.wins,
        draws: p.first_place ?? p.firstPlace ?? 0,
        favCiv: p.favCiv || null,
      },
    });
  }

  // Get player DB records for match creation
  const winner = await prisma.player.findUnique({ where: { discordId: winnerId } });
  const player1Data = await prisma.player.findUnique({ where: { discordId: orderedPlayers[0].id } });
  const player2Data = await prisma.player.findUnique({ where: { discordId: orderedPlayers[1].id } });

  if (player1Data && player2Data) {
    // Create match record
    const isP1Winner = orderedPlayers[0].id === winnerId;
    await prisma.match.create({
      data: {
        player1Id: player1Data.id,
        player2Id: player2Data.id,
        result: isP1Winner ? "1-0" : "0-1",
        status: "completed",
        seasonId: season.id,
        scheduledAt: new Date(),
        completedAt: new Date(),
        player1EloBefore: Math.round(orderedPlayers[0].ratingBefore || orderedPlayers[0].rating),
        player1EloAfter: Math.round(orderedPlayers[0].rating),
        player2EloBefore: Math.round(orderedPlayers[1].ratingBefore || orderedPlayers[1].rating),
        player2EloAfter: Math.round(orderedPlayers[1].rating),
        notes: reportId ? `Report ID: ${reportId}` : null,
        player1Civ: data.leaderPicks?.[orderedPlayers[0]?.id]?.leader || null,
        player2Civ: data.leaderPicks?.[orderedPlayers[1]?.id]?.leader || null,
      },
    });
  }

  // If more than 2 players (FFA), record additional matchups for display
  if (orderedPlayers.length > 2) {
    // Just record 1st vs last as the primary match, others tracked via notes
    // Full FFA tracking can be added later
  }

  // Sync ALL player stats if provided (handles players not in this match)
  if (data.allPlayers) {
    for (const [discordId, p] of Object.entries(data.allPlayers)) {
      const division = getDivision(p.rating);
      await prisma.player.upsert({
        where: { discordId },
        update: {
          username: p.name,
          eloRating: Math.round(p.rating),
          division,
          wins: p.wins,
          losses: p.games - p.wins,
	  draws: p.first_place ?? p.firstPlace ?? 0,
        },
        create: {
          username: p.name,
          discordId,
          eloRating: Math.round(p.rating),
          division,
          wins: p.wins,
          losses: p.games - p.wins,
	  draws: p.first_place ?? p.firstPlace ?? 0,
        },
      });
    }
  }

  return NextResponse.json({
    success: true,
    message: `Match report ${reportId || ""} synced`,
    playersUpdated: orderedPlayers.length,
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
