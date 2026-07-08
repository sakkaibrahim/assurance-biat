import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Notifications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const loadNotifications = () => {
    setLoading(true)
    api.get('/notifications?user_id=1').then((response) => {
      setItems(response.data || response)
      setMessage('')
    }).catch(() => setMessage('Impossible de charger les notifications.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const markAsRead = async (notificationId) => {
    await api.put(`/notifications/${notificationId}/read`)
    loadNotifications()
  }

  const deleteNotification = async (notificationId) => {
    await api.delete(`/notifications/${notificationId}`)
    loadNotifications()
  }

  return (
    <section className="grid gap-6">
      <div>
        <div className="text-xs tracking-widest uppercase text-blue-300">Module organisation</div>
        <h2 className="text-4xl font-bold mt-2">Notifications</h2>
        <p className="text-blue-200 mt-2">Rappels intelligents pour les dossiers urgents, les contrats et les rendez-vous.</p>
      </div>

      <button type="button" onClick={loadNotifications} className="rounded-2xl bg-gradient-to-r from-blue-600 to-teal-400 px-4 py-2 text-white font-semibold hover:shadow-lg transition-all">
        Rafraîchir
      </button>
      {loading && <div className="text-blue-200">Chargement...</div>}
      {message && <div className="text-pink-300">{message}</div>}

      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item.id} className={`rounded-3xl border p-4 ${item.is_read ? 'border-white/5 bg-white/5' : 'border-blue-500/40 bg-blue-500/10'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-bold text-lg">{item.title}</div>
                <div className="text-blue-200 text-sm mt-1">{item.message}</div>
                <div className="text-xs text-blue-300 mt-2">{new Date(item.created_at).toLocaleString('fr-FR')}</div>
              </div>
              <div className="flex gap-2">
                {!item.is_read && (
                  <button type="button" onClick={() => markAsRead(item.id)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-white hover:bg-white/10 transition-colors">
                    Marquer comme lu
                  </button>
                )}
                <button type="button" onClick={() => deleteNotification(item.id)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-white hover:bg-white/10 transition-colors">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
