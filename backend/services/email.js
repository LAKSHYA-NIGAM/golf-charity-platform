/**
 * GreenHeart Email Service — powered by Resend
 * https://resend.com · npm install resend
 *
 * Set RESEND_API_KEY in .env to enable real sending.
 * Falls back to console.log when key is absent (dev mode).
 */

let Resend
try { Resend = require('resend').Resend } catch { Resend = null }

const resend = (Resend && process.env.RESEND_API_KEY)
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM  = process.env.EMAIL_FROM  || 'GreenHeart <noreply@greenheart.io>'
const SITE  = process.env.FRONTEND_URL || 'http://localhost:3000'

/* ── Core sender with dev fallback ─────────────────────────────────── */
async function sendEmail({ to, subject, html }) {
  if (!resend) {
    console.log('\n📧  [DEV — Resend not configured, logging email]')
    console.log(`    To:      ${to}`)
    console.log(`    Subject: ${subject}`)
    console.log('    (Add RESEND_API_KEY to .env to send real emails)\n')
    return { id: 'dev-mode' }
  }
  const { data, error } = await resend.emails.send({ from: FROM, to, subject, html })
  if (error) throw new Error(`Resend: ${JSON.stringify(error)}`)
  return data
}

/* ── HTML primitives ─────────────────────────────────────────────────── */
const H1 = (t) =>
  `<h1 style="margin:0 0 16px;font-size:28px;font-weight:900;color:#f7f3ec;line-height:1.2;font-family:Georgia,serif;">${t}</h1>`

const P = (t) =>
  `<p style="margin:0 0 12px;color:rgba(247,243,236,0.6);font-size:14px;line-height:1.8;font-family:Arial,sans-serif;">${t}</p>`

const BTN = (url, label) =>
  `<a href="${url}" style="display:inline-block;margin-top:20px;background:linear-gradient(135deg,#1a6b1a,#2d8c2d);color:#f7f3ec;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600;font-family:Arial,sans-serif;font-size:15px;">${label} →</a>`

const HR = () =>
  `<hr style="border:none;border-top:1px solid rgba(45,140,45,0.15);margin:24px 0;" />`

const STAT_BOX = (label, value, accent = '#d4a82a') =>
  `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:rgba(212,168,42,0.06);border:1px solid rgba(212,168,42,0.18);border-radius:12px;"><tr><td style="padding:24px;text-align:center;">
    <p style="margin:0 0 4px;color:rgba(247,243,236,0.45);font-size:12px;text-transform:uppercase;letter-spacing:.08em;font-family:Arial,sans-serif;">${label}</p>
    <p style="margin:0;font-size:48px;font-weight:900;color:${accent};font-family:Georgia,serif;">${value}</p>
  </td></tr></table>`

