const router = require('express').Router();
const Train = require('../models/Train');
const auth = require('../middleware/auth');

// Search trains
router.get('/search', async (req, res) => {
  try {
    const { from, to, date } = req.query;
    const trains = await Train.find({
      from: new RegExp(from, 'i'),
      to:   new RegExp(to, 'i'),
      availableSeats: { $gt: 0 }
    });
    res.json(trains);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all trains (admin)
router.get('/', async (req, res) => {
  const trains = await Train.find();
  res.json(trains);
});

// Add train (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });
    const train = await Train.create(req.body);
    res.status(201).json(train);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;