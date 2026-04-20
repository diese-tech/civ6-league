// app/matches/page.js
import { prisma } from "@/lib/db";
import MatchesClient from "./MatchesClient";

export const revalidate = 30;
export const metadata = { title: "Matches — Civ VI League" };

export default async function MatchesPage() {
  const matches = await prisma.match.findMany({
    orderBy: { scheduledAt: "desc" },
    include: {
      player1: { select: { id: true, username: true, eloRating: true } },
      player2: { select: { id: true, username: true, eloRating: true } },
      players: {
        orderBy: { placement: "asc" },
        include: {
          player: { select: { id: true, username: true, eloRating: true } },
        },
      },
    },
  });

  const ser = (d) => (d instanceof Date ? d.toISOString() : d);
  const serialized = matches.map((m) => ({
    ...m,
    scheduledAt: ser(m.scheduledAt),
    completedAt: ser(m.completedAt),
    createdAt: ser(m.createdAt),
    updatedAt: ser(m.updatedAt),
    players: m.players.map((mp) => ({
      ...mp,
      createdAt: ser(mp.createdAt),
    })),
  }));

  return <MatchesClient matches={serialized} />;
}