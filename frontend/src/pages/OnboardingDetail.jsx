import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchOnboarding, fetchSteps, fetchInteractions, fetchRiskScores, createStep, updateStep, deleteStep as deleteStepApi, createInteraction, calculateRiskScore } from '../services/api'

const STEP_STATUSES = [
  { value: 'a_faire', label: 'À faire', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  { value: 'en_cours', label: 'En cours', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'terminee', label: 'Terminée', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'bloquee', label: 'Bloquée', color: 'bg-red-50 text-red-700 border-red-200' },
]

const INTERACTION_TYPES = [
  { value: 'appel', label: 'Appel' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'reunion', label: 'Réunion' },
]

export default function OnboardingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [caseData, setCaseData] = useState(null)
  const [steps, setSteps] = useState([])
  const [interactions, setInteractions] = useState([])
  const [riskScore, setRiskScore] = useState(null)
  const [stepForm, setStepForm] = useState({ step_name: '', status: 'a_faire', deadline: '', required_documents: '', notes: '' })
  const [interactionForm, setInteractionForm] = useState({ interaction_type: 'email', notes: '', next_followup_date: '' })
  const [message, setMessage] = useState('')

  const loadData = () => {
    fetchOnboarding(id).then(setCaseData).catch(() => navigate('/onboarding'))
    fetchSteps(id).then(setSteps).catch(() => setSteps([]))
    fetchInteractions(id).then(setInteractions).catch(() => setInteractions([]))
    fetchRiskScores({ case_id: id }).then((response) => {
      const scores = Array.isArray(response) ? response : [response]
      setRiskScore(scores.length > 0 ? scores[0] : null)
    }).catch(() => setRiskScore(null))
  }

  useEffect(() => {
    loadData()
  }, [id])

  const addStep = async (event) => {
    event.preventDefault()
    setMessage('')
    try {
      await createStep({ ...stepForm, case_id: Number(id), deadline: stepForm.deadline || null })
      setStepForm({ step_name: '', status: 'a_faire', deadline: '', required_documents: '', notes: '' })
      loadData()
      setMessage('Étape ajoutée')
    } catch (error) {
      setMessage('Erreur')
    }
  }

  const updateStepStatus = async (stepId, status) => {
    await updateStep(stepId, { status })
    loadData()
  }

  const deleteStep = async (stepId) => {
    await deleteStepApi(stepId)
    loadData()
  }

  const addInteraction = async (event) => {
    event.preventDefault()
    setMessage('')
    try {
      await createInteraction({ ...interactionForm, case_id: Number(id), next_followup_date: interactionForm.next_followup_date || null })
      setInteractionForm({ interaction_type: 'email', notes: '', next_followup_date: '' })
      loadData()
      setMessage('Interaction ajoutée')
    } catch (error) {
      setMessage('Erreur')
    }
  }

  const calculateRisk = async () => {
    try {
      const result = await calculateRiskScore(id)
      setRiskScore(result)
      setMessage('Score de risque calculé')
    } catch (error) {
      setMessage('Erreur lors du calcul')
    }
  }

  if (!caseData) return <div className="text-muted">Chargement...</div>

  const statusBadge = (status) => {
    const s = STEP_STATUSES.find((s) => s.value === status) || STEP_STATUSES[0]
    return <span className={`px-2 py-1 rounded-xl border text-xs font-medium ${s.color}`}>{s.label}</span>
  }

  const riskBadge = (level) => {
    const colors = {
      faible: 'bg-green-50 text-green-700 border-green-200',
      moyen: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      eleve: 'bg-orange-50 text-orange-700 border-orange-200',
      critique: 'bg-red-50 text-red-700 border-red-200',
    }
    return <span className={`px-2 py-1 rounded-xl border text-xs font-medium ${colors[level] || colors.faible}`}>{level}</span>
  }

  const progress = steps.length > 0 ? Math.round(steps.filter((s) => s.status === 'terminee').length / steps.length * 100) : 0

  return (
    <section className="grid gap-6">
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => navigate('/onboarding')} className="text-sm text-primary hover:underline mb-2">← Retour à la liste</button>
          <div className="text-xs tracking-widest uppercase text-primary font-semibold">Détail onboarding</div>
          <h2 className="text-4xl font-bold mt-2 text-text">{caseData.client_name}</h2>
          <p className="text-muted mt-2">{caseData.client_email} {caseData.client_phone && `· ${caseData.client_phone}`} · {caseData.product_type}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted">Progression</div>
          <div className="text-2xl font-bold text-primary">{progress}%</div>
        </div>
      </div>

      {riskScore && (
        <div className="rounded-3xl border border-border bg-white shadow-sm p-4 flex items-center gap-4">
          <div>
            <div className="text-sm text-muted">Score de risque d'abandon</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold">{riskScore.risk_score}</span>
              {riskBadge(riskScore.risk_level)}
            </div>
            {riskScore.suggested_action && <div className="text-sm text-muted mt-1">Action: {riskScore.suggested_action}</div>}
          </div>
          <button onClick={calculateRisk} className="rounded-2xl border border-border bg-white px-3 py-1 text-text hover:bg-primary-soft transition-colors text-sm">
            Recalculer
          </button>
        </div>
      )}
      {!riskScore && (
        <button onClick={calculateRisk} className="rounded-2xl border border-border bg-white px-4 py-2 text-text hover:bg-primary-soft transition-colors text-sm">
          Calculer le score de risque
        </button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-border bg-white shadow-sm p-5">
          <h3 className="text-xl font-bold text-text mb-4">Étapes du parcours</h3>
          <form onSubmit={addStep} className="grid gap-3 mb-4">
            <input
              className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary text-text"
              value={stepForm.step_name}
              onChange={(event) => setStepForm({ ...stepForm, step_name: event.target.value })}
              placeholder="Nom de l'étape"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                className="w-full rounded-2xl border border-border bg-surface p-3 text-text"
                value={stepForm.status}
                onChange={(event) => setStepForm({ ...stepForm, status: event.target.value })}
              >
                {STEP_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <input
                type="date"
                className="w-full rounded-2xl border border-border bg-surface p-3 text-text"
                value={stepForm.deadline}
                onChange={(event) => setStepForm({ ...stepForm, deadline: event.target.value })}
              />
            </div>
            <input
              className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary text-text"
              value={stepForm.required_documents}
              onChange={(event) => setStepForm({ ...stepForm, required_documents: event.target.value })}
              placeholder="Documents requis"
            />
            <textarea
              className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary text-text"
              value={stepForm.notes}
              onChange={(event) => setStepForm({ ...stepForm, notes: event.target.value })}
              placeholder="Notes"
            />
            <button type="submit" className="rounded-2xl bg-primary px-4 py-2 text-white font-semibold hover:bg-primary/90 transition-colors">
              Ajouter l'étape
            </button>
          </form>
          <div className="grid gap-2">
            {steps.map((step) => (
              <div key={step.id} className="rounded-2xl border border-border bg-surface p-3 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text">{step.step_name}</span>
                    {statusBadge(step.status)}
                  </div>
                  {step.deadline && (
                    <div className="text-xs text-muted mt-1">Échéance: {new Date(step.deadline).toLocaleDateString('fr-FR')}</div>
                  )}
                  {step.notes && <div className="text-sm text-muted mt-1">{step.notes}</div>}
                </div>
                <div className="flex gap-1">
                  {step.status !== 'terminee' && (
                    <button onClick={() => updateStepStatus(step.id, 'terminee')} className="text-xs text-green-600 hover:underline">Terminer</button>
                  )}
                  <button onClick={() => updateStepStatus(step.id, step.status === 'bloquee' ? 'a_faire' : 'bloquee')} className="text-xs text-red-600 hover:underline">
                    {step.status === 'bloquee' ? 'Débloquer' : 'Bloquer'}
                  </button>
                  <button onClick={() => deleteStep(step.id)} className="text-xs text-gray-500 hover:underline">Supprimer</button>
                </div>
              </div>
            ))}
            {steps.length === 0 && <div className="text-muted text-sm">Aucune étape définie</div>}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-3xl border border-border bg-white shadow-sm p-5">
            <h3 className="text-xl font-bold text-text mb-4">Interactions client</h3>
            <form onSubmit={addInteraction} className="grid gap-3 mb-4">
              <select
                className="w-full rounded-2xl border border-border bg-surface p-3 text-text"
                value={interactionForm.interaction_type}
                onChange={(event) => setInteractionForm({ ...interactionForm, interaction_type: event.target.value })}
              >
                {INTERACTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <textarea
                className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary text-text"
                value={interactionForm.notes}
                onChange={(event) => setInteractionForm({ ...interactionForm, notes: event.target.value })}
                placeholder="Notes"
              />
              <input
                type="date"
                className="w-full rounded-2xl border border-border bg-surface p-3 text-text"
                value={interactionForm.next_followup_date}
                onChange={(event) => setInteractionForm({ ...interactionForm, next_followup_date: event.target.value })}
              />
              <button type="submit" className="rounded-2xl bg-primary px-4 py-2 text-white font-semibold hover:bg-primary/90 transition-colors">
                Ajouter l'interaction
              </button>
            </form>
            <div className="grid gap-2">
              {interactions.map((interaction) => (
                <div key={interaction.id} className="rounded-2xl border border-border bg-surface p-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-xl border border-border text-xs font-medium text-text">{interaction.interaction_type}</span>
                    <span className="text-xs text-muted">{new Date(interaction.interaction_date).toLocaleString('fr-FR')}</span>
                  </div>
                  {interaction.notes && <div className="text-sm text-text mt-1">{interaction.notes}</div>}
                  {interaction.next_followup_date && (
                    <div className="text-xs text-primary mt-1">Prochaine relance: {new Date(interaction.next_followup_date).toLocaleDateString('fr-FR')}</div>
                  )}
                </div>
              ))}
              {interactions.length === 0 && <div className="text-muted text-sm">Aucune interaction enregistrée</div>}
            </div>
          </div>
        </div>
      </div>
      {message && <div className="text-primary font-semibold text-center">{message}</div>}
    </section>
  )
}
