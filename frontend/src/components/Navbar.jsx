import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate  = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/'); setOpen(false) }
  const active = (path) => location.pathname === path

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>

        {/* Logo */}
        <Link to="/" style={styles.logo}>
          🚆 Rail<span style={{ color: 'var(--accent)' }}>Yatra</span>
        </Link>

        {/* Links */}
        <div style={{ ...styles.links, ...(open ? styles.linksOpen : {}) }}>
          <Link to="/"            style={{ ...styles.link, ...(active('/')            ? styles.linkActive : {}) }} onClick={() => setOpen(false)}>Home</Link>
          {user && (
            <Link to="/my-bookings" style={{ ...styles.link, ...(active('/my-bookings') ? styles.linkActive : {}) }} onClick={() => setOpen(false)}>My Bookings</Link>
          )}

          {user ? (
            <div style={styles.userRow}>
              <div style={styles.avatar}>{user.name?.[0]?.toUpperCase()}</div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user.name.split(' ')[0]}</span>
              <button className="btn btn-secondary" style={{ padding: '7px 14px', fontSize: 13 }} onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div style={styles.authRow}>
              <Link to="/login"    className="btn btn-secondary" style={{ padding: '7px 16px', fontSize: 13 }} onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary"   style={{ padding: '7px 16px', fontSize: 13 }} onClick={() => setOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>

        {/* Hamburger */}
        <button onClick={() => setOpen(!open)} style={styles.hamburger}>
          <span /><span /><span />
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-links-open { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}

const styles = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(10,12,16,0.9)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--border)',
  },
  inner: {
    maxWidth: 1100, margin: '0 auto', padding: '0 24px',
    height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logo: {
    fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800,
    color: 'var(--text)', textDecoration: 'none', letterSpacing: '-0.02em',
  },
  links: {
    display: 'flex', alignItems: 'center', gap: 8,
  },
  linksOpen: {
    display: 'flex', flexDirection: 'column',
    position: 'absolute', top: 64, left: 0, right: 0,
    background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
    padding: 16, gap: 10,
  },
  link: {
    textDecoration: 'none', color: 'var(--text-muted)',
    fontSize: 14, fontWeight: 500, padding: '6px 14px',
    borderRadius: 8, transition: 'color 0.2s',
  },
  linkActive: { color: 'var(--accent)', background: 'var(--bg-hover)' },
  userRow:  { display: 'flex', alignItems: 'center', gap: 10, marginLeft: 8 },
  authRow:  { display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'var(--accent)', color: '#0a0c10',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14,
  },
  hamburger: {
    display: 'none', flexDirection: 'column', gap: 5,
    background: 'none', border: 'none', cursor: 'pointer', padding: 6,
  },
}