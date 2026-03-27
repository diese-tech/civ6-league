// app/tierlist/page.js
import { prisma } from "@/lib/db";
import TierListClient from "./TierListClient";
import Link from "next/link";

export const revalidate = 60;
export const metadata = { title: "Leader Tier List — Strategy Inc" };

export default async function TierListPage() {
  const matches = await prisma.match.findMany({
    where: { status: "completed" },
    select: { player1Civ: true, player2Civ: true, result: true },
  });

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

  // Get community tier lists
  let communityLists = [];
  try {
    communityLists = await prisma.tierList.findMany({
      where: { isPublic: true },
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: {
        player: { select: { id: true, username: true } },
        _count: { select: { entries: true } },
      },
    });
  } catch {}

  const ser = (d) => (d instanceof Date ? d.toISOString() : d);

  return (
    <div>
      <TierListClient leaders={leaders} totalGames={totalGames} />

      {/* Community Tier Lists Section */}
      <section className="max-w-5xl mx-auto px-6 pb-12">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">Community Tier Lists</h2>
            <div className="w-10 h-0.5 bg-gold mt-2" />
          </div>
          <Link href="/tierlist/create" className="px-5 py-2 bg-gold text-[var(--bg-primary)] font-condensed text-xs font-semibold tracking-widest uppercase rounded-md hover:bg-gold-bright transition-all">
            Create Your Own
          </Link>
        </div>

        {communityLists.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {communityLists.map((tl) => (
              <Link key={tl.id} href={`/tierlist/${tl.slug}`} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 hover:border-gold/30 transition-colors">
                <div className="font-condensed text-base font-semibold mb-1">{tl.title}</div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span className="font-semibold text-[var(--text-secondary)]">{tl.player.username}</span>
                  <span>·</span>
                  <span>{tl._count.entries} leaders</span>
                  <span>·</span>
                  <span>{new Date(tl.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-8 text-center">
            <p className="text-[var(--text-muted)] mb-4">No community tier lists yet. Be the first!</p>
            <Link href="/tierlist/create" className="px-5 py-2 bg-gold text-[var(--bg-primary)] font-condensed text-xs font-semibold tracking-widest uppercase rounded-md">
              Create Tier List
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
