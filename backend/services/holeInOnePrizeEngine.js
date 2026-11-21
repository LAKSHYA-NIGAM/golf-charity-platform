/**
 * Hole-In-One Insurance Prize Contest Validator
 * Validates contest eligibility requirements:
 * 1. Minimum hole distance verified (e.g. >= 150 yards for men, >= 135 yards for women)
 * 2. Official witness attestation signatures present
 * 3. Designated prize hole verification
 */

function validateHoleInOneClaim({
  holeNumber,
  designatedHole,
  measuredYardage,
  minRequiredYardage = 150,
  witnessSignatures = [],
  isOfficialTournamentRound = true,
} = {}) {
  const errors = [];

  if (holeNumber !== designatedHole) {
    errors.push(`Claimed on hole ${holeNumber}, but official prize hole is hole ${designatedHole}.`);
  }

  const yardage = Number(measuredYardage) || 0;
  if (yardage < minRequiredYardage) {
    errors.push(`Measured yardage of ${yardage} yds is below policy requirement of ${minRequiredYardage} yds.`);
  }

  if (!Array.isArray(witnessSignatures) || witnessSignatures.length < 2) {
    errors.push('Insurance policy mandates at least 2 independent witness attestations.');
  }

  if (!isOfficialTournamentRound) {
    errors.push('Shot must occur during an official tournament round.');
  }

  return {
    isEligible: errors.length === 0,
    errors,
    yardage,
    witnessCount: witnessSignatures?.length || 0,
  };
}

module.exports = { validateHoleInOneClaim };
