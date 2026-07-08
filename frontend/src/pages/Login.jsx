import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Login() {
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
    <div className="page-shell" style={{ display: 'grid', placeItems: 'center' }}>
      <form className="card glow" onSubmit={handleSubmit} style={{ width: 'min(460px, 100%)', padding: 28, display: 'grid', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8db1ff' }}>Assistant Assurance</div>
          <h1 style={{ margin: '10px 0 0', fontSize: 34 }}>Connexion</h1>
          <p style={{ margin: '10px 0 0', color: '#a8bde4' }}>Accède au dashboard RAG des agents d'assurance.</p>
        </div>

        <input className="input" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
        <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mot de passe" />
        {error ? <div style={{ color: '#ff9fb2' }}>{error}</div> : null}
        <button className="button" type="submit">Entrer</button>
        <div style={{ textAlign: 'center', color: '#a8bde4', fontSize: 14 }}>
          Pas encore de compte ? <Link to="/register" style={{ color: '#8db1ff' }}>Créer un compte</Link>
        </div>
      </form>
    </div>
  )
}
