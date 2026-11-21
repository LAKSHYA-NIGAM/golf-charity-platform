/**
 * Golf Tournament Scoring Engine
 * Computes Gross Strokes, Net Stroke Play, and Stableford scoring
 * with Hole Handicap Index allowances.
 */

class GolfScoringEngine {
  /**
   * Calculates handicap stroke allocation for a specific hole.
   * If player handicap is 14, and hole handicap index is <= 14, player receives 1 stroke on this hole.
   */
  static getHoleHandicapAllowance(playerHandicap, holeHandicapIndex) {
    if (playerHandicap <= 0) return 0;
    const baseStrokes = Math.floor(playerHandicap / 18);
    const remainder = playerHandicap % 18;
    return baseStrokes + (holeHandicapIndex <= remainder ? 1 : 0);
  }

  /**
   * Calculates Stableford points for a single hole based on net score vs hole par.
   * Double Bogey or worse: 0 pts
   * Bogey (+1 net): 1 pt
   * Par (0 net): 2 pts
   * Birdie (-1 net): 3 pts
   * Eagle (-2 net): 4 pts
   * Albatross (-3 net): 5 pts
   */
  static calculateHoleStableford(par, grossStrokes, handicapAllowance = 0) {
    if (grossStrokes <= 0) return 0;
    const netStrokes = grossStrokes - handicapAllowance;
    const diff = netStrokes - par;

    if (diff <= -3) return 5; // Albatross or better
    if (diff === -2) return 4; // Eagle
    if (diff === -1) return 3; // Birdie
    if (diff === 0) return 2;  // Par
    if (diff === 1) return 1;  // Bogey
    return 0;                  // Double bogey or worse
  }

  /**
   * Computes full scorecard results across 9 or 18 holes.
   * @param {Array} holes - [{ hole: 1, par: 4, index: 7, gross: 4 }, ...]
   * @param {number} playerHandicap - course handicap of player
   */
  static evaluateRound(holes, playerHandicap = 0) {
    if (!Array.isArray(holes) || holes.length === 0) {
      throw new Error('Invalid or empty scorecard holes array');
    }

    let totalPar = 0;
    let totalGross = 0;
    let totalNet = 0;
    let totalStableford = 0;

    const holeBreakdown = holes.map(h => {
      const par = Number(h.par) || 4;
      const gross = Number(h.gross) || 0;
      const index = Number(h.index) || 18;
      const allowance = GolfScoringEngine.getHoleHandicapAllowance(playerHandicap, index);
      const net = Math.max(1, gross - allowance);
      const stableford = GolfScoringEngine.calculateHoleStableford(par, gross, allowance);

      totalPar += par;
      totalGross += gross;
      totalNet += net;
      totalStableford += stableford;

      return {
        hole: h.hole,
        par,
        gross,
        index,
        allowance,
        net,
        stableford
      };
    });

    return {
      holeCount: holes.length,
      playerHandicap,
      totalPar,
      totalGross,
      totalNet,
      totalStableford,
      netToPar: totalNet - totalPar,
      grossToPar: totalGross - totalPar,
      holes: holeBreakdown
    };
  }
}

module.exports = GolfScoringEngine;
