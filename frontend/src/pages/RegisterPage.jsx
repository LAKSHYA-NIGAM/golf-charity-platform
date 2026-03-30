import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowRight, ArrowLeft, User, Mail, Lock, Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'

const STEPS = ['Account', 'Charity', 'Plan', 'Payment']

function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: i < current ? '#1a6b1a' : i === current ? 'rgba(45,140,45,0.3)' : 'rgba(255,255,255,0.06)',
              border: i === current ? '2px solid #2d8c2d' : '2px solid transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
            }}>
              {i < current ? <Check size={14} color="#f7f3ec" /> : <span style={{ color: i === current ? '#4da64d' : 'rgba(247,243,236,0.3)', fontSize: 13, fontFamily: '"DM Mono"' }}>{i + 1}</span>}
            </div>
            <span style={{ fontSize: 11, fontFamily: '"DM Mono"', textTransform: 'uppercase', letterSpacing: '0.06em', color: i === current ? '#4da64d' : 'rgba(247,243,236,0.25)' }}>{s}</span>
          </div>
          {i < STEPS.length - 1 && <div style={{ width: 40, height: 1, background: i < current ? '#1a6b1a' : 'rgba(247,243,236,0.1)', marginBottom: 20, transition: 'background 0.3s' }} />}
        </React.Fragment>
      ))}
    </div>
  )
}

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [charities, setCharities] = useState([])
  const [form, setForm] = useState({
    full_name: '', email: '', password: '',
    charity_id: '', plan: 'monthly',
    extra_contribution: 0,
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/charities?limit=20').then(r => setCharities(r.data.charities || [])).catch(() => {
      // Fallback charities for demo
      setCharities([
        { id: '1', name: 'St. Vincent de Paul', category: 'Poverty Relief', description: 'Supporting families in need across Ireland.' },
        { id: '2', name: 'Irish Heart Foundation', category: 'Health', description: 'Fighting heart disease and stroke in Ireland.' },
        { id: '3', name: 'Focus Ireland', category: 'Homelessness', description: 'Working to prevent and address homelessness.' },
        { id: '4', name: 'ISPCC Childline', category: 'Child Safety', description: 'Supporting children in distress 24/7.' },
      ])
    })
  }, [])

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleRegister = async () => {
    setLoading(true)
    try {
      const user = await register(form)
      // Redirect to Stripe checkout
      const { data } = await api.post('/subscriptions/create-checkout', { plan: form.plan })
      window.location.href = data.url
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    /* Step 0: Account */
    <motion.div key="account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="display-heading" style={{ fontSize: 32, color: '#f7f3ec', marginBottom: 8, textAlign: 'center' }}>Create your account</h2>
      <p className="serif-italic" style={{ color: 'rgba(247,243,236,0.4)', textAlign: 'center', marginBottom: 32 }}>Start your journey to golfing for good</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {[
          { label: 'Full Name', key: 'full_name', type: 'text', icon: User, placeholder: 'John Murphy' },
          { label: 'Email', key: 'email', type: 'email', icon: Mail, placeholder: 'john@example.com' },
          { label: 'Password', key: 'password', type: 'password', icon: Lock, placeholder: '8+ characters' },
        ].map(({ label, key, type, icon: Icon, placeholder }) => (
          <div key={key}>
            <label style={{ display: 'block', color: 'rgba(247,243,236,0.6)', fontSize: 12, marginBottom: 7, fontFamily: '"DM Mono"', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</label>
            <div style={{ position: 'relative' }}>
              <Icon size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(247,243,236,0.2)' }} />
              <input type={type} required value={form[key]} onChange={e => upd(key, e.target.value)}
                className="input-field" style={{ paddingLeft: 40 }} placeholder={placeholder} />
            </div>
          </div>
        ))}
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 8 }}
          onClick={() => { if (!form.full_name || !form.email || !form.password) { toast.error('Fill all fields'); return } setStep(1) }}>
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>,

    /* Step 1: Charity */
    <motion.div key="charity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="display-heading" style={{ fontSize: 32, color: '#f7f3ec', marginBottom: 8, textAlign: 'center' }}>Choose your charity</h2>
      <p className="serif-italic" style={{ color: 'rgba(247,243,236,0.4)', textAlign: 'center', marginBottom: 32 }}>10% of your subscription goes directly to them</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {charities.map(c => (
          <div key={c.id} onClick={() => upd('charity_id', c.id)}
            style={{
              padding: '16px 20px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
              border: form.charity_id === c.id ? '2px solid #2d8c2d' : '1px solid rgba(45,140,45,0.12)',
              background: form.charity_id === c.id ? 'rgba(45,140,45,0.1)' : 'rgba(255,255,255,0.02)',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
              background: form.charity_id === c.id ? 'rgba(45,140,45,0.3)' : 'rgba(255,255,255,0.06)',
              border: form.charity_id === c.id ? '2px solid #2d8c2d' : '2px solid transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {form.charity_id === c.id ? <Check size={16} color="#4da64d" /> : <Heart size={14} color="rgba(247,243,236,0.2)" />}
            </div>
            <div>
              <p style={{ color: '#f7f3ec', fontWeight: 600, fontSize: 15 }}>{c.name}</p>
              <p style={{ color: 'rgba(247,243,236,0.4)', fontSize: 12, fontFamily: '"DM Mono"' }}>{c.category}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-outline" onClick={() => setStep(0)} style={{ flex: '0 0 auto' }}><ArrowLeft size={16} /></button>
        <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => { if (!form.charity_id) { toast.error('Select a charity'); return } setStep(2) }}>
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>,

    /* Step 2: Plan */
    <motion.div key="plan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="display-heading" style={{ fontSize: 32, color: '#f7f3ec', marginBottom: 8, textAlign: 'center' }}>Choose your plan</h2>
      <p className="serif-italic" style={{ color: 'rgba(247,243,236,0.4)', textAlign: 'center', marginBottom: 32 }}>Flexible billing, cancel anytime</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {[
          { key: 'monthly', label: 'Monthly', price: '€12', period: '/month', perks: ['Flexible', 'Cancel anytime', 'Full access'] },
          { key: 'yearly', label: 'Yearly', price: '€120', period: '/year', save: 'Save €24', perks: ['Best value', '2 months free', 'Priority support'] },
        ].map(p => (
          <div key={p.key} onClick={() => upd('plan', p.key)} style={{
            padding: '24px 18px', borderRadius: 16, cursor: 'pointer', textAlign: 'center',
            border: form.plan === p.key ? '2px solid #d4a82a' : '1px solid rgba(247,243,236,0.08)',
            background: form.plan === p.key ? 'rgba(212,168,42,0.06)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s',
          }}>
            {p.save && <p className="badge badge-gold" style={{ display: 'inline-flex', marginBottom: 12, fontSize: 10 }}>{p.save}</p>}
            <p style={{ color: 'rgba(247,243,236,0.6)', fontSize: 13, marginBottom: 4 }}>{p.label}</p>
            <p style={{ fontFamily: '"Playfair Display"', fontSize: 34, fontWeight: 900, color: form.plan === p.key ? '#d4a82a' : '#f7f3ec' }}>
              {p.price}<span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(247,243,236,0.35)' }}>{p.period}</span>
            </p>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {p.perks.map(pk => <span key={pk} style={{ color: 'rgba(247,243,236,0.5)', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Check size={12} color="#2d8c2d" /> {pk}
              </span>)}
            </div>
          </div>
        ))}
      </div>
      <div>
        <label style={{ display: 'block', color: 'rgba(247,243,236,0.5)', fontSize: 13, marginBottom: 8 }}>
          Extra charity contribution (optional): <span style={{ color: '#d4a82a' }}>€{form.extra_contribution}</span>
        </label>
        <input type="range" min="0" max="50" value={form.extra_contribution}
          onChange={e => upd('extra_contribution', Number(e.target.value))}
          style={{ width: '100%', accentColor: '#2d8c2d', marginBottom: 20 }} />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-outline" onClick={() => setStep(1)} style={{ flex: '0 0 auto' }}><ArrowLeft size={16} /></button>
        <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(3)}>
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>,

    /* Step 3: Confirm */
    <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="display-heading" style={{ fontSize: 32, color: '#f7f3ec', marginBottom: 8, textAlign: 'center' }}>Ready to go!</h2>
      <p className="serif-italic" style={{ color: 'rgba(247,243,236,0.4)', textAlign: 'center', marginBottom: 32 }}>Review your choices before payment</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        {[
          ['Name', form.full_name],
          ['Email', form.email],
          ['Charity', charities.find(c => c.id === form.charity_id)?.name || '—'],
          ['Plan', form.plan === 'yearly' ? 'Yearly — €120/yr' : 'Monthly — €12/mo'],
          ['Extra Donation', form.extra_contribution > 0 ? `€${form.extra_contribution}` : 'None'],
        ].map(([label, value]) => (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '12px 16px', borderRadius: 10,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(45,140,45,0.1)',
          }}>
            <span style={{ color: 'rgba(247,243,236,0.4)', fontSize: 13, fontFamily: '"DM Mono"' }}>{label}</span>
            <span style={{ color: '#f7f3ec', fontSize: 14, fontWeight: 500 }}>{value}</span>
          </div>
        ))}
      </div>
      <p style={{ color: 'rgba(247,243,236,0.3)', fontSize: 12, textAlign: 'center', marginBottom: 20 }}>
        You'll be redirected to Stripe for secure payment. Cancel anytime.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-outline" onClick={() => setStep(2)} style={{ flex: '0 0 auto' }}><ArrowLeft size={16} /></button>
        <button className="btn-gold" style={{ flex: 1, justifyContent: 'center', fontSize: 15 }} onClick={handleRegister} disabled={loading}>
          {loading ? 'Setting up…' : `Subscribe & Pay →`}
        </button>
      </div>
    </motion.div>,
  ]

  return (
    <div className="mesh-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <Link to="/" style={{ position: 'fixed', top: 24, left: 32, fontFamily: '"Playfair Display"', fontSize: 18, fontWeight: 900, color: '#f7f3ec', textDecoration: 'none' }}>
        Green<span style={{ color: '#2d8c2d' }}>Heart</span>
      </Link>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="glass-card p-10" style={{ width: '100%', maxWidth: 500 }}>
        <StepIndicator current={step} />
        <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>
        <p style={{ textAlign: 'center', color: 'rgba(247,243,236,0.3)', fontSize: 13, marginTop: 28 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#4da64d', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
