"use client";
import { useState, useMemo } from "react";

export default function RulesClient({ rules: initialRules }) {
  const [rules, setRules] = useState(initialRules);
  const [activeCategory, setActiveCategory] = useState(null);
  const [openRule, setOpenRule] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState(null);
  const [newForm, setNewForm] = useState({ category: "", title: "", content: "", sortOrder: 0 });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

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

  const reload = async () => {
    const res = await fetch("/api/rules");
    const data = await res.json();
    setRules(data.rules || []);
  };

  const saveRule = async (ruleData) => {
    const res = await fetch("/api/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...ruleData, password }),
    });
    const data = await res.json();
    if (res.ok) { showToast("Saved!"); reload(); return true; }
    showToast(data.error || "Failed to save."); return false;
  };

  const deleteRule = async (id) => {
    if (!confirm("Delete this rule?")) return;
    const res = await fetch("/api/rules", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });
    if (res.ok) { showToast("Deleted."); reload(); }
    else showToast("Failed to delete.");
  };

  const inputCls = "w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border)] rounded-md text-[var(--text-primary)] text-sm outline-none focus:border-gold-dim transition-colors";
  const labelCls = "block font-condensed text-[11px] font-semibold tracking-[2px] uppercase text-[var(--text-muted)] mb-1.5";

  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Rules & Policies</h1>
          <div className="w-10 h-0.5 bg-gold mt-2" />
        </div>
        <button onClick={() => setEditMode(!editMode)} className={`px-4 py-2 font-condensed text-xs tracking-wider uppercase rounded-md border transition-all ${editMode ? "text-gold bg-gold/[0.08] border-gold/20" : "text-[var(--text-muted)] border-[var(--border)]"}`}>
          {editMode ? "Done Editing" : "Edit Rules"}
        </button>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-8 max-w-xl leading-relaxed">
        Strategy Inc is a no-quit community. These rules ensure fair and competitive play for everyone.
      </p>

      {editMode && (
        <div className="bg-[var(--bg-card)] border border-gold-dim rounded-xl p-5 mb-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className={labelCls}>Admin Password</label>
              <input type="password" className={inputCls} placeholder="Enter password to edit" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
        </div>
      )}

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
        <div className="space-y-2 mb-8 fade-in">
          {categoryRules.map((rule) => (
            <div key={rule.id} className="border border-[var(--border)] rounded-lg overflow-hidden">
              <button onClick={() => setOpenRule(openRule === rule.id ? null : rule.id)} className="w-full px-6 py-5 flex items-center justify-between bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-colors text-left">
                <span className="font-display text-base font-semibold">{rule.title}</span>
                <span className={`text-gold-dim text-lg transition-transform duration-200 ${openRule === rule.id ? "rotate-180" : ""}`}>▾</span>
              </button>
              {openRule === rule.id && (
                <div className="px-6 pb-5 bg-[var(--bg-card)] fade-in">
                  {editMode && editForm?.id === rule.id ? (
                    <div className="space-y-3 pt-2">
                      <div><label className={labelCls}>Title</label><input className={inputCls} value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></div>
                      <div><label className={labelCls}>Category</label><input className={inputCls} value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} /></div>
                      <div><label className={labelCls}>Content</label><textarea className={`${inputCls} min-h-[150px] resize-y`} rows={6} value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} /></div>
                      <div><label className={labelCls}>Sort Order</label><input type="number" className={inputCls} value={editForm.sortOrder} onChange={(e) => setEditForm({ ...editForm, sortOrder: +e.target.value })} /></div>
                      <div className="flex gap-2 pt-2">
                        <button onClick={async () => { if (await saveRule(editForm)) setEditForm(null); }} className="px-4 py-2 bg-gold text-[var(--bg-primary)] font-condensed text-xs font-semibold tracking-widest uppercase rounded-md">Save</button>
                        <button onClick={() => setEditForm(null)} className="px-4 py-2 border border-[var(--border-bright)] text-[var(--text-secondary)] font-condensed text-xs tracking-widest uppercase rounded-md">Cancel</button>
                        <button onClick={() => deleteRule(rule.id)} className="px-4 py-2 border border-[var(--red)]/30 text-[var(--red)] font-condensed text-xs tracking-widest uppercase rounded-md ml-auto">Delete</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm text-[var(--text-secondary)] leading-7 whitespace-pre-line">{rule.content}</div>
                      {editMode && (
                        <button onClick={() => setEditForm({ id: rule.id, category: rule.category, title: rule.title, content: rule.content, sortOrder: rule.sortOrder })} className="mt-3 px-3 py-1.5 border border-[var(--border-bright)] text-[var(--text-secondary)] font-condensed text-[11px] tracking-wider uppercase rounded-md hover:text-gold">
                          Edit This Rule
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {categoryNames.length === 0 && !editMode && (
        <div className="text-center py-16 text-[var(--text-muted)]">No rules added yet. Click "Edit Rules" to start building your ruleset.</div>
      )}

      {editMode && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 mt-8">
          <h3 className="font-display text-lg text-gold mb-4">Add New Rule</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>Category</label>
              <input className={inputCls} placeholder="e.g. In-Game Rules, Voting, Drop Policy" value={newForm.category} onChange={(e) => setNewForm({ ...newForm, category: e.target.value })} list="cat-suggestions" />
              <datalist id="cat-suggestions">
                {categoryNames.map((c) => <option key={c} value={c} />)}
                {["General", "In-Game Rules", "Exploits", "Voting", "Scraps", "Irrelevancy", "Drop Policy", "Punishments", "Substitute Players", "Re-Maps", "Timed Games"].filter((c) => !categoryNames.includes(c)).map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label className={labelCls}>Title</label>
              <input className={inputCls} placeholder="Rule title" value={newForm.title} onChange={(e) => setNewForm({ ...newForm, title: e.target.value })} />
            </div>
          </div>
          <div className="mb-4">
            <label className={labelCls}>Content</label>
            <textarea className={`${inputCls} min-h-[120px] resize-y`} rows={5} placeholder="Rule details. Line breaks are preserved." value={newForm.content} onChange={(e) => setNewForm({ ...newForm, content: e.target.value })} />
          </div>
          <div className="mb-4 w-32">
            <label className={labelCls}>Sort Order</label>
            <input type="number" className={inputCls} value={newForm.sortOrder} onChange={(e) => setNewForm({ ...newForm, sortOrder: +e.target.value })} />
          </div>
          <button onClick={async () => { if (await saveRule(newForm)) setNewForm({ category: newForm.category, title: "", content: "", sortOrder: newForm.sortOrder + 1 }); }} className="px-5 py-2.5 bg-gold text-[var(--bg-primary)] font-condensed text-xs font-semibold tracking-widest uppercase rounded-md">
            Add Rule
          </button>
        </div>
      )}

      {toast && <div className="fixed bottom-6 right-6 px-5 py-3 bg-[var(--bg-card)] border border-gold-dim rounded-lg text-sm z-50 shadow-2xl fade-in">{toast}</div>}
    </section>
  );
}