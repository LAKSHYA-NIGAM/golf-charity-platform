import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{
      position: 'relative', zIndex: 1,
      borderTop: '1px solid rgba(45,140,45,0.12)',
      padding: '60px 32px 32px',
      background: 'rgba(10,15,10,0.5)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #1a6b1a, #2d8c2d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⛳</div>
              <span style={{ fontFamily: '"Playfair Display"', fontSize: 18, fontWeight: 900, color: '#f7f3ec' }}>Green<span style={{ color: '#2d8c2d' }}>Heart</span></span>
            </div>
            <p style={{ color: 'rgba(247,243,236,0.4)', fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}>
              Golf subscriptions that power real charitable change. Play, contribute, and win — all in one platform.
            </p>
          </div>
          {[
            { title: 'Platform', links: [['How It Works', '/'], ['Charities', '/charities'], ['Monthly Draws', '/draw'], ['Pricing', '/pricing']] },
            { title: 'Account', links: [['Sign Up', '/register'], ['Sign In', '/login'], ['Dashboard', '/dashboard'], ['Profile', '/profile']] },
            { title: 'Legal', links: [['Privacy Policy', '/privacy'], ['Terms of Use', '/terms'], ['Cookie Policy', '/cookies'], ['Contact', '/contact']] },
          ].map(col => (
            <div key={col.title}>
              <h5 style={{ fontFamily: '"DM Mono"', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(247,243,236,0.3)', marginBottom: 16 }}>{col.title}</h5>
              {col.links.map(([label, to]) => (
                <Link key={label} to={to} style={{ display: 'block', color: 'rgba(247,243,236,0.5)', fontSize: 14, marginBottom: 10, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#f7f3ec'}
                  onMouseLeave={e => e.target.style.color = 'rgba(247,243,236,0.5)'}
                >{label}</Link>
              ))}
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(45,140,45,0.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ color: 'rgba(247,243,236,0.25)', fontSize: 13, fontFamily: '"DM Mono"' }}>
            © 2025 GreenHeart. All rights reserved. Registered Charity Partner Program.
          </p>
          <p style={{ color: 'rgba(247,243,236,0.25)', fontSize: 12 }}>
            Gambling Commission Licensed · Charity Regulator Approved
          </p>
        </div>
      </div>
    </footer>
  )
}
