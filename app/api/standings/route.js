// app/api/standings/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/standings?division=Deity&seasonId=2
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const division = searchParams.get("division");

  const where = { isActive: true };
  if (division) where.division = division;

  const players = await prisma.player.findMany({
    where,
    orderBy: { eloRating: "desc" },
    include: { badges: true },
  });

  return NextResponse.json({ standings: players });
}
