// lib/elo.js
// ─── ELO RATING SYSTEM ─────────────────────────────────────────────────────
// Modified ELO with K-factor based on games played

/**
 * Calculate new ELO rating after a match
 * @param {number} ratingA - Player A's current rating
 * @param {number} ratingB - Player B's current rating  
 * @param {number} scoreA  - Player A's score (1 = win, 0.5 = draw, 0 = loss)
 * @param {number} gamesPlayed - Player A's total games (affects K-factor)
 * @returns {number} Player A's new rating
 */
export function calculateElo(ratingA, ratingB, scoreA, gamesPlayed = 30) {
  // K-factor: 32 for new players (< 30 games), 16 for established
  const K = gamesPlayed < 30 ? 32 : 16;

  // Expected score based on rating difference
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));

  // New rating
  return Math.round(ratingA + K * (scoreA - expectedA));
}

/**
 * Get division name based on ELO rating
 */
export function getDivisionFromElo(elo) {
  if (elo >= 1800) return "Deity";
  if (elo >= 1500) return "Immortal";
  if (elo >= 1200) return "Emperor";
  if (elo >= 900) return "King";
  return "Prince";
}

/**
 * Process a match result and return updated ratings
 */
export function processMatchResult(player1, player2, result) {
  const p1Games = player1.wins + player1.losses + player1.draws;
  const p2Games = player2.wins + player2.losses + player2.draws;

  let scoreA, scoreB;
  if (result === "1-0") {
    scoreA = 1; scoreB = 0;
  } else if (result === "0-1") {
    scoreA = 0; scoreB = 1;
  } else {
    scoreA = 0.5; scoreB = 0.5;
  }

  const newRatingA = calculateElo(player1.eloRating, player2.eloRating, scoreA, p1Games);
  const newRatingB = calculateElo(player2.eloRating, player1.eloRating, scoreB, p2Games);

  return {
    player1: {
      eloBefore: player1.eloRating,
      eloAfter: newRatingA,
      division: getDivisionFromElo(newRatingA),
      winsInc: result === "1-0" ? 1 : 0,
      lossesInc: result === "0-1" ? 1 : 0,
      drawsInc: result === "draw" ? 1 : 0,
      streak: result === "1-0"
        ? (player1.streak > 0 ? player1.streak + 1 : 1)
        : result === "0-1"
          ? (player1.streak < 0 ? player1.streak - 1 : -1)
          : 0,
    },
    player2: {
      eloBefore: player2.eloRating,
      eloAfter: newRatingB,
      division: getDivisionFromElo(newRatingB),
      winsInc: result === "0-1" ? 1 : 0,
      lossesInc: result === "1-0" ? 1 : 0,
      drawsInc: result === "draw" ? 1 : 0,
      streak: result === "0-1"
        ? (player2.streak > 0 ? player2.streak + 1 : 1)
        : result === "1-0"
          ? (player2.streak < 0 ? player2.streak - 1 : -1)
          : 0,
    },
  };
}
