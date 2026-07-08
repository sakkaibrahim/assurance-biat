import { useEffect, useState } from 'react'
import { fetchChatHistory } from '../services/api'

export default function History() {
  const [items, setItems] = useState([])

  useEffect(() => {
    fetchChatHistory()
      .then((response) => setItems(response.items || []))
      .catch(() => setItems([]))
  }, [])

  return (
    <section className="card glow" style={{ padding: 24 }}>
      <div style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8db1ff' }}>Historique</div>
      <h2 style={{ margin: '10px 0 0', fontSize: 34 }}>Dernières conversations</h2>
      <div style={{ display: 'grid', gap: 14, marginTop: 20 }}>
        {items.length ? items.map((item) => (
          <article key={item.id} className="card" style={{ padding: 16, background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8db1ff' }}>Question</div>
            <p style={{ marginTop: 8 }}>{item.question}</p>
            <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8db1ff' }}>Réponse</div>
            <p style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{item.answer}</p>
            {item.sources?.length ? (
              <div style={{ marginTop: 12 }}>
                <strong>Sources</strong>
                <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                  {item.sources.map((source, sourceIndex) => (
                    <div key={`${item.id}-${sourceIndex}`} style={{ color: '#cfe0ff' }}>
                      {source.filename}: {source.excerpt}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </article>
        )) : (
          <p style={{ color: '#a8bde4' }}>Aucune conversation enregistrée pour le moment.</p>
        )}
      </div>
    </section>
  )
}
