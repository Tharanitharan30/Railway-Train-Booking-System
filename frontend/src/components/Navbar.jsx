import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const active = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/')
    setOpen(false)
  }

  const closeMenu = () => setOpen(false)

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand" onClick={closeMenu}>
          <span className="navbar__brand-mark">RY</span>
          <span>
            Rail<span style={{ color: 'var(--accent-strong)' }}>Yatra</span>
          </span>
        </Link>

        <div className={`navbar__menu ${open ? 'navbar__menu--open' : ''}`}>
          <div className="navbar__navlinks">
            <Link
              to="/"
              className={`navbar__link ${active('/') ? 'navbar__link--active' : ''}`}
              onClick={closeMenu}
            >
              Home
            </Link>
            {user && (
              <Link
                to="/my-bookings"
                className={`navbar__link ${active('/my-bookings') ? 'navbar__link--active' : ''}`}
                onClick={closeMenu}
              >
                My Bookings
              </Link>
            )}
          </div>

          {user ? (
            <div className="navbar__user">
              <div className="navbar__avatar">{user.name?.[0]?.toUpperCase() || 'U'}</div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Signed in</div>
                <div style={{ fontWeight: 700, fontFamily: 'var(--font-head)' }}>
                  {user.name?.split(' ')[0]}
                </div>
              </div>
              <button type="button" className="btn btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar__actions">
              <Link to="/login" className="btn btn-secondary" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={closeMenu}>
                Create Account
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          className="navbar__toggle"
          aria-label="Toggle navigation"
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  )
}
