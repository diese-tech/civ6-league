// app/leaderboard/page.js
import { prisma } from "@/lib/db";
import { DIVISIONS } from "@/lib/constants";
import LeaderboardClient from "./LeaderboardClient";

export const dynamic = "force-dynamic";
export const revalidate = 30;
export const metadata = { title: "Rankings — Civ VI League" };

export default async function LeaderboardPage() {
  const [players, seasons] = await Promise.all([
    prisma.player.findMany({ orderBy: { eloRating: "desc" }, include: { badges: true } }),
    prisma.season.findMany({ orderBy: { startDate: "desc" } }),
  ]);

  const ser = (d) => (d instanceof Date ? d.toISOString() : d);

  return (
    <LeaderboardClient
      players={players.map((p) => ({ ...p, createdAt: ser(p.createdAt), updatedAt: ser(p.updatedAt), badges: p.badges.map((b) => ({ ...b, awardedAt: ser(b.awardedAt) })) }))}
      divisions={DIVISIONS}
      seasons={seasons.map((s) => ({ ...s, startDate: ser(s.startDate), endDate: ser(s.endDate), createdAt: ser(s.createdAt) }))}
    />
  );
}
