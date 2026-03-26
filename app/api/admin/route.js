// app/api/admin/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(request) {
  try {
    const { type, id } = await request.json();

    if (type === "player") {
      // Delete player's matches first, then the player
      await prisma.match.deleteMany({
        where: { OR: [{ player1Id: id }, { player2Id: id }] },
      });
      await prisma.badge.deleteMany({ where: { playerId: id } });
      await prisma.player.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (type === "match") {
      await prisma.match.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (type === "season") {
      // Delete all matches in this season first
      await prisma.match.deleteMany({ where: { seasonId: id } });
      await prisma.season.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (err) {
    console.error("[Admin] Delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}