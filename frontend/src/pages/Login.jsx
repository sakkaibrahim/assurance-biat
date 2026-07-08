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
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-[460px] rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl p-7 grid gap-4">
        <div>
          <div className="text-xs tracking-widest uppercase text-blue-300">Assistant Assurance</div>
          <h1 className="text-4xl font-bold mt-3">Connexion</h1>
          <p className="mt-2 text-blue-200">Accède au dashboard RAG des agents d'assurance.</p>
        </div>

        <input
          className="w-full rounded-2xl border border-white/10 bg-white/5 text-white p-3 outline-none focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(98,143,255,0.15)]"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          className="w-full rounded-2xl border border-white/10 bg-white/5 text-white p-3 outline-none focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(98,143,255,0.15)]"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Mot de passe"
        />
        {error ? <div className="text-pink-300">{error}</div> : null}
        <button type="submit" className="rounded-2xl bg-gradient-to-r from-blue-600 to-teal-400 px-4 py-3 text-white font-semibold hover:shadow-lg transition-all">
          Entrer
        </button>
        <div className="text-center text-blue-200 text-sm">
          Pas encore de compte ? <Link to="/register" className="text-blue-300">Créer un compte</Link>
        </div>
      </form>
    </div>
  )
}
