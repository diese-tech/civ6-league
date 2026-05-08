// app/blog/page.js
import { prisma } from "@/lib/db";
import Link from "next/link";
import BlogClient from "./BlogClient";

export const dynamic = "force-dynamic";
export const revalidate = 30;
export const metadata = { title: "Blog — Strategy Inc" };

export default async function BlogPage() {
  const posts = await prisma.announcement.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  const ser = (d) => (d instanceof Date ? d.toISOString() : d);

  return (
    <BlogClient posts={posts.map((p) => ({ ...p, createdAt: ser(p.createdAt) }))} />
  );
}
