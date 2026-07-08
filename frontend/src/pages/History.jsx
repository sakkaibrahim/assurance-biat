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
    <section className="rounded-3xl border border-border bg-white shadow-sm p-6">
      <div className="text-xs tracking-widest uppercase text-primary font-semibold">Historique</div>
      <h2 className="text-4xl font-bold mt-2 text-text">Dernières conversations</h2>
      <div className="grid gap-4 mt-5">
        {items.length ? items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-border bg-surface p-4">
            <div className="text-xs uppercase tracking-wider text-primary font-semibold">Question</div>
            <p className="mt-2 text-text">{item.question}</p>
            <div className="text-xs uppercase tracking-wider text-primary font-semibold mt-3">Réponse</div>
            <p className="mt-2 text-text whitespace-pre-wrap">{item.answer}</p>
            {item.sources?.length ? (
              <div className="mt-3">
                <strong className="text-text">Sources</strong>
                <div className="grid gap-2 mt-2">
                  {item.sources.map((source, sourceIndex) => (
                    <div key={`${item.id}-${sourceIndex}`} className="text-muted">
                      {source.filename}: {source.excerpt}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </article>
        )) : (
          <p className="text-muted">Aucune conversation enregistrée pour le moment.</p>
        )}
      </div>
    </section>
  )
}
