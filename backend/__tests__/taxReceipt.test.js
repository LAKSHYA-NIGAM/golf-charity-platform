const TaxReceiptEngine = require('../services/taxReceipt');

describe('TaxReceiptEngine Unit Tests', () => {
  describe('calculateDeduction', () => {
    test('calculates 100% deduction when no goods/services provided (FMV = 0)', () => {
      const res = TaxReceiptEngine.calculateDeduction(100, 0, false);
      expect(res.grossAmount).toBe(100);
      expect(res.fairMarketValue).toBe(0);
      expect(res.taxDeductibleAmount).toBe(100);
      expect(res.giftAidReclaim).toBe(0);
      expect(res.totalCharityValue).toBe(100);
    });

    test('deducts fair market value of golf round from tournament entry fee', () => {
      // Tournament ticket: $250, Green fee + dinner FMV: $100 -> $150 tax deductible
      const res = TaxReceiptEngine.calculateDeduction(250, 100, false);
      expect(res.taxDeductibleAmount).toBe(150);
      expect(res.totalCharityValue).toBe(150);
    });

    test('calculates 25% Gift Aid reclaim for eligible UK donors', () => {
      // £100 pure donation -> £25 Gift Aid reclaim -> £125 total value to charity
      const res = TaxReceiptEngine.calculateDeduction(100, 0, true);
      expect(res.taxDeductibleAmount).toBe(100);
      expect(res.isGiftAidEligible).toBe(true);
      expect(res.giftAidReclaim).toBe(25);
      expect(res.totalCharityValue).toBe(125);
    });

    test('handles case where FMV exceeds gross payment without negative deductions', () => {
      const res = TaxReceiptEngine.calculateDeduction(50, 75, false);
      expect(res.taxDeductibleAmount).toBe(0);
    });
  });

  describe('generateReceipt', () => {
    test('generates complete compliant receipt with legal notice and unique ID', () => {
      const receipt = TaxReceiptEngine.generateReceipt({
        donorName: 'Arnold Palmer',
        donorEmail: 'arnold@golf.org',
        charityName: 'Youth Golf Foundation',
        charityRegNumber: 'CH-883921',
        grossAmount: 500,
        fairMarketValue: 150,
        currency: 'USD'
      });

      expect(receipt.receiptId).toMatch(/^REC-/);
      expect(receipt.donor.name).toBe('Arnold Palmer');
      expect(receipt.charity.name).toBe('Youth Golf Foundation');
      expect(receipt.financials.taxDeductibleAmount).toBe(350);
      expect(receipt.legalNotice).toContain('limited to the excess of payment');
    });

    test('throws error when mandatory params are missing', () => {
      expect(() => {
        TaxReceiptEngine.generateReceipt({ donorName: 'John' });
      }).toThrow();
    });
  });
});
