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
    <div className="min-h-screen p-6 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
      <Sidebar />
      <main className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl min-h-[calc(100vh-48px)] p-6">
        <Outlet />
      </main>
    </div>
  )
}
