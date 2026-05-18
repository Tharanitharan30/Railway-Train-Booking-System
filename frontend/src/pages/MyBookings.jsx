import { useEffect, useRef, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const STATUS_STYLES = {
  Confirmed: 'badge-green',
  Cancelled: 'badge-red',
  Pending: 'badge-orange',
}

const FILTERS = ['All', 'Confirmed', 'Pending', 'Cancelled']

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0)

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

const monthLabel = (date) =>
  date.toLocaleDateString('en-IN', {
    month: 'short',
  })

const getStatusCounts = (bookings) => ({
  All: bookings.length,
  Confirmed: bookings.filter((booking) => booking.status === 'Confirmed').length,
  Pending: bookings.filter((booking) => booking.status === 'Pending').length,
  Cancelled: bookings.filter((booking) => booking.status === 'Cancelled').length,
})

const getMonthlyActivity = (bookings) => {
  const today = new Date()
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1)
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: monthLabel(date),
      count: 0,
    }
  })

  bookings.forEach((booking) => {
    const date = new Date(booking.journeyDate)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    const targetMonth = months.find((month) => month.key === key)
    if (targetMonth) targetMonth.count += 1
  })

  return months
}

const getTopRoutes = (bookings) => {
  const routeMap = bookings.reduce((accumulator, booking) => {
    const from = booking.train?.from || 'Unknown'
    const to = booking.train?.to || 'Unknown'
    const key = `${from} - ${to}`
    accumulator[key] = (accumulator[key] || 0) + 1
    return accumulator
  }, {})

  return Object.entries(routeMap)
    .map(([route, count]) => ({ route, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 3)
}

function LoadingState() {
  return (
    <div style={styles.loadingLayout}>
      <div style={styles.summaryGrid}>
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="card skeleton-card" style={styles.summaryCard}>
            <div className="skeleton-line skeleton-line--sm" />
            <div className="skeleton-line skeleton-line--lg" />
            <div className="skeleton-line skeleton-line--md" />
          </div>
        ))}
      </div>

      <div style={styles.chartGrid}>
        {[1, 2].map((item) => (
          <div key={item} className="card skeleton-card" style={styles.chartCard}>
            <div className="skeleton-line skeleton-line--sm" />
            <div className="skeleton-line skeleton-line--md" />
            <div className="skeleton-block" style={{ height: 190, marginTop: 18 }} />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 18 }}>
        {[1, 2, 3].map((item) => (
          <div key={item} className="card skeleton-card" style={styles.bookingCard}>
            <div className="skeleton-line skeleton-line--md" />
            <div className="skeleton-block" style={{ height: 96, marginTop: 18 }} />
            <div className="skeleton-block" style={{ height: 68, marginTop: 14 }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MyBookings() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const analyticsRef = useRef(null)
  const bookingsRef = useRef(null)

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
      const response = await api.patch(`/bookings/${bookingId}/cancel`)
      const updatedBooking = response.data?.booking

      setBookings((current) =>
        current.map((booking) => (booking._id === bookingId ? updatedBooking || booking : booking))
      )

      addToast(response.data?.message || 'Booking cancelled', 'success')
    } catch (error) {
      addToast(error.response?.data?.message || 'Cancellation failed', 'error')
    } finally {
      setCancelling(null)
    }
  }

  const statusCounts = getStatusCounts(bookings)
  const filteredBookings = filter === 'All' ? bookings : bookings.filter((booking) => booking.status === filter)
  const monthlyActivity = getMonthlyActivity(bookings)
  const topRoutes = getTopRoutes(bookings)
  const maxMonthlyCount = Math.max(...monthlyActivity.map((item) => item.count), 1)
  const totalBookedAmount = bookings
    .filter((booking) => booking.status !== 'Cancelled')
    .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
  const upcomingBookings = bookings.filter(
    (booking) => booking.status === 'Confirmed' && new Date(booking.journeyDate) >= new Date()
  ).length
  const completedTrips = bookings.filter(
    (booking) => booking.status === 'Confirmed' && new Date(booking.journeyDate) < new Date()
  ).length
  const totalPassengers = bookings.reduce((sum, booking) => sum + (booking.passengers?.length || 0), 0)

  const statusSegments = [
    { label: 'Confirmed', value: statusCounts.Confirmed, color: 'var(--green)' },
    { label: 'Pending', value: statusCounts.Pending, color: 'var(--accent)' },
    { label: 'Cancelled', value: statusCounts.Cancelled, color: 'var(--red)' },
  ]

  const scrollToSection = (targetRef) => {
    targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="page">
      <div className="container">
        <section className="card panel-highlight animate-fadeUp" style={styles.heroCard}>
          <div style={styles.heroContent}>
            <div>
              <div className="section-kicker">Booking Dashboard</div>
              <h1 style={styles.pageTitle}>My bookings</h1>
              <p className="muted" style={styles.heroCopy}>
                Welcome back, <strong style={{ color: 'var(--accent-strong)' }}>{user?.name || 'traveler'}</strong>.
                Track your upcoming trips, review past journeys, and manage tickets from one clean view.
              </p>
            </div>

            <div style={styles.heroActions}>
              <button type="button" className="btn btn-secondary" onClick={() => scrollToSection(analyticsRef)}>
                View analytics
              </button>
              <button type="button" className="btn btn-primary" onClick={() => scrollToSection(bookingsRef)}>
                View bookings
              </button>
            </div>
          </div>
        </section>

        {loading ? (
          <LoadingState />
        ) : (
          <>
            <section className="animate-fadeUp" style={styles.summarySection}>
              <div style={styles.summaryGrid}>
                <div className="card" style={styles.summaryCard}>
                  <span style={styles.summaryLabel}>Total bookings</span>
                  <strong style={styles.summaryValue}>{statusCounts.All}</strong>
                  <span className="muted">Across all journey statuses</span>
                </div>

                <div className="card" style={styles.summaryCard}>
                  <span style={styles.summaryLabel}>Upcoming trips</span>
                  <strong style={styles.summaryValue}>{upcomingBookings}</strong>
                  <span className="muted">Confirmed journeys still ahead</span>
                </div>

                <div className="card" style={styles.summaryCard}>
                  <span style={styles.summaryLabel}>Passengers served</span>
                  <strong style={styles.summaryValue}>{totalPassengers}</strong>
                  <span className="muted">Seats booked across all tickets</span>
                </div>

                <div className="card" style={styles.summaryCard}>
                  <span style={styles.summaryLabel}>Booked value</span>
                  <strong style={styles.summaryValue}>{formatCurrency(totalBookedAmount)}</strong>
                  <span className="muted">{completedTrips} completed confirmed trips</span>
                </div>
              </div>
            </section>

            <section ref={analyticsRef} className="animate-fadeUp" style={styles.analyticsSection}>
              <div style={styles.sectionHeader}>
                <div>
                  <div className="section-kicker">Insights</div>
                  <h2 className="section-title">Simple travel analytics</h2>
                </div>
              </div>

              <div style={styles.chartGrid}>
                <article className="card" style={styles.chartCard}>
                  <div style={styles.chartHeader}>
                    <div>
                      <h3 style={styles.chartTitle}>Status overview</h3>
                      <p className="muted">A quick look at your booking distribution.</p>
                    </div>
                    <span className="badge badge-blue">{statusCounts.All} total</span>
                  </div>

                  <div style={styles.statusBar}>
                    {statusSegments.map((segment) => {
                      const width = statusCounts.All ? `${(segment.value / statusCounts.All) * 100}%` : '0%'

                      return (
                        <span
                          key={segment.label}
                          style={{
                            ...styles.statusBarSegment,
                            width,
                            background: segment.color,
                          }}
                        />
                      )
                    })}
                  </div>

                  <div style={styles.legendList}>
                    {statusSegments.map((segment) => (
                      <div key={segment.label} style={styles.legendItem}>
                        <span style={{ ...styles.legendSwatch, background: segment.color }} />
                        <div>
                          <div style={styles.legendLabel}>{segment.label}</div>
                          <div className="muted">
                            {segment.value} booking{segment.value === 1 ? '' : 's'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="card" style={styles.chartCard}>
                  <div style={styles.chartHeader}>
                    <div>
                      <h3 style={styles.chartTitle}>Journey activity</h3>
                      <p className="muted">Bookings grouped by journey month.</p>
                    </div>
                    <span className="badge badge-orange">Last 6 months</span>
                  </div>

                  <div style={styles.barChart}>
                    {monthlyActivity.map((item) => (
                      <div key={item.key} style={styles.barColumn}>
                        <span style={styles.barValue}>{item.count}</span>
                        <div style={styles.barTrack}>
                          <span
                            style={{
                              ...styles.barFill,
                              height: `${Math.max((item.count / maxMonthlyCount) * 100, item.count ? 18 : 6)}%`,
                            }}
                          />
                        </div>
                        <span style={styles.barLabel}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </article>
              </div>

              <div className="card" style={styles.routesCard}>
                <div style={styles.chartHeader}>
                  <div>
                    <h3 style={styles.chartTitle}>Frequent routes</h3>
                    <p className="muted">Your most repeated travel corridors.</p>
                  </div>
                </div>

                <div style={styles.routeStats}>
                  {topRoutes.length > 0 ? (
                    topRoutes.map((item, index) => (
                      <div key={item.route} style={styles.routeStatItem}>
                        <span style={styles.routeRank}>0{index + 1}</span>
                        <div>
                          <div style={styles.routeName}>{item.route}</div>
                          <div className="muted">
                            {item.count} booking{item.count === 1 ? '' : 's'}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="muted">Your route insights will appear after your first booking.</p>
                  )}
                </div>
              </div>
            </section>

            <section ref={bookingsRef} className="animate-fadeUp" style={styles.listSection}>
              <div style={styles.sectionHeader}>
                <div>
                  <div className="section-kicker">Tickets</div>
                  <h2 className="section-title">Booking history</h2>
                </div>

                <div style={styles.filterRow}>
                  {FILTERS.map((item) => (
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
                      <span style={styles.filterCount}>{statusCounts[item]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="card" style={styles.emptyCard}>
                  <div className="section-kicker">No results</div>
                  <h3 style={styles.emptyTitle}>No bookings found for this filter.</h3>
                  <p className="muted">Try another filter or book a new trip to see more activity here.</p>
                </div>
              ) : (
                <div style={styles.bookingList}>
                  {filteredBookings.map((booking, index) => {
                    const train = booking.train
                    const isPastJourney = new Date(booking.journeyDate) < new Date()

                    return (
                      <article
                        key={booking._id}
                        className="card animate-fadeUp"
                        style={{ ...styles.bookingCard, animationDelay: `${index * 0.05}s` }}
                      >
                        <div style={styles.bookingHeader}>
                          <div>
                            <div style={styles.trainNumber}>{train?.trainNumber || 'Train'}</div>
                            <h3 style={styles.bookingTitle}>{train?.name || 'Journey booking'}</h3>
                            <p className="muted">{formatDate(booking.journeyDate)}</p>
                          </div>

                          <div style={styles.bookingHeaderActions}>
                            <div style={styles.statusGroup}>
                              <span className={`badge ${STATUS_STYLES[booking.status] || 'badge-blue'}`}>
                                {booking.status}
                              </span>
                              {isPastJourney && booking.status === 'Confirmed' && (
                                <span className="badge badge-blue">Completed</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={styles.routePanel}>
                          <div>
                            <div style={styles.routeTime}>{train?.departureTime || '--:--'}</div>
                            <div style={styles.routeStation}>{train?.from || 'Origin'}</div>
                          </div>

                          <div style={styles.routeDivider}>
                            <div style={styles.routeLine} />
                            <span style={styles.routePill}>Direct journey</span>
                            <div style={styles.routeLine} />
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={styles.routeTime}>{train?.arrivalTime || '--:--'}</div>
                            <div style={styles.routeStation}>{train?.to || 'Destination'}</div>
                          </div>
                        </div>

                        <div style={styles.metaGrid}>
                          {[
                            ['PNR', booking.pnrNumber],
                            ['Class', booking.class || 'General'],
                            ['Passengers', booking.passengers?.length || 0],
                            ['Amount', formatCurrency(booking.totalAmount)],
                          ].map(([label, value]) => (
                            <div key={label} style={styles.metaItem}>
                              <div style={styles.metaLabel}>{label}</div>
                              <div style={styles.metaValue}>{value}</div>
                            </div>
                          ))}
                        </div>

                        {booking.passengers?.length > 0 && (
                          <div style={styles.passengerList}>
                            {booking.passengers.map((passenger, passengerIndex) => (
                              <div key={`${passenger.name}-${passengerIndex}`} style={styles.passengerChip}>
                                <span style={styles.passengerIndex}>{passengerIndex + 1}</span>
                                <div>
                                  <div style={styles.passengerName}>{passenger.name}</div>
                                  <div className="muted" style={{ fontSize: 12 }}>
                                    {passenger.age} yrs | {passenger.gender}
                                    {passenger.seatNumber ? ` | Seat ${passenger.seatNumber}` : ''}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {booking.status === 'Confirmed' && (
                          <div style={styles.actionRow}>
                            <button
                              type="button"
                              className={`btn ${isPastJourney ? 'btn-secondary' : 'btn-danger'}`}
                              style={styles.cancelButton}
                              onClick={() => {
                                if (!isPastJourney) handleCancel(booking._id)
                              }}
                              disabled={isPastJourney || cancelling === booking._id}
                            >
                              {cancelling === booking._id ? (
                                <>
                                  <span className="loader" /> Cancelling
                                </>
                              ) : isPastJourney ? (
                                'Cannot Cancel Completed Trip'
                              ) : (
                                'Cancel Ticket'
                              )}
                            </button>
                          </div>
                        )}

                        {booking.status === 'Cancelled' && (
                          <div style={styles.infoRow}>
                            <span className="badge badge-red">Cancelled ticket</span>
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  heroCard: {
    padding: 28,
    borderRadius: 32,
  },
  heroContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 20,
    flexWrap: 'wrap',
  },
  pageTitle: {
    fontFamily: 'var(--font-head)',
    fontSize: 'clamp(34px, 5vw, 52px)',
    lineHeight: 1.02,
    letterSpacing: '-0.05em',
  },
  heroCopy: {
    marginTop: 12,
    maxWidth: 680,
  },
  heroActions: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  loadingLayout: {
    display: 'grid',
    gap: 22,
    marginTop: 24,
  },
  summarySection: {
    marginTop: 24,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
  },
  summaryCard: {
    minHeight: 146,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: 'var(--text-dim)',
    fontFamily: 'var(--font-head)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  summaryValue: {
    margin: '10px 0 6px',
    fontFamily: 'var(--font-head)',
    fontSize: 'clamp(28px, 4vw, 36px)',
    lineHeight: 1.05,
    letterSpacing: '-0.04em',
  },
  analyticsSection: {
    marginTop: 28,
    scrollMarginTop: 96,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chartGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 18,
  },
  chartCard: {
    minHeight: 320,
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  chartTitle: {
    fontFamily: 'var(--font-head)',
    fontSize: 22,
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
  },
  statusBar: {
    display: 'flex',
    width: '100%',
    height: 14,
    overflow: 'hidden',
    borderRadius: 999,
    background: 'rgba(18, 49, 73, 0.08)',
    marginTop: 22,
  },
  statusBarSegment: {
    minWidth: 0,
    transition: 'width 0.35s ease',
  },
  legendList: {
    display: 'grid',
    gap: 12,
    marginTop: 22,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    background: 'rgba(255,255,255,0.72)',
    border: '1px solid rgba(18, 49, 73, 0.08)',
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    flexShrink: 0,
  },
  legendLabel: {
    fontFamily: 'var(--font-head)',
    fontSize: 15,
    fontWeight: 700,
  },
  barChart: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    alignItems: 'end',
    gap: 12,
    height: 230,
    marginTop: 22,
  },
  barColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    height: '100%',
  },
  barValue: {
    fontFamily: 'var(--font-head)',
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--text-muted)',
  },
  barTrack: {
    width: '100%',
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '10px 0',
    borderRadius: 18,
    background: 'linear-gradient(180deg, rgba(18, 49, 73, 0.04), rgba(18, 49, 73, 0.08))',
  },
  barFill: {
    width: '70%',
    minHeight: 6,
    borderRadius: 999,
    background: 'linear-gradient(180deg, #e09a32 0%, #c57810 100%)',
    boxShadow: '0 12px 26px rgba(199, 120, 16, 0.18)',
  },
  barLabel: {
    color: 'var(--text-muted)',
    fontSize: 12,
    fontWeight: 600,
  },
  routesCard: {
    marginTop: 18,
  },
  routeStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 14,
    marginTop: 18,
  },
  routeStatItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 20,
    background: 'rgba(255,255,255,0.76)',
    border: '1px solid rgba(18, 49, 73, 0.08)',
  },
  routeRank: {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(18,49,73,0.94), rgba(34,81,119,0.86))',
    color: '#fff',
    fontFamily: 'var(--font-head)',
    fontWeight: 800,
  },
  routeName: {
    fontFamily: 'var(--font-head)',
    fontSize: 16,
    fontWeight: 700,
  },
  listSection: {
    marginTop: 28,
    scrollMarginTop: 96,
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
    padding: '10px 14px',
    borderRadius: 999,
    border: '1px solid rgba(18, 49, 73, 0.12)',
    background: 'rgba(255,255,255,0.78)',
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
    padding: '40px 24px',
    textAlign: 'center',
  },
  emptyTitle: {
    margin: '10px 0 6px',
    fontFamily: 'var(--font-head)',
    fontSize: 'clamp(26px, 4vw, 36px)',
    lineHeight: 1.08,
    letterSpacing: '-0.04em',
  },
  bookingList: {
    display: 'grid',
    gap: 18,
  },
  bookingCard: {
    borderRadius: 28,
    padding: 24,
  },
  bookingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    flexWrap: 'wrap',
  },
  bookingHeaderActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 12,
  },
  trainNumber: {
    color: 'var(--accent-strong)',
    fontFamily: 'var(--font-head)',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  bookingTitle: {
    fontFamily: 'var(--font-head)',
    fontSize: 'clamp(24px, 4vw, 30px)',
    lineHeight: 1.06,
    letterSpacing: '-0.04em',
  },
  statusGroup: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  routePanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16,
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
    borderRadius: 24,
    background: 'rgba(255,255,255,0.74)',
    border: '1px solid rgba(18, 49, 73, 0.08)',
  },
  routeTime: {
    fontFamily: 'var(--font-head)',
    fontSize: 'clamp(24px, 4vw, 34px)',
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: '-0.04em',
  },
  routeStation: {
    marginTop: 6,
    color: 'var(--text-muted)',
  },
  routeDivider: {
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 12,
    marginTop: 18,
  },
  metaItem: {
    padding: 16,
    borderRadius: 18,
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
    marginBottom: 6,
  },
  metaValue: {
    fontFamily: 'var(--font-head)',
    fontSize: 17,
    fontWeight: 700,
  },
  passengerList: {
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
    borderRadius: 18,
    background: 'rgba(255,255,255,0.78)',
    border: '1px solid rgba(18, 49, 73, 0.08)',
  },
  passengerIndex: {
    width: 30,
    height: 30,
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
  passengerName: {
    fontWeight: 700,
  },
  cancelButton: {
    minWidth: 220,
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 18,
    borderTop: '1px solid rgba(18, 49, 73, 0.1)',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 18,
    borderTop: '1px solid rgba(18, 49, 73, 0.1)',
  },
}
