// app/api/matches/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { processMatchResult } from "@/lib/elo";

// GET /api/matches?status=completed&seasonId=2&limit=20
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const seasonId = searchParams.get("seasonId");
  const limit = parseInt(searchParams.get("limit") || "30");

  const where = {};
  if (status) where.status = status;
  if (seasonId) where.seasonId = parseInt(seasonId);

  const matches = await prisma.match.findMany({
    where,
    orderBy: { scheduledAt: "desc" },
    take: limit,
    include: {
      player1: { select: { id: true, username: true, eloRating: true, division: true } },
      player2: { select: { id: true, username: true, eloRating: true, division: true } },
      season: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ matches });
}

// POST /api/matches — Create a match OR submit a result
export async function POST(request) {
  try {
    const body = await request.json();

    // ── Submit result for existing match ──────────────────────────────
    if (body.matchId && body.result) {
      const match = await prisma.match.findUnique({
        where: { id: body.matchId },
        include: { player1: true, player2: true },
      });

      if (!match) {
        return NextResponse.json({ error: "Match not found" }, { status: 404 });
      }
      if (match.status === "completed") {
        return NextResponse.json({ error: "Match already completed" }, { status: 400 });
      }

      // Calculate ELO changes
      const result = processMatchResult(match.player1, match.player2, body.result);

      // Update everything in a transaction
      await prisma.$transaction([
        // Update match
        prisma.match.update({
          where: { id: match.id },
          data: {
            result: body.result,
            status: "completed",
            completedAt: new Date(),
            player1Civ: body.player1Civ || match.player1Civ,
            player2Civ: body.player2Civ || match.player2Civ,
            map: body.map || match.map,
            replayUrl: body.replayUrl || null,
            player1EloBefore: result.player1.eloBefore,
            player1EloAfter: result.player1.eloAfter,
            player2EloBefore: result.player2.eloBefore,
            player2EloAfter: result.player2.eloAfter,
          },
        }),
        // Update player 1
        prisma.player.update({
          where: { id: match.player1Id },
          data: {
            eloRating: result.player1.eloAfter,
            division: result.player1.division,
            wins: { increment: result.player1.winsInc },
            losses: { increment: result.player1.lossesInc },
            draws: { increment: result.player1.drawsInc },
            streak: result.player1.streak,
          },
        }),
        // Update player 2
        prisma.player.update({
          where: { id: match.player2Id },
          data: {
            eloRating: result.player2.eloAfter,
            division: result.player2.division,
            wins: { increment: result.player2.winsInc },
            losses: { increment: result.player2.lossesInc },
            draws: { increment: result.player2.drawsInc },
            streak: result.player2.streak,
          },
        }),
      ]);

      return NextResponse.json({ success: true, eloChanges: result });
    }

    // ── Create new scheduled match ───────────────────────────────────
    const { player1Id, player2Id, scheduledAt, seasonId, map } = body;

    if (!player1Id || !player2Id || !scheduledAt || !seasonId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (player1Id === player2Id) {
      return NextResponse.json({ error: "Players must be different" }, { status: 400 });
    }

    const match = await prisma.match.create({
      data: {
        player1Id: parseInt(player1Id),
        player2Id: parseInt(player2Id),
        scheduledAt: new Date(scheduledAt),
        seasonId: parseInt(seasonId),
        map: map || "TBD",
        status: "scheduled",
      },
      include: { player1: true, player2: true },
    });

    return NextResponse.json(match, { status: 201 });
  } catch (err) {
    console.error("Match API error:", err);
    return NextResponse.json({ error: "Failed to process match" }, { status: 500 });
  }
}
