import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth }  from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const STATUS = { Confirmed: 'badge-green', Cancelled: 'badge-red', Pending: 'badge-orange' }

export default function MyBookings() {
  const { user }     = useAuth()
  const { addToast } = useToast()
  const [bookings, setBookings]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [cancelling, setCancelling] = useState(null)
  const [filter, setFilter]       = useState('All')

  useEffect(() => {
    api.get('/bookings/my')
      .then(res => setBookings(res.data))
      .catch(() => addToast('Failed to load bookings', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return
    setCancelling(id)
    try {
      await api.patch(`/bookings/${id}/cancel`)
      setBookings(b => b.map(bk => bk._id === id ? { ...bk, status: 'Cancelled' } : bk))
      addToast('Booking cancelled', 'success')
    } catch (err) {
      addToast(err.response?.data?.message || 'Cancellation failed', 'error')
    } finally {
      setCancelling(null) }
  }

  const filtered = filter === 'All' ? bookings : bookings.filter(b => b.status === filter)

  return (
    <div className="page"><div className="container">
      {/* Header */}
      <div style={s.header} className="animate-fadeUp">
        <div>
          <h1 style={s.pageTitle}>My Bookings</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
            Welcome, <strong style={{ color: 'var(--accent)' }}>{user?.name}</strong>
          </p>
        </div>
        <div style={s.filters}>
          {['All', 'Confirmed', 'Cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ ...s.filterBtn, ...(filter === f ? s.filterActive : {}) }}>
              {f} <span style={s.filterCount}>{f === 'All' ? bookings.length : bookings.filter(b => b.status === f).length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 220, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, animation: 'pulse 1.5s ease infinite' }} />)}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '80px 0', textAlign: 'center' }}>
          <span style={{ fontSize: 56 }}>🎫</span>
          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 20 }}>No bookings found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Your travel history will appear here</p>
        </div>
      )}

      {/* Booking Cards */}
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {filtered.map((booking, i) => {
            const train  = booking.train
            const isPast = new Date(booking.journeyDate) < new Date()
            return (
              <div key={booking._id} className="animate-fadeUp" style={{ ...s.card, animationDelay: `${i * 0.07}s` }}>

                {/* Card Header */}
                <div style={s.cardHead}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={s.pnrTag}>PNR</span>
                    <span style={s.pnrVal}>{booking.pnrNumber}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className={`badge ${STATUS[booking.status]}`}>{booking.status}</span>
                    {isPast && booking.status === 'Confirmed' && <span className="badge badge-blue">Completed</span>}
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '20px 20px 0' }}>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, fontFamily: 'var(--font-head)' }}>{train?.trainNumber}</div>
                    <div style={{ fontSize: 17, fontWeight: 700, fontFamily: 'var(--font-head)' }}>{train?.name || 'Train'}</div>
                  </div>

                  {/* Route */}
                  <div style={s.route}>
                    <div><div style={s.time}>{train?.departureTime}</div><div style={s.station}>{train?.from}</div></div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, margin: '0 12px' }}>
                      <div style={{ flex: 1, height: 1, background: 'var(--border-lit)' }} />
                      <span>🚆</span>
                      <div style={{ flex: 1, height: 1, background: 'var(--border-lit)' }} />
                    </div>
                    <div style={{ textAlign: 'right' }}><div style={s.time}>{train?.arrivalTime}</div><div style={s.station}>{train?.to}</div></div>
                  </div>

                  {/* Meta */}
                  <div style={s.meta}>
                    {[
                      ['Date',       new Date(booking.journeyDate).toDateString()],
                      ['Class',      booking.class],
                      ['Passengers', booking.passengers?.length],
                      ['Amount',     `₹${booking.totalAmount}`],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-head)' }}>{k}</span>
                        <span style={{ fontSize: 14, fontWeight: 500, color: k === 'Amount' ? 'var(--accent)' : 'var(--text)', fontFamily: k === 'Amount' ? 'var(--font-head)' : 'inherit', fontWeight: k === 'Amount' ? 700 : 500 }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Passengers */}
                  {booking.passengers?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '14px 0' }}>
                      {booking.passengers.map((p, pi) => (
                        <div key={pi} style={s.passengerTag}>
                          <span style={s.passengerNum}>{pi + 1}</span>
                          <span>{p.name}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{p.age}y · {p.gender}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cancel Button */}
                {booking.status === 'Confirmed' && !isPast && (
                  <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-danger" style={{ padding: '9px 20px', fontSize: 13 }}
                      onClick={() => handleCancel(booking._id)} disabled={cancelling === booking._id}>
                      {cancelling === booking._id ? <><span className="loader" /> Cancelling...</> : 'Cancel Booking'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div></div>
  )
}

const s = {
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
  pageTitle:    { fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' },
  filters:      { display: 'flex', gap: 8 },
  filterBtn:    { background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', transition: 'all 0.2s' },
  filterActive: { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#0a0c10', fontWeight: 600 },
  filterCount:  { background: 'rgba(0,0,0,0.15)', borderRadius: 10, padding: '1px 7px', fontSize: 11 },
  card:         { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' },
  cardHead:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' },
  pnrTag:       { fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-dim)', fontFamily: 'var(--font-head)', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '2px 7px', borderRadius: 4 },
  pnrVal:       { fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.04em' },
  route:        { display: 'flex', alignItems: 'center', marginBottom: 16 },
  time:         { fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, lineHeight: 1 },
  station:      { fontSize: 13, color: 'var(--text-muted)', marginTop: 3 },
  meta:         { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, padding: 14, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 4 },
  passengerTag: { display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '5px 12px 5px 6px', fontSize: 13, color: 'var(--text-muted)' },
  passengerNum: { width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', color: '#0a0c10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-head)' },
}