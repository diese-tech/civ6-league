// app/stats/page.js
import { prisma } from "@/lib/db";
import Link from "next/link";

export const revalidate = 60;
export const metadata = { title: "Season Stats — Strategy Inc" };

const BBG_BASE = "https://civ6bbg.github.io/images/leaders/";
const BBG_NAMES = { "Qin Shi Huang (Mandate of Heaven)": "Qin (Mandate of Heaven)", "Qin Shi Huang (Unifier)": "Qin (Unifier)" };
const LEADER_CIVS = {"Abraham Lincoln":"America","Teddy Roosevelt (Bull Moose)":"America","Teddy Roosevelt (Rough Rider)":"America","Saladin (Vizier)":"Arabia","Saladin (Sultan)":"Arabia","John Curtin":"Australia","Montezuma":"Aztec","Hammurabi":"Babylon","Pedro II":"Brazil","Basil II":"Byzantium","Theodora":"Byzantium","Wilfrid Laurier":"Canada","Kublai Khan (China)":"China","Qin Shi Huang (Mandate of Heaven)":"China","Qin Shi Huang (Unifier)":"China","Wu Zetian":"China","Yongle":"China","Poundmaker":"Cree","Cleopatra (Egyptian)":"Egypt","Cleopatra (Ptolemaic)":"Egypt","Ramses II":"Egypt","Eleanor of Aquitaine (England)":"England","Elizabeth I":"England","Victoria (Age of Empire)":"England","Victoria (Age of Steam)":"England","Menelik II":"Ethiopia","Catherine de Medici (Black Queen)":"France","Catherine de Medici (Magnificence)":"France","Eleanor of Aquitaine (France)":"France","Ambiorix":"Gaul","Vercingetorix":"Gaul","Tamar":"Georgia","Frederick Barbarossa":"Germany","Ludwig II":"Germany","Simón Bolívar":"Gran Colombia","Gorgo":"Greece","Pericles":"Greece","Matthias Corvinus":"Hungary","Pachacuti":"Inca","Chandragupta":"India","Gandhi":"India","Gitarja":"Indonesia","Hojo Tokimune":"Japan","Tokugawa":"Japan","Jayavarman VII":"Khmer","Mvemba a Nzinga":"Kongo","Nzinga Mbande":"Kongo","Sejong":"Korea","Seondeok":"Korea","Alexander":"Macedon","Olympias":"Macedon","Mansa Musa":"Mali","Sundiata Keita":"Mali","Kupe":"Māori","Lautaro":"Mapuche","Lady Six Sky":"Maya","Te' K'inich II":"Maya","Genghis Khan":"Mongolia","Kublai Khan (Mongolia)":"Mongolia","Wilhelmina":"Netherlands","Harald Hardrada (Varangian)":"Norway","Harald Hardrada (Konge)":"Norway","Amanitore":"Nubia","Suleiman (Kanuni)":"Ottomans","Suleiman (Muhteşem)":"Ottomans","Cyrus":"Persia","Nader Shah":"Persia","Dido":"Phoenicia","Ahiram":"Phoenicia","Jadwiga":"Poland","João III":"Portugal","Julius Caesar":"Rome","Trajan":"Rome","Peter":"Russia","Robert the Bruce":"Scotland","Tomyris":"Scythia","Philip II":"Spain","Gilgamesh":"Sumeria","Al-Hasan ibn Sulaiman":"Swahili","Kristina":"Sweden","Spearthrower Owl":"Teotihuacán","Kiviuq":"Thule","Trisong Detsen":"Tibet","Bà Triệu":"Vietnam","Shaka":"Zulu"};
function leaderImg(name) { const civ = LEADER_CIVS[name]; if (!civ) return null; const bbg = BBG_NAMES[name] || name; return `${BBG_BASE}${encodeURIComponent(`${civ} ${bbg}`)}.webp`; }

