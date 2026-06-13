import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import LoadingSpinner from './components/ui/LoadingSpinner'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RiskDashboardPage from './pages/RiskDashboardPage'
import RiskDetailPage from './pages/RiskDetailPage'
import SWFListPage from './pages/SWFListPage'
import SWFProfilePage from './pages/SWFProfilePage'
import ChampionsListPage from './pages/ChampionsListPage'
import ChampionProfilePage from './pages/ChampionProfilePage'
import NetworkPage from './pages/NetworkPage'
import MapPage from './pages/MapPage'
import EventsPage from './pages/EventsPage'
import AlertsPage from './pages/AlertsPage'
import DataEntryPage from './pages/DataEntryPage'

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-navy-950 flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/risk" element={<ProtectedRoute><RiskDashboardPage /></ProtectedRoute>} />
      <Route path="/risk/:slug" element={<ProtectedRoute><RiskDetailPage /></ProtectedRoute>} />
      <Route path="/swf" element={<ProtectedRoute><SWFListPage /></ProtectedRoute>} />
      <Route path="/swf/:id" element={<ProtectedRoute><SWFProfilePage /></ProtectedRoute>} />
      <Route path="/champions" element={<ProtectedRoute><ChampionsListPage /></ProtectedRoute>} />
      <Route path="/champions/:id" element={<ProtectedRoute><ChampionProfilePage /></ProtectedRoute>} />
      <Route path="/network" element={<ProtectedRoute><NetworkPage /></ProtectedRoute>} />
      <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
      <Route path="/data-entry" element={<ProtectedRoute><DataEntryPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
