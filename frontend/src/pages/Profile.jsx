import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const formatDateTime = (value) =>
  new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

const getInitials = (name = 'User') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U'

const getFavoriteRoute = (bookings) => {
  const routeCounts = bookings.reduce((accumulator, booking) => {
    const from = booking.train?.from
    const to = booking.train?.to
    if (!from || !to) return accumulator

    const key = `${from} - ${to}`
    accumulator[key] = (accumulator[key] || 0) + 1
    return accumulator
  }, {})

  return Object.entries(routeCounts).sort((left, right) => right[1] - left[1])[0]?.[0] || 'No journeys yet'
}

export default function Profile() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [profileUser, setProfileUser] = useState(user)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([api.get('/auth/me'), api.get('/bookings/my')])
      .then(([userResponse, bookingsResponse]) => {
        if (!active) return
        setProfileUser(userResponse.data)
        setBookings(bookingsResponse.data)
      })
      .catch(() => addToast('Could not load profile insights', 'error'))
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [addToast])

  const profileStats = useMemo(() => {
    const confirmed = bookings.filter((booking) => booking.status === 'Confirmed')
    const upcoming = confirmed.filter((booking) => new Date(booking.journeyDate) >= new Date())
    const completed = confirmed.filter((booking) => new Date(booking.journeyDate) < new Date())
    const passengers = bookings.reduce((sum, booking) => sum + (booking.passengers?.length || 0), 0)

    return [
      { label: 'Total bookings', value: bookings.length, note: 'All trip records' },
      { label: 'Upcoming trips', value: upcoming.length, note: 'Confirmed journeys ahead' },
      { label: 'Completed trips', value: completed.length, note: 'Finished confirmed rides' },
      { label: 'Passengers booked', value: passengers, note: 'Seats reserved overall' },
    ]
  }, [bookings])

  const highlights = useMemo(
    () => [
      {
        label: 'Member since',
        value: profileUser?.createdAt ? formatDateTime(profileUser.createdAt) : 'Recently joined',
      },
      {
        label: 'Account role',
        value: profileUser?.role === 'admin' ? 'Administrator' : 'Traveler',
      },
      {
        label: 'Favorite route',
        value: getFavoriteRoute(bookings),
      },
    ],
    [bookings, profileUser]
  )

  return (
    <div className="page">
      <div className="container">
        <section className="card panel-highlight animate-fadeUp" style={styles.heroCard}>
          <div style={styles.heroLayout}>
            <div style={styles.profileBlock}>
              <div style={styles.avatar}>{getInitials(profileUser?.name || user?.name)}</div>
              <div>
                <div className="section-kicker">Traveler Profile</div>
                <h1 style={styles.title}>{profileUser?.name || user?.name || 'RailYatra traveler'}</h1>
                <p className="muted" style={styles.subtitle}>
                  Keep your account details, trip activity, and booking habits in one clean snapshot.
                </p>
              </div>
            </div>

            <div style={styles.heroActions}>
              <Link to="/my-bookings" className="btn btn-primary">
                View My Bookings
              </Link>
              <Link to="/" className="btn btn-secondary">
                Book New Journey
              </Link>
            </div>
          </div>
        </section>

        <section className="animate-fadeUp" style={styles.gridSection}>
          <article className="card" style={styles.detailsCard}>
            <div style={styles.cardHead}>
              <div>
                <div className="section-kicker">Account</div>
                <h2 className="section-title" style={{ fontSize: 'clamp(24px, 4vw, 32px)' }}>
                  Personal details
                </h2>
              </div>
              <span className="badge badge-blue">{profileUser?.role || user?.role || 'user'}</span>
            </div>

            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Full name</span>
                <strong style={styles.detailValue}>{profileUser?.name || user?.name || 'Not available'}</strong>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Email address</span>
                <strong style={styles.detailValue}>{profileUser?.email || user?.email || 'Not available'}</strong>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Account type</span>
                <strong style={styles.detailValue}>
                  {(profileUser?.role || user?.role) === 'admin' ? 'Administrator' : 'Traveler'}
                </strong>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Status</span>
                <strong style={styles.detailValue}>Active</strong>
              </div>
            </div>
          </article>

          <article className="card" style={styles.summaryCard}>
            <div className="section-kicker">Highlights</div>
            <h2 className="section-title" style={{ fontSize: 'clamp(24px, 4vw, 32px)' }}>
              Travel snapshot
            </h2>

            <div style={styles.highlightList}>
              {highlights.map((item) => (
                <div key={item.label} style={styles.highlightItem}>
                  <span style={styles.highlightLabel}>{item.label}</span>
                  <strong style={styles.highlightValue}>{item.value}</strong>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="animate-fadeUp" style={styles.statsSection}>
          <div style={styles.sectionHead}>
            <div>
              <div className="section-kicker">Insights</div>
              <h2 className="section-title">Booking activity at a glance</h2>
            </div>
            <p className="muted">
              {loading ? 'Loading profile insights...' : 'A quick look at how this account is using the platform.'}
            </p>
          </div>

          <div style={styles.statsGrid}>
            {profileStats.map((item) => (
              <div key={item.label} className="card" style={styles.statCard}>
                <span style={styles.statLabel}>{item.label}</span>
                <strong style={styles.statValue}>{loading ? '--' : item.value}</strong>
                <span className="muted">{item.note}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

const styles = {
  heroCard: {
    padding: 32,
    borderRadius: 24,
    background: '#ffffff',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
  },
  heroLayout: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 24,
    flexWrap: 'wrap',
  },
  profileBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 28,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
    color: '#ffffff',
    fontFamily: 'var(--font-head)',
    fontSize: 30,
    fontWeight: 800,
    letterSpacing: '-0.04em',
    boxShadow: '0 18px 30px -18px rgba(37, 99, 235, 0.6)',
  },
  title: {
    fontFamily: 'var(--font-head)',
    fontSize: 'clamp(34px, 5vw, 50px)',
    lineHeight: 1.03,
    letterSpacing: '-0.05em',
  },
  subtitle: {
    marginTop: 12,
    maxWidth: 640,
  },
  heroActions: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  gridSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 18,
    marginTop: 24,
  },
  detailsCard: {
    display: 'grid',
    gap: 20,
  },
  summaryCard: {
    display: 'grid',
    gap: 18,
    alignContent: 'start',
  },
  cardHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    flexWrap: 'wrap',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 14,
  },
  detailItem: {
    padding: 18,
    borderRadius: 18,
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
  },
  detailLabel: {
    display: 'block',
    color: 'var(--text-dim)',
    fontFamily: 'var(--font-head)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  detailValue: {
    fontFamily: 'var(--font-head)',
    fontSize: 18,
    lineHeight: 1.3,
    wordBreak: 'break-word',
  },
  highlightList: {
    display: 'grid',
    gap: 12,
  },
  highlightItem: {
    padding: 18,
    borderRadius: 18,
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
  },
  highlightLabel: {
    display: 'block',
    color: 'var(--text-dim)',
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
  },
  highlightValue: {
    fontFamily: 'var(--font-head)',
    fontSize: 18,
    lineHeight: 1.3,
  },
  statsSection: {
    marginTop: 28,
  },
  sectionHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
  },
  statCard: {
    minHeight: 150,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  statLabel: {
    color: 'var(--text-dim)',
    fontFamily: 'var(--font-head)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  statValue: {
    margin: '10px 0 6px',
    fontFamily: 'var(--font-head)',
    fontSize: 'clamp(28px, 4vw, 38px)',
    lineHeight: 1.04,
    letterSpacing: '-0.05em',
  },
}
