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
        <div className="text-xs tracking-widest uppercase text-blue-300">Module organisation</div>
        <h2 className="text-4xl font-bold mt-2">Planning intelligent</h2>
        <p className="text-blue-200 mt-2">Génère un planning quotidien optimal selon les priorités et les échéances.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold">Planning du jour</h3>
            <input
              type="date"
              className="rounded-2xl border border-white/10 bg-white/5 text-white p-2"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </div>
          <button type="button" onClick={loadDaily} className="mt-3 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-400 px-4 py-2 text-white font-semibold hover:shadow-lg transition-all">
            Générer le planning
          </button>
          {loading && <div className="mt-3 text-blue-200">Génération en cours...</div>}
          {message && <div className="mt-3 text-pink-300">{message}</div>}
          {plan && (
            <div className="mt-4 grid gap-2">
              <div className="text-sm text-blue-200">Fenêtre de travail : {plan.work_window?.start} - {plan.work_window?.end}</div>
              <div className="text-sm text-blue-200">Créneaux planifiés : {plan.scheduled_count} / {plan.pending_count}</div>
              {plan.slots?.length ? plan.slots.map((slot, index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="font-semibold">{slot.title}</div>
                  <div className="text-xs text-blue-200">{slot.start?.replace('T', ' ')} - {slot.end?.replace('T', ' ')}</div>
                  <div className="text-xs text-blue-300 mt-1">Priorité : {slot.priority}</div>
                </div>
              )) : (
                <div className="text-blue-200">Aucun créneau généré pour cette journée.</div>
              )}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-lg font-bold">Résumé hebdomadaire</h3>
          <button type="button" onClick={loadWeekly} className="mt-3 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-400 px-4 py-2 text-white font-semibold hover:shadow-lg transition-all">
            Rafraîchir
          </button>
          {summary && (
            <div className="mt-4 grid gap-2">
              <div className="text-sm text-blue-200">Semaine : {summary.week_start} → {summary.week_end}</div>
              <div className="text-sm text-blue-200">Tâches totales : {summary.total_tasks}</div>
              <div className="text-sm text-blue-200">Tâches terminées : {summary.completed_tasks}</div>
              <div className="text-sm text-blue-200">Tâches en cours : {summary.pending_tasks}</div>
              <div className="text-sm text-blue-200">Rendez-vous : {summary.appointments_count}</div>
              <div className="text-sm text-blue-300 mt-2">Taux de complétion : {summary.completion_rate}%</div>
            </div>
          )}
        </section>
      </div>
    </section>
  )
}
