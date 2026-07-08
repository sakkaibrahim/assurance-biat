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
        <div className="text-xs tracking-widest uppercase text-primary font-semibold">Module organisation</div>
        <h2 className="text-4xl font-bold mt-2 text-text">Notifications</h2>
        <p className="text-muted mt-2">Rappels intelligents pour les dossiers urgents, les contrats et les rendez-vous.</p>
      </div>

      <button type="button" onClick={loadNotifications} className="rounded-2xl bg-primary px-4 py-2 text-white font-semibold hover:bg-primary/90 transition-colors">
        Rafraîchir
      </button>
      {loading && <div className="text-muted">Chargement...</div>}
      {message && <div className="text-red-500">{message}</div>}

      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item.id} className={`rounded-3xl border p-4 ${item.is_read ? 'border-border bg-white' : 'border-primary/40 bg-primary-soft'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-bold text-lg text-text">{item.title}</div>
                <div className="text-muted text-sm mt-1">{item.message}</div>
                <div className="text-xs text-muted mt-2">{new Date(item.created_at).toLocaleString('fr-FR')}</div>
              </div>
              <div className="flex gap-2">
                {!item.is_read && (
                  <button type="button" onClick={() => markAsRead(item.id)} className="rounded-2xl border border-border bg-white px-3 py-1 text-text hover:bg-primary-soft transition-colors">
                    Marquer comme lu
                  </button>
                )}
                <button type="button" onClick={() => deleteNotification(item.id)} className="rounded-2xl border border-border bg-white px-3 py-1 text-text hover:bg-red-50 transition-colors">
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
