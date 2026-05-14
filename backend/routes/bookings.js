const router = require('express').Router();
const Booking = require('../models/Booking');
const Train = require('../models/Train');
const auth = require('../middleware/auth');

// Generate PNR
const generatePNR = () => 'PNR' + Date.now().toString().slice(-8);

// Create booking
router.post('/', auth, async (req, res) => {
  try {
    const { trainId, journeyDate, passengers, travelClass } = req.body;
    const train = await Train.findById(trainId);
    if (!train) return res.status(404).json({ message: 'Train not found' });
    if (train.availableSeats < passengers.length)
      return res.status(400).json({ message: 'Not enough seats' });

    const classInfo = train.classes.find(c => c.type === travelClass);
    const price = (classInfo?.price || train.price) * passengers.length;

    const booking = await Booking.create({
      user: req.user.id,
      train: trainId,
      journeyDate,
      passengers,
      class: travelClass,
      totalAmount: price,
      pnrNumber: generatePNR()
    });

    // Reduce available seats
    await Train.findByIdAndUpdate(trainId, { $inc: { availableSeats: -passengers.length } });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's bookings
router.get('/my', auth, async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id }).populate('train');
  res.json(bookings);
});

// Cancel booking
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status: 'Cancelled' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Restore seats
    await Train.findByIdAndUpdate(booking.train, {
      $inc: { availableSeats: booking.passengers.length }
    });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;