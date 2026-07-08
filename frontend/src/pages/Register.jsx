import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Register() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [email, setEmail] = useState('agent@example.com')
  const [fullName, setFullName] = useState('Agent Assurance')
  const [password, setPassword] = useState('agent123')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const response = await register({ email, full_name: fullName, password })
      localStorage.setItem('access_token', response.access_token)
      setUser(response.user)
      navigate('/')
    } catch (registrationError) {
      setError('Impossible de créer le compte.')
    }
  }

  return (
    <div className="page-shell" style={{ display: 'grid', placeItems: 'center' }}>
      <form className="card glow" onSubmit={handleSubmit} style={{ width: 'min(460px, 100%)', padding: 28, display: 'grid', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8db1ff' }}>Assistant Assurance</div>
          <h1 style={{ margin: '10px 0 0', fontSize: 34 }}>Inscription</h1>
          <p style={{ margin: '10px 0 0', color: '#a8bde4' }}>Créer un compte pour accéder à l'assistant IA.</p>
        </div>

        <input className="input" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Nom complet" />
        <input className="input" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
        <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mot de passe" />
        {error ? <div style={{ color: '#ff9fb2' }}>{error}</div> : null}
        <button className="button" type="submit">Créer le compte</button>
        <div style={{ textAlign: 'center', color: '#a8bde4', fontSize: 14 }}>
          Déjà inscrit ? <Link to="/login" style={{ color: '#8db1ff' }}>Retour à la connexion</Link>
        </div>
      </form>
    </div>
  )
}
