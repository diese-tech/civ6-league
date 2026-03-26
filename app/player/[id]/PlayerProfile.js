// app/player/[id]/PlayerProfile.js
"use client";
import { useState } from "react";
import Link from "next/link";

// ── Mini Chart: Rating Over Time (pure SVG, no dependencies) ────────────────
function RatingChart({ data, peakRating, floorRating }) {
  if (data.length < 2) return null;

  const W = 700, H = 200, PAD = 40;
  const ratings = data.map((d) => d.rating);
  const minR = Math.min(...ratings) - 30;
  const maxR = Math.max(...ratings) + 30;
  const rangeR = maxR - minR || 1;

  const x = (i) => PAD + (i / (data.length - 1)) * (W - PAD * 2);
  const y = (r) => PAD + (1 - (r - minR) / rangeR) * (H - PAD * 2);

  const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.rating)}`).join(" ");
  const areaD = pathD + ` L ${x(data.length - 1)} ${H - PAD} L ${PAD} ${H - PAD} Z`;

  // Y-axis labels
  const yLabels = [];
  const step = Math.max(25, Math.round(rangeR / 4 / 25) * 25);
  for (let r = Math.ceil(minR / step) * step; r <= maxR; r += step) {
    yLabels.push(r);
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
      {/* Grid lines */}
      {yLabels.map((r) => (
        <g key={r}>
          <line x1={PAD} y1={y(r)} x2={W - PAD} y2={y(r)} stroke="var(--border)" strokeWidth="0.5" />
          <text x={PAD - 6} y={y(r) + 4} textAnchor="end" fill="var(--text-muted)" fontSize="10" fontFamily="JetBrains Mono, monospace">{r}</text>
        </g>
      ))}
      {/* Area fill */}
      <path d={areaD} fill="url(#ratingGrad)" opacity="0.15" />
      {/* Line */}
      <path d={pathD} fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots */}
      {data.map((d, i) => (
        <circle key={i} cx={x(i)} cy={y(d.rating)} r="3.5" fill="var(--bg-primary)" stroke="var(--gold)" strokeWidth="2" />
      ))}
      {/* Start/end labels */}
      <text x={x(0)} y={y(data[0].rating) - 12} textAnchor="middle" fill="var(--text-secondary)" fontSize="11" fontFamily="JetBrains Mono, monospace">{data[0].rating}</text>
      <text x={x(data.length - 1)} y={y(data[data.length - 1].rating) - 12} textAnchor="middle" fill="var(--gold)" fontSize="12" fontWeight="bold" fontFamily="JetBrains Mono, monospace">{data[data.length - 1].rating}</text>
      {/* Game number labels */}
      <text x={x(0)} y={H - PAD + 16} textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontFamily="JetBrains Mono, monospace">G1</text>
      <text x={x(data.length - 1)} y={H - PAD + 16} textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontFamily="JetBrains Mono, monospace">G{data.length}</text>
      <defs>
        <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gold)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Win Rate Bar ────────────────────────────────────────────────────────────
function WinRateBar({ wins, losses, label }) {
  const total = wins + losses;
  const pct = total > 0 ? Math.round((wins / total) * 100) : 0;
  return (
    <div>
      {label && <div className="text-xs text-[var(--text-muted)] mb-1">{label}</div>}
      <div className="flex h-5 rounded-full overflow-hidden bg-[var(--bg-input)]">
        {pct > 0 && <div className="bg-[var(--green)]/70 flex items-center justify-center text-[10px] font-mono font-bold text-white" style={{ width: `${pct}%`, minWidth: pct > 8 ? "auto" : 0 }}>{pct > 15 ? `${wins}W` : ""}</div>}
        {100 - pct > 0 && <div className="bg-[var(--red)]/50 flex items-center justify-center text-[10px] font-mono font-bold text-white" style={{ width: `${100 - pct}%`, minWidth: (100 - pct) > 8 ? "auto" : 0 }}>{(100 - pct) > 15 ? `${losses}L` : ""}</div>}
      </div>
      <div className="text-right text-[11px] font-mono text-[var(--text-muted)] mt-0.5">{pct}% WR</div>
    </div>
  );
}

// ── Leader Image URL ────────────────────────────────────────────────────────
const BBG_BASE = "https://civ6bbg.github.io/images/leaders/";
const BBG_NAMES = { "Qin Shi Huang (Mandate of Heaven)": "Qin (Mandate of Heaven)", "Qin Shi Huang (Unifier)": "Qin (Unifier)" };
const LEADER_CIVS = {"Abraham Lincoln":"America","Teddy Roosevelt (Bull Moose)":"America","Teddy Roosevelt (Rough Rider)":"America","Saladin (Vizier)":"Arabia","Saladin (Sultan)":"Arabia","John Curtin":"Australia","Montezuma":"Aztec","Hammurabi":"Babylon","Pedro II":"Brazil","Basil II":"Byzantium","Theodora":"Byzantium","Wilfrid Laurier":"Canada","Kublai Khan (China)":"China","Qin Shi Huang (Mandate of Heaven)":"China","Qin Shi Huang (Unifier)":"China","Wu Zetian":"China","Yongle":"China","Poundmaker":"Cree","Cleopatra (Egyptian)":"Egypt","Cleopatra (Ptolemaic)":"Egypt","Ramses II":"Egypt","Eleanor of Aquitaine (England)":"England","Elizabeth I":"England","Victoria (Age of Empire)":"England","Victoria (Age of Steam)":"England","Menelik II":"Ethiopia","Catherine de Medici (Black Queen)":"France","Catherine de Medici (Magnificence)":"France","Eleanor of Aquitaine (France)":"France","Ambiorix":"Gaul","Vercingetorix":"Gaul","Tamar":"Georgia","Frederick Barbarossa":"Germany","Ludwig II":"Germany","Simón Bolívar":"Gran Colombia","Gorgo":"Greece","Pericles":"Greece","Matthias Corvinus":"Hungary","Pachacuti":"Inca","Chandragupta":"India","Gandhi":"India","Gitarja":"Indonesia","Hojo Tokimune":"Japan","Tokugawa":"Japan","Jayavarman VII":"Khmer","Mvemba a Nzinga":"Kongo","Nzinga Mbande":"Kongo","Sejong":"Korea","Seondeok":"Korea","Alexander":"Macedon","Olympias":"Macedon","Mansa Musa":"Mali","Sundiata Keita":"Mali","Kupe":"Māori","Lautaro":"Mapuche","Lady Six Sky":"Maya","Te' K'inich II":"Maya","Genghis Khan":"Mongolia","Kublai Khan (Mongolia)":"Mongolia","Wilhelmina":"Netherlands","Harald Hardrada (Varangian)":"Norway","Harald Hardrada (Konge)":"Norway","Amanitore":"Nubia","Suleiman (Kanuni)":"Ottomans","Suleiman (Muhteşem)":"Ottomans","Cyrus":"Persia","Nader Shah":"Persia","Dido":"Phoenicia","Ahiram":"Phoenicia","Jadwiga":"Poland","João III":"Portugal","Julius Caesar":"Rome","Trajan":"Rome","Peter":"Russia","Robert the Bruce":"Scotland","Tomyris":"Scythia","Philip II":"Spain","Gilgamesh":"Sumeria","Al-Hasan ibn Sulaiman":"Swahili","Kristina":"Sweden","Spearthrower Owl":"Teotihuacán","Kiviuq":"Thule","Trisong Detsen":"Tibet","Bà Triệu":"Vietnam","Shaka":"Zulu"};

function leaderImg(name) {
  const civ = LEADER_CIVS[name];
  if (!civ) return null;
  const bbg = BBG_NAMES[name] || name;
  return `${BBG_BASE}${encodeURIComponent(`${civ} ${bbg}`)}.webp`;
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function PlayerProfile({
  player, division, rank, totalPlayers, winRate, totalGames, matches,
  ratingHistory, leaderStats, h2h, recentForm, peakRating, floorRating,
  bestWinStreak, worstLossStreak, currentStreak,
}) {
  const [tab, setTab] = useState("overview");
  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <Link href="/leaderboard" className="inline-block px-4 py-2 border border-[var(--border-bright)] text-[var(--text-secondary)] font-condensed text-xs tracking-wider uppercase rounded-md hover:text-[var(--text-primary)] mb-6">
        ← Back to Rankings
      </Link>

      {/* ── Profile Header ───────────────────────────────────────────── */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-8 mb-6 fade-in">
        <div className="flex gap-8 items-start flex-wrap md:flex-nowrap">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-dim to-[var(--bg-card)] flex items-center justify-center font-display text-4xl font-bold text-gold-bright border-2 border-gold-dim shrink-0">
            {player.username[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl font-extrabold mb-1">{player.username}</h1>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span className="font-condensed text-base" style={{ color: division.color }}>{division.icon} {division.name}</span>
              <span className="font-mono text-sm text-[var(--text-muted)]">Rank #{rank} of {totalPlayers}</span>
              <span className="font-mono text-sm text-[var(--text-muted)]">Joined {fmt(player.createdAt)}</span>
            </div>
            {/* Recent Form */}
            {recentForm.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs text-[var(--text-muted)] mr-2">Last {recentForm.length}:</span>
                {recentForm.map((r, i) => (
                  <span key={i} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${r === "W" ? "bg-[var(--green)]/20 text-[var(--green)]" : "bg-[var(--red)]/20 text-[var(--red)]"}`}>{r}</span>
                ))}
              </div>
            )}
          </div>
          {/* Rating */}
          <div className="text-center shrink-0">
            <div className="font-display text-5xl font-extrabold leading-none" style={{ color: division.color }}>{player.eloRating}</div>
            <div className="font-condensed text-[11px] tracking-[2px] uppercase text-[var(--text-muted)] mt-1">Rating</div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 mb-6">
        {[
          { val: totalGames, label: "Games", color: "var(--text-primary)" },
          { val: player.wins, label: "Wins", color: "var(--green)" },
          { val: player.losses, label: "Losses", color: "var(--red)" },
          { val: `${winRate}%`, label: "Win Rate", color: "var(--gold)" },
          { val: currentStreak > 0 ? `W${currentStreak}` : currentStreak < 0 ? `L${Math.abs(currentStreak)}` : "—", label: "Streak", color: currentStreak > 0 ? "var(--green)" : currentStreak < 0 ? "var(--red)" : "var(--text-muted)" },
          { val: peakRating, label: "Peak", color: "var(--gold)" },
          { val: `W${bestWinStreak}`, label: "Best Streak", color: "var(--green)" },
          { val: `L${worstLossStreak}`, label: "Worst Streak", color: "var(--red)" },
        ].map(({ val, label, color }) => (
          <div key={label} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3 text-center">
            <div className="font-display text-xl font-bold" style={{ color }}>{val}</div>
            <div className="font-condensed text-[9px] tracking-[2px] uppercase text-[var(--text-muted)] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-6 flex-wrap">
        {[["overview", "Overview"], ["leaders", "Leaders"], ["matchups", "Head-to-Head"], ["history", "Match History"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-5 py-2.5 font-condensed text-xs font-medium tracking-wider uppercase rounded-md border transition-all ${tab === k ? "text-gold bg-gold/[0.08] border-gold/20" : "text-[var(--text-muted)] border-transparent"}`}>{l}</button>
        ))}
      </div>

      {/* ── Overview Tab ─────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="space-y-6 fade-in">
          {/* Rating Chart */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
            <h3 className="font-display text-lg text-gold mb-4">Rating Progression</h3>
            {ratingHistory.length >= 2 ? (
              <RatingChart data={ratingHistory} peakRating={peakRating} floorRating={floorRating} />
            ) : (
              <p className="text-sm text-[var(--text-muted)] py-8 text-center">Not enough games for a chart yet. Play 2+ games to see your rating trend.</p>
            )}
          </div>

          {/* Win Rate + Top Leaders side by side */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
              <h3 className="font-display text-lg text-gold mb-4">Win Rate</h3>
              <WinRateBar wins={player.wins} losses={player.losses} />
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-center">
                  <div className="font-display text-lg font-bold text-[var(--green)]">{player.wins}</div>
                  <div className="text-[10px] text-[var(--text-muted)] font-condensed tracking-wider uppercase">Victories</div>
                </div>
                <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-center">
                  <div className="font-display text-lg font-bold text-[var(--red)]">{player.losses}</div>
                  <div className="text-[10px] text-[var(--text-muted)] font-condensed tracking-wider uppercase">Defeats</div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
              <h3 className="font-display text-lg text-gold mb-4">Most Played Leaders</h3>
              {leaderStats.slice(0, 5).map((ls) => (
                <div key={ls.name} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-b-0">
                  {leaderImg(ls.name) && (
                    <img src={leaderImg(ls.name)} alt={ls.name} className="w-8 h-8 rounded-full object-cover border border-[var(--border)]" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-condensed text-sm font-semibold truncate">{ls.name}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">{ls.games} games</div>
                  </div>
                  <span className={`font-mono text-sm font-bold ${ls.winRate >= 50 ? "text-[var(--green)]" : "text-[var(--red)]"}`}>{ls.winRate}%</span>
                </div>
              ))}
              {leaderStats.length === 0 && <p className="text-sm text-[var(--text-muted)] py-4 text-center">No leader data yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── Leaders Tab ──────────────────────────────────────────────── */}
      {tab === "leaders" && (
        <div className="fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
            {leaderStats.length > 0 ? (
              <div className="divide-y divide-[var(--border)]">
                {leaderStats.map((ls) => (
                  <div key={ls.name} className="flex items-center gap-4 px-5 py-4 hover:bg-gold/[0.02] transition-colors">
                    {leaderImg(ls.name) ? (
                      <img src={leaderImg(ls.name)} alt={ls.name} className="w-12 h-12 rounded-full object-cover border-2 border-[var(--border)]" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--border)] flex items-center justify-center text-lg">🏛️</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-condensed text-base font-semibold">{ls.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">{LEADER_CIVS[ls.name] || ""}</div>
                    </div>
                    <div className="text-center px-3">
                      <div className="font-mono text-sm font-bold">{ls.games}</div>
                      <div className="text-[9px] text-[var(--text-muted)] font-condensed tracking-wider uppercase">Games</div>
                    </div>
                    <div className="text-center px-3">
                      <div className="font-mono text-sm font-bold text-[var(--green)]">{ls.wins}</div>
                      <div className="text-[9px] text-[var(--text-muted)] font-condensed tracking-wider uppercase">Wins</div>
                    </div>
                    <div className="text-center px-3">
                      <div className="font-mono text-sm font-bold text-[var(--red)]">{ls.losses}</div>
                      <div className="text-[9px] text-[var(--text-muted)] font-condensed tracking-wider uppercase">Losses</div>
                    </div>
                    <div className="w-24">
                      <WinRateBar wins={ls.wins} losses={ls.losses} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)] py-12 text-center">No leader data yet. Report matches with leader names to track stats.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Head-to-Head Tab ─────────────────────────────────────────── */}
      {tab === "matchups" && (
        <div className="fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
            {h2h.length > 0 ? (
              <div className="divide-y divide-[var(--border)]">
                {h2h.map((opp) => {
                  const total = opp.wins + opp.losses;
                  const wr = total > 0 ? Math.round((opp.wins / total) * 100) : 0;
                  return (
                    <div key={opp.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gold/[0.02] transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-dim/30 to-[var(--bg-secondary)] flex items-center justify-center font-display text-lg font-bold text-gold-dim border border-[var(--border)]">
                        {opp.username[0]}
                      </div>
                      <div className="flex-1">
                        <Link href={`/player/${opp.id}`} className="font-condensed text-base font-semibold hover:text-gold transition-colors">{opp.username}</Link>
                        <div className="text-xs text-[var(--text-muted)]">{total} games played</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <span className="font-mono text-lg font-bold text-[var(--green)]">{opp.wins}</span>
                          <span className="font-mono text-lg text-[var(--text-muted)] mx-1">-</span>
                          <span className="font-mono text-lg font-bold text-[var(--red)]">{opp.losses}</span>
                        </div>
                        <span className={`font-mono text-sm font-bold px-2 py-1 rounded ${wr >= 50 ? "bg-[var(--green)]/10 text-[var(--green)]" : "bg-[var(--red)]/10 text-[var(--red)]"}`}>{wr}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)] py-12 text-center">No matchup data yet.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Match History Tab ────────────────────────────────────────── */}
      {tab === "history" && (
        <div className="space-y-2 fade-in">
          {matches.map((m) => {
            const isP1 = m.player1Id === player.id;
            const opp = isP1 ? m.player2 : m.player1;
            const isWin = (isP1 && m.result === "1-0") || (!isP1 && m.result === "0-1");
            const civ = isP1 ? m.player1Civ : m.player2Civ;
            const oppCiv = isP1 ? m.player2Civ : m.player1Civ;
            const eloChange = isP1
              ? (m.player1EloAfter && m.player1EloBefore ? m.player1EloAfter - m.player1EloBefore : null)
              : (m.player2EloAfter && m.player2EloBefore ? m.player2EloAfter - m.player2EloBefore : null);

            return (
              <div key={m.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-5 py-4 hover:border-[var(--border-bright)] transition-colors">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded text-[11px] font-condensed font-bold tracking-wider uppercase w-14 text-center ${isWin ? "bg-[var(--green)]/15 text-[var(--green)]" : "bg-[var(--red)]/15 text-[var(--red)]"}`}>
                      {isWin ? "Win" : "Loss"}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">vs</span>
                        <Link href={`/player/${opp.id}`} className="font-condensed text-sm font-semibold hover:text-gold transition-colors">{opp.username}</Link>
                        {eloChange != null && (
                          <span className={`font-mono text-xs font-bold ${eloChange >= 0 ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
                            {eloChange >= 0 ? "+" : ""}{eloChange}
                          </span>
                        )}
                      </div>
                      {/* Leader picks */}
                      <div className="flex items-center gap-3 mt-1">
                        {civ && (
                          <div className="flex items-center gap-1.5">
                            {leaderImg(civ) && <img src={leaderImg(civ)} alt={civ} className="w-5 h-5 rounded-full object-cover" />}
                            <span className="text-xs text-[var(--text-secondary)]">{civ}</span>
                          </div>
                        )}
                        {oppCiv && (
                          <div className="flex items-center gap-1.5 opacity-60">
                            <span className="text-xs text-[var(--text-muted)]">vs</span>
                            {leaderImg(oppCiv) && <img src={leaderImg(oppCiv)} alt={oppCiv} className="w-5 h-5 rounded-full object-cover" />}
                            <span className="text-xs text-[var(--text-muted)]">{oppCiv}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">{fmt(m.completedAt || m.scheduledAt)}</span>
                </div>
              </div>
            );
          })}
          {matches.length === 0 && (
            <div className="text-center py-12 text-[var(--text-muted)]">No matches recorded yet.</div>
          )}
        </div>
      )}
    </section>
  );
}
