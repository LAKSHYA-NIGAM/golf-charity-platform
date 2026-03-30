const express = require('express')
const { supabase } = require('../config/supabase')
const { authenticate, requireAdmin } = require('../middleware/auth')
const { simulateDraw, executeDraw } = require('../services/drawEngine')

const router = express.Router()
router.use(authenticate, requireAdmin)

// ─── GET /api/admin/stats ───
router.get('/stats', async (req, res) => {
  try {
    const [
      { count: total_users },
      { count: active_subs },
      { data: revenue },
      { data: donated },
      { count: pending_verifications },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
      supabase.from('users').select('plan').eq('subscription_status', 'active'),
      supabase.from('charity_contributions').select('amount'),
      supabase.from('winnings').select('*', { count: 'exact', head: true }).eq('status', 'pending_verification'),
    ])

    const monthly_revenue = (revenue || []).reduce((s, u) => s + (u.plan === 'yearly' ? 10 : 12), 0)
    const total_donated = (donated || []).reduce((s, c) => s + c.amount, 0)

    const { count: new_users_30d } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    res.json({
      total_users: total_users || 0,
      active_subs: active_subs || 0,
      monthly_revenue: Math.round(monthly_revenue),
      total_donated: Math.round(total_donated),
      pending_verifications: pending_verifications || 0,
      new_users_30d: new_users_30d || 0,
      churn_rate: total_users > 0 ? ((total_users - active_subs) / total_users * 100).toFixed(1) : 0,
      draws_this_month: 1,
    })
  } catch (err) {
    console.error('Admin stats error:', err)
    res.status(500).json({ message: 'Failed to fetch stats' })
  }
})

// ─── GET /api/admin/users ───
router.get('/users', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query
    let query = supabase
      .from('users')
      .select(`
        id, full_name, email, subscription_status, plan,
        role, created_at, phone,
        charities(name),
        scores(count)
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (status && status !== 'all') query = query.eq('subscription_status', status)
    if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)

    const { data: users, error } = await query
    if (error) throw error

    const shaped = (users || []).map(u => ({
      ...u,
      charity_name: u.charities?.name || null,
      scores_count: u.scores?.[0]?.count || 0,
    }))

    res.json({ users: shaped })
  } catch (err) {
    console.error('Get users error:', err)
    res.status(500).json({ message: 'Failed to fetch users' })
  }
})

// ─── PATCH /api/admin/users/:id/status ───
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['active', 'suspended', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const { error } = await supabase
      .from('users')
      .update({ subscription_status: status })
      .eq('id', req.params.id)

    if (error) throw error
    res.json({ message: 'User status updated' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user status' })
  }
})

// ─── GET /api/admin/draws ───
router.get('/draws', async (req, res) => {
  try {
    const { data: draws, error } = await supabase
      .from('draws')
      .select('*')
      .order('draw_date', { ascending: false })
      .limit(24)

    if (error) throw error
    res.json({ draws: draws || [] })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch draws' })
  }
})

// ─── POST /api/admin/draws ─── Create a new draw
router.post('/draws', async (req, res) => {
  try {
    const { name, draw_date, total_pool } = req.body

    const { data: draw, error } = await supabase
      .from('draws')
      .insert({ name, draw_date, total_pool: total_pool || 0, status: 'scheduled' })
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ draw })
  } catch (err) {
    res.status(500).json({ message: 'Failed to create draw' })
  }
})

// ─── POST /api/admin/draws/simulate ───
router.post('/draws/simulate', async (req, res) => {
  try {
    const { draw_id } = req.body

    // Get next scheduled draw if no draw_id
    let targetDrawId = draw_id
    if (!targetDrawId) {
      const { data: nextDraw } = await supabase
        .from('draws')
        .select('id')
        .eq('status', 'scheduled')
        .order('draw_date', { ascending: true })
        .limit(1)
        .single()
      targetDrawId = nextDraw?.id
    }

    const result = await simulateDraw(targetDrawId)
    res.json(result)
  } catch (err) {
    console.error('Simulate draw error:', err)
    res.status(500).json({ message: 'Draw simulation failed', error: err.message })
  }
})

// ─── POST /api/admin/draws/publish ───
router.post('/draws/publish', async (req, res) => {
  try {
    const { draw_id } = req.body
    if (!draw_id) return res.status(400).json({ message: 'draw_id required' })

    const result = await executeDraw(draw_id)
    res.json({ message: 'Draw published and winners notified', ...result })
  } catch (err) {
    console.error('Publish draw error:', err)
    res.status(500).json({ message: 'Failed to publish draw', error: err.message })
  }
})

// ─── GET /api/admin/winnings/pending ───
router.get('/winnings/pending', async (req, res) => {
  try {
    const { data: winnings, error } = await supabase
      .from('winnings')
      .select(`
        id, match_type, prize_amount, status, proof_url, submitted_at,
        users!inner(full_name, email),
        draws!inner(name)
      `)
      .eq('status', 'pending_verification')
      .order('submitted_at', { ascending: true })

    if (error) throw error

    const shaped = (winnings || []).map(w => ({
      ...w,
      user_name: w.users?.full_name,
      user_email: w.users?.email,
      draw_name: w.draws?.name,
    }))

    res.json({ winnings: shaped })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pending winnings' })
  }
})

// ─── PATCH /api/admin/winnings/:id/verify ───
router.patch('/winnings/:id/verify', async (req, res) => {
  try {
    const { approved } = req.body
    const newStatus = approved ? 'paid' : 'rejected'

    const { error } = await supabase
      .from('winnings')
      .update({
        status: newStatus,
        verified_by: req.user.id,
        verified_at: new Date().toISOString(),
        ...(approved ? { paid_at: new Date().toISOString() } : {}),
      })
      .eq('id', req.params.id)

    if (error) throw error
    res.json({ message: `Winning ${newStatus}` })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update winning status' })
  }
})

// ─── POST /api/admin/charities ───
router.post('/charities', async (req, res) => {
  try {
    const { name, category, description, website } = req.body
    const { data: charity, error } = await supabase
      .from('charities')
      .insert({ name, category, description, website, active: true, total_raised: 0 })
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ charity })
  } catch (err) {
    res.status(500).json({ message: 'Failed to create charity' })
  }
})

module.exports = router
