const assert = require('assert');
const test = require('node:test');
const { rankLeaderboard } = require('../services/leaderboardTieBreak');

test('rankLeaderboard: distinct scores ranked in ascending order', () => {
  const p1 = { id: 'p1', name: 'Golfer A', holeScores: new Array(18).fill(4) }; // 72
  const p2 = { id: 'p2', name: 'Golfer B', holeScores: new Array(18).fill(3) }; // 54
  const p3 = { id: 'p3', name: 'Golfer C', holeScores: new Array(18).fill(5) }; // 90

  const ranked = rankLeaderboard([p1, p2, p3]);
  assert.strictEqual(ranked[0].id, 'p2'); // 54 (Rank 1)
  assert.strictEqual(ranked[1].id, 'p1'); // 72 (Rank 2)
  assert.strictEqual(ranked[2].id, 'p3'); // 90 (Rank 3)
});

test('rankLeaderboard: breaks tie on back-9 countback', () => {
  const pA = { id: 'pA', name: 'Player A', holeScores: [4,4,4,4,4,4,4,5,5, 4,4,3,4,4,3,4,4,4] }; // front: 38, back: 34 (total 72)
  const pB = { id: 'pB', name: 'Player B', holeScores: [4,4,3,4,4,3,4,4,4, 4,4,4,4,4,4,4,5,5] }; // front: 34, back: 38 (total 72)

  const ranked = rankLeaderboard([pB, pA]);
  assert.strictEqual(ranked[0].id, 'pA'); // Player A won countback
  assert.strictEqual(ranked[0].last9 < ranked[1].last9, true);
});
