import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const adminItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/chat', label: 'Chat IA' },
  { to: '/documents', label: 'Documents' },
  { to: '/clients', label: 'Clients' },
  { to: '/tasks', label: 'Tâches' },
  { to: '/planning', label: 'Planning' },
  { to: '/calendar', label: 'Calendrier' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/history', label: 'Historique' },
  { to: '/settings', label: 'Paramètres' },
]

const clientItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/chat', label: 'Chat IA' },
  { to: '/tasks', label: 'Mes tâches' },
  { to: '/calendar', label: 'Calendrier' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/settings', label: 'Paramètres' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const isAdmin = user?.is_admin || false
  const items = isAdmin ? adminItems : clientItems

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="rounded-3xl border border-border bg-white shadow-sm p-5 flex flex-col gap-5">
      <div>
        <div className="text-xs tracking-widest uppercase text-primary font-semibold">Assurance BIAT</div>
        <h1 className="text-3xl font-bold mt-2 text-text">{isAdmin ? 'Console IA' : 'Espace client'}</h1>
        <p className="mt-2 text-muted">
          {user ? `${user.full_name} · ${user.email}` : 'Espace de travail des agents'}
        </p>
        {isAdmin && (
          <span className="inline-block mt-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs text-primary font-semibold">
            Administrateur
          </span>
        )}
      </div>

      <nav className="grid gap-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `px-4 py-3 rounded-2xl font-semibold transition-colors ${
                isActive
                  ? 'bg-primary-soft text-primary border border-primary/20'
                  : 'bg-surface text-text hover:bg-primary-soft/60 border border-transparent'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto grid gap-3">
        {isAdmin && (
          <button
            type="button"
            onClick={() => navigate('/chat')}
            className="rounded-2xl border border-border bg-white px-4 py-2 text-text hover:bg-primary-soft transition-colors"
          >
            Lancer une question
          </button>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-2xl bg-primary px-4 py-2 text-white font-semibold hover:bg-primary/90 transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
