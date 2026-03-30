const express = require('express')
const { stripe, PRICE_IDS } = require('../config/stripe')
const { supabase } = require('../config/supabase')
const { authenticate } = require('../middleware/auth')

const router = express.Router()
router.use(authenticate)

// ─── POST /api/subscriptions/create-checkout ───
router.post('/create-checkout', async (req, res) => {
  try {
    const { plan = 'monthly' } = req.body
    const priceId = PRICE_IDS[plan]

    if (!priceId || priceId.includes('placeholder')) {
      // Demo mode — return mock URL
      return res.json({
        url: `${process.env.FRONTEND_URL}/dashboard?subscribed=true&plan=${plan}`,
        demo: true,
      })
    }

    // Create or get Stripe customer
    let customerId = req.user.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.full_name,
        metadata: { userId: req.user.id },
      })
      customerId = customer.id

      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', req.user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/dashboard?subscribed=true`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?cancelled=true`,
      metadata: { userId: req.user.id, plan },
      subscription_data: {
        metadata: { userId: req.user.id, plan },
      },
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    res.status(500).json({ message: 'Failed to create checkout session' })
  }
})

// ─── POST /api/subscriptions/portal ─── Stripe customer portal
router.post('/portal', async (req, res) => {
  try {
    const customerId = req.user.stripe_customer_id
    if (!customerId) {
      return res.status(400).json({ message: 'No subscription found' })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error('Portal error:', err)
    res.status(500).json({ message: 'Failed to open billing portal' })
  }
})

// ─── GET /api/subscriptions/status ───
router.get('/status', async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('subscription_status, plan, stripe_subscription_id, subscription_renewal_date')
      .eq('id', req.user.id)
      .single()

    res.json({
      status: user?.subscription_status || 'inactive',
      plan: user?.plan,
      renewal_date: user?.subscription_renewal_date,
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch subscription status' })
  }
})

module.exports = router
