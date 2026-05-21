import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const POPULAR = [
  { from: 'Chennai', to: 'Delhi', tag: 'Business corridor' },
  { from: 'Mumbai', to: 'Delhi', tag: 'High demand' },
  { from: 'Bangalore', to: 'Hyderabad', tag: 'Fast weekend route' },
  { from: 'Coimbatore', to: 'Chennai', tag: 'Daily commuter favorite' },
]

const HIGHLIGHTS = [
  { value: '10K+', label: 'Daily train options' },
  { value: '500+', label: 'Stations connected' },
  { value: '2M+', label: 'Passengers served daily' },
  { value: '24/7', label: 'Smart booking access' },
]

export default function Home() {
  const navigate = useNavigate()
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ from: '', to: '', date: today, passengers: 1 })

  const handleSearch = (event) => {
    event.preventDefault()
    navigate(`/search?from=${form.from}&to=${form.to}&date=${form.date}&passengers=${form.passengers}`)
  }

  return (
    <div className="page">
      <div className="container">
        <section style={styles.heroWrap}>
          <div className="card panel-highlight animate-fadeUp" style={styles.heroCard}>
            <div style={styles.heroGrid}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="section-kicker">Railway Booking Reimagined</div>
                <h1 style={styles.title}>
                  Book India&apos;s rail journeys with a cleaner, faster, more confident flow.
                </h1>
                <p style={styles.subtitle}>
                  Search routes, compare class fares, and manage bookings in one polished experience
                  built for everyday travelers.
                </p>
              </div>

              <div className="animate-fadeIn" style={styles.searchShell}>
                <div style={styles.searchTop}>
                  <div>
                    <div style={styles.searchLabel}>Journey Planner</div>
                    <h2 style={styles.searchTitle}>Find your next train</h2>
                  </div>
                  <div style={styles.liveChip}>Live route search</div>
                </div>

                <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={styles.row}>
                    <div style={{ flex: 1, ...styles.field }}>
                      <label className="form-label">From</label>
                      <input
                        placeholder="Departure city"
                        value={form.from}
                        onChange={(event) => setForm((value) => ({ ...value, from: event.target.value }))}
                        required
                      />
                    </div>

                    <button
                      type="button"
                      style={styles.swapBtn}
                      onClick={() => setForm((value) => ({ ...value, from: value.to, to: value.from }))}
                    >
                      Swap
                    </button>

                    <div style={{ flex: 1, ...styles.field }}>
                      <label className="form-label">To</label>
                      <input
                        placeholder="Destination city"
                        value={form.to}
                        onChange={(event) => setForm((value) => ({ ...value, to: event.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.row}>
                    <div style={{ flex: 1, ...styles.field }}>
                      <label className="form-label">Travel date</label>
                      <input
                        type="date"
                        min={today}
                        value={form.date}
                        onChange={(event) => setForm((value) => ({ ...value, date: event.target.value }))}
                        required
                      />
                    </div>

                    <div style={{ flex: 1, ...styles.field }}>
                      <label className="form-label">Passengers</label>
                      <select
                        value={form.passengers}
                        onChange={(event) => setForm((value) => ({ ...value, passengers: event.target.value }))}
                      >
                        {[1, 2, 3, 4, 5, 6].map((count) => (
                          <option key={count} value={count}>
                            {count} Passenger{count > 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: 8, padding: '15px 22px', fontSize: 14 }}
                  >
                    Search Trains
                  </button>
                </form>
              </div>

              <div style={styles.heroStats}>
                {HIGHLIGHTS.map((item) => (
                  <div key={item.label} style={styles.heroStat}>
                    <div style={styles.heroStatValue}>{item.value}</div>
                    <div style={styles.heroStatLabel}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 44 }}>
          <div style={styles.sectionHead}>
            <div>
              <div className="section-kicker">Popular Routes</div>
              <h2 className="section-title">Frequently booked journeys</h2>
            </div>
            <p className="muted" style={{ maxWidth: 420 }}>
              Quick picks for the corridors travelers search most often across the network.
            </p>
          </div>

          <div style={styles.routeGrid}>
            {POPULAR.map((route, index) => (
              <button
                key={`${route.from}-${route.to}`}
                className="animate-fadeUp"
                style={{ ...styles.routeCard, animationDelay: `${index * 0.08}s` }}
                onClick={() => setForm((value) => ({ ...value, from: route.from, to: route.to }))}
              >
                <div style={styles.routeHeader}>
                  <span style={styles.routeCity}>{route.from}</span>
                  <span style={styles.routeArrow}>to</span>
                  <span style={styles.routeCity}>{route.to}</span>
                </div>
                <div style={styles.routeTag}>{route.tag}</div>
              </button>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 44 }}>
          <div className="card" style={styles.assuranceCard}>
            <div>
              <div className="section-kicker">Why RailYatra</div>
              <h2 className="section-title" style={{ fontSize: 'clamp(24px, 3vw, 30px)' }}>
                Built like a real booking product, not a classroom demo
              </h2>
            </div>
            <div style={styles.assuranceGrid}>
              {[
                ['Clean search flow', 'Route, date, and passenger count are surfaced immediately and clearly.'],
                ['Fare clarity', 'Class pricing and booking totals are easier to compare before checkout.'],
                ['Booking management', 'Travel history, PNR, passenger details, and cancellation actions stay organized.'],
              ].map(([title, text]) => (
                <div key={title} style={styles.assuranceItem}>
                  <h3 style={styles.assuranceTitle}>{title}</h3>
                  <p className="muted" style={{ fontSize: 14 }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

const styles = {
  heroWrap: {
    paddingTop: 12,
  },
  heroCard: {
    padding: 40,
    borderRadius: 24,
    overflow: 'hidden',
  },
  heroGrid: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 40,
  },
  title: {
    maxWidth: 760,
    margin: '0 auto',
    fontFamily: 'var(--font-head)',
    fontSize: 'clamp(36px, 6vw, 62px)',
    lineHeight: 1.05,
    letterSpacing: '-0.04em',
  },
  subtitle: {
    maxWidth: 620,
    margin: '18px auto 0',
    fontSize: 17,
    color: 'var(--text-muted)',
  },
  heroStats: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16,
    marginTop: 10,
  },
  heroStat: {
    padding: 20,
    borderRadius: 16,
    border: '1px solid var(--border)',
    background: '#ffffff',
  },
  heroStatValue: {
    fontFamily: 'var(--font-head)',
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: '-0.03em',
  },
  heroStatLabel: {
    fontSize: 13,
    color: 'var(--text-muted)',
    marginTop: 4,
  },
  searchShell: {
    width: '100%',
    maxWidth: 900,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 32,
    borderRadius: 24,
    padding: 32,
    background: '#ffffff',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-lg)',
  },
  searchTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
    textAlign: 'left',
  },
  searchLabel: {
    color: 'var(--accent-strong)',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontFamily: 'var(--font-head)',
    marginBottom: 6,
  },
  searchTitle: {
    fontFamily: 'var(--font-head)',
    fontSize: 28,
    lineHeight: 1.05,
    letterSpacing: '-0.03em',
  },
  liveChip: {
    padding: '6px 12px',
    borderRadius: 999,
    background: 'var(--accent-soft)',
    color: 'var(--accent)',
    fontSize: 12,
    fontWeight: 600,
  },
  row: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-end',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  swapBtn: {
    alignSelf: 'end',
    height: 48,
    padding: '0 16px',
    borderRadius: 12,
    border: '1px solid var(--border)',
    background: 'var(--bg-hover)',
    color: 'var(--text)',
    cursor: 'pointer',
    fontFamily: 'var(--font-head)',
    fontWeight: 600,
  },
  sectionHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'end',
    gap: 18,
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  routeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 14,
  },
  routeCard: {
    textAlign: 'left',
    padding: 24,
    borderRadius: 20,
    border: '1px solid var(--border)',
    background: '#ffffff',
    boxShadow: 'var(--shadow-sm)',
    cursor: 'pointer',
    transition: 'all var(--transition)',
  },
  routeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  routeCity: {
    fontFamily: 'var(--font-head)',
    fontSize: 18,
    fontWeight: 700,
  },
  routeArrow: {
    color: 'var(--text-dim)',
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  routeTag: {
    color: 'var(--text-muted)',
    fontSize: 14,
  },
  assuranceCard: {
    padding: 28,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 20,
  },
  assuranceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 14,
  },
  assuranceItem: {
    padding: 18,
    borderRadius: 22,
    background: 'rgba(255, 255, 255, 0.68)',
    border: '1px solid rgba(18, 49, 73, 0.08)',
  },
  assuranceTitle: {
    fontFamily: 'var(--font-head)',
    fontSize: 18,
    lineHeight: 1.2,
    marginBottom: 8,
  },
}
