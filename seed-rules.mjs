// seed-rules.mjs
// Run: node seed-rules.mjs
// Seeds the Rule table with CPL-inspired categories and placeholder content.
// You can edit everything from the website after seeding.

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const rules = [
  // ── In-Game Rules ─────────────────────────────────────────
  { category: "In-Game Rules", sortOrder: 1, title: "Standard Game Settings",
    content: `The following settings are standard for all games and may not be changed without a majority vote:

• Turn Timer: Competitive
• Turn Mode: Simultaneous
• Game Speed: Online
• Start Era: Ancient Era
• All Game Modes: DISABLED
• All Victory Conditions: ENABLED
• Barbarians: ON
• Tribal Villages: ENABLED
• Duplicate Leaders: ALLOWED
• Map Size: Default for player count
• City States: Default for map size

NO GOLD OR STRATEGIC RESOURCE TRADING
NO MILITARY ALLIANCE` },

  { category: "In-Game Rules", sortOrder: 2, title: "Victory & Ties",
    content: `If 2 players achieve a victory condition on the same turn, the highest slot order gets the victory screen, but it counts as a tie for 1st place.

Time-limited games go to the highest score at the end of the timer.` },

  { category: "In-Game Rules", sortOrder: 3, title: "City-State Capturing",
    content: `You may capture and keep ONE City-State as your own city. If you lose that City-State, you may not capture another (unless recapturing the same one).

Any additional City-States you attack must be razed.

If another player owns a captured City-State, you may capture and keep that city — this does not use your City-State token.

Great People that consume a City-State (giving it to your empire) do NOT count as capturing.` },

  { category: "In-Game Rules", sortOrder: 4, title: "City Trading",
    content: `Trading cities between players is not allowed by default.` },

  { category: "In-Game Rules", sortOrder: 5, title: "Liberating Cities",
    content: `You may liberate any city as long as it does not bring a dead civilization back into the game.

A civilization is considered dead immediately when its last city is captured and may not be brought back during the same turn.

Dead City-States may be liberated and brought back into the game.` },

  { category: "In-Game Rules", sortOrder: 6, title: "Great Person Recruiting",
    content: `A Great Person must be recruited or passed before the last part of the turn.

Passing a Great Person so late that it forces another player to auto-recruit an unwanted Great Person is unsportsmanlike conduct.

Auto-recruiting with the intention of abusing slot order is unsportsmanlike conduct.

When half the turn timer has expired, any player with the option may be asked to take or pass.` },

  { category: "In-Game Rules", sortOrder: 7, title: "AI Trading Restrictions",
    content: `Trading with AI civilizations is restricted to:
• Exchanging open borders
• Renewing existing alliances
• Peace deals
• Ceding cities
• Accepting delegations and embassies

All other trade agreements (new alliances, friendships, resources, gold, great works, diplomatic favor) are NOT allowed.

Trade routes to AI are permitted.` },

  { category: "In-Game Rules", sortOrder: 8, title: "Intentional Feeding",
    content: `You are not allowed to expedite being eliminated from the game. This includes not defending yourself, inviting others to conquer you, or otherwise putting up less fight than an AI would.

Intentional feeding is considered worse than quitting.

World Congress voting will never be considered intentional feeding.` },

  { category: "In-Game Rules", sortOrder: 9, title: "Leaving a Game",
    content: `The host will confirm when a vote has successfully ended the game. The first player to leave without host approval may be subject to punishment, as premature leaving tends to cause a chain reaction.

If host permission is received (get it in writing), responsibility for improper concedes lies with the host.` },

  { category: "In-Game Rules", sortOrder: 10, title: "Private Communication",
    content: `Game-related private communication among opposing players is not allowed during a match.` },

  // ── Exploits ──────────────────────────────────────────────
  { category: "Exploits", sortOrder: 1, title: "Prohibited Exploits",
    content: `The following are considered exploits and are strictly prohibited:

[Add your league's specific exploit list here — e.g. known bugs, overflow exploits, UI manipulation, etc.]

Using any exploit knowingly will result in punishment. If you discover a new exploit during a game, report it immediately and do not use it again.` },

  { category: "Exploits", sortOrder: 2, title: "Reporting Exploits",
    content: `If you discover a potential exploit, report it to an admin via the #reports channel on Discord. Do not share exploit details publicly.

Admins will investigate and add confirmed exploits to the prohibited list.` },

  // ── Voting ────────────────────────────────────────────────
  { category: "Voting", sortOrder: 1, title: "CC (Concession) Votes",
    content: `A CC vote nominates a player to win the game by group consensus.

• Any player may initiate a CC vote using the .cc command
• The nominated player CANNOT vote for themselves
• Votes are secret via DM ballot
• Players have 2 minutes to vote
• Results are posted in the channel

A successful CC vote ends the game with the nominated player as the winner.` },

  { category: "Voting", sortOrder: 2, title: "Irrelevancy Votes",
    content: `An irrelevancy vote declares a player no longer relevant to the outcome of the game, allowing them to leave without penalty.

Eligibility criteria:
• Player is in the bottom 2 by score, OR
• Player has lost 3/5 or more of their empire

The nominated player cannot vote. Secret DM ballot, same process as CC votes.` },

  { category: "Voting", sortOrder: 3, title: "Settings Votes",
    content: `Game settings are voted on before each match using the bot's .vote command.

Players react to each setting option. The option with the most reactions wins. The host may close voting manually or it auto-closes when all players confirm ready.

Fixed settings (not voted on) are posted after the vote closes.` },

  // ── Scraps ────────────────────────────────────────────────
  { category: "Scraps", sortOrder: 1, title: "Scrap Votes",
    content: `A scrap vote proposes to abandon the current game entirely with no winner.

• Initiated with .scrap <current turn number>
• Higher turn numbers require fewer votes to pass
• Secret DM ballot
• All players may vote

A successful scrap ends the game with no result recorded.` },

  // ── Drop Policy ───────────────────────────────────────────
  { category: "Drop Policy", sortOrder: 1, title: "Quitting & Dropping",
    content: `Strategy Inc is a NO-QUIT community. Dropping from games is tracked and penalized.

• Drops are logged with .quit @Player
• Each player's drop count is tracked
• 3 drops triggers a review for suspension or removal

You may only leave a game:
• After being declared irrelevant by vote
• After a successful CC or scrap vote
• With explicit host permission
• After losing 66% or more of your cities` },

  { category: "Drop Policy", sortOrder: 2, title: "AFK Policy",
    content: `Being AFK for 5 or more minutes is counted as a quit.

• Any player can initiate an AFK check with .afk @Player
• The AFK player has 5 minutes to respond
• If the timer expires, the host may kick them at the start of the next turn
• A kicked AFK player is recorded as a quitter` },

  // ── Substitute Players ────────────────────────────────────
  { category: "Substitute Players", sortOrder: 1, title: "Substitution Rules",
    content: `If a player must leave mid-game, they should find a substitute before leaving.

• Use .sub @OldPlayer @NewPlayer to register the substitution
• The substitute inherits the leaving player's position, cities, and units
• The substitute's performance in the game counts toward their own rating

Do not sub out without finding a replacement — this counts as a drop.` },

  // ── Re-Maps ───────────────────────────────────────────────
  { category: "Re-Maps", sortOrder: 1, title: "Remap Rules",
    content: `A remap restarts the game with a new map. Remaps are only available in the first 10 turns.

• Initiated with .remap <turn number>
• Requires UNANIMOUS agreement (all players must vote yes)
• Secret DM ballot
• Only valid on turn 10 or earlier

After a remap, all players must replicate their civilization and leader picks.` },

  { category: "Re-Maps", sortOrder: 2, title: "Re-Lobby Rules",
    content: `A re-lobby restarts the game from a specific turn or from scratch.

• Requires 66% or more of players voting in favor
• May be requested for bugs, crashes, or desyncs
• Maximum 2 re-lobbies per session

Players must replicate their significant actions (war declarations, great people, etc.) if the game re-lobbies on the same turn.` },

  // ── Punishments ───────────────────────────────────────────
  { category: "Punishments", sortOrder: 1, title: "Penalty System",
    content: `Violations are handled with a progressive penalty system:

1st offense: Warning
2nd offense: 1-week suspension
3rd offense: 2-week suspension
4th offense: Permanent ban review

Severe violations (cheating, harassment, account sharing) may skip directly to suspension or ban.

All penalties are at admin discretion and may be appealed once.` },

  { category: "Punishments", sortOrder: 2, title: "Bannable Offenses",
    content: `The following may result in immediate suspension or ban:

• Cheating or exploit abuse
• Harassment, toxicity, or hate speech
• Using alternate accounts while suspended
• Intentional feeding or griefing
• Repeated quitting (3+ drops)

If suspended, DO NOT use another account to play. This will result in additional penalties.` },

  // ── Timed Games ───────────────────────────────────────────
  { category: "Timed Games", sortOrder: 1, title: "Timed Game Rules",
    content: `Timed games have a set duration agreed upon before the match starts. Common durations: 2 hours, 4 hours, 6 hours.

• Game duration is voted on during the .vote phase
• When time expires, the game ends at the current turn
• Winner is determined by score
• If a CC vote passes before time expires, the CC winner takes the game

All other standard rules apply during timed games.` },

  // ── Rating System ─────────────────────────────────────────
  { category: "Rating System", sortOrder: 1, title: "How Ratings Work",
    content: `Strategy Inc uses the Glicko-2 rating system, starting at 1500.

• Ratings update after each .report
• Your placement relative to other players determines rating changes
• Finishing above players with higher ratings gives larger gains
• New players have higher volatility (ratings change more quickly)

A "Win" is any game where your rating increased (positive gain).
A "1st Place" is separately tracked for outright victories.` },

  { category: "Rating System", sortOrder: 2, title: "Reporting Results",
    content: `After each game, report the results using:
.report @1st [Leader] @2nd [Leader] @3rd [Leader] ...

• Tag players in exact finishing order (1st place first)
• Leader names after each @mention are optional but recommended
• The bot calculates ratings and syncs to the website automatically

If a report is incorrect, an admin can fix it with:
.override <report_id> @1st @2nd @3rd ...

This recalculates all ratings from scratch with the corrected result.` },
];

async function main() {
  console.log("🌱 Seeding rules...");

  // Clear existing rules
  await prisma.rule.deleteMany();
  console.log("  Cleared existing rules.");

  for (const rule of rules) {
    await prisma.rule.create({ data: rule });
  }

  console.log(`  ✅ ${rules.length} rules created across ${new Set(rules.map(r => r.category)).size} categories.`);
  console.log("\n📋 Categories:");
  const cats = {};
  for (const r of rules) {
    cats[r.category] = (cats[r.category] || 0) + 1;
  }
  for (const [cat, count] of Object.entries(cats)) {
    console.log(`   • ${cat} (${count} rules)`);
  }
  console.log("\n✅ Done! Edit the content on your website at /rules");
}

main()
  .catch((e) => { console.error("❌ Failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
