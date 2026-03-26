// app/tierlist/TierListClient.js
"use client";
import { useState } from "react";

const BBG_BASE = "https://civ6bbg.github.io/images/leaders/";
const BBG_NAMES = { "Qin Shi Huang (Mandate of Heaven)": "Qin (Mandate of Heaven)", "Qin Shi Huang (Unifier)": "Qin (Unifier)" };
const LEADER_CIVS = {"Abraham Lincoln":"America","Teddy Roosevelt (Bull Moose)":"America","Teddy Roosevelt (Rough Rider)":"America","Saladin (Vizier)":"Arabia","Saladin (Sultan)":"Arabia","John Curtin":"Australia","Montezuma":"Aztec","Hammurabi":"Babylon","Pedro II":"Brazil","Basil II":"Byzantium","Theodora":"Byzantium","Wilfrid Laurier":"Canada","Kublai Khan (China)":"China","Qin Shi Huang (Mandate of Heaven)":"China","Qin Shi Huang (Unifier)":"China","Wu Zetian":"China","Yongle":"China","Poundmaker":"Cree","Cleopatra (Egyptian)":"Egypt","Cleopatra (Ptolemaic)":"Egypt","Ramses II":"Egypt","Eleanor of Aquitaine (England)":"England","Elizabeth I":"England","Victoria (Age of Empire)":"England","Victoria (Age of Steam)":"England","Menelik II":"Ethiopia","Catherine de Medici (Black Queen)":"France","Catherine de Medici (Magnificence)":"France","Eleanor of Aquitaine (France)":"France","Ambiorix":"Gaul","Vercingetorix":"Gaul","Tamar":"Georgia","Frederick Barbarossa":"Germany","Ludwig II":"Germany","Simón Bolívar":"Gran Colombia","Gorgo":"Greece","Pericles":"Greece","Matthias Corvinus":"Hungary","Pachacuti":"Inca","Chandragupta":"India","Gandhi":"India","Gitarja":"Indonesia","Hojo Tokimune":"Japan","Tokugawa":"Japan","Jayavarman VII":"Khmer","Mvemba a Nzinga":"Kongo","Nzinga Mbande":"Kongo","Sejong":"Korea","Seondeok":"Korea","Alexander":"Macedon","Olympias":"Macedon","Mansa Musa":"Mali","Sundiata Keita":"Mali","Kupe":"Māori","Lautaro":"Mapuche","Lady Six Sky":"Maya","Te' K'inich II":"Maya","Genghis Khan":"Mongolia","Kublai Khan (Mongolia)":"Mongolia","Wilhelmina":"Netherlands","Harald Hardrada (Varangian)":"Norway","Harald Hardrada (Konge)":"Norway","Amanitore":"Nubia","Suleiman (Kanuni)":"Ottomans","Suleiman (Muhteşem)":"Ottomans","Cyrus":"Persia","Nader Shah":"Persia","Dido":"Phoenicia","Ahiram":"Phoenicia","Jadwiga":"Poland","João III":"Portugal","Julius Caesar":"Rome","Trajan":"Rome","Peter":"Russia","Robert the Bruce":"Scotland","Tomyris":"Scythia","Philip II":"Spain","Gilgamesh":"Sumeria","Al-Hasan ibn Sulaiman":"Swahili","Kristina":"Sweden","Spearthrower Owl":"Teotihuacán","Kiviuq":"Thule","Trisong Detsen":"Tibet","Bà Triệu":"Vietnam","Shaka":"Zulu"};

function leaderImg(name) {
  const civ = LEADER_CIVS[name];
  if (!civ) return null;
  const bbg = BBG_NAMES[name] || name;
  return `${BBG_BASE}${encodeURIComponent(`${civ} ${bbg}`)}.webp`;
}

function getTier(winRate, games) {
  if (games < 2) return { name: "Unranked", color: "var(--text-muted)", bg: "var(--text-muted)" };
  if (winRate >= 65) return { name: "S", color: "#F5A623", bg: "rgba(245,166,35,0.12)" };
  if (winRate >= 55) return { name: "A", color: "#4AD97A", bg: "rgba(74,217,122,0.1)" };
  if (winRate >= 45) return { name: "B", color: "#4A90D9", bg: "rgba(74,144,217,0.1)" };
  if (winRate >= 35) return { name: "C", color: "#9B59B6", bg: "rgba(155,89,182,0.1)" };
  return { name: "D", color: "#D94A4A", bg: "rgba(217,74,74,0.1)" };
}

