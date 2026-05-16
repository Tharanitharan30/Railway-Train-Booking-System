import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const STATUS_STYLES = {
  Confirmed: 'badge-green',
  Cancelled: 'badge-red',
  Pending: 'badge-orange',
}

export default function MyBookings() {
  const { user } = useAuth()
  const { addToast } = useToast()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    api
      .get('/bookings/my')
      .then((response) => setBookings(response.data))
      .catch(() => addToast('Failed to load bookings', 'error'))
      .finally(() => setLoading(false))
  }, [addToast])

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return

    setCancelling(bookingId)

    try {
      await api.patch(`/bookings/${bookingId}/cancel`)
      setBookings((current) =>
        current.map((booking) => (booking._id === bookingId ? { ...booking, status: 'Cancelled' } : booking))
      )
      addToast('Booking cancelled', 'success')
    } catch (error) {
      addToast(error.response?.data?.message || 'Cancellation failed', 'error')
    } finally {
      setCancelling(null)
    }
  }

  const filteredBookings =
    filter === 'All' ? bookings : bookings.filter((booking) => booking.status === filter)

  const bookingCounts = {
    All: bookings.length,
    Confirmed: bookings.filter((booking) => booking.status === 'Confirmed').length,
    Cancelled: bookings.filter((booking) => booking.status === 'Cancelled').length,
  }

  return (
    <div className="page">
      <div className="container">
        <section className="card panel-highlight animate-fadeUp" style={styles.heroCard}>
          <div style={styles.heroTop}>
            <div>
              <div className="section-kicker">Traveler Dashboard</div>
              <h1 style={styles.pageTitle}>My bookings</h1>
              <p className="muted" style={{ marginTop: 10 }}>
                Welcome back, <strong style={{ color: 'var(--accent-strong)' }}>{user?.name}</strong>. Review your
                trips, PNR numbers, and live booking status in one place.
              </p>
            </div>

            <div style={styles.filterRow}>
              {['All', 'Confirmed', 'Cancelled'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  style={{
                    ...styles.filterButton,
                    ...(filter === item ? styles.filterButtonActive : {}),
                  }}
                >
                  <span>{item}</span>
                  <span style={styles.filterCount}>{bookingCounts[item]}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 24 }}>
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                style={{
                  height: 260,
                  borderRadius: 30,
                  background: 'rgba(255, 252, 245, 0.7)',
                  border: '1px solid rgba(18, 49, 73, 0.08)',
                  animation: 'pulse 1.5s ease infinite',
                }}
              />
            ))}
          </div>
        )}

        {!loading && filteredBookings.length === 0 && (
          <div className="card" style={styles.emptyCard}>
            <div className="section-kicker">No bookings yet</div>
            <h2 style={styles.emptyTitle}>Your travel history will appear here.</h2>
            <p className="muted">Search and confirm a train ticket to start building your trip dashboard.</p>
          </div>
        )}

        {!loading && filteredBookings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 24 }}>
            {filteredBookings.map((booking, index) => {
              const train = booking.train
              const isPastJourney = new Date(booking.journeyDate) < new Date()

              return (
                <article key={booking._id} className="card animate-fadeUp" style={{ ...styles.bookingCard, animationDelay: `${index * 0.06}s` }}>
                  <div style={styles.bookingTop}>
                    <div>
                      <div style={styles.pnrLabel}>PNR Number</div>
                      <div style={styles.pnrValue}>{booking.pnrNumber}</div>
                    </div>

                    <div style={styles.statusGroup}>
                      <span className={`badge ${STATUS_STYLES[booking.status]}`}>{booking.status}</span>
                      {isPastJourney && booking.status === 'Confirmed' && <span className="badge badge-blue">Completed</span>}
                    </div>
                  </div>

                  <div style={styles.bookingMiddle}>
                    <div style={styles.trainMeta}>
                      <div style={styles.trainNumber}>{train?.trainNumber}</div>
                      <h2 style={styles.trainName}>{train?.name || 'Train'}</h2>
                      <p className="muted" style={{ marginTop: 8 }}>
                        {new Date(booking.journeyDate).toDateString()}
                      </p>
                    </div>

                    <div style={styles.routeCard}>
                      <div>
                        <div style={styles.routeTime}>{train?.departureTime}</div>
                        <div style={styles.routeStation}>{train?.from}</div>
                      </div>
                      <div style={styles.routeMiddle}>
                        <div style={styles.routeLine} />
                        <span style={styles.routePill}>Scheduled journey</span>
                        <div style={styles.routeLine} />
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={styles.routeTime}>{train?.arrivalTime}</div>
                        <div style={styles.routeStation}>{train?.to}</div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.metaGrid}>
                    {[
                      ['Class', booking.class],
                      ['Passengers', booking.passengers?.length],
                      ['Amount', `Rs ${booking.totalAmount}`],
                      ['Status', booking.status],
                    ].map(([label, value]) => (
                      <div key={label} style={styles.metaItem}>
                        <div style={styles.metaLabel}>{label}</div>
                        <div style={styles.metaValue}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {booking.passengers?.length > 0 && (
                    <div style={styles.passengerWrap}>
                      {booking.passengers.map((passenger, passengerIndex) => (
                        <div key={`${passenger.name}-${passengerIndex}`} style={styles.passengerChip}>
                          <span style={styles.passengerIndex}>{passengerIndex + 1}</span>
                          <div>
                            <div style={{ fontWeight: 700 }}>{passenger.name}</div>
                            <div className="muted" style={{ fontSize: 12 }}>
                              {passenger.age} yrs · {passenger.gender}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {booking.status === 'Confirmed' && !isPastJourney && (
                    <div style={styles.actionRow}>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleCancel(booking._id)}
                        disabled={cancelling === booking._id}
                      >
                        {cancelling === booking._id ? <><span className="loader" /> Cancelling</> : 'Cancel Booking'}
                      </button>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  heroCard: {
    padding: 28,
    borderRadius: 34,
  },
  heroTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 18,
    alignItems: 'end',
    flexWrap: 'wrap',
  },
  pageTitle: {
    fontFamily: 'var(--font-head)',
    fontSize: 'clamp(36px, 5vw, 54px)',
    lineHeight: 1.02,
    letterSpacing: '-0.05em',
  },
  filterRow: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  filterButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '11px 14px',
    borderRadius: 999,
    border: '1px solid rgba(18, 49, 73, 0.12)',
    background: 'rgba(255,255,255,0.74)',
    cursor: 'pointer',
    color: 'var(--text)',
    fontWeight: 700,
  },
  filterButtonActive: {
    background: 'linear-gradient(135deg, #e09a32 0%, #c57810 100%)',
    color: '#fffdf7',
    borderColor: 'transparent',
  },
  filterCount: {
    minWidth: 28,
    padding: '4px 8px',
    borderRadius: 999,
    background: 'rgba(18, 49, 73, 0.08)',
    fontSize: 12,
  },
  emptyCard: {
    marginTop: 24,
    padding: '42px 24px',
    textAlign: 'center',
  },
  emptyTitle: {
    marginTop: 16,
    fontFamily: 'var(--font-head)',
    fontSize: 'clamp(28px, 4vw, 40px)',
    lineHeight: 1.08,
    letterSpacing: '-0.04em',
  },
  bookingCard: {
    borderRadius: 30,
    padding: 24,
  },
  bookingTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    gap: 16,
    flexWrap: 'wrap',
  },
  pnrLabel: {
    color: 'var(--text-dim)',
    fontFamily: 'var(--font-head)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  pnrValue: {
    marginTop: 8,
    fontFamily: 'var(--font-head)',
    fontSize: 28,
    fontWeight: 800,
    color: 'var(--accent-strong)',
    letterSpacing: '0.02em',
  },
  statusGroup: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  bookingMiddle: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 20,
    marginTop: 22,
    alignItems: 'center',
  },
  trainMeta: {
    padding: 20,
    borderRadius: 24,
    background: 'rgba(255,255,255,0.74)',
    border: '1px solid rgba(18, 49, 73, 0.08)',
  },
  trainNumber: {
    color: 'var(--accent-strong)',
    fontFamily: 'var(--font-head)',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  trainName: {
    fontFamily: 'var(--font-head)',
    fontSize: 28,
    lineHeight: 1.06,
    letterSpacing: '-0.04em',
  },
  routeCard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: 16,
    alignItems: 'center',
    padding: 22,
    borderRadius: 24,
    background: 'rgba(255,255,255,0.72)',
    border: '1px solid rgba(18, 49, 73, 0.08)',
  },
  routeTime: {
    fontFamily: 'var(--font-head)',
    fontSize: 'clamp(26px, 4vw, 34px)',
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: '-0.04em',
  },
  routeStation: {
    marginTop: 6,
    color: 'var(--text-muted)',
  },
  routeMiddle: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  routeLine: {
    flex: 1,
    height: 2,
    background: 'linear-gradient(90deg, rgba(215,137,29,0.8), rgba(18,49,73,0.18))',
  },
  routePill: {
    padding: '7px 10px',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.92)',
    color: 'var(--text-muted)',
    fontSize: 12,
    whiteSpace: 'nowrap',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 12,
    marginTop: 18,
  },
  metaItem: {
    padding: 16,
    borderRadius: 20,
    background: 'rgba(255,255,255,0.72)',
    border: '1px solid rgba(18, 49, 73, 0.08)',
  },
  metaLabel: {
    color: 'var(--text-dim)',
    fontFamily: 'var(--font-head)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  metaValue: {
    fontFamily: 'var(--font-head)',
    fontSize: 18,
    fontWeight: 700,
  },
  passengerWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 18,
  },
  passengerChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 14px',
    borderRadius: 20,
    background: 'rgba(255,255,255,0.78)',
    border: '1px solid rgba(18, 49, 73, 0.08)',
  },
  passengerIndex: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #e09a32 0%, #c57810 100%)',
    color: '#fff',
    fontFamily: 'var(--font-head)',
    fontWeight: 800,
    fontSize: 12,
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 18,
    borderTop: '1px solid rgba(18, 49, 73, 0.1)',
  },
}
