import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'

export default function BookingForm() {
  const { trainId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const train = state?.train
  const journeyDate = state?.journeyDate

  const [travelClass, setTravelClass] = useState('Sleeper')
  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: 'Male' }])
  const [loading, setLoading] = useState(false)
  const [booked, setBooked] = useState(null)

  if (!train) {
    return (
      <div className="page">
        <div className="container">
          <div className="card" style={styles.emptyState}>
            <div className="section-kicker">Booking unavailable</div>
            <h1 style={styles.emptyTitle}>No train has been selected for this booking.</h1>
            <p className="muted">Return to the home page and search for a train first.</p>
            <button type="button" className="btn btn-primary" style={{ marginTop: 18 }} onClick={() => navigate('/')}>
              Go Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const selectedClass = train.classes?.find((item) => item.type === travelClass)
  const pricePerSeat = selectedClass?.price || train.price || 0
  const baseFare = pricePerSeat * passengers.length
  const serviceFee = Math.round(baseFare * 0.02)
  const gst = Math.round(baseFare * 0.05)
  const total = baseFare + serviceFee + gst

  const addPassenger = () => {
    if (passengers.length < 6) {
      setPassengers((current) => [...current, { name: '', age: '', gender: 'Male' }])
    }
  }

  const removePassenger = (index) => {
    if (passengers.length > 1) {
      setPassengers((current) => current.filter((_, passengerIndex) => passengerIndex !== index))
    }
  }

  const updatePassenger = (index, key, value) => {
    setPassengers((current) =>
      current.map((passenger, passengerIndex) =>
        passengerIndex === index ? { ...passenger, [key]: value } : passenger
      )
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const response = await api.post('/bookings', { trainId, journeyDate, passengers, travelClass })
      setBooked(response.data)
      addToast('Booking confirmed successfully', 'success')
    } catch (error) {
      addToast(error.response?.data?.message || 'Booking failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (booked) {
    return (
      <div className="page">
        <div className="container">
          <div className="card animate-fadeUp" style={styles.confirmCard}>
            <div style={styles.confirmBadge}>Booking Confirmed</div>
            <h1 style={styles.confirmTitle}>Your ticket is ready.</h1>
            <p className="muted" style={{ maxWidth: 520 }}>
              Your booking has been saved with a live PNR reference and a full fare summary below.
            </p>

            <div style={styles.confirmPnr}>
              <span style={styles.confirmPnrLabel}>PNR Number</span>
              <span style={styles.confirmPnrValue}>{booked.pnrNumber}</span>
            </div>

            <div style={styles.confirmGrid}>
              {[
                ['Train', train.name],
                ['Route', `${train.from} to ${train.to}`],
                ['Date', new Date(booked.journeyDate).toDateString()],
                ['Class', booked.class],
                ['Passengers', booked.passengers.length],
                ['Total Paid', `Rs ${booked.totalAmount}`],
              ].map(([label, value]) => (
                <div key={label} style={styles.confirmItem}>
                  <div style={styles.confirmItemLabel}>{label}</div>
                  <div style={styles.confirmItemValue}>{value}</div>
                </div>
              ))}
            </div>

            <div style={styles.confirmActions}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/my-bookings')}>
                View My Bookings
              </button>
              <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
                Book Another Trip
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const availableClasses =
    train.classes?.length > 0
      ? train.classes
      : ['Sleeper', '3AC', '2AC', '1AC'].map((type) => ({ type, price: train.price }))

  return (
    <div className="page">
      <div className="container">
        <div style={styles.layout}>
          <div>
            <section className="card panel-highlight animate-fadeUp" style={styles.headerCard}>
              <div style={styles.headerTop}>
                <div>
                  <div className="section-kicker">Complete Booking</div>
                  <h1 style={styles.pageTitle}>{train.name}</h1>
                  <p className="muted" style={{ marginTop: 10 }}>
                    {train.trainNumber} · {new Date(journeyDate).toDateString()}
                  </p>
                </div>
                <span className="badge badge-green">Seats available</span>
              </div>

              <div style={styles.routeCard}>
                <div>
                  <div style={styles.routeTime}>{train.departureTime}</div>
                  <div style={styles.routeStation}>{train.from}</div>
                </div>
                <div style={styles.routeMiddle}>
                  <div style={styles.routeLine} />
                  <span style={styles.routePill}>Direct rail connection</span>
                  <div style={styles.routeLine} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={styles.routeTime}>{train.arrivalTime}</div>
                  <div style={styles.routeStation}>{train.to}</div>
                </div>
              </div>
            </section>

            <section className="card animate-fadeUp" style={{ ...styles.sectionCard, animationDelay: '0.05s' }}>
              <div style={styles.sectionHeader}>
                <div>
                  <div className="section-kicker">Travel Class</div>
                  <h2 style={styles.sectionTitle}>Choose your cabin</h2>
                </div>
              </div>

              <div style={styles.classGrid}>
                {availableClasses.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setTravelClass(item.type)}
                    style={{
                      ...styles.classButton,
                      ...(travelClass === item.type ? styles.classButtonActive : {}),
                    }}
                  >
                    <div style={styles.classButtonTop}>
                      <span style={styles.classType}>{item.type}</span>
                      <span style={styles.classPrice}>Rs {item.price}</span>
                    </div>
                    <div className="muted" style={{ fontSize: 13 }}>
                      Comfortable travel for your selected journey.
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <form onSubmit={handleSubmit}>
              <section className="card animate-fadeUp" style={{ ...styles.sectionCard, animationDelay: '0.1s' }}>
                <div style={styles.sectionHeader}>
                  <div>
                    <div className="section-kicker">Passengers</div>
                    <h2 style={styles.sectionTitle}>Traveler details</h2>
                  </div>

                  {passengers.length < 6 && (
                    <button type="button" className="btn btn-secondary" onClick={addPassenger}>
                      Add Passenger
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {passengers.map((passenger, index) => (
                    <div key={index} style={styles.passengerCard}>
                      <div style={styles.passengerTop}>
                        <div>
                          <div style={styles.passengerLabel}>Passenger {index + 1}</div>
                          <div className="muted" style={{ fontSize: 13 }}>
                            Enter name, age, and gender exactly as required.
                          </div>
                        </div>

                        {index > 0 && (
                          <button type="button" style={styles.removeButton} onClick={() => removePassenger(index)}>
                            Remove
                          </button>
                        )}
                      </div>

                      <div style={styles.passengerFields}>
                        <div style={styles.passengerField}>
                          <label className="form-label">Full name</label>
                          <input
                            placeholder="As shown on ID"
                            value={passenger.name}
                            onChange={(event) => updatePassenger(index, 'name', event.target.value)}
                            required
                          />
                        </div>

                        <div style={styles.passengerField}>
                          <label className="form-label">Age</label>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            placeholder="Age"
                            value={passenger.age}
                            onChange={(event) => updatePassenger(index, 'age', event.target.value)}
                            required
                          />
                        </div>

                        <div style={styles.passengerField}>
                          <label className="form-label">Gender</label>
                          <select
                            value={passenger.gender}
                            onChange={(event) => updatePassenger(index, 'gender', event.target.value)}
                          >
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '16px 22px', marginTop: 18 }}
                disabled={loading}
              >
                {loading ? <><span className="loader" /> Processing booking</> : `Pay Rs ${total} and Confirm`}
              </button>
            </form>
          </div>

          <aside>
            <div className="card animate-fadeUp" style={styles.sidebarCard}>
              <div className="section-kicker">Fare Summary</div>
              <h2 style={styles.sidebarTitle}>Trip total</h2>

              <div style={styles.summaryList}>
                {[
                  [`Base fare x ${passengers.length}`, `Rs ${baseFare}`],
                  ['Service fee', `Rs ${serviceFee}`],
                  ['GST', `Rs ${gst}`],
                  ['Class selected', travelClass],
                ].map(([label, value]) => (
                  <div key={label} style={styles.summaryRow}>
                    <span className="muted">{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>

              <div style={styles.totalBox}>
                <span>Total payable</span>
                <span style={styles.totalValue}>Rs {total}</span>
              </div>

              <div style={styles.secureNote}>
                Secure payment flow with fare breakdown visible before confirmation.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

const styles = {
  emptyState: {
    padding: '44px 24px',
    textAlign: 'center',
  },
  emptyTitle: {
    marginTop: 14,
    fontFamily: 'var(--font-head)',
    fontSize: 'clamp(30px, 4vw, 42px)',
    lineHeight: 1.08,
    letterSpacing: '-0.04em',
  },
  confirmCard: {
    maxWidth: 920,
    margin: '0 auto',
    textAlign: 'center',
    padding: 34,
    borderRadius: 34,
  },
  confirmBadge: {
    display: 'inline-flex',
    padding: '8px 14px',
    borderRadius: 999,
    background: 'rgba(31, 143, 99, 0.12)',
    color: 'var(--green)',
    fontFamily: 'var(--font-head)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  confirmTitle: {
    marginTop: 16,
    fontFamily: 'var(--font-head)',
    fontSize: 'clamp(38px, 6vw, 56px)',
    lineHeight: 1.02,
    letterSpacing: '-0.05em',
  },
  confirmPnr: {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: 6,
    marginTop: 24,
    padding: '18px 30px',
    borderRadius: 24,
    background: 'rgba(255,255,255,0.82)',
    border: '1px solid rgba(18, 49, 73, 0.1)',
  },
  confirmPnrLabel: {
    color: 'var(--text-dim)',
    fontFamily: 'var(--font-head)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  confirmPnrValue: {
    fontFamily: 'var(--font-head)',
    fontSize: 30,
    fontWeight: 800,
    color: 'var(--accent-strong)',
    letterSpacing: '0.04em',
  },
  confirmGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
    marginTop: 26,
    textAlign: 'left',
  },
  confirmItem: {
    padding: 18,
    borderRadius: 22,
    background: 'rgba(255,255,255,0.78)',
    border: '1px solid rgba(18, 49, 73, 0.08)',
  },
  confirmItemLabel: {
    fontSize: 11,
    color: 'var(--text-dim)',
    fontFamily: 'var(--font-head)',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  confirmItemValue: {
    fontFamily: 'var(--font-head)',
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1.3,
  },
  confirmActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginTop: 26,
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 22,
    alignItems: 'start',
  },
  headerCard: {
    padding: 28,
    borderRadius: 34,
    marginBottom: 18,
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    gap: 18,
    flexWrap: 'wrap',
  },
  pageTitle: {
    fontFamily: 'var(--font-head)',
    fontSize: 'clamp(34px, 5vw, 48px)',
    lineHeight: 1.02,
    letterSpacing: '-0.05em',
  },
  routeCard: {
    marginTop: 24,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: 18,
    alignItems: 'center',
    padding: 22,
    borderRadius: 26,
    background: 'rgba(255,255,255,0.72)',
    border: '1px solid rgba(18, 49, 73, 0.08)',
  },
  routeTime: {
    fontFamily: 'var(--font-head)',
    fontSize: 'clamp(28px, 4vw, 36px)',
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
  sectionCard: {
    padding: 26,
    borderRadius: 30,
    marginBottom: 18,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  sectionTitle: {
    fontFamily: 'var(--font-head)',
    fontSize: 30,
    lineHeight: 1.05,
    letterSpacing: '-0.04em',
  },
  classGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
  },
  classButton: {
    textAlign: 'left',
    padding: 18,
    borderRadius: 22,
    border: '1px solid rgba(18, 49, 73, 0.1)',
    background: 'rgba(255,255,255,0.72)',
    cursor: 'pointer',
    transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
  },
  classButtonActive: {
    borderColor: 'rgba(215, 137, 29, 0.45)',
    boxShadow: '0 14px 28px rgba(199, 120, 16, 0.14)',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,243,223,0.88))',
  },
  classButtonTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'baseline',
    marginBottom: 8,
  },
  classType: {
    fontFamily: 'var(--font-head)',
    fontSize: 18,
    fontWeight: 700,
  },
  classPrice: {
    fontFamily: 'var(--font-head)',
    fontSize: 20,
    fontWeight: 800,
    color: 'var(--accent-strong)',
  },
  passengerCard: {
    padding: 18,
    borderRadius: 24,
    background: 'rgba(255,255,255,0.72)',
    border: '1px solid rgba(18, 49, 73, 0.08)',
  },
  passengerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 14,
    flexWrap: 'wrap',
    alignItems: 'start',
    marginBottom: 14,
  },
  passengerLabel: {
    fontFamily: 'var(--font-head)',
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.1,
  },
  removeButton: {
    border: 'none',
    background: 'rgba(201, 77, 71, 0.08)',
    color: 'var(--red)',
    padding: '10px 14px',
    borderRadius: 999,
    cursor: 'pointer',
    fontWeight: 700,
  },
  passengerFields: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 12,
  },
  passengerField: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  sidebarCard: {
    position: 'sticky',
    top: 98,
    borderRadius: 30,
    padding: 24,
  },
  sidebarTitle: {
    fontFamily: 'var(--font-head)',
    fontSize: 30,
    lineHeight: 1.04,
    letterSpacing: '-0.04em',
  },
  summaryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    marginTop: 18,
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    fontSize: 14,
  },
  totalBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    paddingTop: 18,
    borderTop: '1px solid rgba(18, 49, 73, 0.1)',
    fontFamily: 'var(--font-head)',
    fontWeight: 700,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: 800,
    color: 'var(--accent-strong)',
    letterSpacing: '-0.04em',
  },
  secureNote: {
    marginTop: 20,
    padding: 16,
    borderRadius: 20,
    background: 'rgba(31, 143, 99, 0.08)',
    color: 'var(--text-muted)',
    fontSize: 13,
    lineHeight: 1.6,
  },
}
