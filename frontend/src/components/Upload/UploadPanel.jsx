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
    <form className="card glow" onSubmit={handleUpload} style={{ padding: 20, display: 'grid', gap: 14 }}>
      <div>
        <h3 style={{ margin: 0 }}>Importer un PDF</h3>
        <p style={{ margin: '8px 0 0', color: '#a8bde4' }}>Ajoute un contrat, une procédure ou une FAQ pour l'indexation RAG.</p>
      </div>
      <input className="input" type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} />
      <button className="button" type="submit">Importer</button>
      {status ? <div style={{ color: '#cfe0ff' }}>{status}</div> : null}
    </form>
  )
}
