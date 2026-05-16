import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import TrainCard from '../components/TrainCard'

const SORT_OPTIONS = [
  ['departure', 'Departure'],
  ['price', 'Price'],
  ['seats', 'Availability'],
]

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const [trains, setTrains] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('departure')

  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const date = searchParams.get('date')
  const passengers = Number(searchParams.get('passengers') || 1)

  useEffect(() => {
    setLoading(true)
    setError('')

    api
      .get('/trains/search', { params: { from, to } })
      .then((response) => setTrains(response.data))
      .catch((errorResponse) => setError(errorResponse.response?.data?.message || 'Failed to fetch trains'))
      .finally(() => setLoading(false))
  }, [from, to])

  const sorted = [...trains].sort((first, second) => {
    if (sortBy === 'price') return first.price - second.price
    if (sortBy === 'seats') return second.availableSeats - first.availableSeats
    return first.departureTime.localeCompare(second.departureTime)
  })

  return (
    <div className="page">
      <div className="container">
        <section className="card panel-highlight animate-fadeUp" style={styles.heroCard}>
          <div style={styles.heroTop}>
            <div>
              <div className="section-kicker">Search Results</div>
              <h1 style={styles.routeTitle}>
                {from} <span style={{ color: 'var(--accent-strong)' }}>to</span> {to}
              </h1>
              <p className="muted" style={{ marginTop: 10, fontSize: 15 }}>
                {new Date(date).toDateString()} · {passengers} Passenger{passengers > 1 ? 's' : ''}
              </p>
            </div>

            <div style={styles.heroStats}>
              <div style={styles.heroStat}>
                <div style={styles.heroStatLabel}>Trains found</div>
                <div style={styles.heroStatValue}>{loading ? '--' : trains.length}</div>
              </div>
              <div style={styles.heroStat}>
                <div style={styles.heroStatLabel}>Sort by</div>
                <div style={styles.heroStatValue}>{SORT_OPTIONS.find(([value]) => value === sortBy)?.[1]}</div>
              </div>
            </div>
          </div>

          <div style={styles.sortRow}>
            {SORT_OPTIONS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setSortBy(value)}
                style={{
                  ...styles.sortBtn,
                  ...(sortBy === value ? styles.sortBtnActive : {}),
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                style={{
                  height: 220,
                  borderRadius: 28,
                  background: 'rgba(255, 252, 245, 0.7)',
                  border: '1px solid rgba(18, 49, 73, 0.08)',
                  animation: 'pulse 1.5s ease infinite',
                }}
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="card" style={styles.emptyState}>
            <div style={styles.emptyBadge}>Search issue</div>
            <h2 style={styles.emptyTitle}>We couldn&apos;t load trains right now.</h2>
            <p className="muted">{error}</p>
          </div>
        )}

        {!loading && !error && sorted.length === 0 && (
          <div className="card" style={styles.emptyState}>
            <div style={styles.emptyBadge}>No matching trains</div>
            <h2 style={styles.emptyTitle}>Try adjusting your route or travel date.</h2>
            <p className="muted">No trains are currently available for this search.</p>
          </div>
        )}

        {!loading && !error && sorted.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 24 }}>
            {sorted.map((train, index) => (
              <div key={train._id} style={{ animationDelay: `${index * 0.05}s` }}>
                <TrainCard train={train} journeyDate={date} />
              </div>
            ))}
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
    alignItems: 'end',
    gap: 18,
    flexWrap: 'wrap',
  },
  routeTitle: {
    fontFamily: 'var(--font-head)',
    fontSize: 'clamp(34px, 5vw, 52px)',
    lineHeight: 1.02,
    letterSpacing: '-0.05em',
  },
  heroStats: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  heroStat: {
    minWidth: 160,
    padding: '16px 18px',
    borderRadius: 22,
    background: 'rgba(255,255,255,0.74)',
    border: '1px solid rgba(18, 49, 73, 0.1)',
  },
  heroStatLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-dim)',
    fontFamily: 'var(--font-head)',
  },
  heroStatValue: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: 800,
    fontFamily: 'var(--font-head)',
  },
  sortRow: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 20,
  },
  sortBtn: {
    padding: '10px 16px',
    borderRadius: 999,
    border: '1px solid rgba(18, 49, 73, 0.12)',
    background: 'rgba(255, 255, 255, 0.72)',
    color: 'var(--text)',
    cursor: 'pointer',
    fontWeight: 600,
  },
  sortBtnActive: {
    background: 'linear-gradient(135deg, #e09a32 0%, #c57810 100%)',
    color: '#fffdf7',
    borderColor: 'transparent',
    boxShadow: '0 10px 24px rgba(199, 120, 16, 0.2)',
  },
  emptyState: {
    marginTop: 24,
    textAlign: 'center',
    padding: '42px 24px',
  },
  emptyBadge: {
    display: 'inline-flex',
    padding: '8px 12px',
    borderRadius: 999,
    background: 'var(--accent-soft)',
    color: 'var(--accent-strong)',
    fontFamily: 'var(--font-head)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  emptyTitle: {
    marginTop: 16,
    fontFamily: 'var(--font-head)',
    fontSize: 28,
    lineHeight: 1.1,
    letterSpacing: '-0.04em',
  },
}
