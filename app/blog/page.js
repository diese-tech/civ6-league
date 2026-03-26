// app/blog/page.js
import { prisma } from "@/lib/db";
import Link from "next/link";

export const revalidate = 30;
export const metadata = { title: "Blog — Strategy Inc" };

export default async function BlogPage() {
  const posts = await prisma.announcement.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

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

      <div className="space-y-4">
        {posts.map((post) => (
          <article key={post.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--border-bright)] transition-colors">
            <div className="flex items-center gap-2 mb-3">
              {post.isPinned && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-condensed font-semibold tracking-wider uppercase bg-gold/15 text-gold border border-gold/25">
                  Pinned
                </span>
              )}
              <span className="font-mono text-[11px] text-[var(--text-muted)]">
                {new Date(post.createdAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <h2 className="font-display text-xl font-bold mb-3">{post.title}</h2>
            <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
              {post.content}
            </div>
          </article>
        ))}
        {posts.length === 0 && (
          <div className="text-center py-16 text-[var(--text-muted)]">
            No posts yet. Create one using the button above or the <code className="text-gold">.announce</code> command in Discord.
          </div>
        )}
      </div>
    </section>
  );
}
