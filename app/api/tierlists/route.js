// app/api/tierlists/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/tierlists?playerId=X or GET /api/tierlists (all public)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get("playerId");
  const slug = searchParams.get("slug");

  if (slug) {
    const tierList = await prisma.tierList.findUnique({
      where: { slug },
      include: { entries: { orderBy: { position: "asc" } }, player: { select: { id: true, username: true, avatarUrl: true } } },
    });
    if (!tierList) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ tierList });
  }

  const where = { isPublic: true };
  if (playerId) where.playerId = parseInt(playerId);

  const tierLists = await prisma.tierList.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      player: { select: { id: true, username: true, avatarUrl: true } },
      _count: { select: { entries: true } },
    },
    take: 50,
  });

  return NextResponse.json({ tierLists });
}

// POST /api/tierlists - create or update a tier list (requires auth)
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in with Discord to save tier lists." }, { status: 401 });
  }

  try {
    const { id, title, entries, isPublic } = await request.json();
    // entries: [{ leaderKey: "Hammurabi", tier: "S", position: 0 }, ...]

    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json({ error: "Entries required" }, { status: 400 });
    }

    const playerId = parseInt(session.user.id);

    if (id) {
      // Update existing
      const existing = await prisma.tierList.findUnique({ where: { id } });
      if (!existing || existing.playerId !== playerId) {
        return NextResponse.json({ error: "Not found or not yours" }, { status: 403 });
      }

      // Delete old entries and recreate
      await prisma.tierListEntry.deleteMany({ where: { tierListId: id } });
      await prisma.tierList.update({
        where: { id },
        data: {
          title: title || "My Tier List",
          isPublic: isPublic !== false,
          entries: {
            create: entries.map((e, i) => ({
              leaderKey: e.leaderKey,
              tier: e.tier,
              position: e.position ?? i,
            })),
          },
        },
      });

      return NextResponse.json({ success: true, slug: existing.slug });
    } else {
      // Create new
      const slug = `${session.user.name?.toLowerCase().replace(/[^a-z0-9]/g, "") || "player"}-${Date.now().toString(36)}`;

      const tierList = await prisma.tierList.create({
        data: {
          slug,
          playerId,
          title: title || "My Tier List",
          isPublic: isPublic !== false,
          entries: {
            create: entries.map((e, i) => ({
              leaderKey: e.leaderKey,
              tier: e.tier,
              position: e.position ?? i,
            })),
          },
        },
      });

      return NextResponse.json({ success: true, slug: tierList.slug });
    }
  } catch (err) {
    console.error("[TierList] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/tierlists
export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  const existing = await prisma.tierList.findUnique({ where: { id } });
  if (!existing || existing.playerId !== parseInt(session.user.id)) {
    return NextResponse.json({ error: "Not found or not yours" }, { status: 403 });
  }

  await prisma.tierList.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
