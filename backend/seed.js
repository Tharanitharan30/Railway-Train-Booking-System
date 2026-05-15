require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')
const Train    = require('./models/Train')
const User     = require('./models/User')

const trains = [
  {
    trainNumber: '12621', name: 'Tamil Nadu Express',
    from: 'Chennai', to: 'Delhi',
    departureTime: '22:00', arrivalTime: '07:30',
    totalSeats: 500, availableSeats: 500, price: 750,
    classes: [
      { type: 'Sleeper', price: 450,  seats: 200 },
      { type: '3AC',     price: 1100, seats: 150 },
      { type: '2AC',     price: 1600, seats: 100 },
      { type: '1AC',     price: 2800, seats: 50  },
    ],
    daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  },
  {
    trainNumber: '12951', name: 'Mumbai Rajdhani',
    from: 'Mumbai', to: 'Delhi',
    departureTime: '16:55', arrivalTime: '08:35',
    totalSeats: 400, availableSeats: 400, price: 1200,
    classes: [
      { type: '3AC', price: 1350, seats: 200 },
      { type: '2AC', price: 2000, seats: 150 },
      { type: '1AC', price: 3500, seats: 50  },
    ],
    daysOfOperation: ['Mon','Wed','Thu','Fri','Sat','Sun'],
  },
  {
    trainNumber: '12008', name: 'Shatabdi Express',
    from: 'Chennai', to: 'Bangalore',
    departureTime: '06:00', arrivalTime: '11:00',
    totalSeats: 300, availableSeats: 300, price: 550,
    classes: [
      { type: 'Sleeper', price: 300,  seats: 150 },
      { type: '3AC',     price: 750,  seats: 100 },
      { type: '2AC',     price: 1100, seats: 50  },
    ],
    daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat'],
  },
  {
    trainNumber: '22691', name: 'Rajdhani Express',
    from: 'Bangalore', to: 'Delhi',
    departureTime: '20:00', arrivalTime: '05:45',
    totalSeats: 450, availableSeats: 450, price: 1500,
    classes: [
      { type: '3AC', price: 1800, seats: 200 },
      { type: '2AC', price: 2600, seats: 200 },
      { type: '1AC', price: 4500, seats: 50  },
    ],
    daysOfOperation: ['Tue','Wed','Thu','Fri','Sat','Sun'],
  },
  {
    trainNumber: '12241', name: 'Coimbatore Express',
    from: 'Coimbatore', to: 'Chennai',
    departureTime: '21:45', arrivalTime: '05:30',
    totalSeats: 350, availableSeats: 350, price: 280,
    classes: [
      { type: 'Sleeper', price: 200, seats: 200 },
      { type: '3AC',     price: 550, seats: 100 },
      { type: '2AC',     price: 850, seats: 50  },
    ],
    daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  },
]

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB')

  // Clear existing
  await Train.deleteMany({})
  await User.deleteMany({})

  // Insert trains
  await Train.insertMany(trains)
  console.log(`✅ Seeded ${trains.length} trains`)

  // Create admin user
  const adminPass = await bcrypt.hash('admin123', 10)
  await User.create({
    name: 'Admin User',
    email: 'admin@railyatra.com',
    password: adminPass,
    role: 'admin',
  })
  console.log('✅ Admin created → email: admin@railyatra.com | password: admin123')

  // Create test user
  const userPass = await bcrypt.hash('user123', 10)
  await User.create({
    name: 'Test User',
    email: 'user@railyatra.com',
    password: userPass,
    role: 'user',
  })
  console.log('✅ Test user created → email: user@railyatra.com | password: user123')

  await mongoose.disconnect()
  console.log('🌱 Seeding complete!')
}

seed().catch(err => { console.error(err); process.exit(1) })