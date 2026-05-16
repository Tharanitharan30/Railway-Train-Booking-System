import { useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'

export default function BookingForm() {
  const { trainId }   = useParams()
  const { state }     = useLocation()
  const navigate      = useNavigate()
  const { addToast }  = useToast()

  const train       = state?.train
  const journeyDate = state?.journeyDate

  const [travelClass, setTravelClass] = useState('Sleeper')
  const [passengers, setPassengers]   = useState([{ name: '', age: '', gender: 'Male' }])
  const [loading, setLoading]         = useState(false)
  const [booked, setBooked]           = useState(null)

  if (!train) return (
    <div className="page"><div className="container" style={{ textAlign: 'center', paddingTop: 80 }}>
      <h2>No train selected</h2>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>Go Home</button>
    </div></div>
  )

  const classInfo    = train.classes?.find(c => c.type === travelClass)
  const pricePerSeat = classInfo?.price || train.price || 0
  const total        = pricePerSeat * passengers.length

  const addPassenger    = () => passengers.length < 6 && setPassengers(p => [...p, { name: '', age: '', gender: 'Male' }])
  const removePassenger = (i) => passengers.length > 1 && setPassengers(p => p.filter((_, idx) => idx !== i))
  const updatePassenger = (i, key, val) => setPassengers(p => p.map((ps, idx) => idx === i ? { ...ps, [key]: val } : ps))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/bookings', { trainId, journeyDate, passengers, travelClass })
      setBooked(res.data)
      addToast('Booking confirmed! 🎉', 'success')
    } catch (err) {
      addToast(err.response?.data?.message || 'Booking failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Confirmation Screen ──
  if (booked) return (
    <div className="page"><div className="container">
      <div className="animate-fadeUp" style={s.confirmed}>
        <div style={s.checkIcon}>✓</div>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800 }}>Booking Confirmed!</h2>
        <p style={{ color: 'var(--text-muted)' }}>Your ticket has been booked successfully.</p>

        <div style={s.pnrBox}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>PNR Number</span>
          <span style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.05em' }}>{booked.pnrNumber}</span>
        </div>

        <div className="card" style={{ width: '100%', textAlign: 'left' }}>
          {[
            ['Train',      train.name],
            ['Route',      `${train.from} → ${train.to}`],
            ['Date',       new Date(booked.journeyDate).toDateString()],
            ['Class',      booked.class],
            ['Passengers', booked.passengers.length],
            ['Total Paid', `₹${booked.totalAmount}`],
          ].map(([k, v]) => (
            <div key={k} style={s.confRow}>
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{k}</span>
              <strong style={{ color: k === 'Total Paid' ? 'var(--accent)' : 'var(--text)', fontFamily: k === 'Total Paid' ? 'var(--font-head)' : 'inherit', fontSize: k === 'Total Paid' ? 18 : 14 }}>{v}</strong>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/my-bookings')}>View My Bookings</button>
          <button className="btn btn-primary"   onClick={() => navigate('/')}>Book Another</button>
        </div>
      </div>
    </div></div>
  )

  // ── Booking Form ──
  return (
    <div className="page"><div className="container">
      <div style={s.layout}>

        {/* Main */}
        <div>
          <h1 style={s.pageTitle} className="animate-fadeUp">Complete Booking</h1>

          {/* Train Summary */}
          <div className="card animate-fadeUp" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, fontFamily: 'var(--font-head)', marginBottom: 2 }}>{train.trainNumber}</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-head)' }}>{train.name}</div>
              </div>
              <span className="badge badge-green">Available</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div><div style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800 }}>{train.departureTime}</div><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{train.from}</div></div>
              <span style={{ color: 'var(--text-dim)', fontSize: 20 }}>─── 🚆 ───</span>
              <div style={{ textAlign: 'right' }}><div style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800 }}>{train.arrivalTime}</div><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{train.to}</div></div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>📅 {new Date(journeyDate).toDateString()}</div>
          </div>

          {/* Class Selection */}
          <div style={{ marginBottom: 24 }} className="animate-fadeUp">
            <h2 style={s.sectionTitle}>Select Class</h2>
            <div style={s.classGrid}>
              {(train.classes?.length > 0
                ? train.classes
                : ['Sleeper','3AC','2AC','1AC'].map(t => ({ type: t, price: train.price }))
              ).map(cls => (
                <button key={cls.type} type="button"
                  style={{ ...s.classBtn, ...(travelClass === cls.type ? s.classBtnActive : {}) }}
                  onClick={() => setTravelClass(cls.type)}>
                  <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 13, color: travelClass === cls.type ? 'var(--accent)' : 'var(--text)' }}>{cls.type}</span>
                  <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 18 }}>₹{cls.price}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>per person</span>
                </button>
              ))}
            </div>
          </div>

          {/* Passengers */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 24 }} className="animate-fadeUp">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={s.sectionTitle}>Passenger Details</h2>
                {passengers.length < 6 && (
                  <button type="button" className="btn btn-secondary" style={{ padding: '7px 14px', fontSize: 13 }} onClick={addPassenger}>+ Add</button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {passengers.map((p, i) => (
                  <div key={i} style={s.passengerCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-head)', letterSpacing: '0.06em' }}>PASSENGER {i + 1}</span>
                      {i > 0 && <button type="button" onClick={() => removePassenger(i)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>✕</button>}
                    </div>
                    <div style={s.passengerFields}>
                      <div style={s.pField}>
                        <label style={s.label}>Full Name *</label>
                        <input placeholder="As on ID" value={p.name} onChange={e => updatePassenger(i, 'name', e.target.value)} required />
                      </div>
                      <div style={s.pField}>
                        <label style={s.label}>Age *</label>
                        <input type="number" placeholder="Age" min="1" max="120" value={p.age} onChange={e => updatePassenger(i, 'age', e.target.value)} required />
                      </div>
                      <div style={s.pField}>
                        <label style={s.label}>Gender *</label>
                        <select value={p.gender} onChange={e => updatePassenger(i, 'gender', e.target.value)}>
                          <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 15, fontSize: 16 }} disabled={loading}>
              {loading ? <><span className="loader" /> Processing...</> : `Pay ₹${Math.round(total * 1.07)} & Confirm →`}
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div style={{ minWidth: 300 }}>
          <div className="card" style={{ position: 'sticky', top: 88 }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, marginBottom: 16 }}>Fare Summary</h3>
            {[
              ['Base Fare (×' + passengers.length + ')', `₹${total}`],
              ['Service Fee',                            `₹${Math.round(total * 0.02)}`],
              ['GST (5%)',                               `₹${Math.round(total * 0.05)}`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-muted)', marginBottom: 10 }}>
                <span>{k}</span><span>{v}</span>
              </div>
            ))}
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Total</span>
              <span style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>₹{Math.round(total * 1.07)}</span>
            </div>
            <div style={{ marginTop: 16, padding: 12, background: 'rgba(45,212,160,0.05)', border: '1px solid rgba(45,212,160,0.1)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              🔒 Secure payment. Free cancellation up to 4 hours before departure.
            </div>
          </div>
        </div>
      </div>
    </div></div>
  )
}

const s = {
  layout:         { display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, alignItems: 'start' },
  pageTitle:      { fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 24 },
  sectionTitle:   { fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 700, marginBottom: 0 },
  classGrid:      { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 },
  classBtn:       { background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '14px 10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, transition: 'all 0.2s' },
  classBtnActive: { borderColor: 'var(--accent)', background: 'rgba(245,166,35,0.06)' },
  passengerCard:  { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 },
  passengerFields:{ display: 'grid', gridTemplateColumns: '1fr 100px 120px', gap: 12 },
  pField:         { display: 'flex', flexDirection: 'column', gap: 5 },
  label:          { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--font-head)' },
  confirmed:      { maxWidth: 520, margin: '40px auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  checkIcon:      { width: 72, height: 72, borderRadius: '50%', background: 'rgba(45,212,160,0.12)', border: '2px solid var(--green)', color: 'var(--green)', fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 },
  pnrBox:         { background: 'var(--bg-card)', border: '1px solid var(--border-lit)', borderRadius: 12, padding: '16px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  confRow:        { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' },
}