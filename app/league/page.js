// app/league/page.js
import { prisma } from "@/lib/db";
import { DIVISIONS } from "@/lib/constants";
import LeagueClient from "./LeagueClient";

export const dynamic = "force-dynamic";
export const revalidate = 60;
export const metadata = { title: "League Structure — Civ VI League" };

export default async function LeaguePage() {
  const [players, seasons] = await Promise.all([
    prisma.player.findMany({ orderBy: { eloRating: "desc" } }),
    prisma.season.findMany({ orderBy: { startDate: "desc" } }),
  ]);

  const ser = (d) => (d instanceof Date ? d.toISOString() : d);

  return (
    <LeagueClient
      players={players.map((p) => ({ ...p, createdAt: ser(p.createdAt), updatedAt: ser(p.updatedAt) }))}
      seasons={seasons.map((s) => ({ ...s, startDate: ser(s.startDate), endDate: ser(s.endDate), createdAt: ser(s.createdAt) }))}
      divisions={DIVISIONS}
    />
  );
}
