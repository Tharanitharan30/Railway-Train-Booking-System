const router = require('express').Router()
const Train  = require('../models/Train')
const auth   = require('../middleware/auth')

// GET /api/trains/search?from=Chennai&to=Mumbai
router.get('/search', async (req, res) => {
  try {
    const { from, to } = req.query
    if (!from || !to)
      return res.status(400).json({ message: 'from and to are required' })

    const trains = await Train.find({
      from: new RegExp(from, 'i'),
      to:   new RegExp(to, 'i'),
      availableSeats: { $gt: 0 },
    })
    res.json(trains)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/trains  (all trains — public)
router.get('/', async (req, res) => {
  try {
    const trains = await Train.find().sort({ createdAt: -1 })
    res.json(trains)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/trains/:id
router.get('/:id', async (req, res) => {
  try {
    const train = await Train.findById(req.params.id)
    if (!train) return res.status(404).json({ message: 'Train not found' })
    res.json(train)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/trains  (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Admin access required' })

    const existing = await Train.findOne({ trainNumber: req.body.trainNumber })
    if (existing)
      return res.status(400).json({ message: 'Train number already exists' })

    const train = await Train.create(req.body)
    res.status(201).json(train)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/trains/:id  (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Admin access required' })

    const train = await Train.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!train) return res.status(404).json({ message: 'Train not found' })
    res.json(train)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/trains/:id  (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Admin access required' })

    await Train.findByIdAndDelete(req.params.id)
    res.json({ message: 'Train deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router