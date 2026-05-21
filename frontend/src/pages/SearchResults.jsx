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
              <div key={item} className="skeleton-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ width: '40%' }}>
                    <div className="skeleton-line skeleton-line--sm" />
                    <div className="skeleton-line skeleton-line--lg" />
                  </div>
                  <div style={{ width: '20%', textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div className="skeleton-line skeleton-line--sm" style={{ width: '80%' }} />
                    <div className="skeleton-line skeleton-line--md" style={{ width: '100%' }} />
                  </div>
                </div>
                <div className="skeleton-block" style={{ height: 60, marginBottom: 16 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div className="skeleton-line" style={{ width: 80, height: 32, borderRadius: 16 }} />
                    <div className="skeleton-line" style={{ width: 80, height: 32, borderRadius: 16 }} />
                  </div>
                  <div className="skeleton-line" style={{ width: 120, height: 42, borderRadius: 8, marginBottom: 0 }} />
                </div>
              </div>
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
    padding: 32,
    borderRadius: 24,
    background: '#ffffff',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
  },
  heroTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'end',
    gap: 18,
    flexWrap: 'wrap',
  },
  routeTitle: {
    color: 'var(--text)',
    fontFamily: 'var(--font-head)',
    fontSize: 'clamp(32px, 5vw, 48px)',
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
  },
  heroStats: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  heroStat: {
    minWidth: 140,
    padding: '16px 20px',
    borderRadius: 16,
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
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
    border: '1px solid var(--border)',
    background: '#ffffff',
    color: 'var(--text)',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13,
  },
  sortBtnActive: {
    background: 'var(--accent)',
    color: '#ffffff',
    borderColor: 'transparent',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
  },
  emptyState: {
    marginTop: 24,
    textAlign: 'center',
    padding: '42px 24px',
  },
  emptyBadge: {
    display: 'inline-flex',
    padding: '6px 12px',
    borderRadius: 999,
    background: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--red)',
    fontFamily: 'var(--font-head)',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.05em',
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
