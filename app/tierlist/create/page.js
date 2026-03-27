// app/tierlist/create/page.js
"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const BBG_BASE = "https://civ6bbg.github.io/images/leaders/";
const BBG_NAMES = { "Qin Shi Huang (Mandate of Heaven)": "Qin (Mandate of Heaven)", "Qin Shi Huang (Unifier)": "Qin (Unifier)" };
const LEADER_CIVS = {"Abraham Lincoln":"America","Teddy Roosevelt (Bull Moose)":"America","Teddy Roosevelt (Rough Rider)":"America","Saladin (Vizier)":"Arabia","Saladin (Sultan)":"Arabia","John Curtin":"Australia","Montezuma":"Aztec","Hammurabi":"Babylon","Pedro II":"Brazil","Basil II":"Byzantium","Theodora":"Byzantium","Wilfrid Laurier":"Canada","Kublai Khan (China)":"China","Qin Shi Huang (Mandate of Heaven)":"China","Qin Shi Huang (Unifier)":"China","Wu Zetian":"China","Yongle":"China","Poundmaker":"Cree","Cleopatra (Egyptian)":"Egypt","Cleopatra (Ptolemaic)":"Egypt","Ramses II":"Egypt","Eleanor of Aquitaine (England)":"England","Elizabeth I":"England","Victoria (Age of Empire)":"England","Victoria (Age of Steam)":"England","Menelik II":"Ethiopia","Catherine de Medici (Black Queen)":"France","Catherine de Medici (Magnificence)":"France","Eleanor of Aquitaine (France)":"France","Ambiorix":"Gaul","Vercingetorix":"Gaul","Tamar":"Georgia","Frederick Barbarossa":"Germany","Ludwig II":"Germany","Simón Bolívar":"Gran Colombia","Gorgo":"Greece","Pericles":"Greece","Matthias Corvinus":"Hungary","Pachacuti":"Inca","Chandragupta":"India","Gandhi":"India","Gitarja":"Indonesia","Hojo Tokimune":"Japan","Tokugawa":"Japan","Jayavarman VII":"Khmer","Mvemba a Nzinga":"Kongo","Nzinga Mbande":"Kongo","Sejong":"Korea","Seondeok":"Korea","Alexander":"Macedon","Olympias":"Macedon","Mansa Musa":"Mali","Sundiata Keita":"Mali","Kupe":"Māori","Lautaro":"Mapuche","Lady Six Sky":"Maya","Te' K'inich II":"Maya","Genghis Khan":"Mongolia","Kublai Khan (Mongolia)":"Mongolia","Wilhelmina":"Netherlands","Harald Hardrada (Varangian)":"Norway","Harald Hardrada (Konge)":"Norway","Amanitore":"Nubia","Suleiman (Kanuni)":"Ottomans","Suleiman (Muhteşem)":"Ottomans","Cyrus":"Persia","Nader Shah":"Persia","Dido":"Phoenicia","Ahiram":"Phoenicia","Jadwiga":"Poland","João III":"Portugal","Julius Caesar":"Rome","Trajan":"Rome","Peter":"Russia","Robert the Bruce":"Scotland","Tomyris":"Scythia","Philip II":"Spain","Gilgamesh":"Sumeria","Al-Hasan ibn Sulaiman":"Swahili","Kristina":"Sweden","Spearthrower Owl":"Teotihuacán","Kiviuq":"Thule","Trisong Detsen":"Tibet","Bà Triệu":"Vietnam","Shaka":"Zulu"};

const ALL_LEADERS = Object.keys(LEADER_CIVS);

function leaderImg(name) {
  const civ = LEADER_CIVS[name];
  if (!civ) return null;
  const bbg = BBG_NAMES[name] || name;
  return `${BBG_BASE}${encodeURIComponent(`${civ} ${bbg}`)}.webp`;
}

