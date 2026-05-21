import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const FEATURES = [
  { title: 'Instant access', text: 'Manage active trips and booking history from one dashboard.' },
  { title: 'Fast rebooking', text: 'Jump back into the same route and class selection in seconds.' },
  { title: 'Cancellation control', text: 'Track booking state and cancel upcoming trips with clarity.' },
  { title: 'Traveler-first flow', text: 'Calm, readable screens designed for real booking confidence.' },
]

export default function Login() {
  const { login } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const response = await api.post('/auth/login', form)
      login(response.data.user, response.data.token)
      addToast(`Welcome back, ${response.data.user.name}!`, 'success')
      navigate(from, { replace: true })
    } catch (error) {
      addToast(error.response?.data?.message || 'Login failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="container">
        <div className="auth-panel">
          <div className="auth-hero animate-fadeUp">
            <div className="section-kicker" style={{ background: 'var(--bg-hover)', color: 'var(--accent)', padding: '6px 12px', borderRadius: 999 }}>
              Secure traveler account
            </div>
            <h1 style={styles.heroTitle}>Welcome back to your rail workspace.</h1>
            <p style={styles.heroText}>
              Sign in to continue bookings, review PNR details, and manage upcoming journeys without friction.
            </p>

            <div className="auth-feature-grid">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="auth-feature">
                  <h3 style={styles.featureTitle}>{feature.title}</h3>
                  <p style={styles.featureText}>{feature.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card auth-card animate-fadeUp" style={{ animationDelay: '0.08s' }}>
            <div>
              <div className="section-kicker">Sign In</div>
              <h2 style={styles.formTitle}>Access your bookings</h2>
              <p className="muted" style={{ marginTop: 8 }}>
                Use your email and password to continue where you left off.
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-form__row">
                <label className="form-label">Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))}
                  required
                />
              </div>

              <div className="auth-form__row">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '15px 22px', marginTop: 6 }}
                disabled={loading}
              >
                {loading ? <><span className="loader" /> Signing in</> : 'Sign In'}
              </button>
            </form>

            <p className="muted" style={{ textAlign: 'center' }}>
              Don&apos;t have an account?{' '}
              <Link to="/register" style={styles.inlineLink}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  heroTitle: {
    maxWidth: 520,
    fontFamily: 'var(--font-head)',
    fontSize: 'clamp(34px, 5vw, 52px)',
    lineHeight: 1.04,
    letterSpacing: '-0.04em',
  },
  heroText: {
    maxWidth: 520,
    marginTop: 14,
    color: 'var(--text-muted)',
    fontSize: 16,
  },
  featureTitle: {
    fontFamily: 'var(--font-head)',
    fontSize: 16,
    marginBottom: 6,
  },
  featureText: {
    color: 'var(--text-muted)',
    fontSize: 13,
    lineHeight: 1.6,
  },
  formTitle: {
    fontFamily: 'var(--font-head)',
    fontSize: 34,
    lineHeight: 1.05,
    letterSpacing: '-0.04em',
  },
  inlineLink: {
    color: 'var(--accent-strong)',
    fontWeight: 700,
    textDecoration: 'none',
  },
}
