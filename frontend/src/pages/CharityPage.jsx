import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Heart, ExternalLink, Filter } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import api from '../utils/api'

const CATEGORIES = ['All', 'Health', 'Poverty Relief', 'Homelessness', 'Child Safety', 'Education', 'Environment']

const DEMO_CHARITIES = [
  { id: '1', name: 'St. Vincent de Paul', category: 'Poverty Relief', description: 'SVP supports over 140,000 people in Ireland every year through a national network of volunteers helping families in financial difficulty.', total_raised: 42100, subscribers: 312, website: '#', emoji: '🏠', featured: true },
  { id: '2', name: 'Irish Heart Foundation', category: 'Health', description: 'Saving lives by preventing and reducing the impact of heart disease and stroke across Ireland through research, advocacy and support.', total_raised: 38500, subscribers: 287, website: '#', emoji: '❤️', featured: true },
  { id: '3', name: 'Focus Ireland', category: 'Homelessness', description: 'Focus Ireland works to prevent people from becoming homeless and supports people who are already homeless to find and keep a home.', total_raised: 29800, subscribers: 218, website: '#', emoji: '🌿' },
  { id: '4', name: 'ISPCC Childline', category: 'Child Safety', description: 'Childline provides a 24-hour listening service for children and young people up to 18 years facing difficulties.', total_raised: 24600, subscribers: 189, website: '#', emoji: '📞' },
  { id: '5', name: 'Pieta House', category: 'Health', description: 'Providing a range of free, therapeutic services to people who are in suicidal distress or who engage in self-harm.', total_raised: 21300, subscribers: 156, website: '#', emoji: '💜' },
  { id: '6', name: 'Goal Global', category: 'Poverty Relief', description: 'International humanitarian organisation responding to the needs of the most vulnerable worldwide, providing emergency relief.', total_raised: 18700, subscribers: 134, website: '#', emoji: '🌍' },
  { id: '7', name: 'Irish Wildlife Trust', category: 'Environment', description: 'Working for the conservation and protection of Ireland\'s wildlife through education, advocacy and practical conservation action.', total_raised: 14200, subscribers: 98, website: '#', emoji: '🦋' },
  { id: '8', name: 'Barretstown', category: 'Health', description: 'Providing life-changing therapeutic recreation programmes for children living with serious illness and their families.', total_raised: 12800, subscribers: 87, website: '#', emoji: '⭐' },
]

export default function CharityPage() {
  const [charities, setCharities] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/charities').then(r => setCharities(r.data.charities || DEMO_CHARITIES))
      .catch(() => setCharities(DEMO_CHARITIES))
      .finally(() => setLoading(false))
  }, [])

  const filtered = charities.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || c.category === category
    return matchSearch && matchCat
  })

  const featured = filtered.filter(c => c.featured)
  const rest = filtered.filter(c => !c.featured)
  const totalRaised = charities.reduce((s, c) => s + (c.total_raised || 0), 0)

  return (
    <div className="mesh-bg" style={{ minHeight: '100vh' }}>
      <Navbar />

      <div style={{ paddingTop: 100 }}>
        {/* Hero */}
        <section style={{ padding: '60px 32px 80px', textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="badge badge-green mb-6" style={{ display: 'inline-flex', marginBottom: 20 }}>
            <Heart size={12} /> Partner Charities
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="display-heading" style={{ fontSize: 'clamp(40px, 6vw, 64px)', color: '#f7f3ec', marginBottom: 16 }}>
            Where your money <span className="gradient-text-gold">goes.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="serif-italic" style={{ color: 'rgba(247,243,236,0.5)', fontSize: 18, marginBottom: 40 }}>
            Every GreenHeart subscription directs real funds to the causes that matter most to our community.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: '"Playfair Display"', fontSize: 40, fontWeight: 900, color: '#d4a82a' }}>€{(totalRaised / 1000).toFixed(0)}k+</p>
              <p style={{ color: 'rgba(247,243,236,0.35)', fontSize: 13, fontFamily: '"DM Mono"' }}>TOTAL RAISED</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: '"Playfair Display"', fontSize: 40, fontWeight: 900, color: '#4da64d' }}>{charities.length}+</p>
              <p style={{ color: 'rgba(247,243,236,0.35)', fontSize: 13, fontFamily: '"DM Mono"' }}>CHARITIES</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: '"Playfair Display"', fontSize: 40, fontWeight: 900, color: '#80c080' }}>10%+</p>
              <p style={{ color: 'rgba(247,243,236,0.35)', fontSize: 13, fontFamily: '"DM Mono"' }}>OF EVERY SUB</p>
            </div>
          </motion.div>
        </section>

        {/* Search & Filter */}
        <section style={{ padding: '0 32px 60px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(247,243,236,0.25)' }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                className="input-field" style={{ paddingLeft: 42 }} placeholder="Search charities…" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding: '8px 16px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: 13,
                background: category === cat ? 'rgba(45,140,45,0.2)' : 'rgba(255,255,255,0.04)',
                color: category === cat ? '#4da64d' : 'rgba(247,243,236,0.45)',
                border: category === cat ? '1px solid rgba(45,140,45,0.3)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}>{cat}</button>
            ))}
          </div>

          {/* Featured */}
          {featured.length > 0 && (
            <>
              <p style={{ color: 'rgba(247,243,236,0.35)', fontSize: 12, fontFamily: '"DM Mono"', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Featured Charities</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 40 }}>
                {featured.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="charity-card" style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: 40 }}>{c.emoji}</span>
                      <span className="badge badge-gold" style={{ fontSize: 10, height: 'fit-content' }}>Featured</span>
                    </div>
                    <h3 style={{ color: '#f7f3ec', fontWeight: 700, fontSize: 20, marginBottom: 6 }}>{c.name}</h3>
                    <span className="badge badge-green" style={{ fontSize: 11, marginBottom: 12, display: 'inline-flex' }}>{c.category}</span>
                    <p style={{ color: 'rgba(247,243,236,0.5)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{c.description}</p>
                    <div className="divider" style={{ margin: '0 0 16px' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ color: 'rgba(247,243,236,0.3)', fontSize: 11, fontFamily: '"DM Mono"', textTransform: 'uppercase' }}>Raised by GreenHeart</p>
                        <p className="gradient-text-gold" style={{ fontFamily: '"Playfair Display"', fontWeight: 900, fontSize: 24 }}>€{c.total_raised?.toLocaleString()}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: 'rgba(247,243,236,0.3)', fontSize: 11, fontFamily: '"DM Mono"', textTransform: 'uppercase' }}>Subscribers</p>
                        <p style={{ color: '#4da64d', fontFamily: '"Playfair Display"', fontWeight: 700, fontSize: 22 }}>{c.subscribers}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* All charities */}
          <p style={{ color: 'rgba(247,243,236,0.35)', fontSize: 12, fontFamily: '"DM Mono"', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            All Charities ({filtered.length})
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {(rest.length ? rest : filtered).map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="charity-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 28 }}>{c.emoji}</span>
                  <div>
                    <h4 style={{ color: '#f7f3ec', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{c.name}</h4>
                    <span className="badge badge-green" style={{ fontSize: 10 }}>{c.category}</span>
                  </div>
                </div>
                <p style={{ color: 'rgba(247,243,236,0.45)', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{c.description.slice(0, 100)}…</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p className="gradient-text-gold" style={{ fontFamily: '"Playfair Display"', fontWeight: 700, fontSize: 20 }}>€{c.total_raised?.toLocaleString()}</p>
                  <span style={{ color: 'rgba(247,243,236,0.25)', fontSize: 12 }}>{c.subscribers} members</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
