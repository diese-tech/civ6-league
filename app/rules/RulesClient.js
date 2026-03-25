// app/rules/RulesClient.js
"use client";
import { useState } from "react";

export default function RulesClient({ rules }) {
  const [open, setOpen] = useState(null);

  return (
    <div className="space-y-2">
      {rules.map((rule, i) => (
        <div key={i} className="border border-[var(--border)] rounded-lg overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full px-6 py-5 flex items-center justify-between bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-colors text-left"
          >
            <span className="font-display text-base font-semibold">{rule.title}</span>
            <span className={`text-gold-dim text-lg transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}>▾</span>
          </button>
          {open === i && (
            <div className="px-6 pb-5 bg-[var(--bg-card)] text-[var(--text-secondary)] text-sm leading-7 whitespace-pre-line fade-in">
              {rule.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
