/**
 * Charitable Donation Tax Receipt & Deduction Engine
 * Calculates eligible tax deduction amounts (net of goods/services received)
 * and generates IRS 501(c)(3) / HMRC Gift Aid compliant receipts.
 */

const crypto = require('crypto');

class TaxReceiptEngine {
  /**
   * Calculates donation breakdown for a tournament entry or charity draw.
   * @param {number} grossAmount - Total amount paid by donor
   * @param {number} fairMarketValue - Value of golf round, food, merchandise received
   * @param {boolean} isGiftAidEligible - UK Gift Aid declaration flag
   */
  static calculateDeduction(grossAmount, fairMarketValue = 0, isGiftAidEligible = false) {
    const gross = Math.max(0, Number(grossAmount) || 0);
    const fmv = Math.max(0, Number(fairMarketValue) || 0);
    const taxDeductibleAmount = Math.max(0, gross - fmv);

    // HMRC Gift Aid allows 25p on every £1 of eligible donation
    const giftAidReclaim = isGiftAidEligible ? Math.round(taxDeductibleAmount * 0.25 * 100) / 100 : 0;
    const totalCharityValue = taxDeductibleAmount + giftAidReclaim;

    return {
      grossAmount: gross,
      fairMarketValue: fmv,
      taxDeductibleAmount,
      isGiftAidEligible: Boolean(isGiftAidEligible),
      giftAidReclaim,
      totalCharityValue
    };
  }

  /**
   * Generates a formal receipt object.
   */
  static generateReceipt(params) {
    const {
      donorName,
      donorEmail,
      charityName,
      charityRegNumber,
      grossAmount,
      fairMarketValue = 0,
      currency = 'USD',
      isGiftAidEligible = false
    } = params;

    if (!donorName || !charityName || !grossAmount) {
      throw new Error('donorName, charityName, and grossAmount are required');
    }

    const breakdown = TaxReceiptEngine.calculateDeduction(grossAmount, fairMarketValue, isGiftAidEligible);
    const receiptId = `REC-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    return {
      receiptId,
      issuedAt: new Date().toISOString(),
      donor: {
        name: donorName,
        email: donorEmail || 'N/A'
      },
      charity: {
        name: charityName,
        registrationNumber: charityRegNumber || '501(c)(3) PENDING'
      },
      financials: {
        currency: currency.toUpperCase(),
        ...breakdown
      },
      legalNotice: breakdown.fairMarketValue > 0
        ? `In accordance with tax regulations, charitable deductions are limited to the excess of payment over the fair market value ($${breakdown.fairMarketValue.toFixed(2)}) of goods or services provided in return.`
        : 'No goods or services were provided in exchange for this contribution.'
    };
  }
}

module.exports = TaxReceiptEngine;
