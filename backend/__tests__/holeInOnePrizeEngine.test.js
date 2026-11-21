const assert = require('assert');
const test = require('node:test');
const { validateHoleInOneClaim } = require('../services/holeInOnePrizeEngine');

test('validateHoleInOneClaim: valid claim meeting all insurance stipulations', () => {
  const claim = {
    holeNumber: 7,
    designatedHole: 7,
    measuredYardage: 165,
    minRequiredYardage: 150,
    witnessSignatures: ['Witness 1 (PGA Pro)', 'Witness 2 (Tournament Official)'],
    isOfficialTournamentRound: true,
  };

  const result = validateHoleInOneClaim(claim);
  assert.strictEqual(result.isEligible, true);
  assert.strictEqual(result.errors.length, 0);
  assert.strictEqual(result.witnessCount, 2);
});

test('validateHoleInOneClaim: rejects claim with insufficient yardage and missing witnesses', () => {
  const claim = {
    holeNumber: 7,
    designatedHole: 7,
    measuredYardage: 130, // below 150
    minRequiredYardage: 150,
    witnessSignatures: ['Only One Witness'],
    isOfficialTournamentRound: true,
  };

  const result = validateHoleInOneClaim(claim);
  assert.strictEqual(result.isEligible, false);
  assert.strictEqual(result.errors.length, 2);
});