/* ── Email shell ─────────────────────────────────────────────────────── */
function shell(body) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#0a0f0a;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f0a;padding:48px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
      <tr><td style="padding-bottom:28px;">
        <span style="font-size:24px;font-weight:900;color:#f7f3ec;font-family:Georgia,serif;">Green<span style="color:#2d8c2d;">Heart</span> ⛳</span>
      </td></tr>
      <tr><td style="background:#0f1a0f;border:1px solid rgba(45,140,45,0.18);border-radius:16px;padding:36px 32px;">
        ${body}
      </td></tr>
      <tr><td style="padding:24px 0 0;text-align:center;color:rgba(247,243,236,0.2);font-size:12px;font-family:Arial,sans-serif;">
        <p style="margin:0;">© 2025 GreenHeart · <a href="${SITE}/unsubscribe" style="color:rgba(247,243,236,0.2);">Unsubscribe</a> · <a href="${SITE}/privacy" style="color:rgba(247,243,236,0.2);">Privacy</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`
}

/* ── Exported email functions ────────────────────────────────────────── */

async function sendWelcomeEmail(email, name) {
  const first = name.split(' ')[0]
  return sendEmail({
    to: email,
    subject: 'Welcome to GreenHeart — Golf for Good ⛳',
    html: shell(`
      ${H1(`Welcome, ${first}! 🌿`)}
      ${P('You\'ve joined a community of golfers who believe sport can change the world.')}
      ${HR()}
      ${P('<strong style="color:#f7f3ec;">Here\'s what to do next:</strong>')}
      <ol style="color:rgba(247,243,236,0.6);font-family:Arial,sans-serif;font-size:14px;line-height:2.2;padding-left:20px;margin:12px 0;">
        <li>Complete your subscription payment to go active</li>
        <li>Add up to 5 Stableford scores (range: 1–45)</li>
        <li>Watch 10%+ of your subscription go to your chosen charity</li>
        <li>Enter this month's prize draw automatically</li>
      </ol>
      ${BTN(`${SITE}/dashboard`, 'Open My Dashboard')}
    `),
  })
}

async function sendWinnerEmail(email, name, matchCount, prizeAmount) {
  const first = name.split(' ')[0]
  const fmt = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(prizeAmount)
  return sendEmail({
    to: email,
    subject: `🏆 You won ${fmt} in this month's GreenHeart draw!`,
    html: shell(`
      ${H1(`🏆 You won, ${first}!`)}
      ${P(`This month's draw is in — and you matched <strong style="color:#d4a82a;">${matchCount} numbers</strong>!`)}
      ${STAT_BOX('Your Prize', fmt, '#d4a82a')}
      ${P('To claim your prize, upload proof of your score card in your dashboard. Our team reviews within 48 hours and processes payouts within 3–5 business days.')}
      ${BTN(`${SITE}/dashboard/winnings`, 'Upload Proof & Claim')}
    `),
  })
}

async function sendDrawResultEmail(email, name, drawName, numbers) {
  const first = name.split(' ')[0]
  const balls = numbers
    .map(n =>
      `<span style="display:inline-block;width:44px;height:44px;line-height:44px;text-align:center;border-radius:50%;` +
      `background:rgba(45,140,45,0.12);border:2px solid rgba(45,140,45,0.3);` +
      `font-family:monospace;font-size:16px;color:#80c080;margin:4px;">${n}</span>`
    ).join('')
  return sendEmail({
    to: email,
    subject: `${drawName} — Draw Results`,
    html: shell(`
      ${H1(`${drawName} — Results Are In`)}
      ${P(`Hi ${first}, the numbers have been drawn:`)}
      <div style="text-align:center;padding:16px 0;">${balls}</div>
      ${P('Log in to see how many you matched this month!')}
      ${BTN(`${SITE}/dashboard/draws`, 'View My Results')}
    `),
  })
}

async function sendPaymentConfirmationEmail(email, name, amount, plan) {
  const first = name.split(' ')[0]
  const fmt = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount)
  return sendEmail({
    to: email,
    subject: 'GreenHeart — Payment Confirmed ✓',
    html: shell(`
      ${H1('✓ Payment Confirmed')}
      ${P(`Hi ${first}, your <strong>${plan}</strong> subscription of <strong style="color:#4da64d;">${fmt}</strong> has been processed.`)}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:rgba(45,140,45,0.06);border:1px solid rgba(45,140,45,0.15);border-radius:10px;">
        <tr>
          <td style="padding:14px 18px;color:rgba(247,243,236,0.5);font-size:13px;font-family:Arial,sans-serif;">Subscription</td>
          <td style="padding:14px 18px;text-align:right;color:#f7f3ec;font-family:Arial,sans-serif;font-weight:600;">${plan.charAt(0).toUpperCase() + plan.slice(1)} · ${fmt}</td>
        </tr>
        <tr style="border-top:1px solid rgba(45,140,45,0.1);">
          <td style="padding:14px 18px;color:rgba(247,243,236,0.5);font-size:13px;font-family:Arial,sans-serif;">Charity share</td>
          <td style="padding:14px 18px;text-align:right;color:#d4a82a;font-family:Arial,sans-serif;font-weight:600;">10%+ of payment ✓</td>
        </tr>
      </table>
      ${BTN(`${SITE}/dashboard`, 'Go to Dashboard')}
    `),
  })
}

async function sendCancellationEmail(email, name) {
  const first = name.split(' ')[0]
  return sendEmail({
    to: email,
    subject: 'GreenHeart — Subscription Cancelled',
    html: shell(`
      ${H1(`We'll miss you, ${first}`)}
      ${P('Your GreenHeart subscription has been cancelled. You\'ll retain full access until the end of your current billing period.')}
      ${HR()}
      ${P('If you cancelled by mistake, or ever want to come back, you\'re always welcome.')}
      ${BTN(`${SITE}/pricing`, 'Resubscribe Anytime')}
    `),
  })
}

module.exports = {
  sendWelcomeEmail,
  sendWinnerEmail,
  sendDrawResultEmail,
  sendPaymentConfirmationEmail,
  sendCancellationEmail,
}
