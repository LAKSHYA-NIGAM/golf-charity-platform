const assert = require('assert');
const test = require('node:test');
const { allocateSponsorship } = require('../services/sponsorPackageAllocator');

test('allocateSponsorship: allocates available Eagle tier package with team slots', () => {
  const result = allocateSponsorship({
    tierName: 'EAGLE',
    corporateName: 'Acme Corp',
    existingAllocations: [],
  });

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.allocation.corporateName, 'Acme Corp');
  assert.strictEqual(result.allocation.price, 5000);
  assert.strictEqual(result.allocation.includedTeamSlots, 2);
});

test('allocateSponsorship: rejects allocation when single title tier is sold out', () => {
  const existing = [{ tier: 'TITLE', corporateName: 'First Sponsor' }];
  const result = allocateSponsorship({
    tierName: 'TITLE',
    corporateName: 'Second Sponsor',
    existingAllocations: existing,
  });

  assert.strictEqual(result.success, false);
  assert.ok(result.reason.includes('completely sold out'));
});
