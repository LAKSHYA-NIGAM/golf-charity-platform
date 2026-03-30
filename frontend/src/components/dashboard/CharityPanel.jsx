import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Search, Check, ExternalLink } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function CharityPanel() {
  const [charities, setCharities] = useState([])
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [contribution, setContribution] = useState(0)

  useEffect(() => {
    Promise.all([
      api.get('/charities'),
      api.get('/users/my-charity').catch(() => ({ data: {} }))
    ]).then(([cr, ur]) => {
      setCharities(cr.data.charities || [])
      setSelected(ur.data.charity_id || null)
      setContribution(ur.data.extra_contribution || 0)
    }).catch(() => {
      setCharities([
        { id: '1', name: 'St. Vincent de Paul', category: 'Poverty Relief', description: 'Supporting families in need across Ireland and the UK.', total_raised: 42100 },
        { id: '2', name: 'Irish Heart Foundation', category: 'Health', description: 'Fighting heart disease and stroke in Ireland.', total_raised: 38500 },
        { id: '3', name: 'Focus Ireland', category: 'Homelessness', description: 'Working to prevent and address homelessness.', total_raised: 29800 },
        { id: '4', name: 'ISPCC Childline', category: 'Child Safety', description: 'Supporting children in distress 24/7.', total_raised: 24600 },
      ])
    }).finally(() => setLoading(false))
  }, [])

  const filtered = charities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  )

  const save = async () => {
    if (!selected) { toast.error('Please select a charity'); return }
    setSaving(true)
    try {
      await api.put('/users/my-charity', { charity_id: selected, extra_contribution: contribution })
      toast.success('Charity preference saved!')
    } catch { toast.error('Failed to save') } finally { setSaving(false) }
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 className="display-heading" style={{ fontSize: 32, color: '#f7f3ec', marginBottom: 6 }}>My Charity</h2>
        <p style={{ color: 'rgba(247,243,236,0.45)', fontSize: 15 }}>10% of every subscription payment goes to your chosen charity.</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(247,243,236,0.25)' }} />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          className="input-field" style={{ paddingLeft: 42 }}
          placeholder="Search charities…"
        />
      </div>

      {/* Charity grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
        {loading ? [1,2,3,4].map(i => (
          <div key={i} className="shimmer" style={{ height: 160, borderRadius: 16 }} />
        )) : filtered.map(c => (
          <motion.div
            key={c.id}
            whileHover={{ y: -4 }}
            onClick={() => setSelected(c.id)}
            style={{
              padding: '20px', borderRadius: 16, cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s',
              border: selected === c.id ? '2px solid #2d8c2d' : '1px solid rgba(45,140,45,0.12)',
              background: selected === c.id ? 'rgba(45,140,45,0.08)' : 'rgba(255,255,255,0.02)',
              position: 'relative',
            }}
          >
            {selected === c.id && (
              <div style={{ position: 'absolute', top: 14, right: 14, width: 24, height: 24, borderRadius: '50%', background: '#1a6b1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={13} color="#f7f3ec" />
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(45,140,45,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={16} color="#4da64d" />
              </div>
              <div>
                <p style={{ color: '#f7f3ec', fontWeight: 600, fontSize: 14 }}>{c.name}</p>
                <span className="badge badge-green" style={{ fontSize: 10 }}>{c.category}</span>
              </div>
            </div>
            <p style={{ color: 'rgba(247,243,236,0.45)', fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>{c.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: 'rgba(247,243,236,0.3)', fontSize: 10, fontFamily: '"DM Mono"', textTransform: 'uppercase' }}>Total raised</p>
                <p className="gradient-text-gold" style={{ fontFamily: '"Playfair Display"', fontWeight: 700, fontSize: 18 }}>
                  €{c.total_raised?.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Extra contribution slider */}
      <div className="glass-card p-6" style={{ marginBottom: 20 }}>
        <h4 style={{ color: '#f7f3ec', fontWeight: 600, marginBottom: 8 }}>Extra Monthly Contribution</h4>
        <p style={{ color: 'rgba(247,243,236,0.4)', fontSize: 13, marginBottom: 16 }}>
          Add an optional donation on top of your 10% subscription share.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <input type="range" min="0" max="50" value={contribution}
            onChange={e => setContribution(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#2d8c2d' }} />
          <span style={{ color: '#d4a82a', fontFamily: '"Playfair Display"', fontWeight: 700, fontSize: 22, minWidth: 60, textAlign: 'right' }}>
            €{contribution}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ color: 'rgba(247,243,236,0.25)', fontSize: 11, fontFamily: '"DM Mono"' }}>€0 (min 10% included)</span>
          <span style={{ color: 'rgba(247,243,236,0.25)', fontSize: 11, fontFamily: '"DM Mono"' }}>€50/mo max</span>
        </div>
      </div>

      <button onClick={save} disabled={saving} className="btn-primary" style={{ padding: '14px 32px' }}>
        {saving ? 'Saving…' : 'Save Charity Preference'}
      </button>
    </div>
  )
}
