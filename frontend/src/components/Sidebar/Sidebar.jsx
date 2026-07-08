import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const items = [
  { to: '/', label: 'Dashboard' },
  { to: '/chat', label: 'Chat IA' },
  { to: '/documents', label: 'Documents' },
  { to: '/history', label: 'Historique' },
  { to: '/settings', label: 'Paramètres' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl p-5 flex flex-col gap-5">
      <div>
        <div className="text-xs tracking-widest uppercase text-blue-300">Assistant Assurance</div>
        <h1 className="text-3xl font-bold mt-2">Console IA</h1>
        <p className="mt-2 text-blue-200">
          {user ? `${user.full_name} · ${user.email}` : 'Espace de travail des agents'}
        </p>
      </div>

      <nav className="grid gap-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `px-4 py-3 rounded-2xl font-semibold transition-colors ${
                isActive
                  ? 'bg-blue-500/20 border border-white/10 text-white'
                  : 'bg-white/5 border border-white/5 text-white hover:bg-white/10'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto grid gap-3">
        <button
          type="button"
          onClick={() => navigate('/chat')}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white hover:bg-white/10 transition-colors"
        >
          Lancer une question
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-2xl bg-gradient-to-r from-blue-600 to-teal-400 px-4 py-2 text-white font-semibold hover:shadow-lg transition-all"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
