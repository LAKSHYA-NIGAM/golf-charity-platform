/**
 * GreenHeart Draw Engine
 * Handles draw simulation, execution, winner calculation,
 * and prize pool distribution.
 */

const { supabase } = require('../config/supabase')
const { sendDrawResultEmail, sendWinnerEmail } = require('./email')

/**
 * Generate 5 unique random numbers from 1-45
 */
function generateDrawNumbers() {
  const numbers = new Set()
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1)
  }
  return Array.from(numbers).sort((a, b) => a - b)
}

/**
 * Count how many numbers from userScores match drawNumbers
 * @param {number[]} userScores - User's Stableford scores
 * @param {number[]} drawNumbers - The drawn numbers
 * @returns {number} match count
 */
function countMatches(userScores, drawNumbers) {
  const drawSet = new Set(drawNumbers)
  return userScores.filter(s => drawSet.has(s)).length
}

/**
 * Calculate prize pool shares
 * 5-match: 40% (jackpot — rolls over if no winner)
 * 4-match: 35%
 * 3-match: 25%
 */
function calculatePrizes(totalPool, winners) {
  const fiveMatch = winners.filter(w => w.matchCount === 5)
  const fourMatch = winners.filter(w => w.matchCount === 4)
  const threeMatch = winners.filter(w => w.matchCount === 3)

  const prizes = {}

  // 5-match (jackpot) — split equally if multiple winners
  if (fiveMatch.length > 0) {
    const jackpotShare = totalPool * 0.4
    prizes['5-match'] = jackpotShare / fiveMatch.length
    prizes.jackpot_won = true
  } else {
    prizes.jackpot_won = false
    prizes.jackpot_rollover = totalPool * 0.4
  }

  // 4-match
  if (fourMatch.length > 0) {
    prizes['4-match'] = (totalPool * 0.35) / fourMatch.length
  }

  // 3-match
  if (threeMatch.length > 0) {
    prizes['3-match'] = (totalPool * 0.25) / threeMatch.length
  }

  return prizes
}

/**
 * Simulate a draw without persisting — for admin preview
 */
async function simulateDraw(drawId) {
  const numbers = generateDrawNumbers()

  // Get all eligible users (active subscription + at least 1 score)
  const { data: eligibleUsers } = await supabase
    .from('users')
    .select(`
      id, full_name, email,
      scores!inner(score, played_at)
    `)
    .eq('subscription_status', 'active')

  if (!eligibleUsers) return { numbers, winners: [], five_match: 0, four_match: 0, three_match: 0 }

  const winners = []
  for (const user of eligibleUsers) {
    const userScores = (user.scores || []).map(s => s.score)
    const matchCount = countMatches(userScores, numbers)
    if (matchCount >= 3) {
      winners.push({ userId: user.id, name: user.full_name, matchCount })
    }
  }

  return {
    draw_id: drawId,
    numbers,
    winners,
    five_match: winners.filter(w => w.matchCount === 5).length,
    four_match: winners.filter(w => w.matchCount === 4).length,
    three_match: winners.filter(w => w.matchCount === 3).length,
  }
}

/**
 * Execute and publish a draw — persists results, notifies winners
 */
async function executeDraw(drawId) {
  // Fetch the draw
  const { data: draw, error: drawError } = await supabase
    .from('draws')
    .select('*')
    .eq('id', drawId)
    .single()

  if (drawError || !draw) throw new Error('Draw not found')
  if (draw.status === 'completed') throw new Error('Draw already completed')

  const numbers = generateDrawNumbers()

  // Get all active subscribers with their scores
  const { data: eligibleUsers } = await supabase
    .from('users')
    .select(`
      id, full_name, email,
      scores(score, played_at)
    `)
    .eq('subscription_status', 'active')

  const winnerRecords = []
  const participationRecords = []

  for (const user of (eligibleUsers || [])) {
    const userScores = (user.scores || [])
      .sort((a, b) => new Date(b.played_at) - new Date(a.played_at))
      .slice(0, 5)
      .map(s => s.score)

    const matchCount = countMatches(userScores, numbers)
    const matchedNumbers = userScores.filter(s => numbers.includes(s))

    participationRecords.push({
      draw_id: drawId,
      user_id: user.id,
      user_numbers: userScores,
      matched_count: matchCount,
      matched_numbers: matchedNumbers,
    })

    if (matchCount >= 3) {
      winnerRecords.push({
        userId: user.id,
        email: user.email,
        name: user.full_name,
        matchCount,
        matchedNumbers,
      })
    }
  }

  // Calculate prizes
  const prizes = calculatePrizes(draw.total_pool, winnerRecords)

  // Insert participation records
  if (participationRecords.length > 0) {
    await supabase.from('draw_participants').insert(participationRecords)
  }

  // Insert winner records
  for (const winner of winnerRecords) {
    const prizeKey = `${winner.matchCount}-match`
    const prizeAmount = prizes[prizeKey] || 0

    await supabase.from('winnings').insert({
      user_id: winner.userId,
      draw_id: drawId,
      match_type: `${winner.matchCount}-Match`,
      matched_numbers: winner.matchedNumbers,
      prize_amount: Math.round(prizeAmount * 100) / 100,
      status: 'pending_upload',
    })

    // Notify winner
    sendWinnerEmail(winner.email, winner.name, winner.matchCount, prizeAmount).catch(console.error)
  }

  // Update draw record
  await supabase
    .from('draws')
    .update({
      numbers,
      status: 'completed',
      winners_count: winnerRecords.length,
      jackpot_won: prizes.jackpot_won,
      jackpot_rollover: prizes.jackpot_rollover || 0,
      completed_at: new Date().toISOString(),
    })
    .eq('id', drawId)

  // Handle jackpot rollover — add to next draw
  if (!prizes.jackpot_won && prizes.jackpot_rollover > 0) {
    await rolloverJackpot(drawId, prizes.jackpot_rollover)
  }

  return {
    numbers,
    winners: winnerRecords.length,
    prizes,
    jackpot_won: prizes.jackpot_won,
  }
}

/**
 * Add jackpot rollover amount to next scheduled draw
 */
async function rolloverJackpot(currentDrawId, amount) {
  const { data: nextDraw } = await supabase
    .from('draws')
    .select('id, total_pool, jackpot_carry')
    .eq('status', 'scheduled')
    .order('draw_date', { ascending: true })
    .limit(1)
    .single()

  if (nextDraw) {
    await supabase
      .from('draws')
      .update({
        total_pool: nextDraw.total_pool + amount,
        jackpot_carry: (nextDraw.jackpot_carry || 0) + amount,
      })
      .eq('id', nextDraw.id)
  }
}

module.exports = { simulateDraw, executeDraw, generateDrawNumbers, countMatches, calculatePrizes }
