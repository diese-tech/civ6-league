// app/rules/page.js
"use client";
import { useState, useEffect } from "react";

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [toast, setToast] = useState(null);
  const [newRule, setNewRule] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    fetch("/api/rules").then((r) => r.json()).then((d) => {
      setRules(d.rules || []);
      if (d.rules?.length > 0) setActiveTab(d.rules[0].id);
    });
  }, []);

  const saveRule = async (ruleData, action = "update") => {
    const res = await fetch("/api/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, action, data: ruleData }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast(action === "create" ? "Rule added!" : "Rule saved!");
      // Reload rules
      const r = await fetch("/api/rules").then((x) => x.json());
      setRules(r.rules || []);
      setEditingRule(null);
      setNewRule(false);
    } else {
      showToast(data.error || "Failed to save.");
    }
  };

  const deleteRule = async (id) => {
    if (!confirm("Delete this rule section?")) return;
    const res = await fetch("/api/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, action: "delete", data: { id } }),
    });
    if (res.ok) {
      showToast("Deleted.");
      const r = await fetch("/api/rules").then((x) => x.json());
      setRules(r.rules || []);
      if (activeTab === id && r.rules.length > 0) setActiveTab(r.rules[0].id);
    }
  };

  const activeRule = rules.find((r) => r.id === activeTab);

  const inputCls = "w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border)] rounded-md text-[var(--text-primary)] text-sm outline-none focus:border-gold-dim transition-colors";
  const labelCls = "block font-condensed text-[11px] font-semibold tracking-[2px] uppercase text-[var(--text-muted)] mb-1.5";

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Rules & Policies</h1>
          <div className="w-10 h-0.5 bg-gold mt-2" />
        </div>
        {!editMode ? (
          <button onClick={() => setEditMode(true)} className="px-4 py-2 border border-[var(--border-bright)] text-[var(--text-muted)] font-condensed text-xs tracking-wider uppercase rounded-md hover:text-[var(--text-secondary)]">
            Edit Rules
          </button>
        ) : !authed ? null : (
          <button onClick={() => { setEditMode(false); setEditingRule(null); setNewRule(false); }} className="px-4 py-2 border border-[var(--border-bright)] text-[var(--text-muted)] font-condensed text-xs tracking-wider uppercase rounded-md">
            Done Editing
          </button>
        )}
      </div>

      {/* Admin password prompt */}
      {editMode && !authed && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 mb-6 max-w-sm fade-in">
          <label className={labelCls}>Admin Password</label>
          <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
          <button onClick={() => { if (password) setAuthed(true); else showToast("Enter a password."); }} className="mt-3 px-5 py-2 bg-gold text-[var(--bg-primary)] font-condensed text-xs font-semibold tracking-widest uppercase rounded-md">
            Unlock
          </button>
        </div>
      )}

      {/* Quick Summary */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 mb-8">
        <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
          Strategy Inc is a <span className="text-gold font-semibold">no-quit community</span>. Our rules ensure fair, competitive, and enjoyable play for all players. Select a category below to view the full details.
        </p>
      </div>

      {rules.length === 0 && !editMode && (
        <div className="text-center py-16 text-[var(--text-muted)]">
          No rules configured yet. Click "Edit Rules" to add your rule categories.
        </div>
      )}

      {rules.length > 0 && (
        <div className="flex gap-6 flex-col md:flex-row">
          {/* Sidebar Tabs */}
          <div className="md:w-64 shrink-0">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
              {rules.map((rule) => (
                <button
                  key={rule.id}
                  onClick={() => { setActiveTab(rule.id); setEditingRule(null); }}
                  className={`w-full text-left px-5 py-4 flex items-center gap-3 border-b border-[var(--border)] last:border-b-0 transition-all ${
                    activeTab === rule.id
                      ? "bg-gold/[0.08] text-gold border-l-2 border-l-gold"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] border-l-2 border-l-transparent"
                  }`}
                >
                  <span className="text-lg">{rule.icon}</span>
                  <div>
                    <div className="font-condensed text-sm font-semibold">{rule.title}</div>
                    {rule.summary && <div className="text-[11px] text-[var(--text-muted)] mt-0.5 line-clamp-1">{rule.summary}</div>}
                  </div>
                </button>
              ))}
            </div>

            {/* Add Rule Button (admin) */}
            {editMode && authed && (
              <button onClick={() => { setNewRule(true); setEditingRule(null); }} className="w-full mt-3 px-5 py-3 border border-dashed border-gold/30 text-gold font-condensed text-xs tracking-wider uppercase rounded-xl hover:bg-gold/[0.05] transition-all">
                + Add Rule Category
              </button>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {activeRule && !editingRule && !newRule && (
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-8 fade-in">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{activeRule.icon}</span>
                      <h2 className="font-display text-2xl font-bold">{activeRule.title}</h2>
                    </div>
                    {activeRule.summary && (
                      <p className="text-sm text-[var(--text-muted)] italic">{activeRule.summary}</p>
                    )}
                  </div>
                  {editMode && authed && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setEditingRule({ ...activeRule })} className="px-3 py-1.5 border border-[var(--border-bright)] text-[var(--text-secondary)] font-condensed text-[11px] tracking-wider uppercase rounded-md hover:text-gold">
                        Edit
                      </button>
                      <button onClick={() => deleteRule(activeRule.id)} className="px-3 py-1.5 border border-[var(--red)]/30 text-[var(--red)] font-condensed text-[11px] tracking-wider uppercase rounded-md hover:bg-[var(--red)]/10">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <div className="w-full h-px bg-[var(--border)] mb-6" />
                <div className="text-sm text-[var(--text-secondary)] leading-7 whitespace-pre-line">
                  {activeRule.content}
                </div>
              </div>
            )}

            {/* Edit/Create Form */}
            {(editingRule || newRule) && editMode && authed && (
              <div className="bg-[var(--bg-card)] border border-gold/20 rounded-xl p-8 fade-in">
                <h3 className="font-display text-lg text-gold mb-6">{editingRule ? "Edit Rule" : "New Rule Category"}</h3>
                <EditForm
                  initial={editingRule || { title: "", summary: "", content: "", icon: "📜", sortOrder: rules.length }}
                  onSave={(data) => saveRule(data, editingRule ? "update" : "create")}
                  onCancel={() => { setEditingRule(null); setNewRule(false); }}
                  inputCls={inputCls}
                  labelCls={labelCls}
                />
              </div>
            )}
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

function EditForm({ initial, onSave, onCancel, inputCls, labelCls }) {
  const [form, setForm] = useState(initial);

  return (
    <div>
      <div className="grid grid-cols-[auto_1fr] gap-4 mb-4">
        <div>
          <label className={labelCls}>Icon</label>
          <input className={`${inputCls} w-16 text-center text-lg`} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Title</label>
          <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. In-Game Rules" />
        </div>
      </div>
      <div className="mb-4">
        <label className={labelCls}>Summary (short description for sidebar)</label>
        <input className={inputCls} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Brief description" />
      </div>
      <div className="mb-4">
        <label className={labelCls}>Content</label>
        <textarea className={`${inputCls} min-h-[300px] resize-y leading-6`} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Full rule text. Line breaks are preserved." rows={15} />
      </div>
      <div className="mb-6">
        <label className={labelCls}>Sort Order</label>
        <input type="number" className={`${inputCls} w-24`} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
      </div>
      <div className="flex gap-3">
        <button onClick={() => onSave(form)} className="px-5 py-2 bg-gold text-[var(--bg-primary)] font-condensed text-xs font-semibold tracking-widest uppercase rounded-md">Save</button>
        <button onClick={onCancel} className="px-5 py-2 border border-[var(--border-bright)] text-[var(--text-secondary)] font-condensed text-xs tracking-widest uppercase rounded-md">Cancel</button>
      </div>
    </div>
  );
}
