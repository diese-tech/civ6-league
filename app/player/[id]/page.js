// app/player/[id]/page.js
import { prisma } from "@/lib/db";
import { getDivisionInfo } from "@/lib/constants";
import { notFound } from "next/navigation";
import PlayerProfile from "./PlayerProfile";

export const revalidate = 30;

export async function generateMetadata({ params }) {
  const player = await prisma.player.findUnique({ where: { id: parseInt(params.id) } });
  return { title: player ? `${player.username} — Strategy Inc` : "Player Not Found" };
}

export default async function PlayerPage({ params }) {
  const player = await prisma.player.findUnique({
    where: { id: parseInt(params.id) },
    include: { badges: true },
  });
  if (!player) notFound();

  const allPlayers = await prisma.player.findMany({ orderBy: { eloRating: "desc" } });
  const rank = allPlayers.findIndex((p) => p.id === player.id) + 1;

  const matches = await prisma.match.findMany({
    where: { OR: [{ player1Id: player.id }, { player2Id: player.id }], status: "completed" },
    orderBy: { completedAt: "asc" },
    include: {
      player1: { select: { id: true, username: true } },
      player2: { select: { id: true, username: true } },
    },
  });

  // Rating history
  const ratingHistory = [];
  for (const m of matches) {
    const isP1 = m.player1Id === player.id;
    const eloAfter = isP1 ? m.player1EloAfter : m.player2EloAfter;
    if (eloAfter != null) {
      ratingHistory.push({ date: (m.completedAt || m.scheduledAt).toISOString(), rating: eloAfter, gameNumber: ratingHistory.length + 1 });
    }
  }

  // Leader stats
  const leaderMap = {};
  for (const m of matches) {
    const isP1 = m.player1Id === player.id;
    const leader = isP1 ? m.player1Civ : m.player2Civ;
    if (!leader) continue;
    if (!leaderMap[leader]) leaderMap[leader] = { games: 0, wins: 0 };
    leaderMap[leader].games += 1;
    if ((isP1 && m.result === "1-0") || (!isP1 && m.result === "0-1")) leaderMap[leader].wins += 1;
  }
  const leaderStats = Object.entries(leaderMap).map(([name, s]) => ({
    name, games: s.games, wins: s.wins, losses: s.games - s.wins,
    winRate: s.games > 0 ? Math.round((s.wins / s.games) * 100) : 0,
  })).sort((a, b) => b.games - a.games);

  // Head to head
  const h2hMap = {};
  for (const m of matches) {
    const isP1 = m.player1Id === player.id;
    const opp = isP1 ? m.player2 : m.player1;
    if (!h2hMap[opp.id]) h2hMap[opp.id] = { id: opp.id, username: opp.username, wins: 0, losses: 0 };
    if ((isP1 && m.result === "1-0") || (!isP1 && m.result === "0-1")) h2hMap[opp.id].wins += 1;
    else h2hMap[opp.id].losses += 1;
  }
  const h2h = Object.values(h2hMap).sort((a, b) => (b.wins + b.losses) - (a.wins + a.losses));

  // Streaks
  let best = 0, worst = 0, current = 0;
  for (const m of matches) {
    const isP1 = m.player1Id === player.id;
    const isWin = (isP1 && m.result === "1-0") || (!isP1 && m.result === "0-1");
    current = isWin ? (current > 0 ? current + 1 : 1) : (current < 0 ? current - 1 : -1);
    if (current > best) best = current;
    if (current < worst) worst = current;
  }

  // Recent form
  const recentForm = [...matches].reverse().slice(0, 10).map((m) => {
    const isP1 = m.player1Id === player.id;
    return (isP1 && m.result === "1-0") || (!isP1 && m.result === "0-1") ? "W" : "L";
  });

  const peak = ratingHistory.length > 0 ? Math.max(...ratingHistory.map((r) => r.rating)) : player.eloRating;
  const floor = ratingHistory.length > 0 ? Math.min(...ratingHistory.map((r) => r.rating)) : player.eloRating;
  const div = getDivisionInfo(player.division);
  const totalGames = player.wins + player.losses;
  const winRate = totalGames > 0 ? Math.round((player.wins / totalGames) * 100) : 0;

  const ser = (d) => (d instanceof Date ? d.toISOString() : d);

  return (
    <PlayerProfile
      player={{ ...player, createdAt: ser(player.createdAt), updatedAt: ser(player.updatedAt), badges: player.badges.map((b) => ({ ...b, awardedAt: ser(b.awardedAt) })) }}
      division={div}
      rank={rank}
      totalPlayers={allPlayers.length}
      winRate={winRate}
      totalGames={totalGames}
      matches={[...matches].reverse().map((m) => ({ ...m, scheduledAt: ser(m.scheduledAt), completedAt: ser(m.completedAt), createdAt: ser(m.createdAt), updatedAt: ser(m.updatedAt) }))}
      ratingHistory={ratingHistory}
      leaderStats={leaderStats}
      h2h={h2h}
      recentForm={recentForm}
      peakRating={peak}
      floorRating={floor}
      bestWinStreak={best}
      worstLossStreak={Math.abs(worst)}
      currentStreak={current}
    />
  );
}
