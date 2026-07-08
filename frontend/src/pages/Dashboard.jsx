import { useEffect, useState } from 'react'
import { fetchDocuments, fetchMe } from '../services/api'
import { formatDateTime } from '../utils/formatters'

export default function Dashboard() {
  const [documents, setDocuments] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchDocuments().then(setDocuments).catch(() => setDocuments([]))
    fetchMe().then(setUser).catch(() => setUser(null))
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
      <section className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl p-6">
        <div className="text-xs tracking-widest uppercase text-blue-300">Dashboard</div>
        <h2 className="text-4xl font-bold mt-2">Assistant IA pour agents d'assurance</h2>
        <p className="text-blue-200 max-w-3xl mt-2">
          Consulte la documentation interne, retrouve rapidement les passages pertinents et génère des réponses sourcées.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          {[
            { label: 'Documents indexés', value: documents.length },
            { label: 'Mode', value: 'MVP RAG' },
            { label: 'Utilisateur', value: user?.full_name || 'Administrateur' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-blue-200 text-sm">{item.label}</div>
              <div className="mt-2 text-2xl font-bold">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl p-6">
        <h3 className="text-lg font-bold mt-0">Derniers documents</h3>
        <div className="grid gap-3">
          {documents.length ? (
            documents.map((document) => (
              <div key={document.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="font-bold">{document.filename}</div>
                <div className="text-blue-200 text-sm">{document.source_path}</div>
                <div className="text-blue-300 text-xs mt-2">{formatDateTime(document.created_at || new Date())}</div>
              </div>
            ))
          ) : (
            <p className="text-blue-200">Aucun document importé pour le moment.</p>
          )}
        </div>
      </section>
    </div>
  )
}