export default function TierListClient({ leaders, totalGames }) {
  const [sort, setSort] = useState("winRate");
  const [view, setView] = useState("table");
  const [minGames, setMinGames] = useState(1);

  const filtered = leaders.filter((l) => l.games >= minGames);
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "winRate") return b.winRate - a.winRate || b.games - a.games;
    if (sort === "games") return b.games - a.games;
    if (sort === "pickRate") return b.pickRate - a.pickRate;
    return b.winRate - a.winRate;
  });

  // Group by tier for grid view
  const tiers = ["S", "A", "B", "C", "D", "Unranked"];
  const grouped = {};
  for (const t of tiers) grouped[t] = [];
  for (const l of sorted) {
    const tier = getTier(l.winRate, l.games);
    grouped[tier.name].push(l);
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-bold mb-1">Leader Tier List</h1>
      <div className="w-10 h-0.5 bg-gold mb-2" />
      <p className="text-sm text-[var(--text-muted)] mb-6">Based on {totalGames} games this season. Leaders ranked by win rate.</p>

      {/* Controls */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <div className="flex gap-1">
          {[["table", "Table"], ["grid", "Tier Grid"]].map(([k, l]) => (
            <button key={k} onClick={() => setView(k)} className={`px-4 py-2 font-condensed text-xs tracking-wider uppercase rounded-md border transition-all ${view === k ? "text-gold bg-gold/[0.08] border-gold/20" : "text-[var(--text-muted)] border-transparent"}`}>{l}</button>
          ))}
        </div>
        <select className="px-3 py-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] outline-none" value={minGames} onChange={(e) => setMinGames(+e.target.value)}>
          <option value={1}>Min 1 game</option>
          <option value={2}>Min 2 games</option>
          <option value={3}>Min 3 games</option>
          <option value={5}>Min 5 games</option>
        </select>
        {view === "table" && (
          <select className="px-3 py-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] outline-none" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="winRate">Sort by Win Rate</option>
            <option value="games">Sort by Games Played</option>
            <option value="pickRate">Sort by Pick Rate</option>
          </select>
        )}
      </div>

      {/* Table View */}
      {view === "table" && (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] fade-in">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["", "Tier", "Leader", "Games", "Wins", "Losses", "Win Rate", "Pick Rate"].map((h) => (
                  <th key={h} className={`px-4 py-3 text-left font-condensed text-[11px] font-semibold tracking-[2px] uppercase text-[var(--text-muted)] bg-[var(--bg-secondary)] border-b border-[var(--border)] ${["Games", "Wins", "Losses", "Win Rate", "Pick Rate"].includes(h) ? "text-center" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((l, i) => {
                const tier = getTier(l.winRate, l.games);
                const img = leaderImg(l.name);
                return (
                  <tr key={l.name} className="hover:bg-gold/[0.02] transition-colors">
                    <td className="px-3 py-3 border-b border-[var(--border)] w-12">
                      {img ? <img src={img} alt={l.name} className="w-9 h-9 rounded-full object-cover border border-[var(--border)]" /> : <div className="w-9 h-9 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)]" />}
                    </td>
                    <td className="px-3 py-3 border-b border-[var(--border)]">
                      <span className="inline-block w-8 h-8 rounded-lg flex items-center justify-center font-display text-sm font-bold" style={{ color: tier.color, background: tier.bg }}>{tier.name}</span>
                    </td>
                    <td className="px-4 py-3 border-b border-[var(--border)]">
                      <div className="font-condensed font-semibold">{l.name}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">{LEADER_CIVS[l.name] || ""}</div>
                    </td>
                    <td className="px-4 py-3 text-center border-b border-[var(--border)] font-mono text-sm">{l.games}</td>
                    <td className="px-4 py-3 text-center border-b border-[var(--border)] font-mono text-sm text-[var(--green)]">{l.wins}</td>
                    <td className="px-4 py-3 text-center border-b border-[var(--border)] font-mono text-sm text-[var(--red)]">{l.losses}</td>
                    <td className="px-4 py-3 text-center border-b border-[var(--border)]">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-[var(--bg-input)] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${l.winRate}%`, background: l.winRate >= 50 ? "var(--green)" : "var(--red)" }} />
                        </div>
                        <span className={`font-mono text-sm font-bold ${l.winRate >= 50 ? "text-[var(--green)]" : "text-[var(--red)]"}`}>{l.winRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center border-b border-[var(--border)] font-mono text-sm text-[var(--text-secondary)]">{l.pickRate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid/Tier View */}
      {view === "grid" && (
        <div className="space-y-4 fade-in">
          {tiers.map((tierName) => {
            const tierLeaders = grouped[tierName];
            if (tierLeaders.length === 0) return null;
            const tierInfo = getTier(tierName === "S" ? 70 : tierName === "A" ? 60 : tierName === "B" ? 50 : tierName === "C" ? 40 : tierName === "D" ? 30 : 0, 5);
            return (
              <div key={tierName} className="flex gap-3 items-start">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center font-display text-2xl font-bold shrink-0 mt-1" style={{ color: tierInfo.color, background: tierInfo.bg, border: `1px solid ${tierInfo.color}33` }}>
                  {tierName}
                </div>
                <div className="flex flex-wrap gap-2 flex-1">
                  {tierLeaders.map((l) => {
                    const img = leaderImg(l.name);
                    return (
                      <div key={l.name} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-2.5 flex items-center gap-2.5 hover:border-[var(--border-bright)] transition-colors" title={`${l.name} — ${l.winRate}% WR (${l.games} games)`}>
                        {img ? <img src={img} alt={l.name} className="w-10 h-10 rounded-full object-cover border border-[var(--border)]" /> : <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)]" />}
                        <div>
                          <div className="font-condensed text-xs font-semibold leading-tight">{l.name}</div>
                          <div className="font-mono text-[10px]" style={{ color: tierInfo.color }}>{l.winRate}% · {l.games}g</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {sorted.length === 0 && <div className="text-center py-16 text-[var(--text-muted)]">No leader data yet. Report matches with leader names to populate the tier list.</div>}
    </section>
  );
}
