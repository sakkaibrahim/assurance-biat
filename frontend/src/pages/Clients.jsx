import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', address: '', policy_number: '', contract_type: '', expiration_date: '', notes: '' })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const loadClients = () => {
    api.get('/clients').then((response) => setClients(response.data || response)).catch(() => setClients([]))
  }

  useEffect(() => {
    loadClients()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const payload = { ...form, expiration_date: form.expiration_date || null }
      if (editingId) {
        await api.put(`/clients/${editingId}`, payload)
        setMessage('Client mis à jour')
        setEditingId(null)
      } else {
        await api.post('/clients', payload)
        setMessage('Client ajouté')
      }
      setForm({ first_name: '', last_name: '', email: '', phone: '', address: '', policy_number: '', contract_type: '', expiration_date: '', notes: '' })
      loadClients()
    } catch (error) {
      setMessage('Erreur lors de l’enregistrement')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (client) => {
    setEditingId(client.id)
    setForm({
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      policy_number: client.policy_number || '',
      contract_type: client.contract_type || '',
      expiration_date: client.expiration_date ? client.expiration_date.slice(0, 10) : '',
      notes: client.notes || '',
    })
  }

  const handleDelete = async (clientId) => {
    await api.delete(`/clients/${clientId}`)
    loadClients()
  }

  return (
    <section className="grid gap-6">
      <div>
        <div className="text-xs tracking-widest uppercase text-blue-300">Espace client</div>
        <h2 className="text-4xl font-bold mt-2">Clients</h2>
        <p className="text-blue-200 mt-2">Gère les dossiers clients, contrats et échéances.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/5 p-5 grid gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/5 text-white p-3"
            value={form.first_name}
            onChange={(event) => setForm({ ...form, first_name: event.target.value })}
            placeholder="Prénom"
            required
          />
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/5 text-white p-3"
            value={form.last_name}
            onChange={(event) => setForm({ ...form, last_name: event.target.value })}
            placeholder="Nom"
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/5 text-white p-3"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="Email"
          />
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/5 text-white p-3"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            placeholder="Téléphone"
          />
        </div>
        <input
          className="w-full rounded-2xl border border-white/10 bg-white/5 text-white p-3"
          value={form.address}
          onChange={(event) => setForm({ ...form, address: event.target.value })}
          placeholder="Adresse"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/5 text-white p-3"
            value={form.policy_number}
            onChange={(event) => setForm({ ...form, policy_number: event.target.value })}
            placeholder="Numéro de police"
          />
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/5 text-white p-3"
            value={form.contract_type}
            onChange={(event) => setForm({ ...form, contract_type: event.target.value })}
            placeholder="Type de contrat"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="date"
            className="w-full rounded-2xl border border-white/10 bg-white/5 text-white p-3"
            value={form.expiration_date}
            onChange={(event) => setForm({ ...form, expiration_date: event.target.value })}
          />
          <textarea
            className="w-full rounded-2xl border border-white/10 bg-white/5 text-white p-3"
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            placeholder="Notes"
          />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="rounded-2xl bg-gradient-to-r from-blue-600 to-teal-400 px-4 py-2 text-white font-semibold hover:shadow-lg transition-all">
            {editingId ? 'Mettre à jour' : 'Ajouter le client'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm({ first_name: '', last_name: '', email: '', phone: '', address: '', policy_number: '', contract_type: '', expiration_date: '', notes: '' }) }} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white hover:bg-white/10 transition-colors">
              Annuler
            </button>
          )}
        </div>
        {message && <div className="text-blue-200">{message}</div>}
      </form>

      <div className="grid gap-3">
        {clients.map((client) => (
          <div key={client.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-bold text-lg">{client.first_name} {client.last_name}</div>
                <div className="text-blue-200 text-sm">{client.email} · {client.phone}</div>
                <div className="text-blue-200 text-sm">{client.address}</div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded-xl border border-white/10 text-white">{client.policy_number}</span>
                  <span className="px-2 py-1 rounded-xl border border-white/10 text-white">{client.contract_type}</span>
                  {client.expiration_date && <span className="px-2 py-1 rounded-xl border border-white/10 text-white">Échéance : {new Date(client.expiration_date).toLocaleDateString('fr-FR')}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => handleEdit(client)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-white hover:bg-white/10 transition-colors">Modifier</button>
                <button type="button" onClick={() => handleDelete(client.id)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-white hover:bg-white/10 transition-colors">Supprimer</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
