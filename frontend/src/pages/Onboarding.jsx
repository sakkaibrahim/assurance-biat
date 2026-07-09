import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchClients, fetchOnboardings, createOnboarding, updateOnboarding, deleteOnboarding } from '../services/api'

const PRODUCT_TYPES = [
  { value: 'sante', label: 'Santé' },
  { value: 'auto', label: 'Auto' },
  { value: 'habitation', label: 'Habitation' },
  { value: 'vie', label: 'Vie' },
]

export default function OnboardingList() {
  const navigate = useNavigate()
  const [cases, setCases] = useState([])
  const [clients, setClients] = useState([])
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    product_type: 'sante',
    current_step: 1,
    expected_completion_date: '',
    assigned_agent: '',
  })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const loadCases = () => {
    const params = {}
    if (filterType) params.product_type = filterType
    if (filterStatus) params.status = filterStatus
    fetchOnboardings(params).then(setCases).catch(() => setCases([]))
  }

  useEffect(() => {
    loadCases()
    fetchClients().then(setClients).catch(() => setClients([]))
  }, [filterType, filterStatus])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const payload = {
        ...form,
        expected_completion_date: form.expected_completion_date || null,
      }
      if (editingId) {
        await updateOnboarding(editingId, payload)
        setMessage('Dossier mis à jour')
        setEditingId(null)
      } else {
        await createOnboarding(payload)
        setMessage('Dossier créé')
      }
      setForm({ client_name: '', client_email: '', client_phone: '', product_type: 'sante', current_step: 1, expected_completion_date: '', assigned_agent: '' })
      loadCases()
    } catch (error) {
      setMessage('Erreur lors de l’enregistrement')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setForm({
      client_name: item.client_name,
      client_email: item.client_email || '',
      client_phone: item.client_phone || '',
      product_type: item.product_type,
      current_step: item.current_step,
      expected_completion_date: item.expected_completion_date ? item.expected_completion_date.slice(0, 10) : '',
      assigned_agent: item.assigned_agent || '',
    })
  }

  const handleDelete = async (caseId) => {
    await api.delete(`/onboarding/${caseId}`)
    loadCases()
  }

  const statusBadge = (status) => {
    const colors = {
      en_cours: 'bg-blue-50 text-blue-700 border-blue-200',
      bloque: 'bg-red-50 text-red-700 border-red-200',
      termine: 'bg-green-50 text-green-700 border-green-200',
      abandonne: 'bg-gray-50 text-gray-700 border-gray-200',
    }
    const labels = {
      en_cours: 'En cours',
      bloque: 'Bloqué',
      termine: 'Terminé',
      abandonne: 'Abandonné',
    }
    return (
      <span className={`px-2 py-1 rounded-xl border text-xs font-medium ${colors[status] || colors.en_cours}`}>
        {labels[status] || status}
      </span>
    )
  }

  return (
    <section className="grid gap-6">
      <div>
        <div className="text-xs tracking-widest uppercase text-primary font-semibold">Module Onboarding</div>
        <h2 className="text-4xl font-bold mt-2 text-text">Dossiers d'onboarding</h2>
        <p className="text-muted mt-2">Gère le parcours d'intégration des nouveaux clients.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-white shadow-sm p-5 grid gap-3">
        <input
          className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary text-text"
          value={form.client_name}
          onChange={(event) => setForm({ ...form, client_name: event.target.value })}
          placeholder="Nom complet du client"
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary text-text"
            value={form.client_email}
            onChange={(event) => setForm({ ...form, client_email: event.target.value })}
            placeholder="Email"
            type="email"
          />
          <input
            className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary text-text"
            value={form.client_phone}
            onChange={(event) => setForm({ ...form, client_phone: event.target.value })}
            placeholder="Téléphone"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            className="w-full rounded-2xl border border-border bg-surface p-3 text-text"
            value={form.product_type}
            onChange={(event) => setForm({ ...form, product_type: event.target.value })}
          >
            {PRODUCT_TYPES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <input
            type="date"
            className="w-full rounded-2xl border border-border bg-surface p-3 text-text"
            value={form.expected_completion_date}
            onChange={(event) => setForm({ ...form, expected_completion_date: event.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary text-text"
            value={form.assigned_agent}
            onChange={(event) => setForm({ ...form, assigned_agent: event.target.value })}
            placeholder="Agent assigné"
          />
          <input
            type="number"
            min="1"
            className="w-full rounded-2xl border border-border bg-surface p-3 text-text"
            value={form.current_step}
            onChange={(event) => setForm({ ...form, current_step: parseInt(event.target.value) || 1 })}
            placeholder="Étape actuelle"
          />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="rounded-2xl bg-primary px-4 py-2 text-white font-semibold hover:bg-primary/90 transition-colors">
            {editingId ? 'Mettre à jour' : 'Créer le dossier'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm({ client_name: '', client_email: '', client_phone: '', product_type: 'sante', current_step: 1, expected_completion_date: '', assigned_agent: '' }) }} className="rounded-2xl border border-border bg-white px-4 py-2 text-text hover:bg-primary-soft transition-colors">
              Annuler
            </button>
          )}
          {message && <div className="text-primary font-semibold self-center">{message}</div>}
        </div>
      </form>

      <div className="grid gap-3">
        <div className="flex flex-wrap gap-3 items-center">
          <select className="rounded-2xl border border-border bg-surface p-2 text-text" value={filterType} onChange={(event) => setFilterType(event.target.value)}>
            <option value="">Tous les produits</option>
            {PRODUCT_TYPES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <select className="rounded-2xl border border-border bg-surface p-2 text-text" value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="en_cours">En cours</option>
            <option value="bloque">Bloqué</option>
            <option value="termine">Terminé</option>
            <option value="abandonne">Abandonné</option>
          </select>
          <button onClick={loadCases} className="rounded-2xl border border-border bg-white px-4 py-2 text-text hover:bg-primary-soft transition-colors text-sm">
            Actualiser
          </button>
        </div>

        {cases.map((item) => (
          <div key={item.id} className="rounded-3xl border border-border bg-white shadow-sm p-4 flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-lg text-text">{item.client_name}</span>
                {statusBadge(item.status)}
                <span className="px-2 py-1 rounded-xl border border-border text-xs text-text">{item.product_type}</span>
              </div>
              <div className="text-sm text-muted">
                {item.client_email} {item.client_phone && `· ${item.client_phone}`}
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                {item.assigned_agent && <span>Agent: {item.assigned_agent}</span>}
                {item.expected_completion_date && <span>Échéance: {new Date(item.expected_completion_date).toLocaleDateString('fr-FR')}</span>}
                <span>Étape {item.current_step}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => navigate(`/onboarding/${item.id}`)} className="rounded-2xl border border-border bg-white px-3 py-1 text-text hover:bg-primary-soft transition-colors text-sm">
                Détail
              </button>
              <button type="button" onClick={() => handleEdit(item)} className="rounded-2xl border border-border bg-white px-3 py-1 text-text hover:bg-primary-soft transition-colors text-sm">
                Modifier
              </button>
              <button type="button" onClick={() => handleDelete(item.id)} className="rounded-2xl border border-border bg-white px-3 py-1 text-text hover:bg-red-50 transition-colors text-sm">
                Supprimer
              </button>
            </div>
          </div>
        ))}
        {cases.length === 0 && <div className="text-muted text-center py-8">Aucun dossier d'onboarding</div>}
      </div>
    </section>
  )
}
