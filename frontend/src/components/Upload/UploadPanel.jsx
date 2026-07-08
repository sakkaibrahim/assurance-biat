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
    <form onSubmit={handleUpload} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 grid gap-4">
      <div>
        <h3 className="text-lg font-bold">Importer un PDF</h3>
        <p className="mt-1 text-blue-200">Ajoute un contrat, une procédure ou une FAQ pour l'indexation RAG.</p>
      </div>
      <input
        type="file"
        accept="application/pdf"
        onChange={(event) => setFile(event.target.files?.[0] || null)}
        className="w-full rounded-2xl border border-white/10 bg-white/5 text-white p-3"
      />
      <button type="submit" className="rounded-2xl bg-gradient-to-r from-blue-600 to-teal-400 px-4 py-2 text-white font-semibold hover:shadow-lg transition-all">
        Importer
      </button>
      {status ? <div className="text-blue-100">{status}</div> : null}
    </form>
  )
}
