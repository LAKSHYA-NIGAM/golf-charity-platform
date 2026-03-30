/**
 * Demo Mode Middleware
 * When Supabase is not configured, intercepts API calls and returns
 * realistic mock data so the entire frontend works end-to-end.
 */

const { isConfigured } = require('../config/supabase')

// ── In-memory demo store ──────────────────────────────────────────
const demoUsers = {
  admin: {
    id: 'demo-admin-001',
    email: 'admin@greenheart.io',
    full_name: 'GreenHeart Admin',
    role: 'admin',
    subscription_status: 'active',
    plan: 'yearly',
    phone: '+353 1 234 5678',
    charity_id: 'demo-charity-001',
    password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4d8Bz.5.Gu', // admin123
  },
  user: {
    id: 'demo-user-001',
    email: 'demo@greenheart.io',
    full_name: 'Demo Golfer',
    role: 'subscriber',
    subscription_status: 'active',
    plan: 'monthly',
    phone: '+353 87 123 4567',
    charity_id: 'demo-charity-002',
    password_hash: '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
  },
}

const demoCharities = [
  { id: 'demo-charity-001', name: 'St. Vincent de Paul', category: 'Poverty Relief', description: 'SVP supports over 140,000 people in Ireland every year.', website: 'https://svp.ie', emoji: '🏠', featured: true, active: true, total_raised: 42100, subscribers_count: 312 },
  { id: 'demo-charity-002', name: 'Irish Heart Foundation', category: 'Health', description: 'Saving lives by preventing heart disease and stroke.', website: 'https://irishheart.ie', emoji: '❤️', featured: true, active: true, total_raised: 38500, subscribers_count: 287 },
  { id: 'demo-charity-003', name: 'Focus Ireland', category: 'Homelessness', description: 'Working to prevent homelessness across Ireland.', website: 'https://focusireland.ie', emoji: '🌿', featured: false, active: true, total_raised: 29800, subscribers_count: 218 },
  { id: 'demo-charity-004', name: 'ISPCC Childline', category: 'Child Safety', description: '24-hour listening service for children and young people.', website: 'https://ispcc.ie', emoji: '📞', featured: false, active: true, total_raised: 24600, subscribers_count: 189 },
  { id: 'demo-charity-005', name: 'Pieta House', category: 'Health', description: 'Providing free therapeutic services for people in suicidal distress.', website: 'https://pieta.ie', emoji: '💜', featured: false, active: true, total_raised: 21300, subscribers_count: 156 },
  { id: 'demo-charity-006', name: 'Goal Global', category: 'Poverty Relief', description: 'International humanitarian organisation helping the most vulnerable.', website: 'https://goal.ie', emoji: '🌍', featured: false, active: true, total_raised: 18700, subscribers_count: 134 },
  { id: 'demo-charity-007', name: 'Irish Wildlife Trust', category: 'Environment', description: 'Conservation and protection of Ireland\'s wildlife.', website: 'https://iwt.ie', emoji: '🦋', featured: false, active: true, total_raised: 14200, subscribers_count: 98 },
  { id: 'demo-charity-008', name: 'Barretstown', category: 'Health', description: 'Therapeutic recreation for children with serious illness.', website: 'https://barretstown.org', emoji: '⭐', featured: false, active: true, total_raised: 12800, subscribers_count: 87 },
  { id: 'demo-charity-009', name: 'Simon Community', category: 'Homelessness', description: 'Housing and care services for people experiencing homelessness.', website: 'https://simon.ie', emoji: '🏘️', featured: false, active: true, total_raised: 11400, subscribers_count: 76 },
  { id: 'demo-charity-010', name: 'Aware', category: 'Health', description: 'Supporting people impacted by depression and mood conditions.', website: 'https://aware.ie', emoji: '🌈', featured: false, active: true, total_raised: 9600, subscribers_count: 64 },
  { id: 'demo-charity-011', name: 'An Taisce', category: 'Environment', description: 'Ireland\'s National Trust, protecting heritage since 1948.', website: 'https://antaisce.org', emoji: '🌲', featured: false, active: true, total_raised: 7800, subscribers_count: 52 },
  { id: 'demo-charity-012', name: 'Down Syndrome Ireland', category: 'Health', description: 'Supporting people with Down Syndrome and their families.', website: 'https://downsyndrome.ie', emoji: '🧡', featured: false, active: true, total_raised: 6200, subscribers_count: 43 },
]

