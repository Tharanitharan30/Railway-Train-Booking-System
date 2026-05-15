const router  = require('express').Router()
const Booking = require('../models/Booking')
const Train   = require('../models/Train')
const auth    = require('../middleware/auth')

const generatePNR = () =>
  'PNR' + Date.now().toString().slice(-7) + Math.floor(Math.random() * 100)

// POST /api/bookings  — create booking
router.post('/', auth, async (req, res) => {
  try {
    const { trainId, journeyDate, passengers, travelClass } = req.body

    if (!trainId || !journeyDate || !passengers?.length)
      return res.status(400).json({ message: 'Missing required fields' })

    const train = await Train.findById(trainId)
    if (!train) return res.status(404).json({ message: 'Train not found' })

    if (train.availableSeats < passengers.length)
      return res.status(400).json({
        message: `Only ${train.availableSeats} seats available`
      })

    // Calculate price based on class
    const classInfo  = train.classes?.find(c => c.type === travelClass)
    const pricePerSeat = classInfo?.price || train.price
    const totalAmount  = pricePerSeat * passengers.length

    // Assign seat numbers
    const passengersWithSeats = passengers.map((p, i) => ({
      ...p,
      seatNumber: `${travelClass?.[0] || 'G'}${train.totalSeats - train.availableSeats + i + 1}`,
    }))

    const booking = await Booking.create({
      user:        req.user.id,
      train:       trainId,
      journeyDate: new Date(journeyDate),
      passengers:  passengersWithSeats,
      class:       travelClass,
      totalAmount,
      pnrNumber:   generatePNR(),
    })

    // Atomically reduce seats
    await Train.findByIdAndUpdate(trainId, {
      $inc: { availableSeats: -passengers.length },
    })

    // Populate train info before sending
    await booking.populate('train', 'name trainNumber from to departureTime arrivalTime')
    res.status(201).json(booking)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/bookings/my  — logged-in user's bookings
router.get('/my', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('train', 'name trainNumber from to departureTime arrivalTime')
      .sort({ createdAt: -1 })
    res.json(bookings)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/bookings/all  — admin: all bookings
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Admin access required' })

    const bookings = await Booking.find()
      .populate('train', 'name trainNumber from to')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
    res.json(bookings)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/bookings/:id  — single booking
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate('train')

    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    res.json(booking)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/bookings/:id/cancel
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id:  req.params.id,
      user: req.user.id,
    })

    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    if (booking.status === 'Cancelled')
      return res.status(400).json({ message: 'Already cancelled' })

    // Check if journey date has passed
    if (new Date(booking.journeyDate) < new Date())
      return res.status(400).json({ message: 'Cannot cancel past journeys' })

    booking.status = 'Cancelled'
    await booking.save()

    // Restore seats
    await Train.findByIdAndUpdate(booking.train, {
      $inc: { availableSeats: booking.passengers.length },
    })

    res.json(booking)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router