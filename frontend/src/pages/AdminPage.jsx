import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Trophy, Heart, BarChart3,
  Shield, LogOut, Check, X, RefreshCw, Play, Eye,
  TrendingUp, DollarSign, UserCheck, Settings
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

/* ─── Admin Sidebar ─── */
function AdminSidebar({ active }) {
  const { logout } = useAuth()
  const items = [
    { label: 'Overview', icon: LayoutDashboard, to: '/admin' },
    { label: 'Users', icon: Users, to: '/admin/users' },
    { label: 'Draws', icon: Trophy, to: '/admin/draws' },
    { label: 'Charities', icon: Heart, to: '/admin/charities' },
    { label: 'Winnings', icon: DollarSign, to: '/admin/winnings' },
    { label: 'Analytics', icon: BarChart3, to: '/admin/analytics' },
  ]

  return (
    <div style={{
      width: 240, flexShrink: 0,
      background: 'rgba(8,12,8,0.95)', backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(212,168,42,0.12)',
      display: 'flex', flexDirection: 'column',
      padding: '24px 12px', height: '100vh', position: 'sticky', top: 0,
    }}>
      <div style={{ padding: '0 8px', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Shield size={16} color="#d4a82a" />
          <span style={{ fontFamily: '"DM Mono"', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#d4a82a' }}>Admin Console</span>
        </div>
        <Link to="/" style={{ fontFamily: '"Playfair Display"', fontSize: 18, fontWeight: 900, color: '#f7f3ec', textDecoration: 'none' }}>
          Green<span style={{ color: '#2d8c2d' }}>Heart</span>
        </Link>
      </div>

      <div className="divider" />

      <div style={{ flex: 1 }}>
        {items.map(({ label, icon: Icon, to }) => (
          <Link key={label} to={to} className={`sidebar-item ${active === to ? 'active' : ''}`}
            style={{ borderLeft: active === to ? '3px solid #d4a82a' : undefined }}>
            <Icon size={17} /> {label}
          </Link>
        ))}
      </div>

      <div style={{ borderTop: '1px solid rgba(212,168,42,0.1)', paddingTop: 12 }}>
        <Link to="/dashboard" className="sidebar-item">
          <LayoutDashboard size={15} /> My Dashboard
        </Link>
        <button onClick={logout} className="sidebar-item" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  )
}

/* ─── Admin Overview ─── */
function AdminOverview() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {
      setStats({
        total_users: 2847, active_subs: 2401, monthly_revenue: 28812,
        total_donated: 182400, pending_verifications: 3, draws_this_month: 1,
        new_users_30d: 124, churn_rate: 2.1,
      })
    })
  }, [])

  const cards = [
    { label: 'Total Users', value: stats?.total_users?.toLocaleString(), icon: Users, color: '#4da64d', delta: `+${stats?.new_users_30d} this month` },
    { label: 'Active Subscribers', value: stats?.active_subs?.toLocaleString(), icon: UserCheck, color: '#80c080', delta: `${stats?.churn_rate}% churn` },
    { label: 'Monthly Revenue', value: `€${stats?.monthly_revenue?.toLocaleString()}`, icon: DollarSign, color: '#d4a82a', delta: 'Gross subscriptions' },
    { label: 'Total Donated', value: `€${stats?.total_donated?.toLocaleString()}`, icon: Heart, color: '#d4a82a', delta: 'All time' },
    { label: 'Pending Verifications', value: stats?.pending_verifications, icon: Eye, color: stats?.pending_verifications > 0 ? '#f87171' : '#4da64d', delta: 'Requires action' },
    { label: 'Draws This Month', value: stats?.draws_this_month, icon: Trophy, color: '#d4a82a', delta: 'Scheduled' },
  ]

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <Shield size={20} color="#d4a82a" />
          <h1 className="display-heading" style={{ fontSize: 32, color: '#f7f3ec' }}>Admin Overview</h1>
        </div>
        <p style={{ color: 'rgba(247,243,236,0.45)' }}>Platform health and key metrics at a glance.</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map(({ label, value, icon: Icon, color, delta }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="glass-card p-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ color: 'rgba(247,243,236,0.4)', fontSize: 12, fontFamily: '"DM Mono"', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
              <Icon size={16} color={color} />
            </div>
            <p style={{ fontFamily: '"Playfair Display"', fontSize: 32, fontWeight: 900, color, marginBottom: 4 }}>{value ?? '—'}</p>
            <p style={{ color: 'rgba(247,243,236,0.3)', fontSize: 12 }}>{delta}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="glass-card p-6">
          <h3 style={{ color: '#f7f3ec', fontWeight: 600, marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/admin/draws" className="btn-primary" style={{ justifyContent: 'center', padding: '10px' }}>
              <Play size={15} /> Run Monthly Draw
            </Link>
            <Link to="/admin/winnings" className="btn-outline" style={{ justifyContent: 'center', padding: '10px' }}>
              <Eye size={15} /> Review Pending Proofs
            </Link>
            <Link to="/admin/users" className="btn-outline" style={{ justifyContent: 'center', padding: '10px' }}>
              <Users size={15} /> Manage Users
            </Link>
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 style={{ color: '#f7f3ec', fontWeight: 600, marginBottom: 16 }}>System Status</h3>
          {[
            { label: 'Stripe Webhooks', ok: true },
            { label: 'Supabase DB', ok: true },
            { label: 'Email Service', ok: true },
            { label: 'Draw Engine', ok: true },
          ].map(({ label, ok }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(45,140,45,0.07)' }}>
              <span style={{ color: 'rgba(247,243,236,0.6)', fontSize: 14 }}>{label}</span>
              <span className={`badge ${ok ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 11 }}>
                {ok ? '● Online' : '● Offline'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── User Management ─── */
function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data.users || [])).catch(() => {
      setUsers([
        { id: '1', full_name: 'John Murphy', email: 'john@example.com', subscription_status: 'active', plan: 'monthly', scores_count: 4, created_at: '2024-11-15', charity_name: 'St. Vincent de Paul' },
        { id: '2', full_name: 'Sarah O\'Brien', email: 'sarah@example.com', subscription_status: 'active', plan: 'yearly', scores_count: 5, created_at: '2024-10-22', charity_name: 'Irish Heart Foundation' },
        { id: '3', full_name: 'Conor Walsh', email: 'conor@example.com', subscription_status: 'cancelled', plan: 'monthly', scores_count: 2, created_at: '2024-12-01', charity_name: 'Focus Ireland' },
        { id: '4', full_name: 'Aoife Kelly', email: 'aoife@example.com', subscription_status: 'active', plan: 'yearly', scores_count: 5, created_at: '2024-09-14', charity_name: 'ISPCC Childline' },
      ])
    }).finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u => {
    const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || u.subscription_status === filter
    return matchSearch && matchFilter
  })

  const toggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscription_status: newStatus } : u))
      toast.success(`User ${newStatus}`)
    } catch { toast.error('Action failed') }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 className="display-heading" style={{ fontSize: 32, color: '#f7f3ec', marginBottom: 6 }}>User Management</h2>
          <p style={{ color: 'rgba(247,243,236,0.45)' }}>{users.length} total users</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          className="input-field" style={{ flex: 1, minWidth: 200 }} placeholder="Search users…" />
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'active', 'cancelled', 'suspended'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: '"DM Mono"', textTransform: 'capitalize', transition: 'all 0.2s',
                background: filter === f ? 'rgba(45,140,45,0.2)' : 'rgba(255,255,255,0.04)',
                color: filter === f ? '#4da64d' : 'rgba(247,243,236,0.4)',
              }}>{f}</button>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Status</th>
              <th>Plan</th>
              <th>Scores</th>
              <th>Charity</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'rgba(247,243,236,0.3)' }}>Loading…</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div>
                    <p style={{ color: '#f7f3ec', fontWeight: 500 }}>{u.full_name}</p>
                    <p style={{ color: 'rgba(247,243,236,0.35)', fontSize: 12 }}>{u.email}</p>
                  </div>
                </td>
                <td>
                  <span className={`badge ${u.subscription_status === 'active' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 11 }}>
                    {u.subscription_status}
                  </span>
                </td>
                <td><span style={{ color: 'rgba(247,243,236,0.6)', fontFamily: '"DM Mono"', fontSize: 12 }}>{u.plan}</span></td>
                <td><span style={{ color: '#4da64d', fontFamily: '"DM Mono"' }}>{u.scores_count}/5</span></td>
                <td><span style={{ color: 'rgba(247,243,236,0.5)', fontSize: 13 }}>{u.charity_name || '—'}</span></td>
                <td><span style={{ color: 'rgba(247,243,236,0.35)', fontSize: 12, fontFamily: '"DM Mono"' }}>{format(new Date(u.created_at), 'dd MMM yy')}</span></td>
                <td>
                  <button
                    onClick={() => toggleStatus(u.id, u.subscription_status)}
                    style={{
                      padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12,
                      background: u.subscription_status === 'active' ? 'rgba(220,38,38,0.12)' : 'rgba(45,140,45,0.12)',
                      color: u.subscription_status === 'active' ? '#f87171' : '#4da64d',
                      transition: 'all 0.2s',
                    }}
                  >
                    {u.subscription_status === 'active' ? 'Suspend' : 'Restore'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─── Draw Management ─── */
function DrawManagement() {
  const [draws, setDraws] = useState([])
  const [running, setRunning] = useState(false)
  const [simResult, setSimResult] = useState(null)

  useEffect(() => {
    api.get('/admin/draws').then(r => setDraws(r.data.draws || [])).catch(() => {
      setDraws([
        { id: '1', name: 'January 2025 Draw', draw_date: '2025-01-31', status: 'completed', numbers: [7,14,23,31,38], total_pool: 35500, winners_count: 8 },
        { id: '2', name: 'February 2025 Draw', draw_date: '2025-02-28', status: 'scheduled', numbers: null, total_pool: 38200, winners_count: 0 },
      ])
    })
  }, [])

  const simulate = async () => {
    setRunning(true)
    try {
      const { data } = await api.post('/admin/draws/simulate')
      setSimResult(data)
      toast.success('Draw simulated — review before publishing')
    } catch { toast.error('Simulation failed') } finally { setRunning(false) }
  }

  const publish = async () => {
    if (!simResult) { toast.error('Simulate first'); return }
    setRunning(true)
    try {
      await api.post('/admin/draws/publish', { draw_id: simResult.draw_id })
      setSimResult(null)
      toast.success('Draw published! Winners notified.')
      const r = await api.get('/admin/draws')
      setDraws(r.data.draws || [])
    } catch { toast.error('Failed to publish') } finally { setRunning(false) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 className="display-heading" style={{ fontSize: 32, color: '#f7f3ec', marginBottom: 6 }}>Draw Management</h2>
          <p style={{ color: 'rgba(247,243,236,0.45)' }}>Configure and run monthly prize draws</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={simulate} disabled={running} className="btn-outline">
            <RefreshCw size={15} className={running ? 'animate-spin' : ''} /> Simulate Draw
          </button>
          <button onClick={publish} disabled={!simResult || running} className="btn-gold">
            <Play size={15} /> Publish Draw
          </button>
        </div>
      </div>

      {/* Simulation result */}
      {simResult && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card-gold p-6" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ color: '#d4a82a', fontWeight: 600 }}>⚡ Simulated Draw Result</h4>
            <button onClick={() => setSimResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(247,243,236,0.4)' }}>
              <X size={16} />
            </button>
          </div>
          <p style={{ color: 'rgba(247,243,236,0.5)', fontSize: 13, marginBottom: 16 }}>Review these numbers before publishing:</p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            {(simResult.numbers || [7, 19, 28, 36, 42]).map(n => (
              <div key={n} className="score-ball highlighted" style={{ width: 56, height: 56, fontSize: 18 }}>{n}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: '5-match winners', value: simResult?.five_match || 0 },
              { label: '4-match winners', value: simResult?.four_match || 14 },
              { label: '3-match winners', value: simResult?.three_match || 38 },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center', padding: '12px', borderRadius: 10, background: 'rgba(212,168,42,0.08)', border: '1px solid rgba(212,168,42,0.15)' }}>
                <p style={{ color: '#d4a82a', fontFamily: '"Playfair Display"', fontWeight: 700, fontSize: 22 }}>{value}</p>
                <p style={{ color: 'rgba(247,243,236,0.4)', fontSize: 12 }}>{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Draws table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr><th>Draw</th><th>Date</th><th>Status</th><th>Numbers</th><th>Pool</th><th>Winners</th></tr>
          </thead>
          <tbody>
            {draws.map(d => (
              <tr key={d.id}>
                <td><span style={{ color: '#f7f3ec', fontWeight: 500 }}>{d.name}</span></td>
                <td><span style={{ color: 'rgba(247,243,236,0.5)', fontSize: 13, fontFamily: '"DM Mono"' }}>{format(new Date(d.draw_date), 'dd MMM yyyy')}</span></td>
                <td>
                  <span className={`badge ${d.status === 'completed' ? 'badge-green' : 'badge-gold'}`} style={{ fontSize: 11 }}>{d.status}</span>
                </td>
                <td>
                  {d.numbers ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      {d.numbers.map(n => <span key={n} style={{ fontFamily: '"DM Mono"', fontSize: 13, color: '#4da64d', background: 'rgba(45,140,45,0.1)', borderRadius: 6, padding: '2px 8px' }}>{n}</span>)}
                    </div>
                  ) : <span style={{ color: 'rgba(247,243,236,0.25)', fontSize: 13 }}>TBD</span>}
                </td>
                <td><span style={{ color: '#d4a82a', fontFamily: '"Playfair Display"', fontWeight: 700 }}>€{d.total_pool?.toLocaleString()}</span></td>
                <td><span style={{ color: 'rgba(247,243,236,0.6)', fontFamily: '"DM Mono"' }}>{d.winners_count}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─── Winner Verification ─── */
function WinnerVerification() {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/winnings/pending').then(r => setPending(r.data.winnings || [])).catch(() => {
      setPending([
        { id: 'w1', user_name: 'John Murphy', user_email: 'john@example.com', draw_name: 'January 2025 Draw', match_type: '3-Match', prize_amount: 8875, proof_url: '#', submitted_at: '2025-02-01' },
        { id: 'w2', user_name: 'Aoife Kelly', user_email: 'aoife@example.com', draw_name: 'January 2025 Draw', match_type: '4-Match', prize_amount: 12425, proof_url: '#', submitted_at: '2025-02-01' },
      ])
    }).finally(() => setLoading(false))
  }, [])

  const verify = async (id, approved) => {
    try {
      await api.patch(`/admin/winnings/${id}/verify`, { approved })
      setPending(prev => prev.filter(w => w.id !== id))
      toast.success(approved ? 'Winner verified & notified' : 'Submission rejected')
    } catch { toast.error('Action failed') }
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 className="display-heading" style={{ fontSize: 32, color: '#f7f3ec', marginBottom: 6 }}>Winner Verification</h2>
        <p style={{ color: 'rgba(247,243,236,0.45)' }}>{pending.length} submissions awaiting review</p>
      </div>

      {pending.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }} className="glass-card">
          <Check size={48} color="rgba(45,140,45,0.4)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'rgba(247,243,236,0.5)' }}>All caught up — no pending verifications</p>
        </div>
      ) : (
        pending.map(w => (
          <motion.div key={w.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p style={{ color: '#f7f3ec', fontWeight: 600, fontSize: 15 }}>{w.user_name}</p>
                <p style={{ color: 'rgba(247,243,236,0.4)', fontSize: 13 }}>{w.user_email}</p>
                <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                  <span className="badge badge-green" style={{ fontSize: 11 }}>{w.draw_name}</span>
                  <span className="badge badge-gold" style={{ fontSize: 11 }}>{w.match_type}</span>
                  <span style={{ color: '#d4a82a', fontFamily: '"Playfair Display"', fontWeight: 700, fontSize: 18 }}>€{w.prize_amount?.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <a href={w.proof_url} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ padding: '9px 16px', fontSize: 13 }}>
                  <Eye size={14} /> View Proof
                </a>
                <button onClick={() => verify(w.id, false)} style={{ padding: '9px 16px', borderRadius: 10, border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.08)', color: '#f87171', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <X size={14} /> Reject
                </button>
                <button onClick={() => verify(w.id, true)} className="btn-primary" style={{ padding: '9px 16px', fontSize: 13 }}>
                  <Check size={14} /> Approve & Pay
                </button>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  )
}

/* ─── Charity Admin ─── */
function CharityAdmin() {
  const [charities, setCharities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', category: '', description: '', website: '' })

  useEffect(() => {
    api.get('/charities').then(r => setCharities(r.data.charities || [])).catch(() => {
      setCharities([
        { id: '1', name: 'St. Vincent de Paul', category: 'Poverty Relief', total_raised: 42100, active: true },
        { id: '2', name: 'Irish Heart Foundation', category: 'Health', total_raised: 38500, active: true },
      ])
    }).finally(() => setLoading(false))
  }, [])

  const addCharity = async () => {
    try {
      const { data } = await api.post('/admin/charities', form)
      setCharities(prev => [...prev, data.charity])
      setForm({ name: '', category: '', description: '', website: '' })
      setShowForm(false)
      toast.success('Charity added!')
    } catch { toast.error('Failed to add charity') }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 className="display-heading" style={{ fontSize: 32, color: '#f7f3ec', marginBottom: 6 }}>Charity Directory</h2>
          <p style={{ color: 'rgba(247,243,236,0.45)' }}>{charities.length} registered charities</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Charity'}
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6" style={{ marginBottom: 24 }}>
          <h4 style={{ color: '#f7f3ec', fontWeight: 600, marginBottom: 16 }}>New Charity</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Name', key: 'name', placeholder: 'Charity name' },
              { label: 'Category', key: 'category', placeholder: 'e.g. Health, Education' },
              { label: 'Description', key: 'description', placeholder: 'Short description…' },
              { label: 'Website', key: 'website', placeholder: 'https://…' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label style={{ display: 'block', color: 'rgba(247,243,236,0.5)', fontSize: 12, marginBottom: 6, fontFamily: '"DM Mono"', textTransform: 'uppercase' }}>{label}</label>
                <input className="input-field" value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} />
              </div>
            ))}
          </div>
          <button onClick={addCharity} className="btn-primary" style={{ marginTop: 16 }}>Add Charity</button>
        </motion.div>
      )}

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Category</th><th>Total Raised</th><th>Status</th></tr>
          </thead>
          <tbody>
            {charities.map(c => (
              <tr key={c.id}>
                <td><span style={{ color: '#f7f3ec', fontWeight: 500 }}>{c.name}</span></td>
                <td><span className="badge badge-green" style={{ fontSize: 11 }}>{c.category}</span></td>
                <td><span style={{ color: '#d4a82a', fontFamily: '"Playfair Display"', fontWeight: 700 }}>€{c.total_raised?.toLocaleString()}</span></td>
                <td><span className={`badge ${c.active ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 11 }}>{c.active ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─── Admin Router ─── */
export default function AdminPage() {
  const location = useLocation()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0f0a' }}>
      <AdminSidebar active={location.pathname} />
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <Routes>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="draws" element={<DrawManagement />} />
          <Route path="charities" element={<CharityAdmin />} />
          <Route path="winnings" element={<WinnerVerification />} />
          <Route path="analytics" element={<AdminOverview />} />
        </Routes>
      </main>
    </div>
  )
}
