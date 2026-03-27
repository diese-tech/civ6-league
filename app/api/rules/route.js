// app/api/rules/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const rules = await prisma.rule.findMany({
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });
    return NextResponse.json({ rules });
  } catch {
    return NextResponse.json({ rules: [] });
  }
}

export async function POST(request) {
  try {
    const { id, category, title, content, sortOrder, password } = await request.json();

    const blogPassword = process.env.BLOG_PASSWORD;
    if (!password || !blogPassword || password !== blogPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!category?.trim() || !title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Category, title, and content required." }, { status: 400 });
    }

    let rule;
    if (id) {
      rule = await prisma.rule.update({
        where: { id },
        data: { category: category.trim(), title: title.trim(), content: content.trim(), sortOrder: sortOrder || 0 },
      });
    } else {
      rule = await prisma.rule.create({
        data: { category: category.trim(), title: title.trim(), content: content.trim(), sortOrder: sortOrder || 0 },
      });
    }

    return NextResponse.json({ success: true, rule });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id, password } = await request.json();
    const blogPassword = process.env.BLOG_PASSWORD;
    if (!password || !blogPassword || password !== blogPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await prisma.rule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}