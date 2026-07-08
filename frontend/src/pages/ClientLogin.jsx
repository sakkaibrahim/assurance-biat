import { Link, useNavigate } from 'react-router-dom'
import { login, register } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function ClientLogin() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [email, setEmail] = useState('client@example.com')
  const [password, setPassword] = useState('client123')
  const [error, setError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [fullName, setFullName] = useState('Client BIAT')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      if (isRegistering) {
        const response = await register({ email, full_name: fullName, password })
        localStorage.setItem('access_token', response.access_token)
        setUser(response.user)
        navigate('/')
      } else {
        const response = await login({ email, full_name: 'Client', password })
        localStorage.setItem('access_token', response.access_token)
        setUser(response.user)
        navigate('/')
      }
    } catch (loginError) {
      setError('Connexion impossible. Vérifie le backend.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[460px] rounded-3xl border border-border bg-white shadow-sm p-8 grid gap-6">
        <div className="text-center">
          <div className="text-xs tracking-widest uppercase text-primary font-semibold">Assurance BIAT</div>
          <h1 className="text-4xl font-bold mt-3 text-text">{isRegistering ? 'Inscription client' : 'Espace client'}</h1>
          <p className="mt-2 text-muted">Accès réservé aux clients et assurés.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {isRegistering && (
            <input
              className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,122,61,0.12)] text-text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Nom complet"
            />
          )}
          <input
            className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,122,61,0.12)] text-text"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
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
            {isRegistering ? 'Créer un compte' : 'Se connecter'}
          </button>
        </form>

        <div className="text-center text-muted text-sm">
          {isRegistering ? 'Déjà un compte ? ' : 'Pas encore de compte ? '}
          <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-primary font-semibold">
            {isRegistering ? 'Se connecter' : "S'inscrire"}
          </button>
        </div>

        <div className="text-center text-muted text-sm">
          Admin ?{' '}
          <Link to="/login/admin" className="text-primary font-semibold">
            Accès admin
          </Link>
        </div>
      </div>
    </div>
  )
}
