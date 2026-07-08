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
    <div className="grid grid-2" style={{ alignItems: 'start' }}>
      <section className="card glow" style={{ padding: 24 }}>
        <div style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8db1ff' }}>Dashboard</div>
        <h2 style={{ margin: '10px 0 0', fontSize: 34 }}>Assistant IA pour agents d'assurance</h2>
        <p style={{ color: '#a8bde4', maxWidth: 640 }}>
          Consulte la documentation interne, retrouve rapidement les passages pertinents et génère des réponses sourcées.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginTop: 20 }}>
          {[
            { label: 'Documents indexés', value: documents.length },
            { label: 'Mode', value: 'MVP RAG' },
            { label: 'Utilisateur', value: user?.full_name || 'Administrateur' },
          ].map((item) => (
            <div key={item.label} className="card" style={{ padding: 16 }}>
              <div style={{ color: '#a8bde4', fontSize: 13 }}>{item.label}</div>
              <div style={{ marginTop: 8, fontSize: 22, fontWeight: 700 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card glow" style={{ padding: 24 }}>
        <h3 style={{ marginTop: 0 }}>Derniers documents</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {documents.length ? (
            documents.map((document) => (
              <div key={document.id} className="card" style={{ padding: 14, background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ fontWeight: 700 }}>{document.filename}</div>
                <div style={{ color: '#a8bde4', fontSize: 13 }}>{document.source_path}</div>
                <div style={{ color: '#8db1ff', fontSize: 12, marginTop: 8 }}>{formatDateTime(document.created_at || new Date())}</div>
              </div>
            ))
          ) : (
            <p style={{ color: '#a8bde4' }}>Aucun document importé pour le moment.</p>
          )}
        </div>
      </section>
    </div>
  )
}
