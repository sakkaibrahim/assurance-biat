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
    <aside className="card glow" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8db1ff' }}>Assistant Assurance</div>
        <h1 style={{ margin: '8px 0 0', fontSize: 28 }}>Console IA</h1>
        <p style={{ margin: '10px 0 0', color: '#aac0e8' }}>
          {user ? `${user.full_name} · ${user.email}` : 'Espace de travail des agents'}
        </p>
      </div>

      <nav style={{ display: 'grid', gap: 10 }}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              padding: '14px 16px',
              borderRadius: 16,
              background: isActive ? 'rgba(93, 124, 255, 0.18)' : 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#eef4ff',
              fontWeight: 600,
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', display: 'grid', gap: 12 }}>
        <button className="button secondary" type="button" onClick={() => navigate('/chat')}>
          Lancer une question
        </button>
        <button className="button" type="button" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
