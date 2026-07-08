import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import { useAuth } from '../../context/AuthContext'

export default function AppLayout() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/register') {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="page-shell" style={{ display: 'grid', gap: 24, gridTemplateColumns: '280px minmax(0, 1fr)' }}>
      <Sidebar />
      <main className="card glow" style={{ minHeight: 'calc(100vh - 48px)', padding: 24 }}>
        <Outlet />
      </main>
    </div>
  )
}
