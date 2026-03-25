// lib/db.js
// ─── PRISMA CLIENT SINGLETON ────────────────────────────────────────────────
// Prevents multiple Prisma instances in development (hot reload creates new ones)

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
