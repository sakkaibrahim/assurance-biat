import { useEffect, useState } from 'react'
import UploadPanel from '../components/Upload/UploadPanel'
import { deleteDocument, fetchDocuments, reindexDocument } from '../services/api'

export default function Documents() {
  const [documents, setDocuments] = useState([])
  const [message, setMessage] = useState('')

  const loadDocuments = () => {
    fetchDocuments()
      .then(setDocuments)
      .catch(() => setDocuments([]))
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const handleDelete = async (documentId) => {
    setMessage('')
    try {
      await deleteDocument(documentId)
      setMessage('Document supprimé avec succès.')
      loadDocuments()
    } catch (error) {
      setMessage('Impossible de supprimer le document.')
    }
  }

  const handleReindex = async (documentId) => {
    setMessage('')
    try {
      await reindexDocument(documentId)
      setMessage('Document réindexé avec succès.')
      loadDocuments()
    } catch (error) {
      setMessage('Impossible de réindexer le document.')
    }
  }

  return (
    <div className="grid grid-2" style={{ alignItems: 'start' }}>
      <UploadPanel />
      <section className="card glow" style={{ padding: 24 }}>
        <h3 style={{ marginTop: 0 }}>Bibliothèque documentaire</h3>
        {message ? <div style={{ marginBottom: 12, color: '#8db1ff' }}>{message}</div> : null}
        <div style={{ display: 'grid', gap: 12 }}>
          {documents.length ? documents.map((document) => (
            <div key={document.id} className="card" style={{ padding: 14, background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontWeight: 700 }}>{document.filename}</div>
              <div style={{ marginTop: 6, color: '#a8bde4' }}>{document.source_path}</div>
              <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="button secondary" type="button" onClick={() => handleReindex(document.id)}>
                  Réindexer
                </button>
                <button className="button secondary" type="button" onClick={() => handleDelete(document.id)}>
                  Supprimer
                </button>
              </div>
            </div>
          )) : (
            <div className="card" style={{ padding: 14, background: 'rgba(255,255,255,0.03)' }}>
              Aucun document importé pour le moment.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
