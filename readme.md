# Railway Train Booking System

A full-stack train ticket booking application built with React, Express, and MongoDB. Users can search trains, choose travel classes, book tickets, review booking history, and cancel upcoming trips from a clean dashboard.

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,express,mongodb" alt="React, Express and MongoDB icons" />
</p>

## Highlights

- Search trains by source, destination, and journey date
- Book tickets with passenger details and travel class selection
- View booking history with status, route, fare, and passenger info
- Cancel upcoming bookings with automatic seat restoration
- Admin-ready seeded data for quick local testing

## Tech Stack

- Frontend: React, Vite, React Router, Axios
- Backend: Express, Node.js, JWT auth
- Database: MongoDB with Mongoose

## Project Structure

```text
Railway Train Booking System/
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed.js
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
└── README.md
```

## Features

### User Features

- Register and log in
- Search available trains
- Select class and add passenger details
- Confirm bookings and get a PNR number
- Review bookings in a dashboard view
- Cancel valid future bookings

### Booking Dashboard

- Summary cards for booking metrics
- Booking status insights
- Journey activity charts
- Frequent route statistics
- Skeleton loading states and smooth scrolling

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd "Railway Train Booking System"
```

### 2. Install dependencies

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 3. Create backend environment file

Create `backend/.env` with:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
```

### 4. Seed sample data

```bash
cd backend
npm run seed
```

### 5. Start the backend

```bash
cd backend
npm run dev
```

### 6. Start the frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`  
Backend runs on `http://localhost:5000`

## Demo Credentials

After running the seed script:

- Admin: `admin@railyatra.com` / `admin123`
- User: `user@railyatra.com` / `user123`

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Trains

- `GET /api/trains/search`
- `GET /api/trains/:id`

### Bookings

- `POST /api/bookings`
- `GET /api/bookings/my`
- `GET /api/bookings/:id`
- `PATCH /api/bookings/:id/cancel`

## Scripts

### Backend

```bash
npm run dev
npm start
npm run seed
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Notes

- CORS is configured for `http://localhost:5173` and `http://localhost:3000`
- Booking cancellation is allowed only for upcoming journeys
- The frontend uses `http://localhost:5000/api` as the API base URL

## License

This project is available for learning and personal development use.
