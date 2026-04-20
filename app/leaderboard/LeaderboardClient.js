// app/leaderboard/LeaderboardClient.js
"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

function EloBar({ rating, max = 2200, color }) {
  const pct = Math.min((rating / max) * 100, 100);
  return (
    <div className="h-1.5 bg-[var(--bg-input)] rounded-full mt-1.5 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function LeaderboardClient({ players, divisions, seasons }) {
  const [divFilter, setDivFilter] = useState("all");
  const [seasonFilter, setSeasonFilter] = useState(seasons.find((s) => s.isActive)?.id || seasons[0]?.id);

  const filtered = useMemo(() => {
    let p = [...players];
    if (divFilter !== "all") p = p.filter((x) => x.division === divFilter);
    return p;
  }, [players, divFilter]);

  const getDivInfo = (name) => divisions.find((d) => d.name === name) || divisions[4];
  const winRate = (p) => { const t = p.wins + p.losses; return t === 0 ? 0 : Math.round((p.wins / t) * 100); };
  const games = (p) => p.wins + p.losses;

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Leaderboard</h1>
          <div className="w-10 h-0.5 bg-gold mt-2" />
        </div>
        <div className="flex gap-3 flex-wrap">
          <select
            className="px-4 py-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] font-condensed outline-none focus:border-gold-dim"
            value={divFilter}
            onChange={(e) => setDivFilter(e.target.value)}
          >
            <option value="all">All Divisions</option>
            {divisions.map((d) => (
              <option key={d.name} value={d.name}>{d.icon} {d.name}</option>
            ))}
          </select>
          <select
            className="px-4 py-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] font-condensed outline-none focus:border-gold-dim"
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(Number(e.target.value))}
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>{s.name}{s.isActive ? " ●" : ""}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] fade-in">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Rank", "Player", "Division", "ELO", "W", "L", "1st", "Win%", "Streak", "Fav Civ"].map((h) => (
                <th key={h} className={`px-4 py-3.5 text-left font-condensed text-[11px] font-semibold tracking-[2px] uppercase text-[var(--text-muted)] bg-[var(--bg-secondary)] border-b border-[var(--border)] ${["W", "L", "1st", "Win%"].includes(h) ? "text-center" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const div = getDivInfo(p.division);
              return (
                <tr key={p.id} className="hover:bg-gold/[0.02] transition-colors">
                  <td className="px-4 py-3.5 font-display font-bold border-b border-[var(--border)]" style={{ color: i < 3 ? "var(--gold)" : "var(--text-muted)" }}>
                    #{i + 1}
                  </td>
                  <td className="px-4 py-3.5 border-b border-[var(--border)]">
                    <Link href={`/player/${p.id}`} className="font-condensed font-semibold hover:text-gold transition-colors">
                      {p.username}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 border-b border-[var(--border)]" style={{ color: div.color }}>
                    {div.icon} {div.name}
                  </td>
                  <td className="px-4 py-3.5 border-b border-[var(--border)]">
                    <span className="font-mono font-semibold" style={{ color: div.color }}>{p.eloRating}</span>
                    <EloBar rating={p.eloRating} color={div.color} />
                  </td>
                  <td className="px-4 py-3.5 text-center border-b border-[var(--border)] text-[var(--green)]">{p.wins}</td>
                  <td className="px-4 py-3.5 text-center border-b border-[var(--border)] text-[var(--red)]">{p.losses}</td>
                  <td className="px-4 py-3.5 text-center border-b border-[var(--border)] text-[var(--text-muted)]">{p.draws}</td>
                  <td className="px-4 py-3.5 text-center border-b border-[var(--border)] font-mono text-sm">{winRate(p)}%</td>
                  <td className="px-4 py-3.5 border-b border-[var(--border)]">
                    {p.streak > 0 && <span className="px-2.5 py-0.5 rounded-full text-[11px] font-condensed font-semibold tracking-wider uppercase bg-[var(--green)]/10 text-[var(--green)] border border-[var(--green)]/20">W{p.streak}</span>}
                    {p.streak < 0 && <span className="px-2.5 py-0.5 rounded-full text-[11px] font-condensed font-semibold tracking-wider uppercase bg-[var(--red)]/10 text-[var(--red)] border border-[var(--red)]/20">L{Math.abs(p.streak)}</span>}
                    {p.streak === 0 && <span className="text-[var(--text-muted)]">—</span>}
                  </td>
                  <td className="px-4 py-3.5 border-b border-[var(--border)] text-sm text-[var(--text-secondary)]">{p.favCiv || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[var(--text-muted)] mt-4 text-center font-mono">{filtered.length} players · Updated every 30 seconds</p>
    </section>
  );
}
