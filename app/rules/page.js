// app/rules/page.js
import { prisma } from "@/lib/db";
import RulesClient from "./RulesClient";

export const dynamic = "force-dynamic";
export const revalidate = 30;
export const metadata = { title: "Rules — Strategy Inc" };

export default async function RulesPage() {
  let rules = [];
  try {
    rules = await prisma.rule.findMany({
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });
  } catch {
    // Table might not exist yet
  }

  const ser = (d) => (d instanceof Date ? d.toISOString() : d);

  return (
    <RulesClient
      rules={rules.map((r) => ({ ...r, createdAt: ser(r.createdAt), updatedAt: ser(r.updatedAt) }))}
    />
  );
}
