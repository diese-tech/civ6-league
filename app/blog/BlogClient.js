"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

export default function BlogClient({ posts }) {
  const [filter, setFilter] = useState("all");

  const months = useMemo(() => {
    const m = {};
    for (const p of posts) {
      const d = new Date(p.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (!m[key]) m[key] = { key, label, count: 0 };
      m[key].count += 1;
    }
    return Object.values(m).sort((a, b) => b.key.localeCompare(a.key));
  }, [posts]);

  const filtered = useMemo(() => {
    if (filter === "all") return posts;
    return posts.filter((p) => {
      const d = new Date(p.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return key === filter;
    });
  }, [posts, filter]);

  const fmt = (d) => new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <section className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Blog & Announcements</h1>
          <div className="w-10 h-0.5 bg-gold mt-2" />
        </div>
        <Link href="/blog/new" className="px-5 py-2 bg-gold text-[var(--bg-primary)] font-condensed text-xs font-semibold tracking-widest uppercase rounded-md hover:bg-gold-bright transition-all">
          New Post
        </Link>
      </div>

      {/* Date Filter */}
      {months.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setFilter("all")} className={`px-4 py-2 font-condensed text-xs tracking-wider uppercase rounded-md border transition-all ${filter === "all" ? "text-gold bg-gold/[0.08] border-gold/20" : "text-[var(--text-muted)] border-transparent"}`}>
            All ({posts.length})
          </button>
          {months.map((m) => (
            <button key={m.key} onClick={() => setFilter(m.key)} className={`px-4 py-2 font-condensed text-xs tracking-wider uppercase rounded-md border transition-all ${filter === m.key ? "text-gold bg-gold/[0.08] border-gold/20" : "text-[var(--text-muted)] border-transparent"}`}>
              {m.label} ({m.count})
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((post) => (
          <Link key={post.id} href={`/blog/${post.id}`} className="block">
            <article className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 hover:border-gold/30 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                {post.isPinned && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-condensed font-semibold tracking-wider uppercase bg-gold/15 text-gold border border-gold/25">
                    Pinned
                  </span>
                )}
                <span className="font-mono text-[11px] text-[var(--text-muted)]">{fmt(post.createdAt)}</span>
              </div>
              <h2 className="font-display text-xl font-bold mb-2 group-hover:text-gold">{post.title}</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line line-clamp-3">
                {post.content}
              </p>
              <span className="inline-block mt-3 text-xs text-gold font-condensed tracking-wider uppercase">Read more →</span>
            </article>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[var(--text-muted)]">
            {filter === "all" ? "No posts yet." : "No posts for this period."}
          </div>
        )}
      </div>
    </section>
  );
}