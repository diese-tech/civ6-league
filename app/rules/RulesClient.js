"use client";
import { useState, useMemo } from "react";

export default function RulesClient({ rules }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [openRule, setOpenRule] = useState(null);

  const categories = useMemo(() => {
    const cats = {};
    for (const r of rules) {
      if (!cats[r.category]) cats[r.category] = [];
      cats[r.category].push(r);
    }
    return cats;
  }, [rules]);

  const categoryNames = Object.keys(categories);
  const selectedCategory = activeCategory || categoryNames[0] || null;
  const categoryRules = selectedCategory ? (categories[selectedCategory] || []) : [];

  const catIcons = {
    "General": "📋", "In-Game Rules": "🎮", "Exploits": "🚫", "Voting": "🗳️",
    "Scraps": "🗑️", "Irrelevancy": "📉", "Drop Policy": "🚪", "Punishments": "⚠️",
    "Substitute Players": "🔄", "Re-Maps": "🗺️", "Timed Games": "⏱️",
    "Conduct": "🤝", "Match Format": "⚔️", "Rating System": "📊",
    "Disconnections": "🔌", "Seasons": "🏆", "Tournaments": "🏟️",
  };

  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-bold mb-2">Rules & Policies</h1>
      <div className="w-10 h-0.5 bg-gold mb-4" />
      <p className="text-sm text-[var(--text-secondary)] mb-8 max-w-xl leading-relaxed">
        Strategy Inc is a no-quit community. These rules ensure fair and competitive play for everyone.
      </p>

      {categoryNames.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {categoryNames.map((cat) => (
            <button key={cat} onClick={() => { setActiveCategory(cat); setOpenRule(null); }} className={`px-4 py-2.5 font-condensed text-xs font-medium tracking-wider uppercase rounded-md border transition-all flex items-center gap-1.5 ${selectedCategory === cat ? "text-gold bg-gold/[0.08] border-gold/20" : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]"}`}>
              <span>{catIcons[cat] || "📄"}</span>{cat}<span className="ml-1 text-[10px] opacity-60">({categories[cat].length})</span>
            </button>
          ))}
        </div>
      )}

      {selectedCategory && categoryRules.length > 0 && (
        <div className="space-y-2 fade-in">
          {categoryRules.map((rule) => (
            <div key={rule.id} className="border border-[var(--border)] rounded-lg overflow-hidden">
              <button onClick={() => setOpenRule(openRule === rule.id ? null : rule.id)} className="w-full px-6 py-5 flex items-center justify-between bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-colors text-left">
                <span className="font-display text-base font-semibold">{rule.title}</span>
                <span className={`text-gold-dim text-lg transition-transform duration-200 ${openRule === rule.id ? "rotate-180" : ""}`}>▾</span>
              </button>
              {openRule === rule.id && (
                <div className="px-6 pb-5 bg-[var(--bg-card)] fade-in">
                  <div className="text-sm text-[var(--text-secondary)] leading-7 whitespace-pre-line">{rule.content}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {categoryNames.length === 0 && (
        <div className="text-center py-16 text-[var(--text-muted)]">Rules are being updated. Check back soon.</div>
      )}
    </section>
  );
}