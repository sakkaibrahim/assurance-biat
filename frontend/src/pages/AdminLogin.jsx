import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const response = await login({ email, full_name: 'Administrateur', password })
      localStorage.setItem('access_token', response.access_token)
      setUser(response.user)
      navigate('/')
    } catch (loginError) {
      setError('Connexion impossible. Vérifie le backend.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[460px] rounded-3xl border border-border bg-white shadow-sm p-8 grid gap-6">
        <div className="text-center">
          <div className="text-xs tracking-widest uppercase text-primary font-semibold">Assurance BIAT</div>
          <h1 className="text-4xl font-bold mt-3 text-text">Espace Admin</h1>
          <p className="mt-2 text-muted">Accès réservé aux administrateurs et superviseurs.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,122,61,0.12)] text-text"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email admin"
          />
          <input
            type="password"
            className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,122,61,0.12)] text-text"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mot de passe"
          />
          {error ? <div className="text-red-500">{error}</div> : null}
          <button type="submit" className="rounded-2xl bg-primary px-4 py-3 text-white font-semibold hover:bg-primary/90 transition-colors">
            Se connecter
          </button>
        </form>

        <div className="text-center text-muted text-sm">
          Pas admin ?{' '}
          <Link to="/login/client" className="text-primary font-semibold">
            Accès client
          </Link>
        </div>
      </div>
    </div>
  )
}
