import { useNavigate } from 'react-router-dom'

export default function TrainCard({ train, journeyDate }) {
  const navigate = useNavigate()

  const availColor =
    train.availableSeats > 50 ? 'badge-green' :
    train.availableSeats > 10 ? 'badge-orange' : 'badge-red'

  const availText =
    train.availableSeats > 50 ? 'Available' :
    train.availableSeats > 10 ? 'Filling Fast' : 'Few Left'

  return (
    <div style={s.card} className="animate-fadeUp"
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-lit)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
    >
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.trainNum}>{train.trainNumber}</div>
          <div style={s.trainName}>{train.name}</div>
        </div>
        <span className={`badge ${availColor}`}>{availText}</span>
      </div>

      {/* Route */}
      <div style={s.route}>
        <div>
          <div style={s.time}>{train.departureTime}</div>
          <div style={s.station}>{train.from}</div>
        </div>
        <div style={s.trackWrap}>
          <div style={s.dot} />
          <div style={s.track}><span style={s.duration}>Direct</span></div>
          <div style={s.dot} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={s.time}>{train.arrivalTime}</div>
          <div style={s.station}>{train.to}</div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />

      {/* Footer */}
      <div style={s.footer}>
        <div style={s.classList}>
          {(train.classes?.length > 0
            ? train.classes
            : [{ type: 'General', price: train.price }]
          ).map(cls => (
            <div key={cls.type} style={s.chip}>
              <span style={s.chipType}>{cls.type}</span>
              <span style={s.chipPrice}>₹{cls.price}</span>
            </div>
          ))}
        </div>
        <div style={s.actions}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--green)', fontWeight: 700 }}>{train.availableSeats}</span> seats
          </span>
          <button
            className="btn btn-primary"
            style={{ padding: '9px 20px' }}
            onClick={() => navigate(`/book/${train._id}`, { state: { train, journeyDate } })}
          >
            Book Now →
          </button>
        </div>
      </div>
    </div>
  )
}

const s = {
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '22px 24px',
    transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  trainNum: { fontSize: 11, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.08em', fontFamily: 'var(--font-head)', marginBottom: 2 },
  trainName: { fontSize: 17, fontWeight: 700, fontFamily: 'var(--font-head)', color: 'var(--text)' },
  route: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16 },
  time: { fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 800, color: 'var(--text)', lineHeight: 1 },
  station: { fontSize: 13, color: 'var(--text-muted)', marginTop: 4 },
  trackWrap: { display: 'flex', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 },
  track: { flex: 1, height: 2, background: 'linear-gradient(90deg, var(--accent), var(--border-lit), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 80 },
  duration: { fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '1px 6px', borderRadius: 4 },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  classList: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  chip: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', gap: 1 },
  chipType: { fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', fontFamily: 'var(--font-head)' },
  chipPrice: { fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-head)' },
  actions: { display: 'flex', alignItems: 'center', gap: 14 },
}