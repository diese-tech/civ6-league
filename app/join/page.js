// app/join/page.js
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function JoinPage() {
  const [form, setForm] = useState({ username: "", email: "", discord: "" });
  const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!form.username.trim() || form.username.trim().length < 2) {
      setStatus("error");
      setMessage("Username must be at least 2 characters.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim() || null,
          discordTag: form.discord.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Registration failed.");
        return;
      }

      setStatus("success");
      setMessage(`Welcome, ${data.username}! You've been registered in Prince division (ELO 1000). Join our Discord to get started.`);
      setForm({ username: "", email: "", discord: "" });
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <section className="max-w-lg mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl font-bold mb-1">Join the League</h1>
        <div className="w-10 h-0.5 bg-gold mx-auto mb-4" />
        <p className="text-[var(--text-secondary)] leading-relaxed">
          Register to compete in the Civilization VI Competitive League. New players start in Prince division and rank up through placement matches.
        </p>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-8 fade-in">
        {/* Status Message */}
        {status === "success" && (
          <div className="mb-6 p-4 rounded-lg bg-[var(--green)]/10 border border-[var(--green)]/20 text-[var(--green)] text-sm">
            {message}
          </div>
        )}
        {status === "error" && (
          <div className="mb-6 p-4 rounded-lg bg-[var(--red)]/10 border border-[var(--red)]/20 text-[var(--red)] text-sm">
            {message}
          </div>
        )}

        {/* Form */}
        <div className="mb-5">
          <label className="block font-condensed text-[11px] font-semibold tracking-[2px] uppercase text-[var(--text-muted)] mb-1.5">
            Username *
          </label>
          <input
            className="w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border)] rounded-md text-[var(--text-primary)] text-sm outline-none focus:border-gold-dim transition-colors"
            placeholder="Your in-game name"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>

        <div className="mb-5">
          <label className="block font-condensed text-[11px] font-semibold tracking-[2px] uppercase text-[var(--text-muted)] mb-1.5">
            Email (Optional)
          </label>
          <input
            type="email"
            className="w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border)] rounded-md text-[var(--text-primary)] text-sm outline-none focus:border-gold-dim transition-colors"
            placeholder="your@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="mb-6">
          <label className="block font-condensed text-[11px] font-semibold tracking-[2px] uppercase text-[var(--text-muted)] mb-1.5">
            Discord Username
          </label>
          <input
            className="w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border)] rounded-md text-[var(--text-primary)] text-sm outline-none focus:border-gold-dim transition-colors"
            placeholder="username"
            value={form.discord}
            onChange={(e) => setForm({ ...form, discord: e.target.value })}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={status === "loading"}
          className="w-full px-6 py-3 bg-gold text-[var(--bg-primary)] font-condensed text-sm font-semibold tracking-widest uppercase rounded-md hover:bg-gold-bright transition-all disabled:opacity-50"
        >
          {status === "loading" ? "Registering..." : "Register"}
        </button>

        {/* Divider */}
        <div className="my-6 h-px bg-gradient-to-r from-transparent via-[var(--border-bright)] to-transparent" />

        {/* Discord OAuth */}
        <div className="text-center">
          <button
            onClick={() => signIn("discord", { callbackUrl: "/" })}
            className="px-6 py-3 bg-[#5865F2]/10 border border-[#5865F2] text-[#5865F2] font-condensed text-sm font-semibold tracking-widest uppercase rounded-md hover:bg-[#5865F2]/20 transition-all"
          >
            Sign in with Discord
          </button>
          <p className="text-xs text-[var(--text-muted)] mt-3">
            Discord sign-in auto-creates your account if you don&apos;t have one.
          </p>
        </div>
      </div>
    </section>
  );
}
