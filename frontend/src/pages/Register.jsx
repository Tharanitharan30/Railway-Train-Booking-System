import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const BENEFITS = [
  'Save traveler details for repeat bookings',
  'Track confirmed, completed, and cancelled journeys',
  'Review PNR and fare summaries without extra steps',
]

export default function Register() {
  const { login } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (form.password !== form.confirm) {
      addToast('Passwords do not match', 'error')
      return
    }

    if (form.password.length < 6) {
      addToast('Password must be at least 6 characters', 'error')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      })

      login(response.data.user, response.data.token)
      addToast('Account created successfully', 'success')
      navigate('/')
    } catch (error) {
      addToast(error.response?.data?.message || 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="container">
        <div className="auth-panel">
          <div className="auth-hero animate-fadeUp">
            <div className="section-kicker" style={{ background: 'rgba(255,255,255,0.08)', color: '#ffdba5', borderColor: 'rgba(255,255,255,0.1)' }}>
              Create your traveler profile
            </div>
            <h1 style={styles.heroTitle}>Start booking with a sharper, more trustworthy rail experience.</h1>
            <p style={styles.heroText}>
              Create your account to unlock saved journeys, faster checkout, and cleaner booking management.
            </p>

            <div style={styles.benefitsWrap}>
              {BENEFITS.map((benefit) => (
                <div key={benefit} style={styles.benefitItem}>
                  <span style={styles.benefitDot} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card auth-card animate-fadeUp" style={{ animationDelay: '0.08s' }}>
            <div>
              <div className="section-kicker">Register</div>
              <h2 style={styles.formTitle}>Create account</h2>
              <p className="muted" style={{ marginTop: 8 }}>
                Join the platform and manage train journeys with less friction.
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {[
                ['name', 'Full name', 'Your full name', 'text'],
                ['email', 'Email address', 'you@example.com', 'email'],
                ['password', 'Password', 'Minimum 6 characters', 'password'],
                ['confirm', 'Confirm password', 'Repeat your password', 'password'],
              ].map(([key, label, placeholder, type]) => (
                <div className="auth-form__row" key={key}>
                  <label className="form-label">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(event) => setForm((value) => ({ ...value, [key]: event.target.value }))}
                    required
                  />
                </div>
              ))}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '15px 22px', marginTop: 6 }}
                disabled={loading}
              >
                {loading ? <><span className="loader" /> Creating account</> : 'Create Account'}
              </button>
            </form>

            <p className="muted" style={{ textAlign: 'center' }}>
              Already have an account?{' '}
              <Link to="/login" style={styles.inlineLink}>
                Sign in
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
    color: 'rgba(255, 253, 248, 0.76)',
    fontSize: 16,
  },
  benefitsWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    marginTop: 28,
    maxWidth: 460,
  },
  benefitItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 16px',
    borderRadius: 18,
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: 'rgba(255, 253, 248, 0.88)',
  },
  benefitDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#ffdba5',
    boxShadow: '0 0 0 6px rgba(255, 219, 165, 0.14)',
    flexShrink: 0,
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
