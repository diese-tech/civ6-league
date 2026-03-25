// prisma/seed.mjs
// ─── DATABASE SEED ──────────────────────────────────────────────────────────
// Run with: node prisma/seed.mjs
// Populates the database with sample seasons, players, matches, and announcements

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Seasons ──────────────────────────────────────────────────────────────
  const season1 = await prisma.season.create({
    data: {
      name: "Season I — Dawn of Empires",
      startDate: new Date("2025-09-01"),
      endDate: new Date("2025-12-15"),
      isActive: false,
    },
  });

  const season2 = await prisma.season.create({
    data: {
      name: "Season II — Age of Conquest",
      startDate: new Date("2026-01-10"),
      endDate: new Date("2026-04-20"),
      isActive: true,
    },
  });

  console.log("  ✅ Seasons created");

  // ── Players ──────────────────────────────────────────────────────────────
  const playersData = [
    { username: "AlexanderIII", email: "alex@civ6league.com", eloRating: 1920, division: "Deity", wins: 42, losses: 8, draws: 2, streak: 5, favCiv: "Macedon", isAdmin: true },
    { username: "CleopatraVII", email: "cleo@civ6league.com", eloRating: 1855, division: "Deity", wins: 38, losses: 12, draws: 1, streak: 3, favCiv: "Egypt" },
    { username: "Barbarossa", email: "barb@civ6league.com", eloRating: 1790, division: "Immortal", wins: 35, losses: 14, draws: 3, streak: -1, favCiv: "Germany" },
    { username: "Montezuma", email: "monte@civ6league.com", eloRating: 1720, division: "Immortal", wins: 30, losses: 18, draws: 2, streak: 2, favCiv: "Aztec" },
    { username: "Hojo_Tokimune", email: "hojo@civ6league.com", eloRating: 1680, division: "Immortal", wins: 28, losses: 16, draws: 4, streak: 4, favCiv: "Japan" },
    { username: "GilgaMesh", email: "gilga@civ6league.com", eloRating: 1550, division: "Immortal", wins: 25, losses: 20, draws: 3, streak: -2, favCiv: "Sumeria" },
    { username: "VictoriaAge", email: "vic@civ6league.com", eloRating: 1480, division: "Emperor", wins: 22, losses: 22, draws: 4, streak: 1, favCiv: "England" },
    { username: "PedroII", email: "pedro@civ6league.com", eloRating: 1390, division: "Emperor", wins: 20, losses: 24, draws: 2, streak: -3, favCiv: "Brazil" },
    { username: "Saladin_AE", email: "saladin@civ6league.com", eloRating: 1320, division: "Emperor", wins: 18, losses: 20, draws: 6, streak: 2, favCiv: "Arabia" },
    { username: "Gorgo_Sparta", email: "gorgo@civ6league.com", eloRating: 1250, division: "Emperor", wins: 16, losses: 22, draws: 4, streak: -1, favCiv: "Greece" },
    { username: "TomyrisSaka", email: "tomyris@civ6league.com", eloRating: 1100, division: "King", wins: 14, losses: 26, draws: 2, streak: 1, favCiv: "Scythia" },
    { username: "Ambiorix_G", email: "ambiorix@civ6league.com", eloRating: 1050, division: "King", wins: 12, losses: 24, draws: 4, streak: -2, favCiv: "Gaul" },
    { username: "LadyTrieu", email: "trieu@civ6league.com", eloRating: 980, division: "King", wins: 10, losses: 22, draws: 4, streak: 3, favCiv: "Vietnam" },
    { username: "JohnCurtin", email: "curtin@civ6league.com", eloRating: 920, division: "King", wins: 8, losses: 18, draws: 2, streak: -1, favCiv: "Australia" },
    { username: "PackalKinich", email: "packal@civ6league.com", eloRating: 850, division: "Prince", wins: 6, losses: 20, draws: 2, streak: -4, favCiv: "Maya" },
    { username: "SimBol", email: "simbol@civ6league.com", eloRating: 820, division: "Prince", wins: 5, losses: 18, draws: 3, streak: 1, favCiv: "Korea" },
  ];

  const players = [];
  for (const p of playersData) {
    const created = await prisma.player.create({ data: p });
    players.push(created);
  }
  console.log(`  ✅ ${players.length} players created`);

  // ── Badges ───────────────────────────────────────────────────────────────
  const badgesData = [
    { name: "Season I Champion", icon: "👑", playerId: players[0].id },
    { name: "10-Win Streak", icon: "🔥", playerId: players[0].id },
    { name: "Deity Ascendant", icon: "⭐", playerId: players[0].id },
    { name: "Season I Runner-Up", icon: "🥈", playerId: players[1].id },
    { name: "Map Dominator", icon: "🗺️", playerId: players[1].id },
    { name: "Iron Will", icon: "🛡️", playerId: players[2].id },
    { name: "Eagle Warrior", icon: "🦅", playerId: players[3].id },
    { name: "Divine Wind", icon: "🌊", playerId: players[4].id },
    { name: "Balanced Fighter", icon: "⚖️", playerId: players[6].id },
    { name: "Peacekeeper", icon: "☮️", playerId: players[8].id },
    { name: "Rising Star", icon: "🌟", playerId: players[12].id },
    { name: "Newcomer", icon: "🆕", playerId: players[11].id },
    { name: "Newcomer", icon: "🆕", playerId: players[15].id },
  ];

  for (const b of badgesData) {
    await prisma.badge.create({ data: b });
  }
  console.log(`  ✅ ${badgesData.length} badges awarded`);

  // ── Matches ──────────────────────────────────────────────────────────────
  const matchesData = [
    { player1Id: players[0].id, player2Id: players[1].id, result: "1-0", status: "completed", player1Civ: "Macedon", player2Civ: "Egypt", map: "Pangaea", scheduledAt: new Date("2026-03-20"), completedAt: new Date("2026-03-20"), seasonId: season2.id, replayUrl: "https://replay.civ6league.com/m1" },
    { player1Id: players[2].id, player2Id: players[3].id, result: "0-1", status: "completed", player1Civ: "Germany", player2Civ: "Aztec", map: "Continents", scheduledAt: new Date("2026-03-20"), completedAt: new Date("2026-03-20"), seasonId: season2.id },
    { player1Id: players[4].id, player2Id: players[5].id, result: "1-0", status: "completed", player1Civ: "Japan", player2Civ: "Sumeria", map: "Pangaea", scheduledAt: new Date("2026-03-19"), completedAt: new Date("2026-03-19"), seasonId: season2.id, replayUrl: "https://replay.civ6league.com/m3" },
    { player1Id: players[6].id, player2Id: players[7].id, result: "draw", status: "completed", player1Civ: "England", player2Civ: "Brazil", map: "Fractal", scheduledAt: new Date("2026-03-19"), completedAt: new Date("2026-03-19"), seasonId: season2.id },
    { player1Id: players[8].id, player2Id: players[9].id, result: "1-0", status: "completed", player1Civ: "Arabia", player2Civ: "Greece", map: "Pangaea", scheduledAt: new Date("2026-03-18"), completedAt: new Date("2026-03-18"), seasonId: season2.id },
    { player1Id: players[12].id, player2Id: players[13].id, result: "1-0", status: "completed", player1Civ: "Vietnam", player2Civ: "Australia", map: "Archipelago", scheduledAt: new Date("2026-03-17"), completedAt: new Date("2026-03-17"), seasonId: season2.id },
    // Upcoming matches
    { player1Id: players[0].id, player2Id: players[2].id, status: "scheduled", map: "TBD", scheduledAt: new Date("2026-03-26"), seasonId: season2.id },
    { player1Id: players[1].id, player2Id: players[4].id, status: "scheduled", map: "TBD", scheduledAt: new Date("2026-03-27"), seasonId: season2.id },
    { player1Id: players[3].id, player2Id: players[5].id, status: "scheduled", map: "TBD", scheduledAt: new Date("2026-03-28"), seasonId: season2.id },
    { player1Id: players[10].id, player2Id: players[11].id, status: "pending", map: "TBD", scheduledAt: new Date("2026-03-29"), seasonId: season2.id },
  ];

  for (const m of matchesData) {
    await prisma.match.create({ data: m });
  }
  console.log(`  ✅ ${matchesData.length} matches created`);

  // ── Announcements ────────────────────────────────────────────────────────
  const announcementsData = [
    { title: "Season II Now Live!", content: "The Age of Conquest has begun. All divisions are active — check standings and schedule your matches.", isPinned: true, createdAt: new Date("2026-01-10") },
    { title: "New Map Pool Rotation", content: "Pangaea, Continents, Fractal, and Archipelago are in rotation for Season II. Seven Seas removed.", isPinned: false, createdAt: new Date("2026-01-15") },
    { title: "Civ Ban System Update", content: "Players may now ban up to 2 civilizations per match. Bans must be submitted 24h before match time.", isPinned: false, createdAt: new Date("2026-02-01") },
    { title: "Deity Division Spotlight", content: "AlexanderIII leads with a 5-game win streak. CleopatraVII closing the gap. Watch the clash on March 26.", isPinned: true, createdAt: new Date("2026-03-18") },
  ];

  for (const a of announcementsData) {
    await prisma.announcement.create({ data: a });
  }
  console.log(`  ✅ ${announcementsData.length} announcements created`);

  console.log("\n🎮 Database seeded successfully!");
  console.log("   Run 'npm run dev' to start the development server.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
