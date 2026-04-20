// app/api/blog/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST - create a blog post from the website editor
export async function POST(request) {
  try {
    const { title, content, isPinned, password, author } = await request.json();

    // Simple password auth for blog posts
    // Set BLOG_PASSWORD in Vercel env vars
    const blogPassword = process.env.BLOG_PASSWORD;
    if (!blogPassword || password !== blogPassword) {
      return NextResponse.json({ error: "Invalid admin password." }, { status: 401 });
    }

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Title and content required." }, { status: 400 });
    }

    const post = await prisma.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        author: author?.trim() || "Admin",
        isPinned: isPinned || false,
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
