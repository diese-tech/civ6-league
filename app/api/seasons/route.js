// app/api/seasons/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/seasons
export async function GET() {
  const seasons = await prisma.season.findMany({
    orderBy: { startDate: "desc" },
    include: { _count: { select: { matches: true } } },
  });
  return NextResponse.json({ seasons });
}

// POST /api/seasons — Create new season
export async function POST(request) {
  try {
    const { name, startDate, endDate, isActive } = await request.json();

    if (!name || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // If activating this season, deactivate all others
    if (isActive) {
      await prisma.season.updateMany({ data: { isActive: false } });
    }

    const season = await prisma.season.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive || false,
      },
    });

    return NextResponse.json(season, { status: 201 });
  } catch (err) {
    console.error("Season error:", err);
    return NextResponse.json({ error: "Failed to create season" }, { status: 500 });
  }
}