let demoScores = [
  { id: 'ds-1', user_id: 'demo-user-001', score: 32, played_at: '2025-01-15', course_name: 'Portmarnock Golf Club', created_at: '2025-01-15T10:00:00Z' },
  { id: 'ds-2', user_id: 'demo-user-001', score: 27, played_at: '2025-01-08', course_name: 'Royal Dublin Golf Club', created_at: '2025-01-08T10:00:00Z' },
  { id: 'ds-3', user_id: 'demo-user-001', score: 38, played_at: '2024-12-20', course_name: 'Lahinch Golf Club', created_at: '2024-12-20T10:00:00Z' },
  { id: 'ds-4', user_id: 'demo-user-001', score: 14, played_at: '2024-12-12', course_name: 'Ballybunion Golf Club', created_at: '2024-12-12T10:00:00Z' },
  { id: 'ds-5', user_id: 'demo-user-001', score: 41, played_at: '2024-11-30', course_name: 'Tralee Golf Club', created_at: '2024-11-30T10:00:00Z' },
]

const demoDraws = [
  { id: 'dd-1', name: 'December 2024 Draw', draw_date: '2024-12-31', status: 'completed', numbers: [3,11,22,29,40], total_pool: 28000, winners_count: 42, jackpot_won: false, jackpot_carry: 0 },
  { id: 'dd-2', name: 'January 2025 Draw', draw_date: '2025-01-31', status: 'completed', numbers: [7,14,23,31,38], total_pool: 35500, winners_count: 52, jackpot_won: false, jackpot_carry: 11200 },
  { id: 'dd-3', name: 'February 2025 Draw', draw_date: '2025-02-28', status: 'scheduled', numbers: null, total_pool: 38200, winners_count: 0, jackpot_won: null, jackpot_carry: 25400 },
]

const demoWinnings = [
  { id: 'dw-1', user_id: 'demo-user-001', draw_id: 'dd-2', match_type: '3-Match', matched_numbers: [14,38], prize_amount: 170.19, status: 'pending_upload', proof_url: null, submitted_at: null, paid_at: null, draws: { name: 'January 2025 Draw', draw_date: '2025-01-31' } },
]

const demoAllUsers = [
  { id: 'demo-user-001', full_name: 'Demo Golfer', email: 'demo@greenheart.io', subscription_status: 'active', plan: 'monthly', role: 'subscriber', created_at: '2024-11-15', charity_name: 'Irish Heart Foundation', scores_count: 5 },
  { id: 'demo-user-002', full_name: 'Sarah O\'Brien', email: 'sarah@example.com', subscription_status: 'active', plan: 'yearly', role: 'subscriber', created_at: '2024-10-22', charity_name: 'Focus Ireland', scores_count: 5 },
  { id: 'demo-user-003', full_name: 'Conor Walsh', email: 'conor@example.com', subscription_status: 'cancelled', plan: 'monthly', role: 'subscriber', created_at: '2024-12-01', charity_name: 'ISPCC Childline', scores_count: 2 },
  { id: 'demo-user-004', full_name: 'Aoife Kelly', email: 'aoife@example.com', subscription_status: 'active', plan: 'yearly', role: 'subscriber', created_at: '2024-09-14', charity_name: 'St. Vincent de Paul', scores_count: 5 },
  { id: 'demo-user-005', full_name: 'Liam Brennan', email: 'liam@example.com', subscription_status: 'active', plan: 'monthly', role: 'subscriber', created_at: '2024-08-20', charity_name: 'Pieta House', scores_count: 4 },
]

// ── Demo Router ──────────────────────────────────────────────────
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

let demoSession = null // Track logged-in demo user

function demoAuth(req, res, next) {
  const authHeader = req.headers['authorization']
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET)
      req.user = decoded.role === 'admin' ? demoUsers.admin : demoUsers.user
      req.user.id = decoded.userId
    } catch {}
  }
  next()
}

