import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import TrainCard from '../components/TrainCard'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const [trains, setTrains]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [sortBy, setSortBy]   = useState('departure')

  const from = searchParams.get('from')
  const to   = searchParams.get('to')
  const date = searchParams.get('date')
  const pax  = searchParams.get('passengers')

  useEffect(() => {
    setLoading(true); setError('')
    api.get('/trains/search', { params: { from, to } })
      .then(res => setTrains(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to fetch trains'))
      .finally(() => setLoading(false))
  }, [from, to])

  const sorted = [...trains].sort((a, b) =>
    sortBy === 'price' ? a.price - b.price :
    sortBy === 'seats' ? b.availableSeats - a.availableSeats :
    a.departureTime.localeCompare(b.departureTime)
  )

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div style={s.header} className="animate-fadeUp">
          <div>
            <div style={s.route}>
              <span style={s.city}>{from}</span>
              <span style={{ color: 'var(--accent)', fontSize: 22 }}>→</span>
              <span style={s.city}>{to}</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
              {date} · {pax} Passenger{pax > 1 ? 's' : ''}
              {!loading && <> · <strong style={{ color: 'var(--accent)' }}>{trains.length}</strong> trains found</>}
            </p>
          </div>

          <div style={s.sortRow}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sort:</span>
            {['departure', 'price', 'seats'].map(opt => (
              <button key={opt} onClick={() => setSortBy(opt)}
                style={{ ...s.sortBtn, ...(sortBy === opt ? s.sortActive : {}) }}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height: 180, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, animation: 'pulse 1.5s ease infinite' }} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={s.empty}>
            <span style={{ fontSize: 40 }}>😕</span>
            <p style={{ color: 'var(--text-muted)' }}>{error}</p>
          </div>
        )}

        {/* No results */}
        {!loading && !error && trains.length === 0 && (
          <div style={s.empty}>
            <span style={{ fontSize: 56 }}>🚉</span>
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 20 }}>No trains found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try a different route or date</p>
          </div>
        )}

        {/* Results */}
        {!loading && sorted.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {sorted.map((train, i) => (
              <div key={train._id} style={{ animationDelay: `${i * 0.06}s` }}>
                <TrainCard train={train} journeyDate={date} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  header:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--border)' },
  route:   { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 },
  city:    { fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' },
  sortRow: { display: 'flex', alignItems: 'center', gap: 6 },
  sortBtn: { background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '7px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)' },
  sortActive: { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#0a0c10', fontWeight: 600 },
  empty:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '80px 0', textAlign: 'center' },
}