const TIERS = [
  { key: "S", color: "#F5A623", bg: "rgba(245,166,35,0.12)" },
  { key: "A", color: "#4AD97A", bg: "rgba(74,217,122,0.1)" },
  { key: "B", color: "#4A90D9", bg: "rgba(74,144,217,0.1)" },
  { key: "C", color: "#9B59B6", bg: "rgba(155,89,182,0.1)" },
  { key: "D", color: "#D94A4A", bg: "rgba(217,74,74,0.1)" },
  { key: "F", color: "#555B72", bg: "rgba(85,91,114,0.1)" },
];

export default function CreateTierListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("My Tier List");
  const [tiers, setTiers] = useState(() => {
    const t = {};
    TIERS.forEach((tier) => { t[tier.key] = []; });
    t["unranked"] = [...ALL_LEADERS];
    return t;
  });
  const [dragging, setDragging] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  // Drag handlers
  const handleDragStart = (leader, fromTier) => {
    setDragging({ leader, fromTier });
  };

  const handleDrop = (toTier) => {
    if (!dragging) return;
    const { leader, fromTier } = dragging;
    if (fromTier === toTier) { setDragging(null); return; }

    setTiers((prev) => {
      const next = { ...prev };
      next[fromTier] = prev[fromTier].filter((l) => l !== leader);
      next[toTier] = [...prev[toTier], leader];
      return next;
    });
    setDragging(null);
  };

  const handleDragOver = (e) => { e.preventDefault(); };

  // Move leader via click (mobile friendly)
  const moveLeader = (leader, fromTier, direction) => {
    const tierKeys = [...TIERS.map((t) => t.key), "unranked"];
    const fromIdx = tierKeys.indexOf(fromTier);
    let toIdx = fromIdx + direction;
    if (toIdx < 0 || toIdx >= tierKeys.length) return;

    setTiers((prev) => {
      const next = { ...prev };
      next[fromTier] = prev[fromTier].filter((l) => l !== leader);
      next[tierKeys[toIdx]] = [...prev[tierKeys[toIdx]], leader];
      return next;
    });
  };

  // Reset
  const resetAll = () => {
    setTiers(() => {
      const t = {};
      TIERS.forEach((tier) => { t[tier.key] = []; });
      t["unranked"] = [...ALL_LEADERS];
      return t;
    });
  };

  // Save
  const saveTierList = async () => {
    if (!session) { signIn("discord"); return; }

    const entries = [];
    for (const tier of TIERS) {
      tiers[tier.key].forEach((leader, i) => {
        entries.push({ leaderKey: leader, tier: tier.key, position: i });
      });
    }

    if (entries.length === 0) {
      showToast("Place at least one leader in a tier before saving.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/tierlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, entries, isPublic: true }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Saved!");
        router.push(`/tierlist/${data.slug}`);
      } else {
        showToast(data.error || "Failed to save.");
      }
    } catch {
      showToast("Network error.");
    }
    setSaving(false);
  };

  const filteredUnranked = search
    ? tiers.unranked.filter((l) => l.toLowerCase().includes(search.toLowerCase()) || LEADER_CIVS[l]?.toLowerCase().includes(search.toLowerCase()))
    : tiers.unranked;

  const rankedCount = ALL_LEADERS.length - tiers.unranked.length;

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Create Tier List</h1>
          <div className="w-10 h-0.5 bg-gold mt-2" />
        </div>
        <div className="flex gap-2">
          <button onClick={resetAll} className="px-4 py-2 border border-[var(--border-bright)] text-[var(--text-muted)] font-condensed text-xs tracking-wider uppercase rounded-md hover:text-[var(--red)]">
            Reset
          </button>
          <button onClick={saveTierList} disabled={saving} className="px-5 py-2 bg-gold text-[var(--bg-primary)] font-condensed text-xs font-semibold tracking-widest uppercase rounded-md hover:bg-gold-bright disabled:opacity-50">
            {!session ? "Sign In to Save" : saving ? "Saving..." : `Save (${rankedCount}/${ALL_LEADERS.length})`}
          </button>
        </div>
      </div>

      {/* Title */}
      <input
        className="w-full max-w-md px-4 py-2 mb-6 bg-[var(--bg-input)] border border-[var(--border)] rounded-md text-[var(--text-primary)] text-sm outline-none focus:border-gold-dim"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tier list title..."
      />

      {/* Tier Rows */}
      <div className="space-y-2 mb-8">
        {TIERS.map((tier) => (
          <div
            key={tier.key}
            className="flex gap-2 items-stretch min-h-[72px]"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(tier.key)}
          >
            {/* Tier Label */}
            <div
              className="w-14 shrink-0 rounded-lg flex items-center justify-center font-display text-2xl font-bold"
              style={{ color: tier.color, background: tier.bg, border: `1px solid ${tier.color}33` }}
            >
              {tier.key}
            </div>
            {/* Drop Zone */}
            <div className={`flex-1 min-h-[72px] bg-[var(--bg-card)] border rounded-lg p-2 flex flex-wrap gap-1.5 items-start transition-colors ${dragging ? "border-gold/30" : "border-[var(--border)]"}`}>
              {tiers[tier.key].map((leader) => (
                <div
                  key={leader}
                  draggable
                  onDragStart={() => handleDragStart(leader, tier.key)}
                  className="flex items-center gap-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md px-2 py-1.5 cursor-grab active:cursor-grabbing hover:border-[var(--border-bright)] transition-colors group"
                  title={`${leader} (${LEADER_CIVS[leader]})`}
                >
                  {leaderImg(leader) && <img src={leaderImg(leader)} alt="" className="w-7 h-7 rounded-full object-cover" />}
                  <span className="font-condensed text-xs font-semibold truncate max-w-[100px]">{leader.split("(")[0].trim()}</span>
                  {/* Mobile: tap arrows */}
                  <button onClick={() => moveLeader(leader, tier.key, 1)} className="hidden group-hover:block text-[var(--text-muted)] hover:text-[var(--red)] text-xs ml-1">▼</button>
                  <button onClick={() => moveLeader(leader, tier.key, -1)} className="hidden group-hover:block text-[var(--text-muted)] hover:text-[var(--green)] text-xs">▲</button>
                </div>
              ))}
              {tiers[tier.key].length === 0 && (
                <div className="text-xs text-[var(--text-muted)] italic py-2 px-3">Drag leaders here</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Unranked Pool */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="font-display text-lg">
            Unranked <span className="text-[var(--text-muted)] text-sm font-mono">({tiers.unranked.length} remaining)</span>
          </h3>
          <input
            className="px-3 py-1.5 bg-[var(--bg-input)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] outline-none focus:border-gold-dim w-48"
            placeholder="Search leaders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div
          className="flex flex-wrap gap-1.5"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop("unranked")}
        >
          {filteredUnranked.map((leader) => (
            <div
              key={leader}
              draggable
              onDragStart={() => handleDragStart(leader, "unranked")}
              className="flex items-center gap-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md px-2 py-1.5 cursor-grab active:cursor-grabbing hover:border-gold/30 transition-colors"
              title={`${leader} (${LEADER_CIVS[leader]})`}
            >
              {leaderImg(leader) && <img src={leaderImg(leader)} alt="" className="w-7 h-7 rounded-full object-cover" />}
              <div>
                <div className="font-condensed text-xs font-semibold truncate max-w-[110px]">{leader.split("(")[0].trim()}</div>
                <div className="font-mono text-[9px] text-[var(--text-muted)]">{LEADER_CIVS[leader]}</div>
              </div>
            </div>
          ))}
          {filteredUnranked.length === 0 && tiers.unranked.length > 0 && (
            <div className="text-xs text-[var(--text-muted)] py-2">No matches for "{search}"</div>
          )}
          {tiers.unranked.length === 0 && (
            <div className="text-sm text-[var(--green)] py-4 text-center w-full">All leaders ranked!</div>
          )}
        </div>
      </div>

      {toast && <div className="fixed bottom-6 right-6 px-5 py-3 bg-[var(--bg-card)] border border-gold-dim rounded-lg text-sm z-50 shadow-2xl fade-in">{toast}</div>}
    </section>
  );
}
