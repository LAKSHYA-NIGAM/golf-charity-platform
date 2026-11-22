const assert = require('assert');
const test = require('node:test');
const { processBid } = require('../services/charityAuctionEngine');

test('processBid: places opening bid when no bids exist', () => {
  const item = { id: 'item-1', startingPrice: 100, minIncrement: 20, currentHighestBid: 0 };
  const res = processBid({ item, bidderId: 'user-A', maxBidAmount: 150 });

  assert.strictEqual(res.success, true);
  assert.strictEqual(res.currentHighestBid, 100);
  assert.strictEqual(res.currentBidderId, 'user-A');
  assert.strictEqual(res.isWinner, true);
});

test('processBid: rejects bid below minimum increment', () => {
  const item = { id: 'item-2', startingPrice: 100, minIncrement: 25, currentHighestBid: 200 };
  // Needs 225
  const res = processBid({ item, bidderId: 'user-B', maxBidAmount: 210 });

  assert.strictEqual(res.success, false);
  assert.ok(res.reason.includes('below the minimum required bid of $225'));
});

test('processBid: proxy outbidding resolution', () => {
  // Existing bidder has proxy max of $500, currently at $200. New bidder bids $300.
  const item = {
    id: 'item-3',
    minIncrement: 25,
    currentHighestBid: 200,
    currentBidderId: 'user-Existing',
    proxyMaxBid: 500,
  };

  const res = processBid({ item, bidderId: 'user-New', maxBidAmount: 300 });
  assert.strictEqual(res.success, true);
  // Existing bidder defends lead at 300 + 25 = 325
  assert.strictEqual(res.currentBidderId, 'user-Existing');
  assert.strictEqual(res.currentHighestBid, 325);
  assert.strictEqual(res.isWinner, false);
});
