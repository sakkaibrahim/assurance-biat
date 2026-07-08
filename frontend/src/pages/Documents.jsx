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
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
      <UploadPanel />
      <section className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl p-6">
        <h3 className="text-lg font-bold mt-0">Bibliothèque documentaire</h3>
        {message ? <div className="mb-3 text-blue-300">{message}</div> : null}
        <div className="grid gap-3">
          {documents.length ? documents.map((document) => (
            <div key={document.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="font-bold">{document.filename}</div>
              <div className="mt-1 text-blue-200">{document.source_path}</div>
              <div className="mt-2 flex gap-2 flex-wrap">
                <button type="button" onClick={() => handleReindex(document.id)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-white hover:bg-white/10 transition-colors">
                  Réindexer
                </button>
                <button type="button" onClick={() => handleDelete(document.id)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-white hover:bg-white/10 transition-colors">
                  Supprimer
                </button>
              </div>
            </div>
          )) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              Aucun document importé pour le moment.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
