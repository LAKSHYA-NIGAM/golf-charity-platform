import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Heart, TrendingUp, Trophy, ArrowRight, ChevronDown, Star, Globe, Users, Sparkles, Check } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

/* ─── Floating Orb Background ─── */
function MeshBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: '60vw', height: '60vw', maxWidth: 800,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,107,26,0.18) 0%, transparent 70%)',
        filter: 'blur(60px)',
        animation: 'float 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: '50vw', height: '50vw', maxWidth: 700,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,168,42,0.1) 0%, transparent 70%)',
        filter: 'blur(80px)',
        animation: 'float 10s ease-in-out infinite reverse',
      }} />
      <div style={{
        position: 'absolute', top: '40%', left: '40%',
        width: '40vw', height: '40vw', maxWidth: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(45,140,45,0.08) 0%, transparent 70%)',
        filter: 'blur(100px)',
        animation: 'float 12s ease-in-out infinite 3s',
      }} />
      <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }`}</style>
    </div>
  )
}

/* ─── Animated Counter ─── */
function Counter({ to, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0
        const duration = 2000
        const step = to / (duration / 16)
        const timer = setInterval(() => {
          start += step
          if (start >= to) { setCount(to); clearInterval(timer) }
          else setCount(Math.floor(start))
        }, 16)
        observer.disconnect()
      }
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [to])

  return (
    <span ref={ref} className="stat-value gradient-text-green">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

/* ─── Draw Number Ball ─── */
function DrawBall({ number, delay, matched }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      className={`score-ball ${matched ? 'highlighted' : ''}`}
      style={{ width: 64, height: 64, fontSize: 22 }}
    >
      {number}
    </motion.div>
  )
}

/* ─── Feature Card ─── */
function FeatureCard({ icon: Icon, title, desc, accent, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className="glass-card p-8 group cursor-default"
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
    >
      <div className="mb-6" style={{
        width: 52, height: 52, borderRadius: 14,
        background: accent === 'gold' ? 'rgba(212,168,42,0.12)' : 'rgba(45,140,45,0.12)',
        border: `1px solid ${accent === 'gold' ? 'rgba(212,168,42,0.25)' : 'rgba(45,140,45,0.25)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={24} color={accent === 'gold' ? '#d4a82a' : '#4da64d'} />
      </div>
      <h3 className="font-display text-xl font-bold mb-3" style={{ color: '#f7f3ec' }}>{title}</h3>
      <p style={{ color: 'rgba(247,243,236,0.55)', fontSize: 15, lineHeight: 1.7 }}>{desc}</p>
    </motion.div>
  )
}

/* ─── Testimonial ─── */
const testimonials = [
  { name: 'Sarah M.', location: 'Dublin', quote: 'Won the 4-match prize last month. Donated half to my chosen charity. Best feeling ever.', stars: 5 },
  { name: 'James K.', location: 'Manchester', quote: "I've been playing golf for 20 years. GreenHeart made it actually mean something beyond the course.", stars: 5 },
  { name: 'Priya N.', location: 'Cork', quote: 'The charity transparency is incredible. I can see exactly where my subscription goes. Revolutionary.', stars: 5 },
]

