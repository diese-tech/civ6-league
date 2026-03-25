// app/rules/page.js
import { RULES } from "@/lib/constants";
import RulesClient from "./RulesClient";

export const metadata = { title: "Rules — Civ VI League" };

export default function RulesPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-bold mb-1">League Rules & Regulations</h1>
      <div className="w-10 h-0.5 bg-gold mb-4" />
      <p className="text-[var(--text-secondary)] mb-10 max-w-xl leading-relaxed">
        All participants must adhere to these rules. They ensure fair, competitive, and enjoyable play for everyone. Rules may be updated between seasons.
      </p>
      <RulesClient rules={RULES} />
    </section>
  );
}
