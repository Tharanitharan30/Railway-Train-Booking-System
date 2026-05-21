import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider }  from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Navbar         from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home           from './pages/Home'
import Login          from './pages/Login'
import Register       from './pages/Register'
import SearchResults  from './pages/SearchResults'
import BookingForm    from './pages/BookingForm'
import MyBookings     from './pages/MyBookings'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import Chatbot from './components/Chatbot'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/"              element={<Home />} />
            <Route path="/login"         element={<Login />} />
            <Route path="/register"      element={<Register />} />
            <Route path="/search"        element={<SearchResults />} />
            <Route path="/book/:trainId" element={<ProtectedRoute><BookingForm /></ProtectedRoute>} />
            <Route path="/my-bookings"   element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
            <Route path="/profile"       element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          </Routes>
          <Chatbot />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
