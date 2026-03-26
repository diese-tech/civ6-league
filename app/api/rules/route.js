// app/api/rules/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const rules = await prisma.ruleCategory.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ rules });
  } catch {
    return NextResponse.json({ rules: [] });
  }
}

export async function POST(request) {
  const { password, action, data } = await request.json();
  const blogPassword = process.env.BLOG_PASSWORD;
  if (!blogPassword || password !== blogPassword) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  try {
    if (action === "create") {
      const rule = await prisma.ruleCategory.create({
        data: {
          title: data.title,
          slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          summary: data.summary || "",
          content: data.content,
          icon: data.icon || "📜",
          sortOrder: data.sortOrder || 0,
        },
      });
      return NextResponse.json({ success: true, rule });
    }
    if (action === "update") {
      await prisma.ruleCategory.update({
        where: { id: data.id },
        data: { title: data.title, summary: data.summary, content: data.content, icon: data.icon, sortOrder: data.sortOrder },
      });
      return NextResponse.json({ success: true });
    }
    if (action === "delete") {
      await prisma.ruleCategory.delete({ where: { id: data.id } });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
