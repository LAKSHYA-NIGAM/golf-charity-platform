// PricingPage.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const FEATURES = [
  'Monthly prize draw entry',
  'Score management (up to 5 Stableford)',
  '10%+ to your chosen charity',
  'Winner verification & payouts',
  'Charity directory access',
  'Draw history & results',
  'Email notifications',
  'Community leaderboard',
]

export default function PricingPage() {
  return (
    <div className="mesh-bg" style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: 120, maxWidth: 900, margin: '0 auto', padding: '120px 32px 80px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 60 }}>
          <h1 className="display-heading" style={{ fontSize: 'clamp(40px, 6vw, 64px)', color: '#f7f3ec', marginBottom: 12 }}>
            Simple, <span className="gradient-text-green">transparent</span> pricing.
          </h1>
          <p className="serif-italic" style={{ color: 'rgba(247,243,236,0.5)', fontSize: 18 }}>No hidden fees. Cancel anytime. Real charitable impact.</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 720, margin: '0 auto 60px' }}>
          {[
            { plan: 'Monthly', price: 12, period: 'month', highlight: false, cta: 'Start Monthly' },
            { plan: 'Yearly', price: 120, period: 'year', highlight: true, save: '€24 / year', cta: 'Start Yearly — Best Value' },
          ].map(p => (
            <motion.div key={p.plan} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={p.highlight ? 'glass-card-gold' : 'glass-card'}
              style={{ padding: '36px 28px', textAlign: 'center', position: 'relative' }}>
              {p.highlight && (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)' }}>
                  <span className="badge badge-gold" style={{ fontSize: 11 }}>BEST VALUE</span>
                </div>
              )}
              <p style={{ color: 'rgba(247,243,236,0.5)', fontSize: 14, marginBottom: 8 }}>{p.plan}</p>
              <p style={{ fontFamily: '"Playfair Display"', fontSize: 52, fontWeight: 900, color: p.highlight ? '#d4a82a' : '#f7f3ec', lineHeight: 1 }}>
                €{p.price}
              </p>
              <p style={{ color: 'rgba(247,243,236,0.35)', fontSize: 14, marginBottom: 8 }}>per {p.period}</p>
              {p.save && <p style={{ color: '#4da64d', fontSize: 13, marginBottom: 24 }}>Save {p.save}</p>}
              <div style={{ marginBottom: 28, textAlign: 'left' }}>
                {FEATURES.map(f => (
                  <p key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(247,243,236,0.65)', fontSize: 14, marginBottom: 10 }}>
                    <Check size={14} color="#2d8c2d" /> {f}
                  </p>
                ))}
              </div>
              <Link to={`/register?plan=${p.plan.toLowerCase()}`}
                className={p.highlight ? 'btn-gold' : 'btn-primary'}
                style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
                {p.cta} <ArrowRight size={16} />
              </Link>
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: 'center', padding: '40px', borderRadius: 16, background: 'rgba(45,140,45,0.05)', border: '1px solid rgba(45,140,45,0.12)' }}>
          <p style={{ color: 'rgba(247,243,236,0.5)', fontSize: 14, lineHeight: 1.8 }}>
            ✓ Secure Stripe payments · ✓ Cancel anytime · ✓ Instant access · ✓ Minimum 10% to charity · ✓ Monthly draw entries
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
