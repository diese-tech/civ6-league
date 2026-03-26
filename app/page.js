// app/page.js
// ─── HOMEPAGE ───────────────────────────────────────────────────────────────
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getDivisionInfo, DIVISIONS } from "@/lib/constants";

// Revalidate every 60 seconds so data stays fresh
export const revalidate = 60;

export default async function HomePage() {
  // Fetch all data in parallel
  const [players, activeSeason, recentMatches, upcomingMatches, announcements] =
    await Promise.all([
      prisma.player.findMany({ orderBy: { eloRating: "desc" }, take: 5 }),
      prisma.season.findFirst({ where: { isActive: true } }),
      prisma.match.findMany({
        where: { status: "completed" },
        orderBy: { completedAt: "desc" },
        take: 3,
        include: { player1: true, player2: true },
      }),
      prisma.match.findMany({
        where: { status: "scheduled" },
        orderBy: { scheduledAt: "asc" },
        take: 3,
        include: { player1: true, player2: true },
      }),
      prisma.announcement.findMany({
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        take: 4,
      }),
    ]);

  const totalPlayers = await prisma.player.count();
  const totalMatches = await prisma.match.count({ where: { status: "completed" } });

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative py-24 md:py-32 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(197,164,78,0.06),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-6 fade-in">
          <p className="font-condensed text-xs tracking-[5px] uppercase text-gold-dim mb-5">
            Competitive Civilization VI League
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-tight mb-4">
            Build Your Empire.
            <br />
            Prove Your <span className="text-gold">Dominance</span>.
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-10 leading-relaxed font-light">
            Join the premier competitive Civ VI community. Ranked divisions, ELO
            matchmaking, seasonal tournaments, and a thriving community of
            strategy enthusiasts.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="https://discord.gg/WtNeHbXbjj"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3 bg-[#5865F2] text-white font-condensed text-sm font-semibold tracking-widest uppercase rounded-md hover:bg-[#4752C4] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(88,101,242,0.3)] transition-all"
            >
              💬 Join Our Discord
            </a>
          </div>
        </div>
      </section>

      {/* ── Active Season Banner ───────────────────────────────────────── */}
      {activeSeason && (
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <div className="p-6 rounded-xl border border-gold-dim bg-gradient-to-br from-gold/[0.08] to-accent/[0.04] flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="live-dot" />
                <span className="font-condensed text-[11px] tracking-[2px] uppercase text-[var(--green)]">
                  Active Season
                </span>
              </div>
              <div className="font-display text-xl font-bold text-gold">
                {activeSeason.name}
              </div>
              <div className="text-sm text-[var(--text-muted)] mt-1 font-mono">
                {new Date(activeSeason.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                —{" "}
                {new Date(activeSeason.endDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
            <Link
              href="/matches"
              className="px-5 py-2 bg-gold text-[var(--bg-primary)] font-condensed text-xs font-semibold tracking-widest uppercase rounded-md"
            >
              View Schedule
            </Link>
          </div>
        </div>
      )}

      {/* ── Stats Row ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { val: totalPlayers, label: "Players" },
            { val: totalMatches, label: "Matches Played" },
            { val: DIVISIONS.length, label: "Divisions" },
            { val: activeSeason ? "Active" : "Off-Season", label: "Status" },
          ].map(({ val, label }) => (
            <div
              key={label}
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-5 text-center"
            >
              <div className="font-display text-2xl md:text-3xl font-bold text-gold">
                {val}
              </div>
              <div className="font-condensed text-[11px] tracking-[2px] uppercase text-[var(--text-muted)] mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Top Players + Recent Matches ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Top Ranked */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-display text-lg text-gold">Top Ranked</h3>
              <Link
                href="/leaderboard"
                className="px-4 py-1.5 border border-[var(--border-bright)] text-[var(--text-secondary)] font-condensed text-xs tracking-wider uppercase rounded-md hover:text-[var(--text-primary)]"
              >
                Full Rankings
              </Link>
            </div>
            {players.map((p, i) => {
              const div = getDivisionInfo(p.division);
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 py-3 ${
                    i < 4 ? "border-b border-[var(--border)]" : ""
                  }`}
                >
                  <span
                    className={`font-display text-base font-bold w-7 text-center ${
                      i === 0 ? "text-gold" : "text-[var(--text-muted)]"
                    }`}
                  >
                    #{i + 1}
                  </span>
                  <div className="flex-1">
                    <Link
                      href={`/player/${p.id}`}
                      className="font-condensed text-[15px] font-semibold hover:text-gold transition-colors"
                    >
                      {p.username}
                    </Link>
                    <div className="text-xs text-[var(--text-muted)]">
                      {div.icon} {div.name}
                    </div>
                  </div>
                  <span
                    className="font-mono text-sm font-medium"
                    style={{ color: div.color }}
                  >
                    {p.eloRating}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Recent + Upcoming */}
          <div className="space-y-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
              <h3 className="font-display text-lg text-gold mb-4">
                Recent Results
              </h3>
              {recentMatches.map((m) => {
                const p1Won = m.result?.startsWith("1");
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-b-0 gap-2"
                  >
                    <Link
                      href={`/player/${m.player1.id}`}
                      className={`font-condensed text-sm flex-1 ${
                        p1Won ? "font-bold text-gold" : "text-[var(--text-secondary)]"
                      }`}
                    >
                      {m.player1.username}
                    </Link>
                    <span className="font-display text-sm text-[var(--text-muted)] px-2">
                      {m.result === "draw" ? "Draw" : m.result}
                    </span>
                    <Link
                      href={`/player/${m.player2.id}`}
                      className={`font-condensed text-sm flex-1 text-right ${
                        !p1Won && m.result !== "draw"
                          ? "font-bold text-gold"
                          : "text-[var(--text-secondary)]"
                      }`}
                    >
                      {m.player2.username}
                    </Link>
                  </div>
                );
              })}
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
              <h3 className="font-display text-lg text-accent mb-4">
                Upcoming
              </h3>
              {upcomingMatches.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-b-0 gap-2"
                >
                  <span className="font-condensed text-sm flex-1">
                    {m.player1.username}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--text-muted)] px-2">
                    {new Date(m.scheduledAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="font-condensed text-sm flex-1 text-right">
                    {m.player2.username}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Announcements ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <h2 className="font-display text-2xl font-bold mb-1">
          News & Announcements
        </h2>
        <div className="w-10 h-0.5 bg-gold mb-8" />
        <div className="grid md:grid-cols-2 gap-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--border-bright)] transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                {a.isPinned && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-condensed font-semibold tracking-wider uppercase bg-gold/15 text-gold border border-gold/25">
                    Pinned
                  </span>
                )}
                <span className="font-mono text-[11px] text-[var(--text-muted)]">
                  {new Date(a.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h3 className="font-display text-base font-semibold mb-2">
                {a.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {a.content}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divisions ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">Divisions</h2>
            <div className="w-10 h-0.5 bg-gold mt-2" />
          </div>
          <Link
            href="/league"
            className="px-4 py-1.5 border border-[var(--border-bright)] text-[var(--text-secondary)] font-condensed text-xs tracking-wider uppercase rounded-md"
          >
            View League Structure
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {DIVISIONS.map((d) => (
            <Link
              key={d.name}
              href="/league"
              className="bg-[var(--bg-card)] border rounded-xl p-5 text-center hover:border-[var(--border-bright)] transition-all"
              style={{ borderColor: d.color + "22" }}
            >
              <div className="text-3xl mb-2">{d.icon}</div>
              <div
                className="font-display text-base font-bold"
                style={{ color: d.color }}
              >
                {d.name}
              </div>
              <div className="font-mono text-xs text-[var(--text-muted)] mt-1">
                {d.rankRange}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Discord CTA ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="rounded-xl border border-[#5865F2] bg-gradient-to-br from-[#5865F2]/[0.08] to-gold/[0.04] p-12 text-center">
          <div className="text-4xl mb-3">💬</div>
          <h3 className="font-display text-2xl font-bold mb-2">
            Join Our Discord
          </h3>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-6">
            Connect with fellow players, find matches, discuss strategy, and
            stay updated on league news.
          </p>
          <a
            href={
              "https://discord.gg/WtNeHbXbjj"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-7 py-3 bg-[#5865F2] text-white font-condensed text-sm font-semibold tracking-widest uppercase rounded-md hover:bg-[#4752C4] transition-all"
          >
            Open Discord Server
          </a>
        </div>
      </section>
    </div>
  );
}
