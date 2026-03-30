const jwt = require('jsonwebtoken')
const { supabase } = require('../config/supabase')

/**
 * Verify JWT and attach user to request
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers['authorization']
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const token = authHeader.slice(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-in-production')

    // Fetch fresh user data from DB
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, subscription_status, plan, charity_id, phone')
      .eq('id', decoded.userId)
      .single()

    if (error || !user) {
      return res.status(401).json({ message: 'User not found or token invalid' })
    }

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' })
    }
    return res.status(401).json({ message: 'Invalid token' })
  }
}

/**
 * Require admin role
 */
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

/**
 * Require active subscription
 */
function requireActiveSubscription(req, res, next) {
  if (req.user?.subscription_status !== 'active') {
    return res.status(403).json({
      message: 'Active subscription required',
      subscription_status: req.user?.subscription_status,
    })
  }
  next()
}

module.exports = { authenticate, requireAdmin, requireActiveSubscription }
