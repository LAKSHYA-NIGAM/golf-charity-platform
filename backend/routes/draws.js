const express = require('express')
const { supabase } = require('../config/supabase')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

// ─── GET /api/draws/public ─── Latest completed draws (public)
router.get('/public', async (req, res) => {
  try {
    const { data: draws, error } = await supabase
      .from('draws')
      .select('id, name, draw_date, numbers, total_pool, winners_count, status, jackpot_rollover, jackpot_carry')
      .in('status', ['completed', 'scheduled'])
      .order('draw_date', { ascending: false })
      .limit(12)

    if (error) throw error
    res.json({ draws: draws || [] })
  } catch (err) {
    console.error('Get public draws error:', err)
    res.status(500).json({ message: 'Failed to fetch draws' })
  }
})

// ─── GET /api/draws/my-history ─── Authenticated user's draw participation
router.get('/my-history', authenticate, async (req, res) => {
  try {
    const { data: participations, error } = await supabase
      .from('draw_participants')
      .select(`
        id, user_numbers, matched_count, matched_numbers,
        draws!inner(id, name, draw_date, numbers, total_pool, status)
      `)
      .eq('user_id', req.user.id)
      .order('draws(draw_date)', { ascending: false })
      .limit(24)

    if (error) throw error

    // Shape the response
    const draws = (participations || []).map(p => ({
      ...p.draws,
      userEntry: {
        numbers: p.user_numbers,
        matched_count: p.matched_count,
        matched_numbers: p.matched_numbers,
      }
    }))

    res.json({ draws })
  } catch (err) {
    console.error('Get draw history error:', err)
    res.status(500).json({ message: 'Failed to fetch draw history' })
  }
})

// ─── GET /api/draws/current ─── Current month's scheduled draw
router.get('/current', async (req, res) => {
  try {
    const { data: draw, error } = await supabase
      .from('draws')
      .select('id, name, draw_date, total_pool, status, jackpot_carry')
      .eq('status', 'scheduled')
      .order('draw_date', { ascending: true })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    res.json({ draw: draw || null })
  } catch (err) {
    console.error('Get current draw error:', err)
    res.status(500).json({ message: 'Failed to fetch current draw' })
  }
})

module.exports = router
