import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../../utils/api'
import { format } from 'date-fns'

function DrawCard({ draw, userEntry }) {
  const [expanded, setExpanded] = useState(false)
  const matchCount = userEntry?.matched_count || 0

  const matchBadge = matchCount >= 5 ? 'badge-gold' :
    matchCount >= 3 ? 'badge-green' : 'badge-red'
  const matchLabel = matchCount >= 5 ? `🏆 5-Match JACKPOT!` :
    matchCount >= 4 ? `⭐ 4-Match Win!` :
    matchCount >= 3 ? `✓ 3-Match Win!` :
    matchCount > 0 ? `${matchCount} matched` : 'No match'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{ overflow: 'hidden', marginBottom: 16 }}
    >
      <div
        style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}
        onClick={() => setExpanded(e => !e)}
      >
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(45,140,45,0.1)', border: '1px solid rgba(45,140,45,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Trophy size={20} color="#4da64d" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#f7f3ec', fontWeight: 600, fontSize: 15, marginBottom: 3 }}>
            {draw.name || `Monthly Draw — ${format(new Date(draw.draw_date), 'MMMM yyyy')}`}
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ color: 'rgba(247,243,236,0.4)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Calendar size={12} /> {format(new Date(draw.draw_date), 'dd MMM yyyy')}
            </span>
            <span className={`badge ${matchBadge}`} style={{ fontSize: 11 }}>{matchLabel}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: '#d4a82a', fontFamily: '"Playfair Display"', fontWeight: 700, fontSize: 22 }}>
            €{draw.total_pool?.toLocaleString() || '0'}
          </p>
          <p style={{ color: 'rgba(247,243,236,0.3)', fontSize: 11, fontFamily: '"DM Mono"' }}>TOTAL POOL</p>
        </div>
        {expanded ? <ChevronUp size={18} color="rgba(247,243,236,0.3)" /> : <ChevronDown size={18} color="rgba(247,243,236,0.3)" />}
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          style={{ padding: '0 24px 24px', borderTop: '1px solid rgba(45,140,45,0.1)' }}
        >
          <div style={{ paddingTop: 20 }}>
            <p style={{ color: 'rgba(247,243,236,0.4)', fontSize: 12, fontFamily: '"DM Mono"', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
              Drawn Numbers
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              {draw.numbers?.map(n => (
                <div key={n} className="score-ball" style={{
                  borderColor: userEntry?.numbers?.includes(n) ? 'rgba(212,168,42,0.8)' : undefined,
                  background: userEntry?.numbers?.includes(n) ? 'rgba(212,168,42,0.15)' : undefined,
                  color: userEntry?.numbers?.includes(n) ? '#e4c83a' : undefined,
                }}>{n}</div>
              ))}
            </div>

            {userEntry && (
              <>
                <p style={{ color: 'rgba(247,243,236,0.4)', fontSize: 12, fontFamily: '"DM Mono"', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
                  Your Numbers
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                  {userEntry.numbers?.map(n => (
                    <div key={n} className="score-ball" style={{ width: 48, height: 48, fontSize: 15 }}>{n}</div>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { label: '5-Match (40%)', value: `€${((draw.total_pool || 0) * 0.4).toLocaleString()}`, highlight: matchCount >= 5 },
                { label: '4-Match (35%)', value: `€${((draw.total_pool || 0) * 0.35).toLocaleString()}`, highlight: matchCount === 4 },
                { label: '3-Match (25%)', value: `€${((draw.total_pool || 0) * 0.25).toLocaleString()}`, highlight: matchCount === 3 },
              ].map(({ label, value, highlight }) => (
                <div key={label} style={{
                  padding: '12px 14px', borderRadius: 10, textAlign: 'center',
                  background: highlight ? 'rgba(212,168,42,0.1)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${highlight ? 'rgba(212,168,42,0.3)' : 'rgba(45,140,45,0.1)'}`,
                }}>
                  <p style={{ color: 'rgba(247,243,236,0.4)', fontSize: 11, fontFamily: '"DM Mono"', marginBottom: 4 }}>{label}</p>
                  <p style={{ color: highlight ? '#d4a82a' : '#f7f3ec', fontFamily: '"Playfair Display"', fontWeight: 700, fontSize: 18 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function DrawHistory() {
  const [draws, setDraws] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/draws/my-history').then(r => setDraws(r.data.draws || [])).catch(() => {
      setDraws([
        {
          id: '1', draw_date: '2025-01-31', name: 'January 2025 Draw',
          numbers: [7, 14, 23, 31, 38], total_pool: 35500,
          userEntry: { numbers: [14, 23, 31, 19, 42], matched_count: 3 }
        },
        {
          id: '2', draw_date: '2024-12-31', name: 'December 2024 Draw',
          numbers: [3, 11, 22, 29, 40], total_pool: 28000,
          userEntry: { numbers: [7, 15, 22, 33, 41], matched_count: 1 }
        },
      ])
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 className="display-heading" style={{ fontSize: 32, color: '#f7f3ec', marginBottom: 6 }}>Draw History</h2>
        <p style={{ color: 'rgba(247,243,236,0.45)', fontSize: 15 }}>Your participation in monthly prize draws</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1,2].map(i => <div key={i} className="shimmer" style={{ height: 84, borderRadius: 16 }} />)}
        </div>
      ) : draws.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }} className="glass-card">
          <Trophy size={48} color="rgba(45,140,45,0.3)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'rgba(247,243,236,0.5)' }}>No draws yet — add your scores to enter!</p>
        </div>
      ) : (
        draws.map(draw => (
          <DrawCard key={draw.id} draw={draw} userEntry={draw.userEntry} />
        ))
      )}
    </div>
  )
}
