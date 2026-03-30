import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Flag, Heart, Trophy, User,
  TrendingUp, Plus, Upload, LogOut, Bell, ChevronRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import ScoreManager from '../components/dashboard/ScoreManager'
import DrawHistory from '../components/dashboard/DrawHistory'
import CharityPanel from '../components/dashboard/CharityPanel'
import WinnerUpload from '../components/dashboard/WinnerUpload'

/* ─── Sidebar ─── */
function Sidebar({ active }) {
  const { user, logout } = useAuth()
  const items = [
    { label: 'Overview', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'My Scores', icon: TrendingUp, to: '/dashboard/scores' },
    { label: 'Draws', icon: Trophy, to: '/dashboard/draws' },
    { label: 'My Charity', icon: Heart, to: '/dashboard/charity' },
    { label: 'Winnings', icon: Trophy, to: '/dashboard/winnings' },
    { label: 'Profile', icon: User, to: '/dashboard/profile' },
  ]

  return (
    <div style={{
      width: 240, flexShrink: 0,
      background: 'rgba(10,15,10,0.8)', backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(45,140,45,0.1)',
      display: 'flex', flexDirection: 'column',
      padding: '24px 12px', height: '100vh', position: 'sticky', top: 0,
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', marginBottom: 32, textDecoration: 'none' }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #1a6b1a, #2d8c2d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⛳</div>
        <span style={{ fontFamily: '"Playfair Display"', fontSize: 16, fontWeight: 900, color: '#f7f3ec' }}>Green<span style={{ color: '#2d8c2d' }}>Heart</span></span>
      </Link>

      <div style={{ flex: 1 }}>
        {items.map(({ label, icon: Icon, to }) => (
          <Link key={label} to={to} className={`sidebar-item ${active === to ? 'active' : ''}`}>
            <Icon size={17} /> {label}
          </Link>
        ))}
      </div>

      {/* User card */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(45,140,45,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(45,140,45,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Playfair Display"', fontWeight: 700, color: '#4da64d', fontSize: 14 }}>
            {user?.full_name?.[0] || 'U'}
          </div>
          <div>
            <p style={{ color: '#f7f3ec', fontSize: 13, fontWeight: 600 }}>{user?.full_name}</p>
            <p style={{ color: 'rgba(247,243,236,0.35)', fontSize: 11, fontFamily: '"DM Mono"' }}>{user?.subscription_status}</p>
          </div>
        </div>
        <button onClick={logout} className="sidebar-item" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(247,243,236,0.35)' }}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  )
}

/* ─── Overview ─── */
function Overview() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/dashboard-stats').then(r => setStats(r.data)).catch(() => {
      setStats({
        scores_entered: 3, total_draws: 6, total_winnings: 0,
        charity_contributed: 21.60, current_draw_eligible: true,
        subscription_renewal: '2025-02-12'
      })
    }).finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Scores Entered', value: stats?.scores_entered || 0, suffix: '/ 5', color: '#4da64d', icon: TrendingUp },
    { label: 'Draws Entered', value: stats?.total_draws || 0, suffix: '', color: '#d4a82a', icon: Trophy },
    { label: 'Total Winnings', value: `€${stats?.total_winnings || 0}`, suffix: '', color: '#80c080', icon: Trophy },
    { label: 'Charity Given', value: `€${stats?.charity_contributed?.toFixed(2) || '0.00'}`, suffix: '', color: '#d4a82a', icon: Heart },
  ]

  return (
    <div>
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 className="display-heading" style={{ fontSize: 36, color: '#f7f3ec', marginBottom: 6 }}>
          Good day, <span className="gradient-text-green">{user?.full_name?.split(' ')[0]}</span> 👋
        </h1>
        <p style={{ color: 'rgba(247,243,236,0.45)', fontSize: 16 }}>
          {stats?.current_draw_eligible
            ? "You're entered in this month's draw. Good luck!"
            : "Enter your scores to be eligible for this month's draw."}
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map(({ label, value, suffix, color, icon: Icon }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card p-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <p style={{ color: 'rgba(247,243,236,0.4)', fontSize: 12, fontFamily: '"DM Mono"', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</p>
              <Icon size={16} color={color} />
            </div>
            <p style={{ fontFamily: '"Playfair Display"', fontSize: 32, fontWeight: 900, color }}>
              {value}<span style={{ fontFamily: '"DM Sans"', fontSize: 14, color: 'rgba(247,243,236,0.3)', fontWeight: 400 }}>{suffix}</span>
            </p>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 style={{ color: '#f7f3ec', fontWeight: 600, marginBottom: 16 }}>Subscription Status</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span className={`badge ${user?.subscription_status === 'active' ? 'badge-green' : 'badge-red'}`}>
              ● {user?.subscription_status || 'Inactive'}
            </span>
            <span style={{ color: 'rgba(247,243,236,0.4)', fontSize: 12, fontFamily: '"DM Mono"' }}>
              {user?.plan === 'yearly' ? 'Yearly Plan' : 'Monthly Plan'}
            </span>
          </div>
          {stats?.subscription_renewal && (
            <p style={{ color: 'rgba(247,243,236,0.35)', fontSize: 13 }}>
              Renews: {new Date(stats.subscription_renewal).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h3 style={{ color: '#f7f3ec', fontWeight: 600, marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/dashboard/scores" className="btn-primary" style={{ justifyContent: 'center', padding: '10px 16px', fontSize: 14 }}>
              <Plus size={15} /> Add Score
            </Link>
            <Link to="/dashboard/draws" className="btn-outline" style={{ justifyContent: 'center', padding: '10px 16px', fontSize: 14 }}>
              <Trophy size={15} /> View Draws
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

/* ─── Dashboard Router ─── */
export default function DashboardPage() {
  const location = useLocation()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0f0a' }}>
      <Sidebar active={location.pathname} />

      <main style={{ flex: 1, padding: '40px 40px', overflowY: 'auto', maxWidth: 'calc(100vw - 240px)' }}>
        <Routes>
          <Route index element={<Overview />} />
          <Route path="scores" element={<ScoreManager />} />
          <Route path="draws" element={<DrawHistory />} />
          <Route path="charity" element={<CharityPanel />} />
          <Route path="winnings" element={<WinnerUpload />} />
          <Route path="profile" element={<ProfileSection />} />
        </Routes>
      </main>
    </div>
  )
}

function ProfileSection() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '' })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/users/profile', form)
      updateUser(form)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to save') } finally { setSaving(false) }
  }

  return (
    <div>
      <h2 className="display-heading" style={{ fontSize: 32, color: '#f7f3ec', marginBottom: 32 }}>My Profile</h2>
      <div className="glass-card p-8" style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { label: 'Full Name', key: 'full_name', type: 'text' },
            { label: 'Phone', key: 'phone', type: 'tel' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label style={{ display: 'block', color: 'rgba(247,243,236,0.5)', fontSize: 12, marginBottom: 7, fontFamily: '"DM Mono"', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="input-field" />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', color: 'rgba(247,243,236,0.5)', fontSize: 12, marginBottom: 7, fontFamily: '"DM Mono"', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Email</label>
            <input type="email" value={user?.email || ''} disabled className="input-field" style={{ opacity: 0.5, cursor: 'not-allowed' }} />
          </div>
          <button onClick={save} disabled={saving} className="btn-primary" style={{ justifyContent: 'center' }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
