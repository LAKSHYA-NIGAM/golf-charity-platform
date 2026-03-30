import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success(`Welcome back, ${user.full_name?.split(' ')[0]}!`)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mesh-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      {/* Back link */}
      <Link to="/" style={{ position: 'fixed', top: 24, left: 32, display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(247,243,236,0.4)', fontSize: 14, textDecoration: 'none' }}>
        ← <span style={{ fontFamily: '"Playfair Display"', fontWeight: 700, color: '#f7f3ec', fontSize: 16 }}>Green<span style={{ color: '#2d8c2d' }}>Heart</span></span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-10"
        style={{ width: '100%', maxWidth: 440 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 className="display-heading" style={{ fontSize: 36, color: '#f7f3ec', marginBottom: 8 }}>Welcome back</h1>
          <p className="serif-italic" style={{ color: 'rgba(247,243,236,0.45)', fontSize: 16 }}>Sign in to your GreenHeart account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', color: 'rgba(247,243,236,0.6)', fontSize: 13, marginBottom: 8, fontFamily: '"DM Mono"', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(247,243,236,0.25)' }} />
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: 42 }}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: 'rgba(247,243,236,0.6)', fontSize: 13, marginBottom: 8, fontFamily: '"DM Mono"', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(247,243,236,0.25)' }} />
              <input
                type={showPw ? 'text' : 'password'} required value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: 42, paddingRight: 44 }}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPw(v => !v)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(247,243,236,0.3)', padding: 4
              }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <Link to="/forgot-password" style={{ color: 'rgba(247,243,236,0.35)', fontSize: 13, textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '15px', fontSize: 15 }}>
            {loading ? 'Signing in…' : <>Sign In <ArrowRight size={16} /></>}
          </button>
        </form>

        <div className="divider" style={{ margin: '28px 0' }} />

        <p style={{ textAlign: 'center', color: 'rgba(247,243,236,0.4)', fontSize: 14 }}>
          New to GreenHeart?{' '}
          <Link to="/register" style={{ color: '#4da64d', textDecoration: 'none', fontWeight: 600 }}>
            Create an account
          </Link>
        </p>

        {/* Demo credentials */}
        <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 10, background: 'rgba(45,140,45,0.06)', border: '1px solid rgba(45,140,45,0.12)' }}>
          <p style={{ color: 'rgba(247,243,236,0.35)', fontSize: 12, fontFamily: '"DM Mono"', textAlign: 'center' }}>
            DEMO: admin@greenheart.io / admin123
          </p>
        </div>
      </motion.div>
    </div>
  )
}
