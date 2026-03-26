// app/api/announcements/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - fetch announcements for display
export async function GET() {
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: 20,
  });
  return NextResponse.json({ announcements });
}

// POST - create announcement (from bot)
export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.BOT_SYNC_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, content, isPinned } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content required" }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: { title, content, isPinned: isPinned || false },
    });

    return NextResponse.json({ success: true, announcement });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}