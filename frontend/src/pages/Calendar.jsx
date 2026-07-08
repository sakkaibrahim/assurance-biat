import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Calendar() {
  const [appointments, setAppointments] = useState([])
  const [form, setForm] = useState({ title: '', start_datetime: '', end_datetime: '', client_name: '', client_id: '', location: '', status: 'scheduled' })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [clients, setClients] = useState([])

  const loadAppointments = () => {
    api.get('/calendar').then((response) => setAppointments(response.data || response)).catch(() => setAppointments([]))
  }

  useEffect(() => {
    loadAppointments()
    api.get('/clients').then((response) => setClients(response.data || response)).catch(() => setClients([]))
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const payload = { ...form, client_id: form.client_id ? Number(form.client_id) : null }
      if (editingId) {
        await api.put(`/calendar/${editingId}`, payload)
        setMessage('Rendez-vous mis à jour')
        setEditingId(null)
      } else {
        await api.post('/calendar', payload)
        setMessage('Rendez-vous créé')
      }
      setForm({ title: '', start_datetime: '', end_datetime: '', client_name: '', client_id: '', location: '', status: 'scheduled' })
      loadAppointments()
    } catch (error) {
      setMessage('Erreur lors de l’enregistrement')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (appointment) => {
    setEditingId(appointment.id)
    setForm({
      title: appointment.title,
      start_datetime: appointment.start_datetime?.slice(0, 16) || '',
      end_datetime: appointment.end_datetime?.slice(0, 16) || '',
      client_name: appointment.client_name || '',
      client_id: appointment.client_id || '',
      location: appointment.location || '',
      status: appointment.status,
    })
  }

  const handleDelete = async (appointmentId) => {
    await api.delete(`/calendar/${appointmentId}`)
    loadAppointments()
  }

  return (
    <section className="grid gap-6">
      <div>
        <div className="text-xs tracking-widest uppercase text-primary font-semibold">Module organisation</div>
        <h2 className="text-4xl font-bold mt-2 text-text">Calendrier</h2>
        <p className="text-muted mt-2">Gère les rendez-vous et les événements de la journée.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-white shadow-sm p-5 grid gap-3">
        <input
          className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,122,61,0.12)] text-text"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
          placeholder="Titre"
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="datetime-local"
            className="w-full rounded-2xl border border-border bg-surface p-3 text-text"
            value={form.start_datetime}
            onChange={(event) => setForm({ ...form, start_datetime: event.target.value })}
            required
          />
          <input
            type="datetime-local"
            className="w-full rounded-2xl border border-border bg-surface p-3 text-text"
            value={form.end_datetime}
            onChange={(event) => setForm({ ...form, end_datetime: event.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,122,61,0.12)] text-text"
            value={form.client_name}
            onChange={(event) => setForm({ ...form, client_name: event.target.value })}
            placeholder="Client"
          />
          <select
            className="w-full rounded-2xl border border-border bg-surface p-3 text-text"
            value={form.client_id}
            onChange={(event) => setForm({ ...form, client_id: event.target.value })}
          >
            <option value="">Sélectionner un client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.first_name} {client.last_name}</option>
            ))}
          </select>
        </div>
        <input
          className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,122,61,0.12)] text-text"
          value={form.location}
          onChange={(event) => setForm({ ...form, location: event.target.value })}
          placeholder="Lieu"
        />
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="rounded-2xl bg-primary px-4 py-2 text-white font-semibold hover:bg-primary/90 transition-colors">
            {editingId ? 'Mettre à jour' : 'Créer le rendez-vous'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm({ title: '', start_datetime: '', end_datetime: '', client_name: '', client_id: '', location: '', status: 'scheduled' }) }} className="rounded-2xl border border-border bg-white px-4 py-2 text-text hover:bg-primary-soft transition-colors">
              Annuler
            </button>
          )}
        </div>
        {message && <div className="text-primary font-semibold">{message}</div>}
      </form>

      <div className="grid gap-3">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="rounded-3xl border border-border bg-white shadow-sm p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-bold text-lg text-text">{appointment.title}</div>
                <div className="text-muted text-sm">{appointment.client_name}</div>
                <div className="text-xs text-muted mt-1">
                  {appointment.start_datetime?.replace('T', ' ')} - {appointment.end_datetime?.replace('T', ' ')}
                </div>
                <div className="text-xs text-muted">{appointment.location}</div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => handleEdit(appointment)} className="rounded-2xl border border-border bg-white px-3 py-1 text-text hover:bg-primary-soft transition-colors">Modifier</button>
                <button type="button" onClick={() => handleDelete(appointment.id)} className="rounded-2xl border border-border bg-white px-3 py-1 text-text hover:bg-red-50 transition-colors">Supprimer</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
