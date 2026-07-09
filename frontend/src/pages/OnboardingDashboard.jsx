import { useEffect, useState } from 'react'
import { fetchOnboardingDashboard, fetchPrioritizedCases } from '../services/api'

export default function OnboardingDashboard() {
  const [stats, setStats] = useState(null)
  const [prioritized, setPrioritized] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchOnboardingDashboard(),
      fetchPrioritizedCases(5),
    ])
      .then(([dashboardData, prioritizedData]) => {
        setStats(dashboardData)
        setPrioritized(prioritizedData)
      })
      .catch(() => setLoading(false))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-muted">Chargement du tableau de bord...</div>
  if (!stats) return <div className="text-muted">Erreur lors du chargement</div>

  const widgets = [
    { label: 'Onboardings en cours', value: stats.onboardings_en_cours, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Dossiers bloqués', value: stats.dossiers_bloques, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Étapes en retard', value: stats.etapes_en_retard, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Terminés cette semaine', value: stats.onboardings_termines_semaine, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Taux de complétion', value: `${stats.taux_completion_global}%`, color: 'text-primary', bg: 'bg-green-50' },
    { label: 'Clients à haut risque', value: stats.clients_haut_risque, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Activité récente', value: stats.activite_recente, color: 'text-text', bg: 'bg-gray-50' },
  ]

  const riskBadge = (level) => {
    const colors = {
      faible: 'bg-green-50 text-green-700 border-green-200',
      moyen: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      eleve: 'bg-orange-50 text-orange-700 border-orange-200',
      critique: 'bg-red-50 text-red-700 border-red-200',
    }
    return <span className={`px-2 py-1 rounded-xl border text-xs font-medium ${colors[level] || colors.faible}`}>{level}</span>
  }

  return (
    <section className="grid gap-6">
      <div>
        <div className="text-xs tracking-widest uppercase text-primary font-semibold">Module Onboarding</div>
        <h2 className="text-4xl font-bold mt-2 text-text">Tableau de bord onboarding</h2>
        <p className="text-muted mt-2">Vue d'ensemble des dossiers d'intégration des nouveaux clients.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {widgets.map((widget) => (
          <div key={widget.label} className={`rounded-3xl border border-border p-4 ${widget.bg}`}>
            <div className="text-sm text-muted">{widget.label}</div>
            <div className={`text-3xl font-bold mt-2 ${widget.color}`}>{widget.value}</div>
          </div>
        ))}
      </div>

      {prioritized.length > 0 && (
        <div className="rounded-3xl border border-border bg-white shadow-sm p-5">
          <h3 className="text-xl font-bold text-text mb-4">Clients à relancer en priorité</h3>
          <div className="grid gap-2">
            {prioritized.map((item) => (
              <div key={item.case_id} className="rounded-2xl border border-border bg-surface p-3 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text">{item.client_name}</span>
                    <span className="px-2 py-1 rounded-xl border border-border text-xs text-text">{item.product_type}</span>
                    {riskBadge(item.risk_level)}
                  </div>
                  <div className="text-sm text-muted mt-1">Score: {item.risk_score} · {item.suggested_action}</div>
                </div>
                <span className="text-xs text-muted whitespace-nowrap">{item.assigned_agent || 'Non assigné'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-muted">
        Dernière mise à jour: {new Date(stats.generated_at).toLocaleString('fr-FR')}
      </div>
    </section>
  )
}
