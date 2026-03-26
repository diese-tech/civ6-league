// app/tierlist/page.js
import { prisma } from "@/lib/db";
import TierListClient from "./TierListClient";

export const revalidate = 60;
export const metadata = { title: "Leader Tier List — Strategy Inc" };

export default async function TierListPage() {
  const matches = await prisma.match.findMany({
    where: { status: "completed" },
    select: { player1Civ: true, player2Civ: true, result: true },
  });

  // Aggregate leader stats
  const leaderMap = {};
  for (const m of matches) {
    if (m.player1Civ) {
      if (!leaderMap[m.player1Civ]) leaderMap[m.player1Civ] = { games: 0, wins: 0 };
      leaderMap[m.player1Civ].games += 1;
      if (m.result === "1-0") leaderMap[m.player1Civ].wins += 1;
    }
    if (m.player2Civ) {
      if (!leaderMap[m.player2Civ]) leaderMap[m.player2Civ] = { games: 0, wins: 0 };
      leaderMap[m.player2Civ].games += 1;
      if (m.result === "0-1") leaderMap[m.player2Civ].wins += 1;
    }
  }

  const totalGames = matches.length;
  const leaders = Object.entries(leaderMap)
    .map(([name, s]) => ({
      name,
      games: s.games,
      wins: s.wins,
      losses: s.games - s.wins,
      winRate: s.games > 0 ? Math.round((s.wins / s.games) * 100) : 0,
      pickRate: totalGames > 0 ? Math.round((s.games / (totalGames * 2)) * 100) : 0,
    }))
    .sort((a, b) => b.winRate - a.winRate || b.games - a.games);

  return <TierListClient leaders={leaders} totalGames={totalGames} />;
}
