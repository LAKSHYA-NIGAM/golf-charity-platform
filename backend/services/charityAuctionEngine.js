/**
 * Silent Charity Auction Proxy Bidding Engine
 * Handles incremental bids, reserve prices, minimum step increments, and auto-proxy bidding.
 */

function processBid({
  item,
  bidderId,
  maxBidAmount,
} = {}) {
  if (!item || !bidderId) {
    return { success: false, reason: 'Invalid item or bidder payload' };
  }

  const minIncrement = Number(item.minIncrement) || 25;
  const startingPrice = Number(item.startingPrice) || 50;
  const currentHighestBid = Number(item.currentHighestBid) || 0;
  const minRequiredBid = currentHighestBid > 0 ? currentHighestBid + minIncrement : startingPrice;

  const maxBid = Number(maxBidAmount);
  if (isNaN(maxBid) || maxBid < minRequiredBid) {
    return {
      success: false,
      reason: `Bid of $${maxBid} is below the minimum required bid of $${minRequiredBid}`,
      minRequiredBid,
    };
  }

  // If another bidder had a proxy max bid
  let winningBid = minRequiredBid;
  let winningBidder = bidderId;

  if (item.proxyMaxBid && item.currentBidderId && item.currentBidderId !== bidderId) {
    if (item.proxyMaxBid >= maxBid) {
      // Existing bidder retains lead at (newBid + increment) up to their max
      winningBid = Math.min(item.proxyMaxBid, maxBid + minIncrement);
      winningBidder = item.currentBidderId;
    } else {
      // New bidder overtakes existing proxy max
      winningBid = Math.min(maxBid, item.proxyMaxBid + minIncrement);
      winningBidder = bidderId;
    }
  }

  return {
    success: true,
    itemId: item.id,
    currentHighestBid: winningBid,
    currentBidderId: winningBidder,
    isWinner: winningBidder === bidderId,
  };
}

module.exports = { processBid };
