import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import HotelCatalogPage from './pages/HotelCatalogPage'
import SearchAvailabilityPage from './pages/SearchAvailabilityPage'
import BookingPage from './pages/BookingPage'
import StayManagementPage from './pages/StayManagementPage'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/hotels" element={<HotelCatalogPage />} />
                <Route path="/search" element={<SearchAvailabilityPage />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/stays" element={<StayManagementPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
