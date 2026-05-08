// app/blog/[id]/page.js
import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export async function generateMetadata({ params }) {
  const post = await prisma.announcement.findUnique({ where: { id: parseInt(params.id) } });
  return { title: post ? `${post.title} — Strategy Inc` : "Post Not Found" };
}

export default async function BlogPostPage({ params }) {
  const post = await prisma.announcement.findUnique({ where: { id: parseInt(params.id) } });
  if (!post) notFound();

  const fmt = (d) => new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <section className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/blog" className="inline-block px-4 py-2 border border-[var(--border-bright)] text-[var(--text-secondary)] font-condensed text-xs tracking-wider uppercase rounded-md hover:text-[var(--text-primary)] mb-6">
        ← Back to Blog
      </Link>

      <article className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-8">
        <div className="flex items-center gap-2 mb-4">
          {post.isPinned && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-condensed font-semibold tracking-wider uppercase bg-gold/15 text-gold border border-gold/25">
              Pinned
            </span>
          )}
          <span className="font-mono text-[11px] text-[var(--text-muted)]">{fmt(post.createdAt)}</span>
        </div>
        <h1 className="font-display text-3xl font-bold mb-6">{post.title}</h1>
        <div className="w-full h-px bg-[var(--border)] mb-6" />
        <div className="text-sm text-[var(--text-secondary)] leading-8 whitespace-pre-line">
          {post.content}
        </div>
      </article>
    </section>
  );
}
