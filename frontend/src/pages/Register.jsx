import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth }  from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Register() {
  const { login }    = useAuth()
  const { addToast } = useToast()
  const navigate     = useNavigate()

  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { addToast('Passwords do not match', 'error'); return }
    if (form.password.length < 6)       { addToast('Password must be at least 6 characters', 'error'); return }
    setLoading(true)
    try {
      const res = await api.post('/auth/register', {
        name: form.name, email: form.email, password: form.password,
      })
      login(res.data.user, res.data.token)
      addToast('Account created! 🎉', 'success')
      navigate('/')
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
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

  return (
    <div style={s.page}>
      <div className="card animate-fadeUp" style={s.card}>
        <div style={s.header}>
          <Link to="/" style={s.logo}>🚆 RailYatra</Link>
          <h1 style={s.title}>Create account</h1>
          <p style={s.sub}>Join millions of rail travelers</p>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          {[
            { key: 'name',     type: 'text',     placeholder: 'Your full name',      label: 'Full Name' },
            { key: 'email',    type: 'email',    placeholder: 'you@example.com',     label: 'Email Address' },
            { key: 'password', type: 'password', placeholder: 'Min. 6 characters',   label: 'Password' },
            { key: 'confirm',  type: 'password', placeholder: 'Repeat your password',label: 'Confirm Password' },
          ].map(f => (
            <div key={f.key} style={s.field}>
              <label style={s.label}>{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} required />
            </div>
          ))}
          <button type="submit" className="btn btn-primary" style={s.btn} disabled={loading}>
            {loading ? <><span className="loader" /> Creating account...</> : 'Create Account →'}
          </button>
        </form>

        <p style={s.switch}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}