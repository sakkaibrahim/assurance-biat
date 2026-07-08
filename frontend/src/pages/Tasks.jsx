import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState({ title: '', description: '', priority: 'moyenne', estimated_duration: '', deadline: '', assigned_user: '', client_or_dossier: '' })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const loadTasks = () => {
    api.get('/tasks').then((response) => setTasks(response.data || response)).catch(() => setTasks([]))
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const payload = {
        ...form,
        estimated_duration: form.estimated_duration ? Number(form.estimated_duration) : null,
        deadline: form.deadline || null,
      }
      if (editingId) {
        await api.put(`/tasks/${editingId}`, payload)
        setMessage('Tâche mise à jour')
        setEditingId(null)
      } else {
        await api.post('/tasks', payload)
        setMessage('Tâche créée')
      }
      setForm({ title: '', description: '', priority: 'moyenne', estimated_duration: '', deadline: '', assigned_user: '', client_or_dossier: '' })
      loadTasks()
    } catch (error) {
      setMessage('Erreur lors de l’enregistrement')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (task) => {
    setEditingId(task.id)
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      estimated_duration: task.estimated_duration || '',
      deadline: task.deadline ? task.deadline.slice(0, 10) : '',
      assigned_user: task.assigned_user || '',
      client_or_dossier: task.client_or_dossier || '',
    })
  }

  const handleDelete = async (taskId) => {
    await api.delete(`/tasks/${taskId}`)
    loadTasks()
  }

  const priorityColor = {
    urgente: 'text-red-300',
    haute: 'text-orange-300',
    moyenne: 'text-yellow-200',
    faible: 'text-green-200',
  }

  return (
    <section className="grid gap-6">
      <div>
        <div className="text-xs tracking-widest uppercase text-blue-300">Module organisation</div>
        <h2 className="text-4xl font-bold mt-2">Tâches</h2>
        <p className="text-blue-200 mt-2">Organise le travail des agents avec des tâches priorisées et des rappels.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/5 p-5 grid gap-3">
        <input
          className="w-full rounded-2xl border border-white/10 bg-white/5 text-white p-3"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
          placeholder="Titre"
          required
        />
        <textarea
          className="w-full rounded-2xl border border-white/10 bg-white/5 text-white p-3"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          placeholder="Description"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            className="w-full rounded-2xl border border-white/10 bg-white/5 text-white p-3"
            value={form.priority}
            onChange={(event) => setForm({ ...form, priority: event.target.value })}
          >
            <option value="faible">Faible</option>
            <option value="moyenne">Moyenne</option>
            <option value="haute">Haute</option>
            <option value="urgente">Urgente</option>
          </select>
          <input
            type="number"
            className="w-full rounded-2xl border border-white/10 bg-white/5 text-white p-3"
            value={form.estimated_duration}
            onChange={(event) => setForm({ ...form, estimated_duration: event.target.value })}
            placeholder="Durée estimée (min)"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="date"
            className="w-full rounded-2xl border border-white/10 bg-white/5 text-white p-3"
            value={form.deadline}
            onChange={(event) => setForm({ ...form, deadline: event.target.value })}
          />
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/5 text-white p-3"
            value={form.assigned_user}
            onChange={(event) => setForm({ ...form, assigned_user: event.target.value })}
            placeholder="Agent assigné"
          />
        </div>
        <input
          className="w-full rounded-2xl border border-white/10 bg-white/5 text-white p-3"
          value={form.client_or_dossier}
          onChange={(event) => setForm({ ...form, client_or_dossier: event.target.value })}
          placeholder="Client / Dossier"
        />
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="rounded-2xl bg-gradient-to-r from-blue-600 to-teal-400 px-4 py-2 text-white font-semibold hover:shadow-lg transition-all">
            {editingId ? 'Mettre à jour' : 'Créer la tâche'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm({ title: '', description: '', priority: 'moyenne', estimated_duration: '', deadline: '', assigned_user: '', client_or_dossier: '' }) }} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white hover:bg-white/10 transition-colors">
              Annuler
            </button>
          )}
        </div>
        {message && <div className="text-blue-200">{message}</div>}
      </form>

      <div className="grid gap-3">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-bold text-lg">{task.title}</div>
                <div className="text-blue-200 text-sm">{task.description}</div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className={`px-2 py-1 rounded-xl border border-white/10 ${priorityColor[task.priority] || 'text-white'}`}>{task.priority}</span>
                  {task.deadline && <span className="px-2 py-1 rounded-xl border border-white/10 text-white">Échéance : {new Date(task.deadline).toLocaleString('fr-FR')}</span>}
                  <span className="px-2 py-1 rounded-xl border border-white/10 text-white">{task.status}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => handleEdit(task)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-white hover:bg-white/10 transition-colors">Modifier</button>
                <button type="button" onClick={() => handleDelete(task.id)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-white hover:bg-white/10 transition-colors">Supprimer</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
