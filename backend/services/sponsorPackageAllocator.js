/**
 * Corporate Tournament Sponsorship Package Allocator
 * Manages tiers (Title: $10k, Eagle: $5k, Birdie: $2.5k, Hole: $1k),
 * team player slots, branding entitlements, and inventory limits.
 */

const SPONSORSHIP_TIERS = {
  TITLE: { price: 10000, teamSlots: 3, bannerPlacement: 'Clubhouse & All Holes', maxAvailable: 1 },
  EAGLE: { price: 5000, teamSlots: 2, bannerPlacement: 'Driving Range & 18th Green', maxAvailable: 4 },
  BIRDIE: { price: 2500, teamSlots: 1, bannerPlacement: '1st Tee & Putting Green', maxAvailable: 8 },
  HOLE: { price: 1000, teamSlots: 0, bannerPlacement: 'Single Tee Box Sign', maxAvailable: 18 },
};

function allocateSponsorship({
  tierName,
  corporateName,
  existingAllocations = [],
} = {}) {
  const normTier = (tierName || '').trim().toUpperCase();
  const tier = SPONSORSHIP_TIERS[normTier];

  if (!tier) {
    return { success: false, reason: `Unknown sponsorship tier: ${tierName}` };
  }

  const currentCount = existingAllocations.filter((a) => a.tier === normTier).length;
  if (currentCount >= tier.maxAvailable) {
    return {
      success: false,
      reason: `Sponsorship tier ${normTier} is completely sold out (${tier.maxAvailable}/${tier.maxAvailable} allocated).`,
    };
  }

  return {
    success: true,
    allocation: {
      corporateName: (corporateName || 'Anonymous Sponsor').trim(),
      tier: normTier,
      price: tier.price,
      includedTeamSlots: tier.teamSlots,
      branding: tier.bannerPlacement,
      allocationDate: new Date().toISOString().split('T')[0],
    },
  };
}

module.exports = { SPONSORSHIP_TIERS, allocateSponsorship };
