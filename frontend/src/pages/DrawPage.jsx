// DrawPage.jsx
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Calendar, Users } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import api from '../utils/api'
import { format } from 'date-fns'

export function DrawPage() {
  const [draws, setDraws] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/draws/public').then(r => setDraws(r.data.draws || [])).catch(() => {
      setDraws([
        { id: '1', name: 'January 2025', draw_date: '2025-01-31', numbers: [7,14,23,31,38], total_pool: 35500, winners: [{ match: '4-match', count: 14 }, { match: '3-match', count: 38 }], status: 'completed', jackpot_rolled: false },
        { id: '2', name: 'February 2025', draw_date: '2025-02-28', numbers: null, total_pool: 38200, winners: [], status: 'scheduled', jackpot_rolled: false },
      ])
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="mesh-bg" style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: 120, maxWidth: 900, margin: '0 auto', padding: '120px 32px 80px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 60 }}>
          <p className="badge badge-gold mb-4" style={{ display: 'inline-flex', marginBottom: 16 }}><Trophy size={12} /> Monthly Draws</p>
          <h1 className="display-heading" style={{ fontSize: 'clamp(40px, 6vw, 64px)', color: '#f7f3ec', marginBottom: 12 }}>
            Prize <span className="gradient-text-gold">Draws</span>
          </h1>
          <p className="serif-italic" style={{ color: 'rgba(247,243,236,0.5)', fontSize: 18 }}>
            Monthly draws with rolling jackpots. Match 3, 4, or all 5 numbers to win.
          </p>
        </motion.div>

        {draws.map((draw, i) => (
          <motion.div key={draw.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card p-8" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ color: '#f7f3ec', fontWeight: 700, fontSize: 20, marginBottom: 4 }}>{draw.name} Draw</p>
                <p style={{ color: 'rgba(247,243,236,0.4)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={13} /> {format(new Date(draw.draw_date), 'dd MMMM yyyy')}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${draw.status === 'completed' ? 'badge-green' : 'badge-gold'}`}>{draw.status}</span>
                <p style={{ color: '#d4a82a', fontFamily: '"Playfair Display"', fontWeight: 900, fontSize: 28, marginTop: 4 }}>
                  €{draw.total_pool?.toLocaleString()}
                </p>
                <p style={{ color: 'rgba(247,243,236,0.3)', fontSize: 11, fontFamily: '"DM Mono"' }}>TOTAL POOL</p>
              </div>
            </div>

            {draw.numbers ? (
              <>
                <p style={{ color: 'rgba(247,243,236,0.35)', fontSize: 12, fontFamily: '"DM Mono"', textTransform: 'uppercase', marginBottom: 12 }}>Drawn Numbers</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                  {draw.numbers.map(n => <div key={n} className="score-ball">{n}</div>)}
                </div>
              </>
            ) : (
              <div style={{ padding: '20px', borderRadius: 12, background: 'rgba(212,168,42,0.06)', border: '1px solid rgba(212,168,42,0.15)', textAlign: 'center', marginBottom: 20 }}>
                <p style={{ color: 'rgba(247,243,236,0.4)', fontSize: 14 }}>⏳ Draw scheduled for {format(new Date(draw.draw_date), 'dd MMMM yyyy')}</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { tier: '5 of 5', share: '40%', value: (draw.total_pool * 0.4).toLocaleString(), special: 'Jackpot' },
                { tier: '4 of 5', share: '35%', value: (draw.total_pool * 0.35).toLocaleString() },
                { tier: '3 of 5', share: '25%', value: (draw.total_pool * 0.25).toLocaleString() },
              ].map(t => (
                <div key={t.tier} style={{ textAlign: 'center', padding: '14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(45,140,45,0.1)' }}>
                  <p style={{ color: '#4da64d', fontFamily: '"DM Mono"', fontSize: 13, marginBottom: 2 }}>{t.tier}</p>
                  <p style={{ color: '#f7f3ec', fontFamily: '"Playfair Display"', fontWeight: 700, fontSize: 20 }}>€{t.value}</p>
                  <p style={{ color: 'rgba(247,243,236,0.3)', fontSize: 11 }}>{t.share} {t.special ? `· ${t.special}` : ''}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      <Footer />
    </div>
  )
}

export default DrawPage
