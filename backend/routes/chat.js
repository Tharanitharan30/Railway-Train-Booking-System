const router  = require('express').Router()
const Train   = require('../models/Train')
const Booking = require('../models/Booking')

// Intent detection — pure keyword matching
const detectIntent = (msg) => {
  const m = msg.toLowerCase()
  if (/(search|find|train|going|travel|from|to|route)/.test(m))  return 'search'
  if (/(book|ticket|reserve|seat)/.test(m))                       return 'booking_help'
  if (/(cancel|cancell|refund)/.test(m))                          return 'cancel'
  if (/(pnr|status|my booking|booked)/.test(m))                   return 'pnr'
  if (/(price|cost|fare|charge|fee|cheap|expensive)/.test(m))     return 'price'
  if (/(class|sleeper|3ac|2ac|1ac|ac|berth)/.test(m))             return 'classes'
  if (/(available|seat|vacancy)/.test(m))                         return 'availability'
  if (/(time|depart|arrive|schedule|when)/.test(m))               return 'schedule'
  if (/(hello|hi|hey|help|start)/.test(m))                        return 'greeting'
  if (/(thank|thanks|bye|ok|okay|got it)/.test(m))                return 'closing'
  return 'unknown'
}

// Extract city names from message
const extractCities = (msg) => {
  // Common Indian cities
  const cities = [
    'chennai','mumbai','delhi','bangalore','hyderabad',
    'kolkata','pune','ahmedabad','jaipur','coimbatore',
    'madurai','trichy','salem','erode','tirunelveli',
    'surat','lucknow','kanpur','nagpur','indore',
    'bhopal','patna','varanasi','agra','goa',
  ]
  const found = []
  const m = msg.toLowerCase()
  cities.forEach(c => { if (m.includes(c)) found.push(c) })
  return found
}

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body
    const userId = req.body.userId || null

    if (!message?.trim())
      return res.status(400).json({ message: 'Empty message' })

    const intent = detectIntent(message)
    let reply    = ''
    let trains   = []

    switch (intent) {

      // ── Greeting ──────────────────────────────────────
      case 'greeting':
        reply = `👋 Hello! Welcome to **RailYatra**!\n\nI can help you with:\n• 🔍 Searching trains between cities\n• 💺 Checking seat availability\n• 💰 Fare & class information\n• 📋 Booking guidance\n• ❌ Cancellation policy\n\nTry asking: *"trains from Chennai to Mumbai"* or *"how to book a ticket?"*`
        break

      // ── Train Search ──────────────────────────────────
      case 'search': {
        const cities = extractCities(message)

        if (cities.length >= 2) {
          trains = await Train.find({
            from: new RegExp(cities[0], 'i'),
            to:   new RegExp(cities[1], 'i'),
            availableSeats: { $gt: 0 },
          }).limit(5)

          if (trains.length === 0) {
            // Try reverse
            trains = await Train.find({
              from: new RegExp(cities[1], 'i'),
              to:   new RegExp(cities[0], 'i'),
              availableSeats: { $gt: 0 },
            }).limit(5)
          }

          if (trains.length > 0) {
            const trainList = trains.map(t =>
              `🚆 **${t.name}** (${t.trainNumber})\n` +
              `   ${t.from} → ${t.to}\n` +
              `   🕐 ${t.departureTime} → ${t.arrivalTime}\n` +
              `   💺 ${t.availableSeats} seats available\n` +
              `   💰 From ₹${Math.min(...(t.classes?.map(c => c.price) || [t.price]))}`
            ).join('\n\n')
            reply = `Found **${trains.length} train(s)** from ${cities[0]} to ${cities[1]}:\n\n${trainList}\n\n👉 Go to the home page, enter your route and date to book!`
          } else {
            reply = `😕 No trains found from **${cities[0]}** to **${cities[1]}**.\n\nTry checking:\n• Spelling of city names\n• A different route\n• Our search page for all available routes`
          }
        } else if (cities.length === 1) {
          trains = await Train.find({
            $or: [
              { from: new RegExp(cities[0], 'i') },
              { to:   new RegExp(cities[0], 'i') },
            ]
          }).limit(6)

          if (trains.length > 0) {
            const fromList = trains.filter(t => t.from.toLowerCase().includes(cities[0]))
            const toList   = trains.filter(t => t.to.toLowerCase().includes(cities[0]))
            reply = `🚉 Trains involving **${cities[0]}**:\n\n`
            if (fromList.length) reply += `**Departing from ${cities[0]}:**\n` + fromList.map(t => `• ${t.name} → ${t.to} (${t.departureTime})`).join('\n')
            if (toList.length)   reply += `\n\n**Arriving at ${cities[0]}:**\n`  + toList.map(t =>  `• ${t.name} from ${t.from} (${t.arrivalTime})`).join('\n')
          } else {
            reply = `No trains found for **${cities[0]}**. Please check the city name and try again.`
          }
        } else {
          // No city detected — show all trains
          trains = await Train.find({ availableSeats: { $gt: 0 } }).limit(6)
          if (trains.length > 0) {
            reply = `🚆 **Available Trains:**\n\n` +
              trains.map(t => `• **${t.name}** — ${t.from} → ${t.to} | ${t.departureTime} | ₹${t.price}`).join('\n') +
              `\n\n💡 Tip: Ask me *"trains from Chennai to Delhi"* for specific routes!`
          } else {
            reply = `No trains available right now. Please check back later.`
          }
        }
        break
      }

      // ── Booking Help ──────────────────────────────────
      case 'booking_help':
        reply = `📋 **How to Book a Ticket:**\n\n1️⃣ Go to the **Home page**\n2️⃣ Enter *From*, *To*, and *Date*\n3️⃣ Click **Search Trains**\n4️⃣ Choose your train → click **Book Now**\n5️⃣ Select your **travel class**\n6️⃣ Enter **passenger details** (name, age, gender)\n7️⃣ Click **Pay & Confirm**\n\n✅ You'll get a **PNR number** instantly after booking!\n\nNeed help finding a specific train? Just ask me!`
        break

      // ── Cancellation ──────────────────────────────────
      case 'cancel':
        reply = `❌ **Cancellation Policy:**\n\n✅ Free cancellation up to **4 hours** before departure\n🔄 Seats are **automatically restored** after cancellation\n\n**How to Cancel:**\n1. Go to **My Bookings** page\n2. Find your booking\n3. Click **Cancel Booking**\n4. Confirm the cancellation\n\n⚠️ You **cannot cancel** after the journey date has passed.`
        break

      // ── PNR / My Bookings ─────────────────────────────
      case 'pnr':
        if (userId) {
          const bookings = await Booking.find({ user: userId })
            .populate('train', 'name from to')
            .sort({ createdAt: -1 })
            .limit(3)

          if (bookings.length > 0) {
            const list = bookings.map(b =>
              `• **PNR: ${b.pnrNumber}**\n  ${b.train?.name} | ${b.train?.from} → ${b.train?.to}\n  📅 ${new Date(b.journeyDate).toDateString()} | ${b.status === 'Confirmed' ? '✅' : '❌'} ${b.status}`
            ).join('\n\n')
            reply = `🎫 **Your Recent Bookings:**\n\n${list}\n\n👉 View all bookings in **My Bookings** page`
          } else {
            reply = `You don't have any bookings yet.\n\n👉 Search for trains on the **Home page** to book your first ticket!`
          }
        } else {
          reply = `🔐 Please **login** to check your PNR and booking status.\n\nOnce logged in, you can:\n• View all your bookings\n• Check PNR status\n• Cancel bookings\n\n👉 Go to **My Bookings** after logging in.`
        }
        break

      // ── Price Info ────────────────────────────────────
      case 'price': {
        const cities = extractCities(message)
        if (cities.length >= 2) {
          trains = await Train.find({
            from: new RegExp(cities[0], 'i'),
            to:   new RegExp(cities[1], 'i'),
          }).limit(3)

          if (trains.length > 0) {
            const priceInfo = trains.map(t => {
              const classInfo = t.classes?.length > 0
                ? t.classes.map(c => `${c.type}: ₹${c.price}`).join(' | ')
                : `General: ₹${t.price}`
              return `🚆 **${t.name}**\n   ${classInfo}`
            }).join('\n\n')
            reply = `💰 **Fares from ${cities[0]} to ${cities[1]}:**\n\n${priceInfo}`
          } else {
            reply = `No trains found for that route to show prices.\nTry searching from the Home page.`
          }
        } else {
          reply = `💰 **Ticket Price Ranges:**\n\n• 🛌 **Sleeper** — ₹200 to ₹600 (budget)\n• 🚃 **3AC** — ₹500 to ₹1500 (most popular)\n• 🚃 **2AC** — ₹900 to ₹2500 (comfortable)\n• 👑 **1AC** — ₹1500 to ₹5000 (premium)\n\n💡 Ask me *"price from Chennai to Mumbai"* for exact fares!`
        }
        break
      }

      // ── Class Info ────────────────────────────────────
      case 'classes':
        reply = `💺 **Travel Classes Explained:**\n\n🛌 **Sleeper (SL)**\n   Most affordable, open berths, fans\n   Best for: Budget travel, short trips\n\n🚃 **3 Tier AC (3AC)**\n   Air-conditioned, 3 berths per section\n   Best for: Comfortable long journeys\n\n🚃 **2 Tier AC (2AC)**\n   More spacious, privacy curtains\n   Best for: Business/family travel\n\n👑 **1st Class AC (1AC)**\n   Private cabins, premium service\n   Best for: Luxury travel\n\n💡 **Recommendation:** 3AC is the sweet spot for most travelers!`
        break

      // ── Availability ──────────────────────────────────
      case 'availability': {
        const cities = extractCities(message)
        if (cities.length >= 2) {
          trains = await Train.find({
            from: new RegExp(cities[0], 'i'),
            to:   new RegExp(cities[1], 'i'),
          })
          if (trains.length > 0) {
            reply = trains.map(t =>
              `🚆 **${t.name}** — ${t.availableSeats > 0 ? `✅ ${t.availableSeats} seats available` : '❌ Fully booked'}`
            ).join('\n')
          } else {
            reply = `No trains found for that route.`
          }
        } else {
          const available = await Train.countDocuments({ availableSeats: { $gt: 0 } })
          const total     = await Train.countDocuments()
          reply = `📊 **Current Availability:**\n\n✅ **${available}** trains have seats available\n🚆 **${total}** total trains in system\n\n💡 Ask me *"seats from Chennai to Delhi"* for a specific route!`
        }
        break
      }

      // ── Schedule ──────────────────────────────────────
      case 'schedule': {
        const cities = extractCities(message)
        if (cities.length >= 2) {
          trains = await Train.find({
            from: new RegExp(cities[0], 'i'),
            to:   new RegExp(cities[1], 'i'),
          }).limit(5)

          if (trains.length > 0) {
            reply = `🕐 **Train Schedule — ${cities[0]} to ${cities[1]}:**\n\n` +
              trains.map(t =>
                `🚆 **${t.name}** (${t.trainNumber})\n   Departs: ${t.departureTime} | Arrives: ${t.arrivalTime}\n   Runs: ${t.daysOfOperation?.join(', ') || 'Daily'}`
              ).join('\n\n')
          } else {
            reply = `No schedule found for that route. Try the search page for exact timings.`
          }
        } else {
          reply = `📅 To check train schedules, please tell me the route!\n\nExample: *"train schedule from Chennai to Bangalore"*`
        }
        break
      }

      // ── Closing ───────────────────────────────────────
      case 'closing':
        reply = `😊 You're welcome! Have a safe and comfortable journey! 🚆\n\nFeel free to ask me anything else about your travel plans!`
        break

      // ── Unknown ───────────────────────────────────────
      default: {
        const allTrains = await Train.find().limit(5)
        reply = `🤔 I'm not sure I understood that. Here's what I can help with:\n\n• *"trains from Chennai to Mumbai"* — find trains\n• *"how to book a ticket"* — booking guide\n• *"cancel my booking"* — cancellation help\n• *"price from Delhi to Pune"* — check fares\n• *"sleeper vs 3AC"* — class comparison\n• *"available seats"* — check availability\n\n🚆 **Currently running ${allTrains.length}+ trains!** Just ask me about any route.`
      }
    }

    res.json({ reply, intent })

  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({ reply: 'Sorry, something went wrong. Please try again!' })
  }
})

module.exports = router