// ── Auth routes ──
router.post('/auth/register', async (req, res) => {
  const { full_name, email, password, plan = 'monthly', charity_id } = req.body
  const hash = await bcrypt.hash(password, 12)
  const user = {
    id: 'demo-user-' + Date.now(),
    email: email.toLowerCase(),
    full_name,
    role: 'subscriber',
    subscription_status: 'active',
    plan,
    charity_id: charity_id || null,
  }
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
  res.status(201).json({ token, user })
})

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body
  let user = null

  if (email === 'admin@greenheart.io') {
    const valid = await bcrypt.compare(password, demoUsers.admin.password_hash)
    if (valid) user = { ...demoUsers.admin }
  } else if (email === 'demo@greenheart.io') {
    // Accept any password for demo user
    user = { ...demoUsers.user }
  } else {
    // Accept any email/password in demo mode
    user = { ...demoUsers.user, email: email.toLowerCase(), full_name: email.split('@')[0] }
    user.id = 'demo-user-' + Date.now()
  }

  if (!user) return res.status(401).json({ message: 'Invalid credentials' })

  const { password_hash, ...safeUser } = user
  const token = jwt.sign({ userId: safeUser.id, role: safeUser.role }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: safeUser })
})

router.get('/auth/me', demoAuth, (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' })
  const { password_hash, ...safeUser } = req.user
  res.json({ user: safeUser })
})

router.post('/auth/logout', (req, res) => {
  res.json({ message: 'Logged out' })
})

// ── Scores ──
router.get('/scores', demoAuth, (req, res) => {
  const userId = req.user?.id || 'demo-user-001'
  const scores = demoScores.filter(s => s.user_id === userId).sort((a, b) => new Date(b.played_at) - new Date(a.played_at))
  res.json({ scores })
})

router.post('/scores', demoAuth, (req, res) => {
  const userId = req.user?.id || 'demo-user-001'
  const { score, played_at, course_name } = req.body
  const userScores = demoScores.filter(s => s.user_id === userId)
  if (userScores.length >= 5) {
    const oldest = userScores.sort((a, b) => new Date(a.played_at) - new Date(b.played_at))[0]
    demoScores = demoScores.filter(s => s.id !== oldest.id)
  }
  const newScore = { id: 'ds-' + Date.now(), user_id: userId, score, played_at, course_name, created_at: new Date().toISOString() }
  demoScores.push(newScore)
  res.status(201).json({ score: newScore })
})

router.delete('/scores/:id', demoAuth, (req, res) => {
  demoScores = demoScores.filter(s => s.id !== req.params.id)
  res.json({ message: 'Score deleted' })
})

// ── Draws ──
router.get('/draws/public', (req, res) => {
  res.json({ draws: demoDraws })
})

router.get('/draws/current', (req, res) => {
  const scheduled = demoDraws.find(d => d.status === 'scheduled')
  res.json({ draw: scheduled || null })
})

router.get('/draws/my-history', demoAuth, (req, res) => {
  const draws = demoDraws.filter(d => d.status === 'completed').map(d => ({
    ...d,
    userEntry: { numbers: [32, 27, 38, 14, 41], matched_count: 2, matched_numbers: [14, 38] }
  }))
  res.json({ draws })
})

// ── Charities ──
router.get('/charities', (req, res) => {
  let result = [...demoCharities]
  const { search, category } = req.query
  if (category && category !== 'All') result = result.filter(c => c.category === category)
  if (search) result = result.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  res.json({ charities: result })
})

router.get('/charities/:id', (req, res) => {
  const charity = demoCharities.find(c => c.id === req.params.id)
  if (!charity) return res.status(404).json({ message: 'Not found' })
  res.json({ charity })
})

// ── Users / Dashboard ──
router.get('/users/dashboard-stats', demoAuth, (req, res) => {
  res.json({
    scores_entered: 5,
    total_draws: 6,
    total_winnings: 170.19,
    charity_contributed: 21.60,
    current_draw_eligible: true,
    subscription_renewal: '2025-03-12',
  })
})

router.put('/users/profile', demoAuth, (req, res) => {
  res.json({ message: 'Profile updated (demo mode)' })
})

router.get('/users/my-charity', demoAuth, (req, res) => {
  res.json({ charity_id: 'demo-charity-002', extra_contribution: 2 })
})

router.put('/users/my-charity', demoAuth, (req, res) => {
  res.json({ message: 'Charity preference saved (demo mode)' })
})

