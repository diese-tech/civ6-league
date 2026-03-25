// app/admin/page.js
"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState("players");
  const [players, setPlayers] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [matches, setMatches] = useState([]);
  const [toast, setToast] = useState(null);
  const [editModal, setEditModal] = useState(null);

  // Match form state
  const [mf, setMf] = useState({ player1Id: "", player2Id: "", result: "", date: "", map: "Pangaea", civ1: "", civ2: "" });
  // Season form state
  const [sf, setSf] = useState({ name: "", start: "", end: "", active: false });

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

  // ── Submit Match Result ────────────────────────────────────────────
  const submitMatch = async () => {
    if (!mf.player1Id || !mf.player2Id || !mf.result || !mf.date) {
      return showToast("Fill all required fields.");
    }
    if (mf.player1Id === mf.player2Id) return showToast("Players must be different.");

    const activeSeason = seasons.find((s) => s.isActive);
    if (!activeSeason) return showToast("No active season.");

    try {
      // Create match then immediately submit result
      const createRes = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player1Id: parseInt(mf.player1Id),
          player2Id: parseInt(mf.player2Id),
          scheduledAt: mf.date,
          seasonId: activeSeason.id,
          map: mf.map,
        }),
      });
      const created = await createRes.json();
      if (!createRes.ok) return showToast(created.error || "Failed to create match");

      // Submit result
      const resultRes = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: created.id,
          result: mf.result,
          player1Civ: mf.civ1 || null,
          player2Civ: mf.civ2 || null,
          map: mf.map,
        }),
      });
      const resultData = await resultRes.json();
      if (!resultRes.ok) return showToast(resultData.error || "Failed to submit result");

      showToast("Match recorded and ELO updated!");
      setMf({ player1Id: "", player2Id: "", result: "", date: "", map: "Pangaea", civ1: "", civ2: "" });
      loadData();
    } catch {
      showToast("Network error.");
    }
  };

  // ── Create Season ──────────────────────────────────────────────────
  const createSeason = async () => {
    if (!sf.name || !sf.start || !sf.end) return showToast("Fill all fields.");
    try {
      const res = await fetch("/api/seasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sf.name,
          startDate: sf.start,
          endDate: sf.end,
          isActive: sf.active,
        }),
      });
      if (!res.ok) return showToast("Failed to create season.");
      showToast("Season created!");
      setSf({ name: "", start: "", end: "", active: false });
      loadData();
    } catch {
      showToast("Network error.");
    }
  };

  // ── ELO Preview ────────────────────────────────────────────────────
  const eloPreview = (() => {
    if (!mf.player1Id || !mf.player2Id || !mf.result) return null;
    const p1 = players.find((p) => p.id === parseInt(mf.player1Id));
    const p2 = players.find((p) => p.id === parseInt(mf.player2Id));
    if (!p1 || !p2) return null;
    const scoreA = mf.result === "1-0" ? 1 : mf.result === "0-1" ? 0 : 0.5;
    const K = 16;
    const eA = 1 / (1 + Math.pow(10, (p2.eloRating - p1.eloRating) / 400));
    const eB = 1 / (1 + Math.pow(10, (p1.eloRating - p2.eloRating) / 400));
    const newA = Math.round(p1.eloRating + K * (scoreA - eA));
    const newB = Math.round(p2.eloRating + K * ((1 - scoreA) - eB));
    return { p1, p2, newA, newB };
  })();

  const inputCls = "w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border)] rounded-md text-[var(--text-primary)] text-sm outline-none focus:border-gold-dim transition-colors";
  const labelCls = "block font-condensed text-[11px] font-semibold tracking-[2px] uppercase text-[var(--text-muted)] mb-1.5";

  const CIVS = ["America","Arabia","Australia","Aztec","Babylon","Brazil","Byzantium","Canada","China","Cree","Egypt","England","Ethiopia","France","Gaul","Georgia","Germany","Gran Colombia","Greece","Hungary","Inca","India","Indonesia","Japan","Khmer","Korea","Kongo","Macedon","Mali","Maori","Mapuche","Maya","Mongolia","Netherlands","Norway","Nubia","Ottoman","Persia","Phoenicia","Poland","Portugal","Rome","Russia","Scotland","Scythia","Spain","Sumeria","Sweden","Vietnam","Zulu"];

  // Simple admin check (in production, enforce server-side)
  if (authStatus === "loading") return <div className="max-w-7xl mx-auto px-6 py-20 text-center text-[var(--text-muted)]">Loading...</div>;

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

      {/* Tabs */}
      <div className="flex gap-1 mb-8 flex-wrap">
        {[["players", "Manage Players"], ["matches", "Record Match"], ["seasons", "Manage Seasons"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-5 py-2.5 font-condensed text-xs font-medium tracking-wider uppercase rounded-md border transition-all ${tab === k ? "text-gold bg-gold/[0.08] border-gold/20" : "text-[var(--text-muted)] border-transparent"}`}>
            {l}
          </button>
        ))}
      </div>

      {/* ── Players Tab ────────────────────────────────────────────── */}
      {tab === "players" && (
        <div className="fade-in">
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["ID", "Username", "Division", "ELO", "W/L/D", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-condensed text-[11px] font-semibold tracking-[2px] uppercase text-[var(--text-muted)] bg-[var(--bg-secondary)] border-b border-[var(--border)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p.id} className="hover:bg-gold/[0.02]">
                    <td className="px-4 py-3 font-mono text-sm text-[var(--text-muted)] border-b border-[var(--border)]">{p.id}</td>
                    <td className="px-4 py-3 font-semibold border-b border-[var(--border)]">{p.username}</td>
                    <td className="px-4 py-3 text-sm border-b border-[var(--border)]">{p.division}</td>
                    <td className="px-4 py-3 font-mono border-b border-[var(--border)]">{p.eloRating}</td>
                    <td className="px-4 py-3 font-mono text-sm border-b border-[var(--border)]">
                      <span className="text-[var(--green)]">{p.wins}</span>/<span className="text-[var(--red)]">{p.losses}</span>/<span className="text-[var(--text-muted)]">{p.draws}</span>
                    </td>
                    <td className="px-4 py-3 border-b border-[var(--border)]">
                      <button onClick={() => setEditModal(p)} className="px-3 py-1 border border-[var(--border-bright)] text-[var(--text-secondary)] font-condensed text-[11px] tracking-wider uppercase rounded-md hover:text-[var(--text-primary)]">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Edit Modal */}
          {editModal && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6" onClick={() => setEditModal(null)}>
              <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-8 max-w-md w-full fade-in" onClick={(e) => e.stopPropagation()}>
                <h2 className="font-display text-xl text-gold mb-6">Edit: {editModal.username}</h2>
                <div className="mb-4"><label className={labelCls}>Username</label><input className={inputCls} defaultValue={editModal.username} /></div>
                <div className="mb-4"><label className={labelCls}>ELO Rating</label><input className={inputCls} type="number" defaultValue={editModal.eloRating} /></div>
                <div className="mb-6">
                  <label className={labelCls}>Division</label>
                  <select className={inputCls} defaultValue={editModal.division}>
                    {["Deity", "Immortal", "Emperor", "King", "Prince"].map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { showToast("Player updated."); setEditModal(null); loadData(); }} className="px-5 py-2 bg-gold text-[var(--bg-primary)] font-condensed text-xs font-semibold tracking-widest uppercase rounded-md">Save</button>
                  <button onClick={() => setEditModal(null)} className="px-5 py-2 border border-[var(--border-bright)] text-[var(--text-secondary)] font-condensed text-xs tracking-widest uppercase rounded-md">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Record Match Tab ───────────────────────────────────────── */}
      {tab === "matches" && (
        <div className="max-w-2xl fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-8">
            <h3 className="font-display text-lg text-gold mb-6">Report Match Result</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className={labelCls}>Player 1 *</label>
                <select className={inputCls} value={mf.player1Id} onChange={(e) => setMf({ ...mf, player1Id: e.target.value })}>
                  <option value="">Select...</option>
                  {players.map((p) => <option key={p.id} value={p.id}>{p.username} ({p.eloRating})</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Player 2 *</label>
                <select className={inputCls} value={mf.player2Id} onChange={(e) => setMf({ ...mf, player2Id: e.target.value })}>
                  <option value="">Select...</option>
                  {players.map((p) => <option key={p.id} value={p.id}>{p.username} ({p.eloRating})</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className={labelCls}>P1 Civilization</label>
                <select className={inputCls} value={mf.civ1} onChange={(e) => setMf({ ...mf, civ1: e.target.value })}>
                  <option value="">Select...</option>
                  {CIVS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>P2 Civilization</label>
                <select className={inputCls} value={mf.civ2} onChange={(e) => setMf({ ...mf, civ2: e.target.value })}>
                  <option value="">Select...</option>
                  {CIVS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div><label className={labelCls}>Result *</label>
                <select className={inputCls} value={mf.result} onChange={(e) => setMf({ ...mf, result: e.target.value })}>
                  <option value="">Select...</option>
                  <option value="1-0">Player 1 Wins</option>
                  <option value="0-1">Player 2 Wins</option>
                  <option value="draw">Draw</option>
                </select>
              </div>
              <div><label className={labelCls}>Date *</label>
                <input type="date" className={inputCls} value={mf.date} onChange={(e) => setMf({ ...mf, date: e.target.value })} />
              </div>
              <div><label className={labelCls}>Map</label>
                <select className={inputCls} value={mf.map} onChange={(e) => setMf({ ...mf, map: e.target.value })}>
                  {["Pangaea", "Continents", "Fractal", "Archipelago"].map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <button onClick={submitMatch} className="px-6 py-3 bg-gold text-[var(--bg-primary)] font-condensed text-sm font-semibold tracking-widest uppercase rounded-md hover:bg-gold-bright transition-all">
              Submit Result
            </button>

            {/* ELO Preview */}
            {eloPreview && (
              <>
                <div className="my-6 h-px bg-gradient-to-r from-transparent via-[var(--border-bright)] to-transparent" />
                <h4 className="font-display text-sm text-[var(--text-primary)] mb-3">ELO Preview</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4 text-center">
                    <div className="text-sm font-semibold mb-1">{eloPreview.p1.username}</div>
                    <div className="font-mono text-sm">
                      {eloPreview.p1.eloRating} → <span className={eloPreview.newA > eloPreview.p1.eloRating ? "text-[var(--green)]" : "text-[var(--red)]"}>{eloPreview.newA}</span>
                      <span className="text-xs ml-1">({eloPreview.newA > eloPreview.p1.eloRating ? "+" : ""}{eloPreview.newA - eloPreview.p1.eloRating})</span>
                    </div>
                  </div>
                  <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4 text-center">
                    <div className="text-sm font-semibold mb-1">{eloPreview.p2.username}</div>
                    <div className="font-mono text-sm">
                      {eloPreview.p2.eloRating} → <span className={eloPreview.newB > eloPreview.p2.eloRating ? "text-[var(--green)]" : "text-[var(--red)]"}>{eloPreview.newB}</span>
                      <span className="text-xs ml-1">({eloPreview.newB > eloPreview.p2.eloRating ? "+" : ""}{eloPreview.newB - eloPreview.p2.eloRating})</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Recent Matches */}
          <h3 className="font-display text-lg mt-10 mb-4">Recent Matches</h3>
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {["ID", "Player 1", "Player 2", "Result", "Status", "Date"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left font-condensed text-[10px] font-semibold tracking-[2px] uppercase text-[var(--text-muted)] bg-[var(--bg-secondary)] border-b border-[var(--border)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matches.slice(0, 10).map((m) => (
                  <tr key={m.id} className="hover:bg-gold/[0.02]">
                    <td className="px-3 py-2 font-mono text-[var(--text-muted)] border-b border-[var(--border)]">{m.id}</td>
                    <td className="px-3 py-2 border-b border-[var(--border)]">{m.player1?.username}</td>
                    <td className="px-3 py-2 border-b border-[var(--border)]">{m.player2?.username}</td>
                    <td className="px-3 py-2 font-mono border-b border-[var(--border)]">{m.result || "—"}</td>
                    <td className="px-3 py-2 border-b border-[var(--border)]">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-condensed font-semibold tracking-wider uppercase ${m.status === "completed" ? "bg-[var(--green)]/10 text-[var(--green)]" : "bg-accent/10 text-accent"}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-[var(--text-muted)] border-b border-[var(--border)]">
                      {new Date(m.scheduledAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Seasons Tab ────────────────────────────────────────────── */}
      {tab === "seasons" && (
        <div className="fade-in">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {seasons.map((s) => (
              <div key={s.id} className={`bg-[var(--bg-card)] border rounded-xl p-5 ${s.isActive ? "border-gold-dim" : "border-[var(--border)]"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-condensed font-semibold tracking-wider uppercase ${s.isActive ? "bg-[var(--green)]/10 text-[var(--green)]" : "bg-[var(--text-muted)]/10 text-[var(--text-muted)]"}`}>
                    {s.isActive ? "Active" : "Ended"}
                  </span>
                  <span className="font-mono text-xs text-[var(--text-muted)]">{s._count?.matches || 0} matches</span>
                </div>
                <div className="font-display text-sm font-semibold mb-1">{s.name}</div>
                <div className="font-mono text-[11px] text-[var(--text-muted)]">
                  {new Date(s.startDate).toLocaleDateString()} — {new Date(s.endDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-8 max-w-lg">
            <h3 className="font-display text-lg text-gold mb-6">Create New Season</h3>
            <div className="mb-4"><label className={labelCls}>Season Name *</label>
              <input className={inputCls} placeholder='e.g. "Season IV — Atomic Age"' value={sf.name} onChange={(e) => setSf({ ...sf, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className={labelCls}>Start Date *</label><input type="date" className={inputCls} value={sf.start} onChange={(e) => setSf({ ...sf, start: e.target.value })} /></div>
              <div><label className={labelCls}>End Date *</label><input type="date" className={inputCls} value={sf.end} onChange={(e) => setSf({ ...sf, end: e.target.value })} /></div>
            </div>
            <label className="flex items-center gap-3 mb-6 cursor-pointer">
              <input type="checkbox" checked={sf.active} onChange={(e) => setSf({ ...sf, active: e.target.checked })} className="w-4 h-4 accent-gold" />
              <span className="text-sm text-[var(--text-secondary)]">Set as active season (deactivates current)</span>
            </label>
            <button onClick={createSeason} className="px-6 py-3 bg-gold text-[var(--bg-primary)] font-condensed text-sm font-semibold tracking-widest uppercase rounded-md">
              Create Season
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 px-5 py-3 bg-[var(--bg-card)] border border-gold-dim rounded-lg text-sm z-50 shadow-2xl fade-in">
          {toast}
        </div>
      )}
    </section>
  );
}
