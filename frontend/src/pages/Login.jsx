import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../api/axios'
import { useAuth }  from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const { login }    = useAuth()
  const { addToast } = useToast()
  const navigate     = useNavigate()
  const location     = useLocation()
  const from         = location.state?.from?.pathname || '/'

  const [form, setForm]     = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.user, res.data.token)
      addToast(`Welcome back, ${res.data.user.name}! 👋`, 'success')
      navigate(from, { replace: true })
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div className="card animate-fadeUp" style={s.card}>
        <div style={s.header}>
          <Link to="/" style={s.logo}>🚆 RailYatra</Link>
          <h1 style={s.title}>Welcome back</h1>
          <p style={s.sub}>Sign in to access your bookings</p>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email address</label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input type="password" placeholder="Your password" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button type="submit" className="btn btn-primary" style={s.btn} disabled={loading}>
            {loading ? <><span className="loader" /> Signing in...</> : 'Sign In →'}
          </button>
        </form>

        <p style={s.switch}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Create one</Link>
        </p>
      </div>
    </div>
  )
}

const s = {
  page:  { minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' },
  card:  { width: '100%', maxWidth: 420, borderColor: 'var(--border-lit)', boxShadow: 'var(--shadow-lg)' },
  header:{ textAlign: 'center', marginBottom: 28 },
  logo:  { display: 'inline-block', fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 800, color: 'var(--accent)', textDecoration: 'none', marginBottom: 16 },
  title: { fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 },
  sub:   { fontSize: 14, color: 'var(--text-muted)' },
  form:  { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--font-head)' },
  btn:   { width: '100%', justifyContent: 'center', padding: 13, fontSize: 15, marginTop: 4 },
  switch:{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' },
}