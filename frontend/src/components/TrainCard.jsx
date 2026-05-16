import { useNavigate } from 'react-router-dom'

export default function TrainCard({ train, journeyDate }) {
  const navigate = useNavigate()

  const availabilityClass =
    train.availableSeats > 50 ? 'badge-green' : train.availableSeats > 10 ? 'badge-orange' : 'badge-red'

  const availabilityText =
    train.availableSeats > 50 ? 'Available' : train.availableSeats > 10 ? 'Filling Fast' : 'Few Left'

  const classes = train.classes?.length > 0 ? train.classes : [{ type: 'General', price: train.price }]

  return (
    <div className="card animate-fadeUp" style={styles.card}>
      <div style={styles.topRow}>
        <div>
          <div style={styles.trainNumber}>{train.trainNumber}</div>
          <h3 style={styles.trainName}>{train.name}</h3>
        </div>
        <span className={`badge ${availabilityClass}`}>{availabilityText}</span>
      </div>

      <div style={styles.routeWrap}>
        <div>
          <div style={styles.time}>{train.departureTime}</div>
          <div style={styles.station}>{train.from}</div>
        </div>

        <div style={styles.trackBlock}>
          <div style={styles.trackMeta}>
            <span style={styles.trackCity}>Boarding</span>
            <span style={styles.trackPill}>Direct route</span>
            <span style={styles.trackCity}>Arrival</span>
          </div>
          <div style={styles.trackLine}>
            <span style={styles.trackDot} />
            <span style={styles.trackRail} />
            <span style={styles.trackCenter}>Rail corridor</span>
            <span style={styles.trackRail} />
            <span style={styles.trackDot} />
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={styles.time}>{train.arrivalTime}</div>
          <div style={styles.station}>{train.to}</div>
        </div>
      </div>

      <div style={styles.footer}>
        <div style={styles.classList}>
          {classes.map((travelClass) => (
            <div key={travelClass.type} style={styles.classChip}>
              <span style={styles.classChipLabel}>{travelClass.type}</span>
              <span style={styles.classChipPrice}>Rs {travelClass.price}</span>
            </div>
          ))}
        </div>

        <div style={styles.actionWrap}>
          <div style={styles.seatBox}>
            <span style={styles.seatCount}>{train.availableSeats}</span>
            <span style={styles.seatLabel}>seats left</span>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate(`/book/${train._id}`, { state: { train, journeyDate } })}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  card: {
    borderRadius: 30,
    padding: 24,
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    gap: 16,
    flexWrap: 'wrap',
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
  trainName: {
    fontFamily: 'var(--font-head)',
    fontSize: 27,
    lineHeight: 1.05,
    letterSpacing: '-0.04em',
  },
  routeWrap: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    alignItems: 'center',
    gap: 18,
    marginTop: 26,
  },
  time: {
    fontFamily: 'var(--font-head)',
    fontSize: 'clamp(26px, 4vw, 36px)',
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: '-0.05em',
  },
  station: {
    marginTop: 6,
    color: 'var(--text-muted)',
    fontSize: 14,
  },
  trackBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  trackMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    fontSize: 12,
    color: 'var(--text-dim)',
  },
  trackCity: {
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontFamily: 'var(--font-head)',
    fontSize: 10,
    fontWeight: 700,
  },
  trackPill: {
    padding: '6px 10px',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(18, 49, 73, 0.08)',
    color: 'var(--text-muted)',
  },
  trackLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  trackDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: 'var(--accent-strong)',
    boxShadow: '0 0 0 5px rgba(215, 137, 29, 0.12)',
    flexShrink: 0,
  },
  trackRail: {
    flex: 1,
    height: 2,
    background: 'linear-gradient(90deg, rgba(215,137,29,0.8), rgba(18,49,73,0.18))',
  },
  trackCenter: {
    padding: '4px 10px',
    borderRadius: 999,
    background: 'rgba(18, 49, 73, 0.05)',
    color: 'var(--text-muted)',
    fontSize: 12,
    whiteSpace: 'nowrap',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 18,
    alignItems: 'end',
    flexWrap: 'wrap',
    marginTop: 24,
    paddingTop: 20,
    borderTop: '1px solid rgba(18, 49, 73, 0.1)',
  },
  classList: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  classChip: {
    padding: '12px 14px',
    borderRadius: 18,
    background: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(18, 49, 73, 0.08)',
    minWidth: 92,
  },
  classChipLabel: {
    display: 'block',
    fontFamily: 'var(--font-head)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-dim)',
    marginBottom: 4,
  },
  classChipPrice: {
    fontFamily: 'var(--font-head)',
    fontSize: 18,
    fontWeight: 800,
  },
  actionWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  seatBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    padding: '8px 0',
  },
  seatCount: {
    fontFamily: 'var(--font-head)',
    fontSize: 24,
    fontWeight: 800,
    color: 'var(--green)',
    lineHeight: 1,
  },
  seatLabel: {
    fontSize: 13,
    color: 'var(--text-muted)',
  },
}
