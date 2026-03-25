// app/player/[id]/page.js
import { prisma } from "@/lib/db";
import { getDivisionInfo } from "@/lib/constants";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 30;

export async function generateMetadata({ params }) {
  const player = await prisma.player.findUnique({ where: { id: parseInt(params.id) } });
  return { title: player ? `${player.username} — Civ VI League` : "Player Not Found" };
}

export default async function PlayerPage({ params }) {
  const player = await prisma.player.findUnique({
    where: { id: parseInt(params.id) },
    include: { badges: true },
  });

  if (!player) notFound();

  const matches = await prisma.match.findMany({
    where: { OR: [{ player1Id: player.id }, { player2Id: player.id }] },
    orderBy: { scheduledAt: "desc" },
    include: {
      player1: { select: { id: true, username: true } },
      player2: { select: { id: true, username: true } },
    },
  });

  const div = getDivisionInfo(player.division);
  const winRate = (() => { const t = player.wins + player.losses + player.draws; return t === 0 ? 0 : Math.round((player.wins / t) * 100); })();
  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <Link href="/leaderboard" className="inline-block px-4 py-2 border border-[var(--border-bright)] text-[var(--text-secondary)] font-condensed text-xs tracking-wider uppercase rounded-md hover:text-[var(--text-primary)] mb-6">
        ← Back to Rankings
      </Link>

      {/* Profile Header */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-8 mb-6 fade-in">
        <div className="flex gap-8 items-start flex-wrap md:flex-nowrap">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-dim to-[var(--bg-card)] flex items-center justify-center font-display text-4xl font-bold text-gold-bright border-2 border-gold-dim shrink-0">
            {player.username[0]}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl font-extrabold mb-1">{player.username}</h1>
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <span className="font-condensed text-base" style={{ color: div.color }}>{div.icon} {div.name} Division</span>
              <span className="font-mono text-sm text-[var(--text-muted)]">Joined {fmt(player.createdAt)}</span>
            </div>
            {player.badges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {player.badges.map((b) => (
                  <span key={b.id} className="px-2.5 py-0.5 rounded-full text-[11px] font-condensed font-semibold tracking-wider uppercase bg-gold/15 text-gold border border-gold/25">
                    {b.icon} {b.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ELO Display */}
          <div className="text-center shrink-0">
            <div className="font-display text-5xl font-extrabold leading-none" style={{ color: div.color }}>{player.eloRating}</div>
            <div className="font-condensed text-[11px] tracking-[2px] uppercase text-[var(--text-muted)] mt-1">ELO Rating</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
        {[
          { val: player.wins, label: "Wins", color: "var(--green)" },
          { val: player.losses, label: "Losses", color: "var(--red)" },
          { val: player.draws, label: "Draws", color: "var(--text-muted)" },
          { val: `${winRate}%`, label: "Win Rate", color: "var(--gold)" },
          { val: player.streak > 0 ? `W${player.streak}` : player.streak < 0 ? `L${Math.abs(player.streak)}` : "—", label: "Streak", color: player.streak > 0 ? "var(--green)" : player.streak < 0 ? "var(--red)" : "var(--text-muted)" },
          { val: player.favCiv || "—", label: "Favorite Civ", color: "var(--accent)", small: true },
        ].map(({ val, label, color, small }) => (
          <div key={label} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4 text-center">
            <div className={`font-display font-bold ${small ? "text-lg" : "text-2xl"}`} style={{ color }}>{val}</div>
            <div className="font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)] mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Match History */}
      <h2 className="font-display text-2xl font-bold mb-1">Match History</h2>
      <div className="w-10 h-0.5 bg-gold mb-6" />

      <div className="space-y-2">
        {matches.map((m) => {
          const isP1 = m.player1Id === player.id;
          const opp = isP1 ? m.player2 : m.player1;
          let outcome = "scheduled";
          if (m.result === "draw") outcome = "draw";
          else if (m.result) outcome = (isP1 && m.result.startsWith("1")) || (!isP1 && m.result.startsWith("0")) ? "win" : "loss";

          const civ = isP1 ? m.player1Civ : m.player2Civ;
          const eloChange = isP1
            ? (m.player1EloAfter && m.player1EloBefore ? m.player1EloAfter - m.player1EloBefore : null)
            : (m.player2EloAfter && m.player2EloBefore ? m.player2EloAfter - m.player2EloBefore : null);

          return (
            <div key={m.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-5 py-3 flex items-center justify-between flex-wrap gap-3 hover:border-[var(--border-bright)] transition-colors">
              <div className="flex items-center gap-3">
                {outcome === "win" && <span className="px-2 py-0.5 rounded-full text-[10px] font-condensed font-bold tracking-wider uppercase bg-[var(--green)]/10 text-[var(--green)] border border-[var(--green)]/20 w-14 text-center">Win</span>}
                {outcome === "loss" && <span className="px-2 py-0.5 rounded-full text-[10px] font-condensed font-bold tracking-wider uppercase bg-[var(--red)]/10 text-[var(--red)] border border-[var(--red)]/20 w-14 text-center">Loss</span>}
                {outcome === "draw" && <span className="px-2 py-0.5 rounded-full text-[10px] font-condensed font-bold tracking-wider uppercase bg-[var(--text-muted)]/10 text-[var(--text-muted)] border border-[var(--text-muted)]/20 w-14 text-center">Draw</span>}
                {outcome === "scheduled" && <span className="px-2 py-0.5 rounded-full text-[10px] font-condensed font-bold tracking-wider uppercase bg-accent/10 text-accent border border-accent/20 w-14 text-center">{m.status}</span>}
                <span className="text-sm">
                  vs{" "}
                  <Link href={`/player/${opp.id}`} className="font-semibold hover:text-gold transition-colors">{opp.username}</Link>
                </span>
                {eloChange !== null && (
                  <span className={`font-mono text-xs ${eloChange >= 0 ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
                    {eloChange >= 0 ? "+" : ""}{eloChange}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {civ && <span className="text-xs text-[var(--text-muted)]">{civ}</span>}
                {m.map && m.map !== "TBD" && <span className="text-xs text-[var(--text-muted)]">{m.map}</span>}
                <span className="font-mono text-[11px] text-[var(--text-muted)]">{fmt(m.scheduledAt)}</span>
              </div>
            </div>
          );
        })}
        {matches.length === 0 && (
          <div className="text-center py-12 text-[var(--text-muted)]">No matches recorded yet.</div>
        )}
      </div>
    </section>
  );
}
