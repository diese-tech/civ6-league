// app/blog/new/page.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPostPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", content: "", isPinned: false });
  const [status, setStatus] = useState(null);
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setStatus({ type: "error", msg: "Title and content are required." });
      return;
    }
    if (!password) {
      setStatus({ type: "error", msg: "Admin password required." });
      return;
    }

    setStatus({ type: "loading", msg: "Publishing..." });

    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", msg: "Published!" });
        setTimeout(() => router.push("/blog"), 1000);
      } else {
        setStatus({ type: "error", msg: data.error || "Failed to publish." });
      }
    } catch {
      setStatus({ type: "error", msg: "Network error." });
    }
  };

  const inputCls = "w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border)] rounded-md text-[var(--text-primary)] text-sm outline-none focus:border-gold-dim transition-colors";
  const labelCls = "block font-condensed text-[11px] font-semibold tracking-[2px] uppercase text-[var(--text-muted)] mb-1.5";

  return (
    <section className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-bold mb-1">New Post</h1>
      <div className="w-10 h-0.5 bg-gold mb-8" />

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-8">
        {status && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${
            status.type === "error" ? "bg-[var(--red)]/10 border border-[var(--red)]/20 text-[var(--red)]" :
            status.type === "success" ? "bg-[var(--green)]/10 border border-[var(--green)]/20 text-[var(--green)]" :
            "bg-accent/10 border border-accent/20 text-accent"
          }`}>
            {status.msg}
          </div>
        )}

        <div className="mb-5">
          <label className={labelCls}>Title</label>
          <input className={inputCls} placeholder="Post title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>

        <div className="mb-5">
          <label className={labelCls}>Content</label>
          <textarea
            className={`${inputCls} min-h-[200px] resize-y`}
            placeholder="Write your announcement or blog post here..."
            rows={10}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Line breaks are preserved. No markdown support yet.</p>
        </div>

        <label className="flex items-center gap-3 mb-5 cursor-pointer">
          <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} className="w-4 h-4 accent-[var(--gold)]" />
          <span className="text-sm text-[var(--text-secondary)]">Pin this post (appears at the top)</span>
        </label>

        <div className="mb-6">
          <label className={labelCls}>Admin Password</label>
          <input type="password" className={inputCls} placeholder="Enter admin password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="flex gap-3">
          <button onClick={handleSubmit} disabled={status?.type === "loading"} className="px-6 py-3 bg-gold text-[var(--bg-primary)] font-condensed text-sm font-semibold tracking-widest uppercase rounded-md hover:bg-gold-bright transition-all disabled:opacity-50">
            {status?.type === "loading" ? "Publishing..." : "Publish"}
          </button>
          <button onClick={() => router.push("/blog")} className="px-6 py-3 border border-[var(--border-bright)] text-[var(--text-secondary)] font-condensed text-sm tracking-widest uppercase rounded-md">
            Cancel
          </button>
        </div>
      </div>

      {/* Preview */}
      {form.title && (
        <div className="mt-8">
          <h3 className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] mb-3">Preview</h3>
          <article className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              {form.isPinned && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-condensed font-semibold tracking-wider uppercase bg-gold/15 text-gold border border-gold/25">Pinned</span>}
              <span className="font-mono text-[11px] text-[var(--text-muted)]">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
            </div>
            <h2 className="font-display text-xl font-bold mb-3">{form.title}</h2>
            <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{form.content}</div>
          </article>
        </div>
      )}
    </section>
  );
}
