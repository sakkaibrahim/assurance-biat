import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Planning() {
  const [plan, setPlan] = useState(null)
  const [summary, setSummary] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const loadDaily = () => {
    setLoading(true)
    api.get(`/planning/daily?date=${selectedDate}`).then((response) => {
      setPlan(response.data || response)
      setMessage('')
    }).catch(() => setMessage('Impossible de charger le planning.'))
      .finally(() => setLoading(false))
  }

  const loadWeekly = () => {
    setLoading(true)
    api.get('/planning/weekly').then((response) => {
      setSummary(response.data || response)
      setMessage('')
    }).catch(() => setMessage('Impossible de charger le résumé.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadDaily()
    loadWeekly()
  }, [])

  return (
    <section className="grid gap-6">
      <div>
        <div className="text-xs tracking-widest uppercase text-primary font-semibold">Module organisation</div>
        <h2 className="text-4xl font-bold mt-2 text-text">Planning intelligent</h2>
        <p className="text-muted mt-2">Génère un planning quotidien optimal selon les priorités et les échéances.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-3xl border border-border bg-white shadow-sm p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-text">Planning du jour</h3>
            <input
              type="date"
              className="rounded-2xl border border-border bg-surface p-2 text-text"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </div>
          <button type="button" onClick={loadDaily} className="mt-3 rounded-2xl bg-primary px-4 py-2 text-white font-semibold hover:bg-primary/90 transition-colors">
            Générer le planning
          </button>
          {loading && <div className="mt-3 text-muted">Génération en cours...</div>}
          {message && <div className="mt-3 text-red-500">{message}</div>}
          {plan && (
            <div className="mt-4 grid gap-2">
              <div className="text-sm text-muted">Fenêtre de travail : {plan.work_window?.start} - {plan.work_window?.end}</div>
              <div className="text-sm text-muted">Créneaux planifiés : {plan.scheduled_count} / {plan.pending_count}</div>
              {plan.slots?.length ? plan.slots.map((slot, index) => (
                <div key={index} className="rounded-2xl border border-border bg-surface p-3">
                  <div className="font-semibold text-text">{slot.title}</div>
                  <div className="text-xs text-muted">{slot.start?.replace('T', ' ')} - {slot.end?.replace('T', ' ')}</div>
                  <div className="text-xs text-primary mt-1">Priorité : {slot.priority}</div>
                </div>
              )) : (
                <div className="text-muted">Aucun créneau généré pour cette journée.</div>
              )}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-border bg-white shadow-sm p-5">
          <h3 className="text-lg font-bold text-text">Résumé hebdomadaire</h3>
          <button type="button" onClick={loadWeekly} className="mt-3 rounded-2xl bg-primary px-4 py-2 text-white font-semibold hover:bg-primary/90 transition-colors">
            Rafraîchir
          </button>
          {summary && (
            <div className="mt-4 grid gap-2">
              <div className="text-sm text-muted">Semaine : {summary.week_start} → {summary.week_end}</div>
              <div className="text-sm text-muted">Tâches totales : {summary.total_tasks}</div>
              <div className="text-sm text-muted">Tâches terminées : {summary.completed_tasks}</div>
              <div className="text-sm text-muted">Tâches en cours : {summary.pending_tasks}</div>
              <div className="text-sm text-muted">Rendez-vous : {summary.appointments_count}</div>
              <div className="text-sm text-primary mt-2">Taux de complétion : {summary.completion_rate}%</div>
            </div>
          )}
        </section>
      </div>
    </section>
  )
}
