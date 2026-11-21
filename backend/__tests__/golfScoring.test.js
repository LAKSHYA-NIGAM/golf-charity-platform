const GolfScoringEngine = require('../services/golfScoring');

describe('GolfScoringEngine Unit Tests', () => {
  describe('calculateHoleStableford', () => {
    test('awards 2 points for net par', () => {
      expect(GolfScoringEngine.calculateHoleStableford(4, 4, 0)).toBe(2);
    });

    test('awards 3 points for net birdie', () => {
      expect(GolfScoringEngine.calculateHoleStableford(4, 3, 0)).toBe(3);
    });

    test('awards 4 points for net eagle', () => {
      expect(GolfScoringEngine.calculateHoleStableford(5, 3, 0)).toBe(4);
    });

    test('awards 1 point for net bogey', () => {
      expect(GolfScoringEngine.calculateHoleStableford(4, 5, 0)).toBe(1);
    });

    test('awards 0 points for net double bogey or worse', () => {
      expect(GolfScoringEngine.calculateHoleStableford(4, 6, 0)).toBe(0);
      expect(GolfScoringEngine.calculateHoleStableford(4, 8, 0)).toBe(0);
    });

    test('applies handicap allowance stroke correctly', () => {
      // Gross 5 on Par 4 with 1 handicap stroke = Net 4 (Par) -> 2 Stableford points
      expect(GolfScoringEngine.calculateHoleStableford(4, 5, 1)).toBe(2);
    });
  });

  describe('getHoleHandicapAllowance', () => {
    test('allocates 1 stroke when hole index <= handicap', () => {
      expect(GolfScoringEngine.getHoleHandicapAllowance(10, 5)).toBe(1);
      expect(GolfScoringEngine.getHoleHandicapAllowance(10, 10)).toBe(1);
    });

    test('allocates 0 strokes when hole index > handicap', () => {
      expect(GolfScoringEngine.getHoleHandicapAllowance(10, 11)).toBe(0);
    });

    test('allocates 2 strokes on difficult holes for high handicap players (>18)', () => {
      // Handicap 20: gets 1 stroke on all 18 holes, plus extra stroke on hole index 1 and 2
      expect(GolfScoringEngine.getHoleHandicapAllowance(20, 2)).toBe(2);
      expect(GolfScoringEngine.getHoleHandicapAllowance(20, 5)).toBe(1);
    });
  });

  describe('evaluateRound', () => {
    test('evaluates a 3-hole scorecard accurately', () => {
      const holes = [
        { hole: 1, par: 4, index: 1, gross: 4 }, // Net 3 (Birdie with 1 stroke allowance) -> 3 pts
        { hole: 2, par: 3, index: 15, gross: 3 }, // Net 3 (Par, 0 allowance) -> 2 pts
        { hole: 3, par: 5, index: 3, gross: 6 }  // Net 5 (Par with 1 allowance) -> 2 pts
      ];
      // playerHandicap 10: receives strokes on index 1 and 3, not on 15
      const round = GolfScoringEngine.evaluateRound(holes, 10);

      expect(round.holeCount).toBe(3);
      expect(round.totalPar).toBe(12);
      expect(round.totalGross).toBe(13);
      expect(round.totalNet).toBe(11);
      expect(round.totalStableford).toBe(7); // 3 + 2 + 2
      expect(round.netToPar).toBe(-1);
    });
  });
});
