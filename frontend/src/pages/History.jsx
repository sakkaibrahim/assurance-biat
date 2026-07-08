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
    <section className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl p-6">
      <div className="text-xs tracking-widest uppercase text-blue-300">Historique</div>
      <h2 className="text-4xl font-bold mt-2">Dernières conversations</h2>
      <div className="grid gap-4 mt-5">
        {items.length ? items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-wider text-blue-300">Question</div>
            <p className="mt-2">{item.question}</p>
            <div className="text-xs uppercase tracking-wider text-blue-300 mt-3">Réponse</div>
            <p className="mt-2 whitespace-pre-wrap">{item.answer}</p>
            {item.sources?.length ? (
              <div className="mt-3">
                <strong>Sources</strong>
                <div className="grid gap-2 mt-2">
                  {item.sources.map((source, sourceIndex) => (
                    <div key={`${item.id}-${sourceIndex}`} className="text-blue-100">
                      {source.filename}: {source.excerpt}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </article>
        )) : (
          <p className="text-blue-200">Aucune conversation enregistrée pour le moment.</p>
        )}
      </div>
    </section>
  )
}
