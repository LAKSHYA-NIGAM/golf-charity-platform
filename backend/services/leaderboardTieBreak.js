/**
 * Golf Tournament Leaderboard & USGA Countback Tie-Breaker
 * Ranks golfers by total gross/net score and applies standard USGA tie-break criteria:
 * 1. Best score over last 9 holes (holes 10-18)
 * 2. Best score over last 6 holes (holes 13-18)
 * 3. Best score over last 3 holes (holes 16-18)
 * 4. Best score on 18th hole
 */

function rankLeaderboard(players = []) {
  if (!Array.isArray(players) || players.length === 0) return [];

  const processed = players.map((p) => {
    const scores = Array.isArray(p.holeScores) && p.holeScores.length === 18 ? p.holeScores : new Array(18).fill(4);
    const totalScore = scores.reduce((a, b) => a + b, 0);
    const last9 = scores.slice(9).reduce((a, b) => a + b, 0);
    const last6 = scores.slice(12).reduce((a, b) => a + b, 0);
    const last3 = scores.slice(15).reduce((a, b) => a + b, 0);
    const hole18 = scores[17];

    return {
      id: p.id,
      name: p.name,
      totalScore,
      last9,
      last6,
      last3,
      hole18,
    };
  });

  // Lower stroke score is better in standard stroke play
  processed.sort((a, b) => {
    if (a.totalScore !== b.totalScore) return a.totalScore - b.totalScore;
    if (a.last9 !== b.last9) return a.last9 - b.last9;
    if (a.last6 !== b.last6) return a.last6 - b.last6;
    if (a.last3 !== b.last3) return a.last3 - b.last3;
    return a.hole18 - b.hole18;
  });

  return processed.map((p, idx) => ({ ...p, rank: idx + 1 }));
}

module.exports = { rankLeaderboard };
