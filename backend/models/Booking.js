const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  train: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true },
  journeyDate: { type: Date, required: true },
  passengers: [{
    name:   { type: String, required: true },
    age:    { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    seatNumber: String,
  }],
  class:       { type: String, enum: ['Sleeper', '3AC', '2AC', '1AC'] },
  totalAmount: { type: Number, required: true },
  status:      { type: String, enum: ['Confirmed', 'Cancelled', 'Pending'], default: 'Confirmed' },
  pnrNumber:   { type: String, unique: true },
}, { timestamps: true })

module.exports = mongoose.model('Booking', bookingSchema)