import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Calendar, TrendingUp, Info } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

function ScoreRow({ score, onDelete, index }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/scores/${score.id}`)
      onDelete(score.id)
      toast.success('Score removed')
    } catch { toast.error('Failed to delete') } finally { setDeleting(false) }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '16px 20px', borderRadius: 12,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(45,140,45,0.1)',
        marginBottom: 10,
      }}
    >
      <div className="score-ball">{score.score}</div>
      <div style={{ flex: 1 }}>
        <p style={{ color: '#f7f3ec', fontWeight: 500, fontSize: 15 }}>{score.course_name || 'Golf Course'}</p>
        <p style={{ color: 'rgba(247,243,236,0.35)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
          <Calendar size={12} />
          {format(new Date(score.played_at), 'dd MMM yyyy')}
        </p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ color: 'rgba(247,243,236,0.35)', fontSize: 11, fontFamily: '"DM Mono"', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Stableford</p>
        <p className="gradient-text-green" style={{ fontFamily: '"Playfair Display"', fontWeight: 700, fontSize: 20 }}>{score.score}</p>
      </div>
      <button onClick={handleDelete} disabled={deleting} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'rgba(247,243,236,0.2)', padding: 8, borderRadius: 8,
        transition: 'all 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(247,243,236,0.2)'}
      >
        <Trash2 size={15} />
      </button>
    </motion.div>
  )
}

function AddScoreModal({ onClose, onAdd }) {
  const [score, setScore] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [course, setCourse] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    const s = Number(score)
    if (!s || s < 1 || s > 45) { toast.error('Score must be 1–45'); return }
    setSaving(true)
    try {
      const { data } = await api.post('/scores', { score: s, played_at: date, course_name: course || undefined })
      onAdd(data.score)
      onClose()
      toast.success('Score added!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add score') }
    finally { setSaving(false) }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="glass-card p-8"
        style={{ width: '100%', maxWidth: 420 }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="display-heading" style={{ fontSize: 26, color: '#f7f3ec', marginBottom: 24 }}>Add Golf Score</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', color: 'rgba(247,243,236,0.5)', fontSize: 12, marginBottom: 8, fontFamily: '"DM Mono"', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Stableford Score (1–45)
            </label>
            <input
              type="number" min="1" max="45" value={score}
              onChange={e => setScore(e.target.value)}
              className="input-field"
              placeholder="e.g. 28"
              style={{ textAlign: 'center', fontSize: 28, fontFamily: '"Playfair Display"', fontWeight: 700 }}
            />
            {/* Score range visual */}
            <div style={{ marginTop: 10, position: 'relative' }}>
              <input type="range" min="1" max="45" value={score || 1} onChange={e => setScore(e.target.value)}
                style={{ width: '100%', accentColor: '#2d8c2d' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ color: 'rgba(247,243,236,0.25)', fontSize: 11, fontFamily: '"DM Mono"' }}>1</span>
                <span style={{ color: 'rgba(247,243,236,0.25)', fontSize: 11, fontFamily: '"DM Mono"' }}>45</span>
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: 'rgba(247,243,236,0.5)', fontSize: 12, marginBottom: 8, fontFamily: '"DM Mono"', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Date Played
            </label>
            <input type="date" value={date} max={format(new Date(), 'yyyy-MM-dd')}
              onChange={e => setDate(e.target.value)} className="input-field" />
          </div>

          <div>
            <label style={{ display: 'block', color: 'rgba(247,243,236,0.5)', fontSize: 12, marginBottom: 8, fontFamily: '"DM Mono"', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Course Name (optional)
            </label>
            <input type="text" value={course} onChange={e => setCourse(e.target.value)}
              className="input-field" placeholder="e.g. Portmarnock Golf Club" />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={onClose} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button onClick={submit} disabled={saving} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              {saving ? 'Saving…' : 'Add Score'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function ScoreManager() {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    api.get('/scores').then(r => setScores(r.data.scores || [])).catch(() => {
      // Demo data
      setScores([
        { id: '1', score: 32, course_name: 'Portmarnock Golf Club', played_at: '2025-01-15' },
        { id: '2', score: 27, course_name: 'Royal Dublin Golf Club', played_at: '2025-01-08' },
        { id: '3', score: 35, course_name: 'Mount Juliet Estate', played_at: '2024-12-28' },
      ])
    }).finally(() => setLoading(false))
  }, [])

  const handleAdd = (newScore) => {
    setScores(prev => {
      const updated = [newScore, ...prev]
      return updated.slice(0, 5) // Keep only latest 5
    })
  }

  const handleDelete = (id) => setScores(prev => prev.filter(s => s.id !== id))

  const avgScore = scores.length ? Math.round(scores.reduce((s, r) => s + r.score, 0) / scores.length) : 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h2 className="display-heading" style={{ fontSize: 32, color: '#f7f3ec', marginBottom: 6 }}>My Scores</h2>
          <p style={{ color: 'rgba(247,243,236,0.45)', fontSize: 15 }}>
            Track your last 5 Stableford scores. Used in monthly draws.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary" disabled={scores.length >= 5 && false}>
          <Plus size={16} /> Add Score
        </button>
      </div>

      {/* Score summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Scores on file', value: `${scores.length} / 5`, color: '#4da64d' },
          { label: 'Average score', value: avgScore || '—', color: '#d4a82a' },
          { label: 'Draw eligibility', value: scores.length >= 1 ? '✓ Eligible' : '✗ Enter scores', color: scores.length >= 1 ? '#4da64d' : '#dc2626' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-5">
            <p style={{ color: 'rgba(247,243,236,0.4)', fontSize: 11, fontFamily: '"DM Mono"', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</p>
            <p style={{ color, fontFamily: '"Playfair Display"', fontWeight: 700, fontSize: 24 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Info banner */}
      <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(45,140,45,0.06)', border: '1px solid rgba(45,140,45,0.15)', display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 24 }}>
        <Info size={16} color="#4da64d" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ color: 'rgba(247,243,236,0.5)', fontSize: 13, lineHeight: 1.6 }}>
          You can store up to 5 Stableford scores (range: 1–45). Adding a 6th score automatically removes the oldest.
          Scores are used to determine your draw numbers in monthly prize draws.
        </p>
      </div>

      {/* Score list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => <div key={i} className="shimmer" style={{ height: 72, borderRadius: 12 }} />)}
        </div>
      ) : scores.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <TrendingUp size={48} color="rgba(45,140,45,0.3)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: 'rgba(247,243,236,0.5)', fontWeight: 500, marginBottom: 8 }}>No scores yet</h3>
          <p style={{ color: 'rgba(247,243,236,0.3)', fontSize: 14, marginBottom: 24 }}>Add your first Stableford score to enter monthly draws</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={16} /> Add First Score
          </button>
        </div>
      ) : (
        <AnimatePresence>
          {scores.map((s, i) => (
            <ScoreRow key={s.id} score={s} onDelete={handleDelete} index={i} />
          ))}
        </AnimatePresence>
      )}

      <AnimatePresence>
        {showModal && <AddScoreModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
      </AnimatePresence>
    </div>
  )
}
