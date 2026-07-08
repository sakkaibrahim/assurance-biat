import { useState } from 'react'
import { uploadDocument } from '../../services/api'

export default function UploadPanel() {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')

  const handleUpload = async (event) => {
    event.preventDefault()
    if (!file) return
    setStatus('Import en cours...')
    try {
      const response = await uploadDocument(file)
      setStatus(response.message)
      setFile(null)
    } catch (error) {
      setStatus("Échec de l'import du document.")
    }
  }

  return (
    <form onSubmit={handleUpload} className="rounded-3xl border border-border bg-white shadow-sm p-5 grid gap-4">
      <div>
        <h3 className="text-lg font-bold text-text">Importer un PDF</h3>
        <p className="mt-1 text-muted">Ajoute un contrat, une procédure ou une FAQ pour l'indexation RAG.</p>
      </div>
      <input
        type="file"
        accept="application/pdf"
        onChange={(event) => setFile(event.target.files?.[0] || null)}
        className="w-full rounded-2xl border border-border bg-surface p-3 text-text"
      />
      <button type="submit" className="rounded-2xl bg-primary px-4 py-2 text-white font-semibold hover:bg-primary/90 transition-colors">
        Importer
      </button>
      {status ? <div className="text-primary font-semibold">{status}</div> : null}
    </form>
  )
}
