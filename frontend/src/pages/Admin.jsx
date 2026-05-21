import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth }  from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const EMPTY = {
  trainNumber: '', name: '', from: '', to: '',
  departureTime: '', arrivalTime: '',
  totalSeats: 200, availableSeats: 200, price: 500,
  classes: [
    { type: 'Sleeper', price: 300,  seats: 100 },
    { type: '3AC',     price: 600,  seats: 60  },
    { type: '2AC',     price: 900,  seats: 30  },
    { type: '1AC',     price: 1400, seats: 10  },
  ],
  daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
}

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function Admin() {
  const { user }     = useAuth()
  const navigate     = useNavigate()
  const { addToast } = useToast()

  const [trains,    setTrains]    = useState([])
  const [form,      setForm]      = useState(EMPTY)
  const [loading,   setLoading]   = useState(false)
  const [fetching,  setFetching]  = useState(true)
  const [tab,       setTab]       = useState('trains')
  const [deleteId,  setDeleteId]  = useState(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return }
    fetchTrains()
  }, [user])

  const fetchTrains = async () => {
    setFetching(true)
    try {
      const res = await api.get('/trains')
      setTrains(res.data)
    } catch {
      addToast('Failed to load trains', 'error')
    } finally {
      setFetching(false)
    }
  }

  const updateClass = (i, field, value) => {
    setForm(f => ({
      ...f,
      classes: f.classes.map((c, ci) => ci === i ? { ...c, [field]: +value } : c),
    }))
  }

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      daysOfOperation: f.daysOfOperation.includes(day)
        ? f.daysOfOperation.filter(d => d !== day)
        : [...f.daysOfOperation, day],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/trains', form)
      addToast(`🚆 "${form.name}" added successfully!`, 'success')
      setForm(EMPTY)
      fetchTrains()
      setTab('trains')
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add train', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this train?')) return
    setDeleteId(id)
    try {
      await api.delete(`/trains/${id}`)
      setTrains(t => t.filter(tr => tr._id !== id))
      addToast('Train deleted', 'success')
    } catch {
      addToast('Failed to delete train', 'error')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="page">
      <div className="container">

        {/* ── Page Header ── */}
        <div style={s.pageHeader} className="animate-fadeUp">
          <div>
            <div style={s.adminTag}>⚙️ Admin Panel</div>
            <h1 style={s.pageTitle}>Train Management</h1>
          </div>
          <div style={s.statsRow}>
            <div style={s.statBox}>
              <span style={s.statNum}>{trains.length}</span>
              <span style={s.statLabel}>Total Trains</span>
            </div>
            <div style={s.statBox}>
              <span style={s.statNum}>{trains.reduce((a, t) => a + t.availableSeats, 0)}</span>
              <span style={s.statLabel}>Total Seats</span>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={s.tabs} className="animate-fadeUp">
          {[
            { key: 'trains', label: '🚆 All Trains' },
            { key: 'add',    label: '+ Add New Train' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ ...s.tabBtn, ...(tab === t.key ? s.tabActive : {}) }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════
            TAB 1 — ALL TRAINS
        ══════════════════════════════════════ */}
        {tab === 'trains' && (
          <div className="animate-fadeUp">
            {fetching ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1,2,3].map(i => <div key={i} style={s.skeleton} />)}
              </div>
            ) : trains.length === 0 ? (
              <div style={s.empty}>
                <span style={{ fontSize: 48 }}>🚉</span>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 20 }}>No trains yet</h3>
                <button className="btn btn-primary" onClick={() => setTab('add')}>Add First Train</button>
              </div>
            ) : (
              <div style={s.tableWrap}>
                {/* Table Header */}
                <div style={s.tableHead}>
                  <span>Train</span>
                  <span>Route</span>
                  <span>Timing</span>
                  <span>Seats</span>
                  <span>Price</span>
                  <span>Action</span>
                </div>

                {/* Table Rows */}
                {trains.map(t => (
                  <div key={t._id} style={s.tableRow}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div>
                      <div style={s.trainNum}>{t.trainNumber}</div>
                      <div style={s.trainName}>{t.name}</div>
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                      {t.from} → {t.to}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {t.departureTime} – {t.arrivalTime}
                    </div>
                    <div>
                      <span className={`badge ${
                        t.availableSeats > 50 ? 'badge-green' :
                        t.availableSeats > 0  ? 'badge-orange' : 'badge-red'
                      }`}>
                        {t.availableSeats}/{t.totalSeats}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--text)' }}>
                      ₹{t.price}
                    </div>
                    <div>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '6px 14px', fontSize: 12 }}
                        onClick={() => handleDelete(t._id)}
                        disabled={deleteId === t._id}
                      >
                        {deleteId === t._id ? <span className="loader" /> : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════
            TAB 2 — ADD TRAIN FORM
        ══════════════════════════════════════ */}
        {tab === 'add' && (
          <form onSubmit={handleSubmit} className="animate-fadeUp" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* ── Section 1: Basic Info ── */}
            <div style={s.section}>
              <h3 style={s.sectionTitle}>🚆 Basic Information</h3>
              <div style={s.grid2}>
                {[
                  { label: 'Train Number *', key: 'trainNumber', placeholder: 'e.g. 12621' },
                  { label: 'Train Name *',   key: 'name',        placeholder: 'e.g. Tamil Nadu Express' },
                  { label: 'From *',         key: 'from',        placeholder: 'Departure city' },
                  { label: 'To *',           key: 'to',          placeholder: 'Destination city' },
                ].map(f => (
                  <div key={f.key} style={s.field}>
                    <label style={s.label}>{f.label}</label>
                    <input
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Section 2: Timing & Seats ── */}
            <div style={s.section}>
              <h3 style={s.sectionTitle}>⏰ Timing & Seats</h3>
              <div style={s.grid4}>
                <div style={s.field}>
                  <label style={s.label}>Departure Time *</label>
                  <input type="time" value={form.departureTime}
                    onChange={e => setForm(p => ({ ...p, departureTime: e.target.value }))} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Arrival Time *</label>
                  <input type="time" value={form.arrivalTime}
                    onChange={e => setForm(p => ({ ...p, arrivalTime: e.target.value }))} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Total Seats</label>
                  <input type="number" min="1" value={form.totalSeats}
                    onChange={e => setForm(p => ({ ...p, totalSeats: +e.target.value, availableSeats: +e.target.value }))} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Base Price (₹)</label>
                  <input type="number" min="1" value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: +e.target.value }))} />
                </div>
              </div>
            </div>

            {/* ── Section 3: Class Pricing ── */}
            <div style={s.section}>
              <h3 style={s.sectionTitle}>💺 Class Pricing</h3>
              <div style={s.grid4}>
                {form.classes.map((cls, i) => (
                  <div key={cls.type} style={s.classCard}>
                    <div style={s.classType}>{cls.type}</div>
                    <div style={s.field}>
                      <label style={s.label}>Price (₹)</label>
                      <input type="number" min="0" value={cls.price}
                        onChange={e => updateClass(i, 'price', e.target.value)} />
                    </div>
                    <div style={s.field}>
                      <label style={s.label}>Seats</label>
                      <input type="number" min="0" value={cls.seats}
                        onChange={e => updateClass(i, 'seats', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Section 4: Days of Operation ── */}
            <div style={s.section}>
              <h3 style={s.sectionTitle}>📅 Days of Operation</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {DAYS.map(day => (
                  <button key={day} type="button"
                    onClick={() => toggleDay(day)}
                    style={{
                      ...s.dayBtn,
                      ...(form.daysOfOperation.includes(day) ? s.dayBtnActive : {}),
                    }}>
                    {day}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
                {form.daysOfOperation.length === 7
                  ? '✅ Runs every day'
                  : `Runs on: ${form.daysOfOperation.join(', ') || 'None selected'}`}
              </p>
            </div>

            {/* ── Preview Banner ── */}
            {form.trainNumber && form.name && form.from && form.to && (
              <div style={s.preview}>
                <span style={{ fontSize: 20 }}>🚆</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15 }}>
                    {form.trainNumber} — {form.name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                    {form.from} → {form.to} &nbsp;·&nbsp; {form.departureTime || '--:--'} to {form.arrivalTime || '--:--'} &nbsp;·&nbsp; {form.totalSeats} seats &nbsp;·&nbsp; ₹{form.price} base
                  </div>
                </div>
              </div>
            )}

            {/* ── Submit ── */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary"
                onClick={() => setForm(EMPTY)}>
                Reset Form
              </button>
              <button type="submit" className="btn btn-primary"
                style={{ padding: '12px 32px' }} disabled={loading}>
                {loading
                  ? <><span className="loader" /> Adding Train...</>
                  : '+ Add Train'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  )
}

const s = {
  pageHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 },
  adminTag:     { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--accent)', textTransform: 'uppercase', fontFamily: 'var(--font-head)', marginBottom: 6 },
  pageTitle:    { fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' },
  statsRow:     { display: 'flex', gap: 12 },
  statBox:      { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 24px', textAlign: 'center' },
  statNum:      { display: 'block', fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 800, color: 'var(--accent)' },
  statLabel:    { fontSize: 12, color: 'var(--text-muted)' },
  tabs:         { display: 'flex', gap: 0, marginBottom: 28, borderBottom: '1px solid var(--border)' },
  tabBtn:       { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font-head)', fontWeight: 600, padding: '10px 24px', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -1, transition: 'all 0.2s' },
  tabActive:    { color: 'var(--accent)', borderBottomColor: 'var(--accent)' },
  skeleton:     { height: 56, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, animation: 'pulse 1.5s ease infinite' },
  empty:        { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '80px 0', textAlign: 'center' },
  tableWrap:    { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' },
  tableHead:    { display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 1fr', padding: '12px 20px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-head)' },
  tableRow:     { display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', transition: 'background 0.15s', cursor: 'default' },
  trainNum:     { fontSize: 11, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-head)', letterSpacing: '0.06em' },
  trainName:    { fontSize: 14, fontWeight: 600, color: 'var(--text)', marginTop: 2 },
  section:      { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 },
  sectionTitle: { fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--border)' },
  grid2:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  grid4:        { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  field:        { display: 'flex', flexDirection: 'column', gap: 6 },
  label:        { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--font-head)' },
  classCard:    { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  classType:    { fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 800, color: 'var(--accent)', marginBottom: 4 },
  dayBtn:       { background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-head)' },
  dayBtnActive: { background: 'rgba(245,166,35,0.1)', borderColor: 'var(--accent)', color: 'var(--accent)' },
  preview:      { display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 10, padding: '14px 18px' },
}