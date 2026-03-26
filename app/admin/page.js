// app/admin/page.js
"use client";
import { useState, useEffect, useCallback } from "react";

export default function AdminPage() {
  const [tab, setTab] = useState("players");
  const [players, setPlayers] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [matches, setMatches] = useState([]);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const loadData = useCallback(async () => {
    const [pRes, sRes, mRes] = await Promise.all([
      fetch("/api/players").then((r) => r.json()),
      fetch("/api/seasons").then((r) => r.json()),
      fetch("/api/matches?limit=50").then((r) => r.json()),
    ]);
    setPlayers(pRes.players || []);
    setSeasons(sRes.seasons || []);
    setMatches(mRes.matches || []);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (type, id, label) => {
    if (confirmDelete !== `${type}-${id}`) {
      setConfirmDelete(`${type}-${id}`);
      showToast(`Click delete again to confirm removing ${label}.`);
      setTimeout(() => setConfirmDelete(null), 5000);
      return;
    }
    try {
      const res = await fetch(`/api/admin`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Deleted ${label}.`);
        loadData();
      } else {
        showToast(data.error || "Delete failed.");
      }
    } catch {
      showToast("Network error.");
    }
    setConfirmDelete(null);
  };

  const inputCls = "w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border)] rounded-md text-[var(--text-primary)] text-sm outline-none focus:border-gold-dim transition-colors";
  const labelCls = "block font-condensed text-[11px] font-semibold tracking-[2px] uppercase text-[var(--text-muted)] mb-1.5";

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin Panel</h1>
          <div className="w-10 h-0.5 bg-gold mt-2" />
        </div>
        <span className="px-3 py-1 rounded-full text-[11px] font-condensed font-semibold tracking-wider uppercase bg-gold/15 text-gold border border-gold/25">
          Admin Access
        </span>
      </div>

      <div className="flex gap-1 mb-8 flex-wrap">
        {[["players", "Players"], ["matches", "Matches"], ["seasons", "Seasons"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-5 py-2.5 font-condensed text-xs font-medium tracking-wider uppercase rounded-md border transition-all ${tab === k ? "text-gold bg-gold/[0.08] border-gold/20" : "text-[var(--text-muted)] border-transparent"}`}>
            {l} ({k === "players" ? players.length : k === "matches" ? matches.length : seasons.length})
          </button>
        ))}
      </div>

      {/* ── Players ──────────────────────────────────────────── */}
      {tab === "players" && (
        <div className="fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 mb-6">
            <p className="text-sm text-[var(--text-secondary)]">
              Players are added automatically when match results are reported via the Discord bot.
              You can remove players here if needed.
            </p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Username", "Discord ID", "Division", "Rating", "W/L", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-condensed text-[11px] font-semibold tracking-[2px] uppercase text-[var(--text-muted)] bg-[var(--bg-secondary)] border-b border-[var(--border)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p.id} className="hover:bg-gold/[0.02]">
                    <td className="px-4 py-3 font-semibold border-b border-[var(--border)]">{p.username}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)] border-b border-[var(--border)]">{p.discordId || "—"}</td>
                    <td className="px-4 py-3 text-sm border-b border-[var(--border)]">{p.division}</td>
                    <td className="px-4 py-3 font-mono border-b border-[var(--border)]">{p.eloRating}</td>
                    <td className="px-4 py-3 font-mono text-sm border-b border-[var(--border)]">
                      <span className="text-[var(--green)]">{p.wins}</span>/<span className="text-[var(--red)]">{p.losses}</span>
                    </td>
                    <td className="px-4 py-3 border-b border-[var(--border)]">
                      <button
                        onClick={() => handleDelete("player", p.id, p.username)}
                        className={`px-3 py-1 font-condensed text-[11px] tracking-wider uppercase rounded-md transition-all ${
                          confirmDelete === `player-${p.id}`
                            ? "bg-[var(--red)] text-white"
                            : "border border-[var(--red)]/30 text-[var(--red)] hover:bg-[var(--red)]/10"
                        }`}
                      >
                        {confirmDelete === `player-${p.id}` ? "Confirm?" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
                {players.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-[var(--text-muted)]">No players yet. They appear after match reports from Discord.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Matches ──────────────────────────────────────────── */}
      {tab === "matches" && (
        <div className="fade-in">
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {["ID", "Player 1", "Player 2", "Result", "Date", "Actions"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left font-condensed text-[10px] font-semibold tracking-[2px] uppercase text-[var(--text-muted)] bg-[var(--bg-secondary)] border-b border-[var(--border)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.id} className="hover:bg-gold/[0.02]">
                    <td className="px-3 py-2 font-mono text-[var(--text-muted)] border-b border-[var(--border)]">{m.id}</td>
                    <td className="px-3 py-2 border-b border-[var(--border)]">{m.player1?.username || "?"}</td>
                    <td className="px-3 py-2 border-b border-[var(--border)]">{m.player2?.username || "?"}</td>
                    <td className="px-3 py-2 font-mono border-b border-[var(--border)]">{m.result || "—"}</td>
                    <td className="px-3 py-2 font-mono text-xs text-[var(--text-muted)] border-b border-[var(--border)]">
                      {new Date(m.scheduledAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 border-b border-[var(--border)]">
                      <button
                        onClick={() => handleDelete("match", m.id, `match #${m.id}`)}
                        className={`px-3 py-1 font-condensed text-[10px] tracking-wider uppercase rounded-md transition-all ${
                          confirmDelete === `match-${m.id}`
                            ? "bg-[var(--red)] text-white"
                            : "border border-[var(--red)]/30 text-[var(--red)] hover:bg-[var(--red)]/10"
                        }`}
                      >
                        {confirmDelete === `match-${m.id}` ? "Confirm?" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
                {matches.length === 0 && (
                  <tr><td colSpan={6} className="px-3 py-12 text-center text-[var(--text-muted)]">No matches yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Seasons ──────────────────────────────────────────── */}
      {tab === "seasons" && (
        <div className="fade-in">
          <div className="space-y-3 mb-8">
            {seasons.map((s) => (
              <div key={s.id} className={`bg-[var(--bg-card)] border rounded-xl p-5 flex items-center justify-between flex-wrap gap-4 ${s.isActive ? "border-gold-dim" : "border-[var(--border)]"}`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {s.isActive && <span className="live-dot" />}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-condensed font-semibold tracking-wider uppercase ${s.isActive ? "bg-[var(--green)]/10 text-[var(--green)]" : "bg-[var(--text-muted)]/10 text-[var(--text-muted)]"}`}>
                      {s.isActive ? "Active" : "Ended"}
                    </span>
                  </div>
                  <div className="font-display text-base font-semibold">{s.name}</div>
                  <div className="font-mono text-[11px] text-[var(--text-muted)]">
                    {new Date(s.startDate).toLocaleDateString()} — {new Date(s.endDate).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete("season", s.id, s.name)}
                  className={`px-4 py-2 font-condensed text-[11px] tracking-wider uppercase rounded-md transition-all ${
                    confirmDelete === `season-${s.id}`
                      ? "bg-[var(--red)] text-white"
                      : "border border-[var(--red)]/30 text-[var(--red)] hover:bg-[var(--red)]/10"
                  }`}
                >
                  {confirmDelete === `season-${s.id}` ? "Confirm?" : "Delete"}
                </button>
              </div>
            ))}
            {seasons.length === 0 && (
              <div className="text-center py-12 text-[var(--text-muted)]">No seasons created.</div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 px-5 py-3 bg-[var(--bg-card)] border border-gold-dim rounded-lg text-sm z-50 shadow-2xl fade-in">
          {toast}
        </div>
      )}
    </section>
  );
}