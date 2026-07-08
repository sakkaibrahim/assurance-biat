import { useEffect, useState } from 'react'
import { fetchDocuments, fetchMe, fetchTasks, fetchNotifications } from '../services/api'
import { formatDateTime } from '../utils/formatters'

export default function Dashboard() {
  const [documents, setDocuments] = useState([])
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    fetchDocuments().then(setDocuments).catch(() => setDocuments([]))
    fetchMe().then(setUser).catch(() => setUser(null))
    fetchTasks().then(setTasks).catch(() => setTasks([]))
    fetchNotifications(1).then(setNotifications).catch(() => setNotifications([]))
  }, [])

  const todayTasks = tasks.filter((task) => task.deadline && new Date(task.deadline).toDateString() === new Date().toDateString())
  const urgentTasks = tasks.filter((task) => task.priority === 'urgente' && task.status !== 'done')
  const todayNotifications = notifications.filter((item) => new Date(item.created_at).toDateString() === new Date().toDateString())

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
      <section className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl p-6">
        <div className="text-xs tracking-widest uppercase text-blue-300">Dashboard</div>
        <h2 className="text-4xl font-bold mt-2">Assistant IA pour agents d'assurance</h2>
        <p className="text-blue-200 max-w-3xl mt-2">
          Consulte la documentation interne, retrouve rapidement les passages pertinents, génère des réponses sourcées et organise ta journée.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {[
            { label: 'Documents indexés', value: documents.length },
            { label: 'Tâches du jour', value: todayTasks.length },
            { label: 'Tâches urgentes', value: urgentTasks.length },
            { label: 'Notifications', value: todayNotifications.length },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-blue-200 text-sm">{item.label}</div>
              <div className="mt-2 text-2xl font-bold">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl p-6">
        <h3 className="text-lg font-bold mt-0">Aujourd’hui</h3>
        <div className="grid gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-blue-300">Tâches du jour</div>
            {todayTasks.length ? todayTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 mt-2">
                <div className="font-semibold">{task.title}</div>
                <div className="text-xs text-blue-300">{task.priority}</div>
              </div>
            )) : (
              <div className="text-blue-200 text-sm mt-2">Aucune tâche pour aujourd’hui.</div>
            )}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-blue-300">Rendez-vous</div>
            <div className="text-blue-200 text-sm mt-2">Consulte le calendrier pour voir les rendez-vous du jour.</div>
          </div>
        </div>
      </section>
    </div>
  )
}
