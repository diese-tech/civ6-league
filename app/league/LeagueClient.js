// app/league/LeagueClient.js
"use client";
import { useState } from "react";
import Link from "next/link";

export default function LeagueClient({ players, seasons, divisions }) {
  const [selectedDiv, setSelectedDiv] = useState("Deity");

  const div = divisions.find((d) => d.name === selectedDiv) || divisions[0];
  const divPlayers = players.filter((p) => p.division === selectedDiv);
  const winRate = (p) => { const t = p.wins + p.losses + p.draws; return t === 0 ? 0 : Math.round((p.wins / t) * 100); };
  const fmt = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-bold mb-1">League Structure</h1>
      <div className="w-10 h-0.5 bg-gold mb-8" />

      {/* Seasons */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 mb-8">
        <h3 className="font-display text-lg text-gold mb-5">Seasons</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {seasons.map((s) => (
            <div key={s.id} className={`bg-[var(--bg-secondary)] border rounded-lg p-4 ${s.isActive ? "border-gold-dim" : "border-[var(--border)]"}`}>
              <div className="flex items-center gap-2 mb-2">
                {s.isActive && <span className="live-dot" />}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-condensed font-semibold tracking-wider uppercase ${s.isActive ? "bg-gold/15 text-gold border border-gold/25" : "bg-[var(--text-muted)]/10 text-[var(--text-muted)] border border-[var(--text-muted)]/20"}`}>
                  {s.isActive ? "Active" : "Ended"}
                </span>
              </div>
              <div className="font-display text-sm font-semibold mb-1">{s.name}</div>
              <div className="font-mono text-[11px] text-[var(--text-muted)]">{fmt(s.startDate)} — {fmt(s.endDate)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Division Tabs */}
      <div className="flex gap-1 mb-6 flex-wrap">
        {divisions.map((d) => (
          <button
            key={d.name}
            onClick={() => setSelectedDiv(d.name)}
            className={`px-5 py-2.5 font-condensed text-xs font-medium tracking-wider uppercase rounded-md border transition-all ${
              selectedDiv === d.name ? "bg-opacity-10 border-opacity-30" : "text-[var(--text-muted)] border-transparent"
            }`}
            style={selectedDiv === d.name ? { color: d.color, borderColor: d.color + "44", background: d.color + "12" } : {}}
          >
            {d.icon} {d.name}
          </button>
        ))}
      </div>

      {/* Division Header */}
      <div className="bg-[var(--bg-card)] border rounded-xl p-5 mb-4 flex items-center gap-4" style={{ borderColor: div.color + "22" }}>
        <span className="text-3xl">{div.icon}</span>
        <div>
          <div className="font-display text-xl font-bold" style={{ color: div.color }}>{div.name} Division</div>
          <div className="font-mono text-sm text-[var(--text-muted)]">ELO Range: {div.rankRange} · {divPlayers.length} Players</div>
        </div>
      </div>

      {/* Standings Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] fade-in">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["#", "Player", "ELO", "W / L / D", "Win%", "Streak"].map((h) => (
                <th key={h} className={`px-4 py-3 text-left font-condensed text-[11px] font-semibold tracking-[2px] uppercase text-[var(--text-muted)] bg-[var(--bg-secondary)] border-b border-[var(--border)] ${["W / L / D", "Win%"].includes(h) ? "text-center" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {divPlayers.map((p, i) => (
              <tr key={p.id} className="hover:bg-gold/[0.02]">
                <td className="px-4 py-3 font-display font-bold text-[var(--text-muted)] border-b border-[var(--border)]">{i + 1}</td>
                <td className="px-4 py-3 border-b border-[var(--border)]">
                  <Link href={`/player/${p.id}`} className="font-condensed font-semibold hover:text-gold transition-colors">{p.username}</Link>
                </td>
                <td className="px-4 py-3 border-b border-[var(--border)]">
                  <span className="font-mono" style={{ color: div.color }}>{p.eloRating}</span>
                </td>
                <td className="px-4 py-3 text-center border-b border-[var(--border)] font-mono text-sm">
                  <span className="text-[var(--green)]">{p.wins}</span>{" / "}
                  <span className="text-[var(--red)]">{p.losses}</span>{" / "}
                  <span className="text-[var(--text-muted)]">{p.draws}</span>
                </td>
                <td className="px-4 py-3 text-center border-b border-[var(--border)] font-mono text-sm">{winRate(p)}%</td>
                <td className="px-4 py-3 border-b border-[var(--border)]">
                  {p.streak > 0 && <span className="px-2 py-0.5 rounded-full text-[11px] font-condensed font-semibold bg-[var(--green)]/10 text-[var(--green)]">W{p.streak}</span>}
                  {p.streak < 0 && <span className="px-2 py-0.5 rounded-full text-[11px] font-condensed font-semibold bg-[var(--red)]/10 text-[var(--red)]">L{Math.abs(p.streak)}</span>}
                  {p.streak === 0 && <span className="text-[var(--text-muted)]">—</span>}
                </td>
              </tr>
            ))}
            {divPlayers.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-[var(--text-muted)]">No players in this division yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
