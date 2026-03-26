// app/api/admin/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(request) {
  try {
    const { type, id } = await request.json();

    if (type === "player") {
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

    if (type === "announcement") {
      await prisma.announcement.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (type === "season") {
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

export async function PATCH(request) {
  try {
    const { type, id, data } = await request.json();

    if (type === "player") {
      const update = {};
      if (data.username !== undefined) update.username = data.username;
      if (data.eloRating !== undefined) update.eloRating = parseInt(data.eloRating);
      if (data.division !== undefined) update.division = data.division;
      if (data.wins !== undefined) update.wins = parseInt(data.wins);
      if (data.losses !== undefined) update.losses = parseInt(data.losses);
      await prisma.player.update({ where: { id }, data: update });
      return NextResponse.json({ success: true });
    }

    if (type === "season") {
      const update = {};
      if (data.name !== undefined) update.name = data.name;
      if (data.startDate !== undefined) update.startDate = new Date(data.startDate);
      if (data.endDate !== undefined) update.endDate = new Date(data.endDate);
      if (data.isActive !== undefined) {
        update.isActive = data.isActive;
        // If activating this season, deactivate all others
        if (data.isActive) {
          await prisma.season.updateMany({ data: { isActive: false } });
        }
      }
      await prisma.season.update({ where: { id }, data: update });
      return NextResponse.json({ success: true });
    }

    if (type === "match") {
      const update = {};
      if (data.result !== undefined) update.result = data.result;
      if (data.status !== undefined) update.status = data.status;
      await prisma.match.update({ where: { id }, data: update });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (err) {
    console.error("[Admin] Edit error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}