/* ─── How It Works Step ─── */
function HowStep({ num, title, desc, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="flex gap-6"
    >
      <div style={{
        flexShrink: 0, width: 48, height: 48, borderRadius: '50%',
        border: '2px solid rgba(45,140,45,0.4)',
        background: 'rgba(45,140,45,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"DM Mono"', fontSize: 16, color: '#4da64d',
      }}>{num}</div>
      <div>
        <h4 style={{ color: '#f7f3ec', fontWeight: 600, marginBottom: 6, fontSize: 17 }}>{title}</h4>
        <p style={{ color: 'rgba(247,243,236,0.5)', fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
      </div>
    </motion.div>
  )
}

export default function LandingPage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % 3), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="mesh-bg" style={{ minHeight: '100vh', position: 'relative' }}>
      <MeshBackground />
      <Navbar />

      {/* ─── HERO ─── */}
      <section ref={heroRef} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', position: 'relative', zIndex: 1 }}>
        <motion.div style={{ y: heroY, opacity: heroOpacity, maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="badge badge-green mb-8"
            style={{ display: 'inline-flex' }}
          >
            <Sparkles size={12} /> Now live in Ireland & UK
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="display-heading"
            style={{ fontSize: 'clamp(48px, 8vw, 100px)', color: '#f7f3ec', marginBottom: 8 }}
          >
            Golf that
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.8 }}
            className="display-heading gradient-text-green"
            style={{ fontSize: 'clamp(48px, 8vw, 100px)', marginBottom: 8 }}
          >
            changes lives.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="serif-italic"
            style={{ fontSize: 'clamp(16px, 2.5vw, 24px)', color: 'rgba(247,243,236,0.5)', marginTop: 16, marginBottom: 48 }}
          >
            Enter your Stableford scores. Win monthly prizes.
            <br />Fund the charities that matter most to you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link to="/register" className="btn-gold" style={{ fontSize: 16, padding: '16px 36px' }}>
              Start for free <ArrowRight size={18} />
            </Link>
            <Link to="/how-it-works" className="btn-outline" style={{ fontSize: 16 }}>
              See how it works
            </Link>
          </motion.div>

          {/* Social proof strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            style={{ marginTop: 64, display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}
          >
            <div style={{ display: 'flex' }}>
              {['🇮🇪','🇬🇧','⛳'].map((e, i) => (
                <span key={i} style={{ fontSize: 20, marginLeft: i > 0 ? -4 : 0 }}>{e}</span>
              ))}
            </div>
            <span style={{ color: 'rgba(247,243,236,0.4)', fontSize: 13, fontFamily: '"DM Mono"' }}>
              2,400+ subscribers · €180k+ donated · 12 charities
            </span>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)' }}
        >
          <ChevronDown size={20} color="rgba(247,243,236,0.3)" />
        </motion.div>
      </section>

      {/* ─── STATS ─── */}
      <section style={{ padding: '80px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 2 }}>
            {[
              { value: 2400, suffix: '+', label: 'Active Subscribers', prefix: '' },
              { value: 180000, suffix: '', label: 'Donated to Charity', prefix: '€' },
              { value: 12, suffix: '', label: 'Partner Charities', prefix: '' },
              { value: 96, suffix: '%', label: 'Satisfaction Rate', prefix: '' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 text-center"
              >
                <Counter to={s.value} suffix={s.suffix} prefix={s.prefix} />
                <p style={{ color: 'rgba(247,243,236,0.4)', fontSize: 13, marginTop: 8, fontFamily: '"DM Mono"', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="badge badge-green mb-6"
                style={{ display: 'inline-flex' }}
              >01 · How It Works</motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="display-heading"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)', color: '#f7f3ec', marginBottom: 48 }}
              >
                Simple. Transparent.<br />
                <span className="gradient-text-green">Meaningful.</span>
              </motion.h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <HowStep num="01" title="Subscribe monthly or yearly" desc="From €12/month. 10%+ goes directly to your chosen charity. The rest powers the prize pool." delay={0} />
                <HowStep num="02" title="Enter your golf scores" desc="Log up to 5 Stableford scores (1–45). We keep your 5 most recent — always current, always fair." delay={0.1} />
                <HowStep num="03" title="Monthly draw" desc="3, 4, or 5 matching numbers win. If no-one matches 5, the jackpot rolls over. Everyone wins eventually." delay={0.2} />
                <HowStep num="04" title="Verified payout & charity impact" desc="Winners upload proof, admin verifies, funds are released. Your charity gets credited automatically." delay={0.3} />
              </div>
            </div>

            {/* Draw visualisation */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="glass-card p-8"
              style={{ textAlign: 'center' }}
            >
              <p className="badge badge-gold mb-6" style={{ display: 'inline-flex', marginBottom: 24 }}>
                <Trophy size={12} /> This Month's Draw
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
                {[7, 14, 23, 31, 38].map((n, i) => (
                  <DrawBall key={n} number={n} delay={i * 0.15} matched={[14, 23, 31].includes(n)} />
                ))}
              </div>
              <p style={{ color: 'rgba(247,243,236,0.4)', fontSize: 13, marginBottom: 32, fontFamily: '"DM Mono"' }}>
                DRAWN NUMBERS — 3 matched!
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { match: '5 of 5', prize: '€14,200', share: '40% Jackpot', color: '#d4a82a' },
                  { match: '4 of 5', prize: '€12,425', share: '35% Pool', color: '#80c080' },
                  { match: '3 of 5', prize: '€8,875', share: '25% Pool', color: '#80c080' },
                ].map((row, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px', borderRadius: 10,
                    background: i === 0 ? 'rgba(212,168,42,0.08)' : 'rgba(45,140,45,0.06)',
                    border: `1px solid ${i === 0 ? 'rgba(212,168,42,0.2)' : 'rgba(45,140,45,0.12)'}`,
                  }}>
                    <span style={{ color: row.color, fontFamily: '"DM Mono"', fontSize: 13 }}>{row.match}</span>
                    <span style={{ color: '#f7f3ec', fontWeight: 600 }}>{row.prize}</span>
                    <span style={{ color: 'rgba(247,243,236,0.4)', fontSize: 12, fontFamily: '"DM Mono"' }}>{row.share}</span>
                  </div>
                ))}
              </div>
              <div className="divider" />
              <p style={{ color: 'rgba(247,243,236,0.3)', fontSize: 12, fontFamily: '"DM Mono"' }}>
                Jackpot rolls over if no 5-match winner
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 64 }}
          >
            <p className="badge badge-green mb-4" style={{ display: 'inline-flex', marginBottom: 16 }}>02 · Features</p>
            <h2 className="display-heading" style={{ fontSize: 'clamp(36px, 5vw, 56px)', color: '#f7f3ec' }}>
              Built for <span className="gradient-text-gold">golfers</span> who care.
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <FeatureCard icon={Heart} accent="gold" delay={0} title="Charity First"
              desc="Every subscription directs minimum 10% to the charity of your choice. Optional top-ups let you give more. Real impact, real transparency." />
            <FeatureCard icon={Trophy} accent="green" delay={0.1} title="Monthly Prize Draws"
              desc="Match 3, 4, or 5 numbers from your golf scores. The prize pool grows with every subscriber. Jackpots roll over until won." />
            <FeatureCard icon={TrendingUp} accent="green" delay={0.2} title="Score Management"
              desc="Enter your last 5 Stableford scores. New scores automatically replace the oldest. Always accurate, always fair, always current." />
            <FeatureCard icon={Globe} accent="gold" delay={0.3} title="Charity Directory"
              desc="Browse 12+ verified charities across health, education, environment and sport. Switch your charity anytime." />
            <FeatureCard icon={Users} accent="green" delay={0.4} title="Community Leaderboard"
              desc="See monthly winners and celebrate the good that your community is doing. Every win powers more charitable giving." />
            <FeatureCard icon={Star} accent="gold" delay={0.5} title="Winner Verification"
              desc="Fully transparent verification. Upload your proof, admin confirms, funds arrive. No ambiguity, no delays." />
          </div>
        </div>
      </section>

      {/* ─── CHARITIES PREVIEW ─── */}
      <section style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 64 }}
          >
            <p className="badge badge-gold mb-4" style={{ display: 'inline-flex', marginBottom: 16 }}>03 · Charities</p>
            <h2 className="display-heading" style={{ fontSize: 'clamp(36px, 5vw, 56px)', color: '#f7f3ec' }}>
              Your subscription.<br />
              <span className="gradient-text-gold">Their future.</span>
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {[
              { name: 'St. Vincent de Paul', category: 'Poverty Relief', raised: '€42,100', emoji: '🏠' },
              { name: 'Irish Heart Foundation', category: 'Health', raised: '€38,500', emoji: '❤️' },
              { name: 'Focus Ireland', category: 'Homelessness', raised: '€29,800', emoji: '🌿' },
              { name: 'ISPCC Childline', category: 'Child Safety', raised: '€24,600', emoji: '📞' },
            ].map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="charity-card p-6"
              >
                <div style={{ fontSize: 40, marginBottom: 16 }}>{c.emoji}</div>
                <h4 style={{ color: '#f7f3ec', fontWeight: 600, marginBottom: 4 }}>{c.name}</h4>
                <p className="badge badge-green" style={{ display: 'inline-flex', marginBottom: 16, fontSize: 11 }}>{c.category}</p>
                <div className="divider" style={{ margin: '12px 0' }} />
                <p style={{ color: 'rgba(247,243,236,0.4)', fontSize: 12, fontFamily: '"DM Mono"' }}>TOTAL RAISED</p>
                <p className="gradient-text-gold" style={{ fontFamily: '"Playfair Display"', fontSize: 22, fontWeight: 700 }}>{c.raised}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginTop: 40 }}
          >
            <Link to="/charities" className="btn-outline">
              View all 12 charities <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <p className="badge badge-green mb-6" style={{ display: 'inline-flex', marginBottom: 24 }}>04 · Voices</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="glass-card p-12"
            >
              <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 24 }}>
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} size={16} fill="#d4a82a" color="#d4a82a" />
                ))}
              </div>
              <p className="serif-italic" style={{ fontSize: 22, color: '#f7f3ec', lineHeight: 1.6, marginBottom: 24 }}>
                "{testimonials[activeTestimonial].quote}"
              </p>
              <p style={{ color: 'rgba(247,243,236,0.5)', fontFamily: '"DM Mono"', fontSize: 13 }}>
                {testimonials[activeTestimonial].name} · {testimonials[activeTestimonial].location}
              </p>
            </motion.div>
          </AnimatePresence>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)} style={{
                width: i === activeTestimonial ? 24 : 8,
                height: 8, borderRadius: 4,
                background: i === activeTestimonial ? '#2d8c2d' : 'rgba(247,243,236,0.15)',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING CTA ─── */}
      <section style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card-gold p-16 text-center"
            style={{ position: 'relative', overflow: 'hidden' }}
          >
            {/* Glow accents */}
            <div style={{
              position: 'absolute', top: -60, right: -60, width: 250, height: 250,
              borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,42,0.15) 0%, transparent 70%)',
            }} />
            <p className="badge badge-gold mb-6" style={{ display: 'inline-flex', marginBottom: 24 }}>
              Ready to Begin?
            </p>
            <h2 className="display-heading" style={{ fontSize: 'clamp(36px, 5vw, 56px)', color: '#f7f3ec', marginBottom: 16 }}>
              One subscription.<br />
              <span className="gradient-text-gold">Infinite good.</span>
            </h2>
            <p style={{ color: 'rgba(247,243,236,0.55)', fontSize: 18, marginBottom: 48, fontFamily: '"Playfair Display"', fontStyle: 'italic' }}>
              From €12/month. Cancel anytime. No hidden fees.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 540, margin: '0 auto 40px' }}>
              {[
                { plan: 'Monthly', price: '€12', period: '/month', desc: 'Full access, cancel anytime' },
                { plan: 'Yearly', price: '€120', period: '/year', desc: 'Save €24 — 2 months free', highlight: true },
              ].map((p, i) => (
                <div key={i} style={{
                  padding: '24px 20px', borderRadius: 16, textAlign: 'center',
                  border: p.highlight ? '1px solid rgba(212,168,42,0.5)' : '1px solid rgba(247,243,236,0.1)',
                  background: p.highlight ? 'rgba(212,168,42,0.08)' : 'rgba(255,255,255,0.03)',
                }}>
                  {p.highlight && <p className="badge badge-gold" style={{ display: 'inline-flex', marginBottom: 12, fontSize: 10 }}>BEST VALUE</p>}
                  <p style={{ color: 'rgba(247,243,236,0.6)', fontSize: 13, marginBottom: 4 }}>{p.plan}</p>
                  <p style={{ fontFamily: '"Playfair Display"', fontSize: 36, fontWeight: 900, color: p.highlight ? '#d4a82a' : '#f7f3ec' }}>
                    {p.price}<span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(247,243,236,0.4)' }}>{p.period}</span>
                  </p>
                  <p style={{ color: 'rgba(247,243,236,0.4)', fontSize: 12, marginTop: 6 }}>{p.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn-gold" style={{ fontSize: 16, padding: '16px 40px' }}>
                Start your journey <ArrowRight size={18} />
              </Link>
              <Link to="/pricing" className="btn-outline">
                Compare plans
              </Link>
            </div>

            <div style={{ marginTop: 32, display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['Secure payments', 'Cancel anytime', '10%+ to charity', 'Monthly draws'].map((t, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(247,243,236,0.4)', fontSize: 13 }}>
                  <Check size={14} color="#2d8c2d" /> {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