// ── Subscriptions ──
router.post('/subscriptions/create-checkout', demoAuth, (req, res) => {
  const { plan = 'monthly' } = req.body
  res.json({
    url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?subscribed=true&plan=${plan}`,
    demo: true,
  })
})

router.post('/subscriptions/portal', demoAuth, (req, res) => {
  res.json({ url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`, demo: true })
})

router.get('/subscriptions/status', demoAuth, (req, res) => {
  res.json({ status: 'active', plan: 'monthly', renewal_date: '2025-03-12T00:00:00Z' })
})

// ── Winnings ──
router.get('/winnings/my', demoAuth, (req, res) => {
  const winnings = demoWinnings.map(w => ({
    ...w,
    draw_name: w.draws?.name,
    draw_date: w.draws?.draw_date,
  }))
  res.json({ winnings })
})

router.post('/winnings/:id/upload-proof', demoAuth, (req, res) => {
  res.json({ message: 'Proof uploaded (demo mode). We\'ll review within 48 hours.', proof_url: '/demo-proof.png' })
})

// ── Admin routes ──
router.get('/admin/stats', demoAuth, (req, res) => {
  res.json({
    total_users: 2847,
    active_subs: 2401,
    monthly_revenue: 28812,
    total_donated: 182400,
    pending_verifications: 3,
    new_users_30d: 124,
    churn_rate: '2.1',
    draws_this_month: 1,
  })
})

router.get('/admin/users', demoAuth, (req, res) => {
  res.json({ users: demoAllUsers })
})

router.patch('/admin/users/:id/status', demoAuth, (req, res) => {
  res.json({ message: 'User status updated (demo mode)' })
})

router.get('/admin/draws', demoAuth, (req, res) => {
  res.json({ draws: demoDraws })
})

router.post('/admin/draws', demoAuth, (req, res) => {
  const draw = { id: 'dd-' + Date.now(), ...req.body, status: 'scheduled', numbers: null, winners_count: 0 }
  demoDraws.push(draw)
  res.status(201).json({ draw })
})

router.post('/admin/draws/simulate', demoAuth, (req, res) => {
  const numbers = []
  const used = new Set()
  while (numbers.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1
    if (!used.has(n)) { numbers.push(n); used.add(n) }
  }
  numbers.sort((a, b) => a - b)
  res.json({
    draw_id: demoDraws.find(d => d.status === 'scheduled')?.id || 'dd-sim',
    numbers,
    winners: [
      { userId: 'demo-user-001', name: 'Demo Golfer', matchCount: 3 },
    ],
    five_match: 0,
    four_match: 1,
    three_match: 14,
  })
})

router.post('/admin/draws/publish', demoAuth, (req, res) => {
  res.json({
    message: 'Draw published and winners notified (demo mode)',
    numbers: [7, 19, 28, 36, 42],
    winners: 8,
    prizes: { '3-match': 680.77, '4-match': 1243.46, jackpot_won: false, jackpot_rollover: 15280 },
    jackpot_won: false,
  })
})

router.get('/admin/winnings/pending', demoAuth, (req, res) => {
  res.json({
    winnings: [
      { id: 'dw-p1', match_type: '3-Match', prize_amount: 8875, status: 'pending_verification', proof_url: '#', submitted_at: '2025-02-01', user_name: 'John Murphy', user_email: 'john@example.com', draw_name: 'January 2025 Draw' },
      { id: 'dw-p2', match_type: '4-Match', prize_amount: 12425, status: 'pending_verification', proof_url: '#', submitted_at: '2025-02-02', user_name: 'Aoife Kelly', user_email: 'aoife@example.com', draw_name: 'January 2025 Draw' },
    ],
  })
})

router.patch('/admin/winnings/:id/verify', demoAuth, (req, res) => {
  const { approved } = req.body
  res.json({ message: `Winning ${approved ? 'paid' : 'rejected'} (demo mode)` })
})

router.post('/admin/charities', demoAuth, (req, res) => {
  const charity = { id: 'dc-' + Date.now(), ...req.body, active: true, total_raised: 0, subscribers_count: 0 }
  demoCharities.push(charity)
  res.status(201).json({ charity })
})

// ── Webhooks (no-op in demo) ──
router.post('/webhooks/stripe', (req, res) => {
  res.json({ received: true })
})

// ── Health ──
router.get('/health', (req, res) => {
  res.json({ status: 'ok', mode: 'demo', timestamp: new Date().toISOString() })
})

module.exports = { router, isConfigured }
