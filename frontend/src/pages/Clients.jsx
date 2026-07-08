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
        <div className="text-xs tracking-widest uppercase text-primary font-semibold">Espace client</div>
        <h2 className="text-4xl font-bold mt-2 text-text">Clients</h2>
        <p className="text-muted mt-2">Gère les dossiers clients, contrats et échéances.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-white shadow-sm p-5 grid gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,122,61,0.12)] text-text"
            value={form.first_name}
            onChange={(event) => setForm({ ...form, first_name: event.target.value })}
            placeholder="Prénom"
            required
          />
          <input
            className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,122,61,0.12)] text-text"
            value={form.last_name}
            onChange={(event) => setForm({ ...form, last_name: event.target.value })}
            placeholder="Nom"
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,122,61,0.12)] text-text"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="Email"
          />
          <input
            className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,122,61,0.12)] text-text"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            placeholder="Téléphone"
          />
        </div>
        <input
          className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,122,61,0.12)] text-text"
          value={form.address}
          onChange={(event) => setForm({ ...form, address: event.target.value })}
          placeholder="Adresse"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,122,61,0.12)] text-text"
            value={form.policy_number}
            onChange={(event) => setForm({ ...form, policy_number: event.target.value })}
            placeholder="Numéro de police"
          />
          <input
            className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,122,61,0.12)] text-text"
            value={form.contract_type}
            onChange={(event) => setForm({ ...form, contract_type: event.target.value })}
            placeholder="Type de contrat"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="date"
            className="w-full rounded-2xl border border-border bg-surface p-3 text-text"
            value={form.expiration_date}
            onChange={(event) => setForm({ ...form, expiration_date: event.target.value })}
          />
          <textarea
            className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,122,61,0.12)] text-text"
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            placeholder="Notes"
          />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="rounded-2xl bg-primary px-4 py-2 text-white font-semibold hover:bg-primary/90 transition-colors">
            {editingId ? 'Mettre à jour' : 'Ajouter le client'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm({ first_name: '', last_name: '', email: '', phone: '', address: '', policy_number: '', contract_type: '', expiration_date: '', notes: '' }) }} className="rounded-2xl border border-border bg-white px-4 py-2 text-text hover:bg-primary-soft transition-colors">
              Annuler
            </button>
          )}
        </div>
        {message && <div className="text-primary font-semibold">{message}</div>}
      </form>

      <div className="grid gap-3">
        {clients.map((client) => (
          <div key={client.id} className="rounded-3xl border border-border bg-white shadow-sm p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-bold text-lg text-text">{client.first_name} {client.last_name}</div>
                <div className="text-muted text-sm">{client.email} · {client.phone}</div>
                <div className="text-muted text-sm">{client.address}</div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded-xl border border-border text-text">{client.policy_number}</span>
                  <span className="px-2 py-1 rounded-xl border border-border text-text">{client.contract_type}</span>
                  {client.expiration_date && <span className="px-2 py-1 rounded-xl border border-border text-text">Échéance : {new Date(client.expiration_date).toLocaleDateString('fr-FR')}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => handleEdit(client)} className="rounded-2xl border border-border bg-white px-3 py-1 text-text hover:bg-primary-soft transition-colors">Modifier</button>
                <button type="button" onClick={() => handleDelete(client.id)} className="rounded-2xl border border-border bg-white px-3 py-1 text-text hover:bg-red-50 transition-colors">Supprimer</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
