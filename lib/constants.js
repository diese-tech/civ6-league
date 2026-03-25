// lib/constants.js
// ─── LEAGUE CONSTANTS ───────────────────────────────────────────────────────

export const DIVISIONS = [
  { name: "Deity", rankRange: "1800+", color: "#F5A623", icon: "👑", min: 1800, max: 9999 },
  { name: "Immortal", rankRange: "1500–1799", color: "#9B59B6", icon: "⚔️", min: 1500, max: 1799 },
  { name: "Emperor", rankRange: "1200–1499", color: "#3498DB", icon: "🛡️", min: 1200, max: 1499 },
  { name: "King", rankRange: "900–1199", color: "#2ECC71", icon: "🏰", min: 900, max: 1199 },
  { name: "Prince", rankRange: "< 900", color: "#95A5A6", icon: "📜", min: 0, max: 899 },
];

export const MAP_POOL = ["Pangaea", "Continents", "Fractal", "Archipelago"];

export const CIVILIZATIONS = [
  "America", "Arabia", "Australia", "Aztec", "Babylon", "Brazil", "Byzantium",
  "Canada", "China", "Cree", "Egypt", "England", "Ethiopia", "France",
  "Gaul", "Georgia", "Germany", "Gran Colombia", "Greece", "Hungary",
  "Inca", "India", "Indonesia", "Japan", "Khmer", "Korea", "Kongo",
  "Macedon", "Mali", "Maori", "Mapuche", "Maya", "Mongolia", "Netherlands",
  "Norway", "Nubia", "Ottoman", "Persia", "Phoenicia", "Poland", "Portugal",
  "Rome", "Russia", "Scotland", "Scythia", "Spain", "Sumeria", "Sweden",
  "Vietnam", "Zulu",
];

export const RULES = [
  {
    title: "1. General Rules",
    content: `All players must maintain respectful conduct. Hate speech, harassment, and unsportsmanlike behavior will result in warnings, suspensions, or permanent bans at admin discretion.\n\nPlayers must be available for at least 2 matches per week during an active season. Failure to schedule or complete matches may result in forfeits.\n\nAll communication regarding matches should occur through the official Discord server or the league website.`,
  },
  {
    title: "2. Match Format",
    content: `Standard matches are 1v1 on the current map pool rotation. Game speed is set to Online (default). Turn timer: 120 seconds per turn.\n\nBoth players must confirm match settings before starting. Screenshots of the settings screen are recommended.\n\nMatches must be played to completion unless one player concedes.`,
  },
  {
    title: "3. Civilization Picks & Bans",
    content: `Each player may ban up to 2 civilizations before a match. Bans must be submitted via the match page at least 24 hours before the scheduled match time.\n\nAfter bans are locked, players simultaneously select their civilization. If both players pick the same civ, priority goes to the player with the lower ELO rating.`,
  },
  {
    title: "4. ELO Rating System",
    content: `The league uses a modified ELO system with K-factor 32 for new players (< 30 games) and K-factor 16 for established players.\n\nWins against higher-rated opponents yield more points. Draws split the expected outcome evenly.\n\nRatings are recalculated immediately after match result approval.`,
  },
  {
    title: "5. Disconnections & Disputes",
    content: `If a player disconnects within the first 30 turns, the match may be restarted. After turn 30, the game state at disconnection is used.\n\nPlayers have 10 minutes to reconnect. Disputes should be reported via #disputes on Discord.`,
  },
  {
    title: "6. Seasons & Promotion",
    content: `Each season lasts approximately 3–4 months. Top 2 players per division are promoted; bottom 2 are relegated.\n\nNew players start in Prince division. Season champions receive special badges.`,
  },
  {
    title: "7. Tournaments",
    content: `Bracket tournaments may be held between seasons. Tournament format will be announced in advance.\n\nTournament matches follow regular season rules unless specified otherwise.`,
  },
  {
    title: "8. Admin & Moderation",
    content: `League admins have final say on disputes. Admin decisions can be appealed once.\n\nRule changes are announced at least 1 week before taking effect.`,
  },
];

export function getDivisionInfo(name) {
  return DIVISIONS.find((d) => d.name === name) || DIVISIONS[4];
}
