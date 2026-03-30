const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { z } = require('zod')
const { supabase } = require('../config/supabase')
const { authenticate } = require('../middleware/auth')
const { sendWelcomeEmail } = require('../services/email')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'
const JWT_EXPIRES = '7d'

// ─── Validation schemas ───
const registerSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  charity_id: z.string().uuid().optional(),
  plan: z.enum(['monthly', 'yearly']).default('monthly'),
  extra_contribution: z.number().min(0).max(50).default(0),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
}

// ─── POST /api/auth/register ───
router.post('/register', async (req, res) => {
  try {
    const body = registerSchema.parse(req.body)

    // Check existing user
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', body.email.toLowerCase())
      .single()

    if (existing) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(body.password, 12)

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        full_name: body.full_name,
        email: body.email.toLowerCase(),
        password_hash: passwordHash,
        charity_id: body.charity_id || null,
        plan: body.plan,
        extra_contribution: body.extra_contribution,
        subscription_status: 'pending', // Set to active after Stripe payment
        role: 'subscriber',
      })
      .select('id, email, full_name, role, subscription_status, plan')
      .single()

    if (error) {
      console.error('Register error:', error)
      return res.status(500).json({ message: 'Registration failed' })
    }

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.full_name).catch(console.error)

    const token = signToken(user.id)
    res.status(201).json({ token, user })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors })
    }
    console.error('Register error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// ─── POST /api/auth/login ───
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, subscription_status, plan, password_hash')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const { password_hash, ...safeUser } = user
    const token = signToken(user.id)

    res.json({ token, user: safeUser })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid credentials format' })
    }
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// ─── GET /api/auth/me ───
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user })
})

// ─── POST /api/auth/logout ───
router.post('/logout', authenticate, (req, res) => {
  // JWT is stateless — client removes the token
  res.json({ message: 'Logged out successfully' })
})

module.exports = router