export default async function StatsPage() {
  const [players, matches, activeSeason] = await Promise.all([
    prisma.player.findMany({ orderBy: { eloRating: "desc" } }),
    prisma.match.findMany({ where: { status: "completed" }, orderBy: { completedAt: "desc" } }),
    prisma.season.findFirst({ where: { isActive: true } }),
  ]);

  const totalPlayers = players.length;
  const totalMatches = matches.length;
  const highestRated = players[0];
  const mostGames = [...players].sort((a, b) => (b.wins + b.losses) - (a.wins + a.losses))[0];
  const bestWinRate = [...players].filter((p) => p.wins + p.losses >= 3).sort((a, b) => {
    const wrA = a.wins / (a.wins + a.losses); const wrB = b.wins / (b.wins + b.losses);
    return wrB - wrA;
  })[0];
  const most1st = [...players].sort((a, b) => (b.draws || 0) - (a.draws || 0))[0]; // draws stores first_place

  // Leader stats
  const leaderMap = {};
  for (const m of matches) {
    for (const civ of [m.player1Civ, m.player2Civ]) {
      if (!civ) continue;
      if (!leaderMap[civ]) leaderMap[civ] = { games: 0, wins: 0 };
      leaderMap[civ].games += 1;
    }
    if (m.player1Civ && m.result === "1-0") leaderMap[m.player1Civ].wins += 1;
    if (m.player2Civ && m.result === "0-1") leaderMap[m.player2Civ].wins += 1;
  }
  const topPicked = Object.entries(leaderMap).sort((a, b) => b[1].games - a[1].games).slice(0, 5);
  const topWinRate = Object.entries(leaderMap).filter(([, s]) => s.games >= 2).sort((a, b) => (b[1].wins / b[1].games) - (a[1].wins / a[1].games)).slice(0, 5);

  // Recent matches
  const recentMatches = matches.slice(0, 8);

  // Average rating
  const avgRating = totalPlayers > 0 ? Math.round(players.reduce((s, p) => s + p.eloRating, 0) / totalPlayers) : 0;

  // Unique leaders played
  const uniqueLeaders = Object.keys(leaderMap).length;

  const StatCard = ({ val, label, color, sub }) => (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 text-center">
      <div className="font-display text-3xl font-bold" style={{ color }}>{val}</div>
      <div className="font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)] mt-1">{label}</div>
      {sub && <div className="text-[11px] text-[var(--text-muted)] mt-1">{sub}</div>}
    </div>
  );

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-bold mb-1">Season Stats</h1>
      <div className="w-10 h-0.5 bg-gold mb-2" />
      {activeSeason && <p className="text-sm text-[var(--text-muted)] mb-8">{activeSeason.name} — Season at a glance</p>}

      {/* Big Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard val={totalPlayers} label="Players" color="var(--text-primary)" />
        <StatCard val={totalMatches} label="Matches Played" color="var(--gold)" />
        <StatCard val={avgRating} label="Avg Rating" color="var(--accent)" />
        <StatCard val={uniqueLeaders} label="Leaders Played" color="var(--green)" />
      </div>

      {/* Player Records */}
      <h2 className="font-display text-xl font-bold mb-1">Player Records</h2>
      <div className="w-8 h-0.5 bg-gold mb-4" />
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { title: "Highest Rated", player: highestRated, stat: highestRated ? `${highestRated.eloRating} rating` : "—", color: "var(--gold)" },
          { title: "Most Active", player: mostGames, stat: mostGames ? `${mostGames.wins + mostGames.losses} games` : "—", color: "var(--accent)" },
          { title: "Best Win Rate", player: bestWinRate, stat: bestWinRate ? `${Math.round((bestWinRate.wins / (bestWinRate.wins + bestWinRate.losses)) * 100)}% (min 3 games)` : "—", color: "var(--green)" },
          { title: "Most 1st Place", player: most1st, stat: most1st?.draws ? `${most1st.draws} firsts` : "—", color: "var(--gold)" },
        ].map(({ title, player: p, stat, color }) => (
          <div key={title} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
            <div className="font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)] mb-2">{title}</div>
            {p ? (
              <>
                <Link href={`/player/${p.id}`} className="font-condensed text-lg font-semibold hover:text-gold transition-colors">{p.username}</Link>
                <div className="font-mono text-sm mt-1" style={{ color }}>{stat}</div>
              </>
            ) : (
              <div className="text-[var(--text-muted)]">—</div>
            )}
          </div>
        ))}
      </div>

      {/* Leader Stats */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-lg text-gold">Most Picked Leaders</h3>
            <Link href="/tierlist" className="font-condensed text-xs text-[var(--text-muted)] tracking-wider uppercase hover:text-gold">Full Tier List →</Link>
          </div>
          {topPicked.map(([name, s], i) => {
            const img = leaderImg(name);
            return (
              <div key={name} className="flex items-center gap-3 py-2.5 border-b border-[var(--border)] last:border-b-0">
                <span className="font-display text-sm font-bold w-5 text-center text-[var(--text-muted)]">{i + 1}</span>
                {img && <img src={img} alt={name} className="w-8 h-8 rounded-full object-cover border border-[var(--border)]" />}
                <div className="flex-1">
                  <div className="font-condensed text-sm font-semibold">{name}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{s.games} games</div>
                </div>
                <span className="font-mono text-sm text-[var(--text-secondary)]">{s.games > 0 ? Math.round((s.wins / s.games) * 100) : 0}% WR</span>
              </div>
            );
          })}
          {topPicked.length === 0 && <p className="text-sm text-[var(--text-muted)] py-4 text-center">No data yet.</p>}
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
          <h3 className="font-display text-lg text-gold mb-4">Highest Win Rate Leaders</h3>
          <p className="text-[11px] text-[var(--text-muted)] mb-3">Minimum 2 games played</p>
          {topWinRate.map(([name, s], i) => {
            const wr = Math.round((s.wins / s.games) * 100);
            const img = leaderImg(name);
            return (
              <div key={name} className="flex items-center gap-3 py-2.5 border-b border-[var(--border)] last:border-b-0">
                <span className="font-display text-sm font-bold w-5 text-center text-[var(--text-muted)]">{i + 1}</span>
                {img && <img src={img} alt={name} className="w-8 h-8 rounded-full object-cover border border-[var(--border)]" />}
                <div className="flex-1">
                  <div className="font-condensed text-sm font-semibold">{name}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{s.wins}W / {s.games - s.wins}L ({s.games} games)</div>
                </div>
                <span className={`font-mono text-sm font-bold ${wr >= 50 ? "text-[var(--green)]" : "text-[var(--red)]"}`}>{wr}%</span>
              </div>
            );
          })}
          {topWinRate.length === 0 && <p className="text-sm text-[var(--text-muted)] py-4 text-center">No data yet.</p>}
        </div>
      </div>

      {/* Recent Activity */}
      <h2 className="font-display text-xl font-bold mb-1">Recent Activity</h2>
      <div className="w-8 h-0.5 bg-gold mb-4" />
      <div className="space-y-2">
        {recentMatches.map((m) => {
          const p1Won = m.result === "1-0";
          return (
            <div key={m.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-5 py-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-sm">
                {m.player1Civ && leaderImg(m.player1Civ) && <img src={leaderImg(m.player1Civ)} alt="" className="w-6 h-6 rounded-full object-cover" />}
                <span className={`font-condensed font-semibold ${p1Won ? "text-gold" : "text-[var(--text-secondary)]"}`}>P1{m.player1Civ ? ` (${m.player1Civ})` : ""}</span>
                <span className="text-[var(--text-muted)]">vs</span>
                {m.player2Civ && leaderImg(m.player2Civ) && <img src={leaderImg(m.player2Civ)} alt="" className="w-6 h-6 rounded-full object-cover" />}
                <span className={`font-condensed font-semibold ${!p1Won ? "text-gold" : "text-[var(--text-secondary)]"}`}>P2{m.player2Civ ? ` (${m.player2Civ})` : ""}</span>
              </div>
              <span className="font-mono text-[11px] text-[var(--text-muted)]">{m.completedAt ? new Date(m.completedAt).toLocaleDateString() : ""}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
