import { useEffect, useState } from 'react'
import { fetchDocuments, fetchMe, fetchTasks, fetchNotifications, fetchClients } from '../services/api'
import { formatDateTime } from '../utils/formatters'

export default function Dashboard() {
  const [documents, setDocuments] = useState([])
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [notifications, setNotifications] = useState([])
  const [clients, setClients] = useState([])

  useEffect(() => {
    fetchDocuments().then(setDocuments).catch(() => setDocuments([]))
    fetchMe().then(setUser).catch(() => setUser(null))
    fetchTasks().then(setTasks).catch(() => setTasks([]))
    fetchNotifications(1).then(setNotifications).catch(() => setNotifications([]))
    fetchClients().then(setClients).catch(() => setClients([]))
  }, [])

  const isAdmin = user?.is_admin || false
  const todayTasks = tasks.filter((task) => task.deadline && new Date(task.deadline).toDateString() === new Date().toDateString())
  const urgentTasks = tasks.filter((task) => task.priority === 'urgente' && task.status !== 'done')
  const todayNotifications = notifications.filter((item) => new Date(item.created_at).toDateString() === new Date().toDateString())
  const expiringContracts = clients.filter((client) => client.expiration_date && new Date(client.expiration_date) > new Date() && new Date(client.expiration_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
      <section className="rounded-3xl border border-border bg-white shadow-sm p-6">
        <div className="text-xs tracking-widest uppercase text-primary font-semibold">Dashboard</div>
        <h2 className="text-4xl font-bold mt-2">
          {isAdmin ? 'Assistant IA pour agents d\'assurance' : 'Mon espace client'}
        </h2>
        <p className="text-muted max-w-3xl mt-2">
          {isAdmin
            ? 'Consulte la documentation interne, retrouve rapidement les passages pertinents, génère des réponses sourcées et organise ta journée.'
            : 'Consulte vos contrats, suivez vos tâches et communiquez avec votre assistant IA.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {isAdmin ? (
            <>
              <div className="rounded-2xl border border-border bg-surface p-4">
                <div className="text-muted text-sm">Documents indexés</div>
                <div className="mt-2 text-2xl font-bold text-text">{documents.length}</div>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4">
                <div className="text-muted text-sm">Tâches du jour</div>
                <div className="mt-2 text-2xl font-bold text-text">{todayTasks.length}</div>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4">
                <div className="text-muted text-sm">Tâches urgentes</div>
                <div className="mt-2 text-2xl font-bold text-text">{urgentTasks.length}</div>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4">
                <div className="text-muted text-sm">Clients</div>
                <div className="mt-2 text-2xl font-bold text-text">{clients.length}</div>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-2xl border border-border bg-surface p-4">
                <div className="text-muted text-sm">Mes tâches</div>
                <div className="mt-2 text-2xl font-bold text-text">{tasks.length}</div>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4">
                <div className="text-muted text-sm">Notifications</div>
                <div className="mt-2 text-2xl font-bold text-text">{todayNotifications.length}</div>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4">
                <div className="text-muted text-sm">Contrats actifs</div>
                <div className="mt-2 text-2xl font-bold text-text">{clients.length}</div>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4">
                <div className="text-muted text-sm">Échéances à venir</div>
                <div className="mt-2 text-2xl font-bold text-text">{expiringContracts.length}</div>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-white shadow-sm p-6">
        <h3 className="text-lg font-bold mt-0">{isAdmin ? 'Aujourd\'hui' : 'Mes informations'}</h3>
        <div className="grid gap-3">
          {isAdmin ? (
            <>
              <div>
                <div className="text-xs uppercase tracking-wider text-primary font-semibold">Tâches du jour</div>
                {todayTasks.length ? todayTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="rounded-2xl border border-border bg-surface p-3 mt-2">
                    <div className="font-semibold text-text">{task.title}</div>
                    <div className="text-xs text-muted">{task.priority}</div>
                  </div>
                )) : (
                  <div className="text-muted text-sm mt-2">Aucune tâche pour aujourd’hui.</div>
                )}
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-primary font-semibold">Rendez-vous</div>
                <div className="text-muted text-sm mt-2">Consulte le calendrier pour voir les rendez-vous du jour.</div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="text-xs uppercase tracking-wider text-primary font-semibold">Mes contrats</div>
                {clients.length ? clients.slice(0, 5).map((client) => (
                  <div key={client.id} className="rounded-2xl border border-border bg-surface p-3 mt-2">
                    <div className="font-semibold text-text">{client.first_name} {client.last_name}</div>
                    <div className="text-xs text-muted">{client.contract_type} · {client.policy_number}</div>
                  </div>
                )) : (
                  <div className="text-muted text-sm mt-2">Aucun contrat enregistré.</div>
                )}
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-primary font-semibold">Notifications</div>
                {todayNotifications.length ? todayNotifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="rounded-2xl border border-border bg-surface p-3 mt-2">
                    <div className="font-semibold text-text">{notification.title}</div>
                    <div className="text-xs text-muted">{notification.message}</div>
                  </div>
                )) : (
                  <div className="text-muted text-sm mt-2">Aucune notification pour aujourd’hui.</div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

