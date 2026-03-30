// ─── users.js ───
const express = require('express')
const { supabase } = require('../config/supabase')
const { authenticate } = require('../middleware/auth')

const router = express.Router()
router.use(authenticate)

// GET /api/users/dashboard-stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    const userId = req.user.id

    const [
      { count: scores_count },
      { count: draws_count },
      { data: winnings },
      { data: contributions },
    ] = await Promise.all([
      supabase.from('scores').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('draw_participants').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('winnings').select('prize_amount, status').eq('user_id', userId),
      supabase.from('charity_contributions').select('amount').eq('user_id', userId),
    ])

    const total_winnings = (winnings || [])
      .filter(w => w.status === 'paid')
      .reduce((s, w) => s + w.prize_amount, 0)

    const charity_contributed = (contributions || [])
      .reduce((s, c) => s + c.amount, 0)

    // Next renewal
    const { data: user } = await supabase
      .from('users')
      .select('subscription_renewal_date')
      .eq('id', userId)
      .single()

    res.json({
      scores_entered: scores_count || 0,
      total_draws: draws_count || 0,
      total_winnings: Math.round(total_winnings * 100) / 100,
      charity_contributed: Math.round(charity_contributed * 100) / 100,
      current_draw_eligible: (scores_count || 0) > 0 && req.user.subscription_status === 'active',
      subscription_renewal: user?.subscription_renewal_date || null,
    })
  } catch (err) {
    console.error('Dashboard stats error:', err)
    res.status(500).json({ message: 'Failed to fetch stats' })
  }
})

// PUT /api/users/profile
router.put('/profile', async (req, res) => {
  try {
    const { full_name, phone } = req.body
    const updates = {}
    if (full_name) updates.full_name = full_name.trim()
    if (phone !== undefined) updates.phone = phone.trim()

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)

    if (error) throw error
    res.json({ message: 'Profile updated' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' })
  }
})

// GET /api/users/my-charity
router.get('/my-charity', async (req, res) => {
  try {
    const { data } = await supabase
      .from('users')
      .select('charity_id, extra_contribution')
      .eq('id', req.user.id)
      .single()
    res.json(data || {})
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch charity' })
  }
})

// PUT /api/users/my-charity
router.put('/my-charity', async (req, res) => {
  try {
    const { charity_id, extra_contribution = 0 } = req.body
    const { error } = await supabase
      .from('users')
      .update({ charity_id, extra_contribution })
      .eq('id', req.user.id)
    if (error) throw error
    res.json({ message: 'Charity preference saved' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to save charity' })
  }
})

module.exports = router
