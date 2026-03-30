import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, LogOut, LayoutDashboard, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [location])

  const navLinks = [
    { label: 'How It Works', to: '/#how-it-works' },
    { label: 'Charities', to: '/charities' },
    { label: 'Draws', to: '/draw' },
    { label: 'Pricing', to: '/pricing' },
  ]

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          padding: scrolled ? '12px 32px' : '20px 32px',
          background: scrolled ? 'rgba(10,15,10,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(45,140,45,0.12)' : '1px solid transparent',
          transition: 'all 0.3s ease',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #1a6b1a, #2d8c2d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16
          }}>⛳</div>
          <span style={{ fontFamily: '"Playfair Display"', fontSize: 20, fontWeight: 900, color: '#f7f3ec', letterSpacing: '-0.02em' }}>
            Green<span style={{ color: '#2d8c2d' }}>Heart</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="hidden md:flex">
          {navLinks.map(l => (
            <Link key={l.label} to={l.to} className="nav-link">{l.label}</Link>
          ))}
        </div>

        {/* Desktop Auth */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }} className="hidden md:flex">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="btn-outline" style={{ padding: '8px 16px', fontSize: 13 }}>
                  <Shield size={14} /> Admin
                </Link>
              )}
              <Link to="/dashboard" className="btn-outline" style={{ padding: '8px 16px', fontSize: 13 }}>
                <LayoutDashboard size={14} /> Dashboard
              </Link>
              <button onClick={logout} className="btn-outline" style={{ padding: '8px 14px', fontSize: 13 }}>
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline" style={{ padding: '9px 20px', fontSize: 14 }}>Sign In</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '9px 20px', fontSize: 14 }}>Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileOpen(v => !v)}
          style={{ background: 'none', border: 'none', color: '#f7f3ec', cursor: 'pointer', padding: 8, display: 'none' }}
          className="block md:hidden"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', top: 70, left: 16, right: 16, zIndex: 99,
              background: 'rgba(10,15,10,0.95)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(45,140,45,0.2)', borderRadius: 16, padding: 24,
            }}
          >
            {navLinks.map(l => (
              <Link key={l.label} to={l.to} className="nav-link" style={{ display: 'block', padding: '12px 0', borderBottom: '1px solid rgba(45,140,45,0.08)', fontSize: 16 }}>
                {l.label}
              </Link>
            ))}
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {user ? (
                <>
                  <Link to="/dashboard" className="btn-primary" style={{ justifyContent: 'center' }}>Dashboard</Link>
                  <button onClick={logout} className="btn-outline" style={{ justifyContent: 'center' }}>Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn-gold" style={{ justifyContent: 'center' }}>Get Started</Link>
                  <Link to="/login" className="btn-outline" style={{ justifyContent: 'center' }}>Sign In</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
