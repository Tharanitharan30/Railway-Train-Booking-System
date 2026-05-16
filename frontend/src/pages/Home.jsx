import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const POPULAR = [
  { from: 'Chennai',   to: 'Delhi' },
  { from: 'Mumbai',    to: 'Delhi' },
  { from: 'Bangalore', to: 'Hyderabad' },
  { from: 'Coimbatore',to: 'Chennai' },
]

export default function Home() {
  const navigate = useNavigate()
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ from: '', to: '', date: today, passengers: 1 })

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/search?from=${form.from}&to=${form.to}&date=${form.date}&passengers=${form.passengers}`)
  }

  return (
    <div>
      {/* Hero */}
      <div style={s.hero}>
        <div style={s.glow} />
        <div className="container">
          <div className="animate-fadeUp" style={{ marginBottom: 40 }}>
            <div style={s.tag}>🚆 India's Modern Rail Booking</div>
            <h1 style={s.title}>Travel India<br /><span style={{ color: 'var(--accent)' }}>On Rails</span></h1>
            <p style={s.subtitle}>Search, compare & book train tickets instantly.<br />Real-time seat availability.</p>
          </div>

          {/* Search Box */}
          <div className="card animate-fadeUp" style={{ borderColor: 'var(--border-lit)', boxShadow: 'var(--shadow-lg)' }}>
            <form onSubmit={handleSearch}>
              <div style={s.fields}>
                <div style={s.field}>
                  <label style={s.label}>From</label>
                  <input placeholder="Departure city" value={form.from}
                    onChange={e => setForm(f => ({ ...f, from: e.target.value }))} required />
                </div>

                <button type="button" style={s.swapBtn}
                  onClick={() => setForm(f => ({ ...f, from: f.to, to: f.from }))}>⇄</button>

                <div style={s.field}>
                  <label style={s.label}>To</label>
                  <input placeholder="Destination city" value={form.to}
                    onChange={e => setForm(f => ({ ...f, to: e.target.value }))} required />
                </div>

                <div style={s.field}>
                  <label style={s.label}>Date</label>
                  <input type="date" value={form.date} min={today}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                </div>

                <div style={{ ...s.field, maxWidth: 150 }}>
                  <label style={s.label}>Passengers</label>
                  <select value={form.passengers} onChange={e => setForm(f => ({ ...f, passengers: e.target.value }))}>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15, marginTop: 16 }}>
                Search Trains →
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Popular Routes */}
      <div className="container">
        <h2 style={s.sectionTitle}>Popular Routes</h2>
        <div style={s.routeGrid}>
          {POPULAR.map((r, i) => (
            <button key={i} style={s.routeCard}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
              onClick={() => setForm(f => ({ ...f, from: r.from, to: r.to }))}>
              <span style={{ fontFamily: 'var(--font-head)', fontWeight: 600 }}>{r.from}</span>
              <span style={{ color: 'var(--accent)' }}>→</span>
              <span style={{ fontFamily: 'var(--font-head)', fontWeight: 600 }}>{r.to}</span>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          {[
            { n: '10K+', l: 'Daily Trains',    icon: '🚆' },
            { n: '500+', l: 'Stations',        icon: '🏛️' },
            { n: '2M+',  l: 'Passengers/Day',  icon: '👥' },
            { n: '99%',  l: 'On-time Rate',    icon: '⚡' },
          ].map((s2, i) => (
            <div key={i} className="card animate-fadeUp" style={{ textAlign: 'center', animationDelay: `${i * 0.1}s` }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s2.icon}</div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>{s2.n}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s2.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const s = {
  hero:     { position: 'relative', padding: '80px 0 60px', overflow: 'hidden' },
  glow:     { position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(245,166,35,0.08) 0%, transparent 70%)', pointerEvents: 'none' },
  tag:      { display: 'inline-block', fontSize: 12, color: 'var(--accent)', background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 20, padding: '5px 14px', marginBottom: 20, letterSpacing: '0.06em' },
  title:    { fontFamily: 'var(--font-head)', fontSize: 'clamp(40px,7vw,72px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 16 },
  subtitle: { fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7 },
  fields:   { display: 'grid', gridTemplateColumns: '1fr auto 1fr 1fr auto', gap: 12, alignItems: 'end' },
  field:    { display: 'flex', flexDirection: 'column', gap: 6 },
  label:    { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-head)' },
  swapBtn:  { background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text-muted)', borderRadius: 8, width: 40, height: 42, fontSize: 18, cursor: 'pointer', alignSelf: 'end' },
  sectionTitle: { fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700, margin: '48px 0 16px' },
  routeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 12, marginBottom: 40 },
  routeCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s', fontSize: 14 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, paddingBottom: 60 },
}