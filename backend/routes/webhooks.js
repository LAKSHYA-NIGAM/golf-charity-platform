const express = require('express')
const { stripe } = require('../config/stripe')
const { supabase } = require('../config/supabase')
const { sendPaymentConfirmationEmail } = require('../services/email')

const router = express.Router()

// ─── POST /api/webhooks/stripe ───
router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event
  try {
    event = webhookSecret
      ? stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
      : JSON.parse(req.body.toString())
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  console.log(`📨 Stripe webhook: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata?.userId
        const plan = session.metadata?.plan || 'monthly'

        if (userId) {
          await supabase.from('users').update({
            subscription_status: 'active',
            plan,
            stripe_subscription_id: session.subscription,
            subscription_activated_at: new Date().toISOString(),
          }).eq('id', userId)

          // Get user for email
          const { data: user } = await supabase.from('users').select('email, full_name').eq('id', userId).single()
          if (user) {
            const amount = plan === 'yearly' ? 120 : 12
            sendPaymentConfirmationEmail(user.email, user.full_name, amount, plan).catch(console.error)
          }
        }
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object
        const customerId = invoice.customer

        const { data: user } = await supabase.from('users').select('id, email, full_name, plan').eq('stripe_customer_id', customerId).single()
        if (user) {
          // Calculate next renewal
          const renewalDate = new Date()
          renewalDate.setMonth(renewalDate.getMonth() + (user.plan === 'yearly' ? 12 : 1))

          await supabase.from('users').update({
            subscription_status: 'active',
            subscription_renewal_date: renewalDate.toISOString(),
          }).eq('id', user.id)

          // Process charity contribution
          await processCharityContribution(user.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        await supabase.from('users').update({ subscription_status: 'cancelled' })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const status = subscription.status === 'active' ? 'active' : 'lapsed'
        await supabase.from('users').update({ subscription_status: status })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        await supabase.from('users').update({ subscription_status: 'lapsed' })
          .eq('stripe_customer_id', invoice.customer)
        break
      }
    }

    res.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

/**
 * Process charity contribution on successful payment
 */
async function processCharityContribution(userId) {
  const { data: user } = await supabase
    .from('users')
    .select('plan, charity_id, extra_contribution')
    .eq('id', userId)
    .single()

  if (!user?.charity_id) return

  const baseAmount = user.plan === 'yearly' ? 120 : 12
  const charityShare = baseAmount * 0.10 + (user.extra_contribution || 0)

  await supabase.from('charity_contributions').insert({
    user_id: userId,
    charity_id: user.charity_id,
    amount: charityShare,
    contribution_date: new Date().toISOString(),
  })

  // Update charity total
  await supabase.rpc('increment_charity_total', {
    p_charity_id: user.charity_id,
    p_amount: charityShare,
  })
}

module.exports = router
