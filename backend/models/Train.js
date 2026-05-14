const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema({
  trainNumber:   { type: String, required: true, unique: true },
  name:          { type: String, required: true },
  from:          { type: String, required: true },
  to:            { type: String, required: true },
  departureTime: { type: String, required: true },
  arrivalTime:   { type: String, required: true },
  totalSeats:    { type: Number, required: true },
  availableSeats:{ type: Number, required: true },
  price:         { type: Number, required: true },
  classes: [{
    type:   { type: String, enum: ['Sleeper', '3AC', '2AC', '1AC'] },
    price:  Number,
    seats:  Number
  }],
  daysOfOperation: [String]   // ['Mon', 'Wed', 'Fri']
}, { timestamps: true });

module.exports = mongoose.model('Train', trainSchema);