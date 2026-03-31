/**
 * GreenHeart Backend Server
 * Node.js + Express REST API
 * 
 * Supports two modes:
 * - LIVE: Full Supabase + Stripe integration
 * - DEMO: Mock data for development/preview (no external services needed)
 */

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const { isConfigured } = require('./config/supabase')

const app = express()
const PORT = process.env.PORT || 5000

// ─── Sanitize FRONTEND_URL (strip invisible chars from env copy-paste) ───
const sanitizedFrontendUrl = (process.env.FRONTEND_URL || '')
  .replace(/[\r\n\t]/g, '')
  .trim()

// ─── CORS origin resolver ───
const allowedOrigins = [
  sanitizedFrontendUrl,
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean)

function corsOrigin(origin, callback) {
  // Allow requests with no origin (mobile apps, curl, server-to-server)
  if (!origin) return callback(null, true)
  // Allow exact matches
  if (allowedOrigins.includes(origin)) return callback(null, true)
  // Allow any *.vercel.app subdomain as fallback
  if (/\.vercel\.app$/.test(origin)) return callback(null, true)
  // Reject everything else
  callback(new Error(`CORS: origin ${origin} not allowed`))
}

// ─── Security Middleware ───
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ─── Body Parsing ───
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ─── Logging ───
app.use(morgan('dev'))

// ─── Rate Limiting ───
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please try again later.' },
})
app.use('/api/', limiter)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts.' },
})
app.use('/api/auth/', authLimiter)

// ─── Mode Selection ───
if (isConfigured) {
  // ═══ LIVE MODE ═══
  console.log('🟢 Starting in LIVE mode (Supabase connected)')

  // Stripe Webhook needs raw body — mount BEFORE json parser
  const webhookRoutes = require('./routes/webhooks')
  app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }), webhookRoutes)

  // Route imports
  const authRoutes = require('./routes/auth')
  const userRoutes = require('./routes/users')
  const scoreRoutes = require('./routes/scores')
  const drawRoutes = require('./routes/draws')
  const charityRoutes = require('./routes/charities')
  const subscriptionRoutes = require('./routes/subscriptions')
  const winningRoutes = require('./routes/winnings')
  const adminRoutes = require('./routes/admin')

  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/scores', scoreRoutes)
  app.use('/api/draws', drawRoutes)
  app.use('/api/charities', charityRoutes)
  app.use('/api/subscriptions', subscriptionRoutes)
  app.use('/api/winnings', winningRoutes)
  app.use('/api/admin', adminRoutes)

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      mode: 'live',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    })
  })
} else {
  // ═══ DEMO MODE ═══
  console.log('🟡 Starting in DEMO mode (no external services needed)')
  console.log('   Login with: admin@greenheart.io / admin123')
  console.log('   Or any email with any password\n')

  const { router: demoRouter } = require('./middleware/demo')
  app.use('/api', demoRouter)
}

// ─── Root route (friendly landing for the API) ───
app.get('/', (req, res) => {
  res.json({
    name: 'GreenHeart API',
    status: 'running',
    version: '1.0.0',
    mode: isConfigured ? 'live' : 'demo',
    health: '/api/health',
    docs: 'https://github.com/LAKSHYA-NIGAM/golf-charity-platform',
  })
})

// ─── Root-level health check alias ───
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: isConfigured ? 'live' : 'demo',
    timestamp: new Date().toISOString(),
    environment: (process.env.NODE_ENV || 'development').replace(/[\r\n\t]/g, '').trim(),
  })
})

// ─── 404 Handler ───
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl })
})

// ─── Global Error Handler ───
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

// ─── Start Server ───
app.listen(PORT, () => {
  console.log(`\n🌿 GreenHeart API running on port ${PORT}`)
  console.log(`   Mode: ${isConfigured ? 'LIVE' : 'DEMO'}`)
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Health: http://localhost:${PORT}/api/health\n`)
})

module.exports = app
