// app/api/players/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/players?division=Deity&limit=50&offset=0
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const division = searchParams.get("division");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  const where = {};
  if (division) where.division = division;

  const [players, total] = await Promise.all([
    prisma.player.findMany({
      where,
      orderBy: { eloRating: "desc" },
      take: limit,
      skip: offset,
      include: { badges: true },
    }),
    prisma.player.count({ where }),
  ]);

  return NextResponse.json({ players, total, limit, offset });
}

// POST /api/players — Register new player
export async function POST(request) {
  try {
    const { username, email, discordTag } = await request.json();

    if (!username || username.trim().length < 2) {
      return NextResponse.json({ error: "Username must be at least 2 characters" }, { status: 400 });
    }

    const existing = await prisma.player.findUnique({ where: { username: username.trim() } });
    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const player = await prisma.player.create({
      data: {
        username: username.trim(),
        email: email?.trim() || null,
        discordTag: discordTag?.trim() || null,
      },
    });

    return NextResponse.json(player, { status: 201 });
  } catch (err) {
    console.error("Create player error:", err);
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 });
  }
}
