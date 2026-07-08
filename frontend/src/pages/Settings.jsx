export default function Settings() {
  return (
    <section className="card glow" style={{ padding: 24 }}>
      <div style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8db1ff' }}>Paramètres</div>
      <h2 style={{ margin: '10px 0 0', fontSize: 34 }}>Configuration du MVP</h2>
      <p style={{ color: '#a8bde4', maxWidth: 720 }}>
        Cette page est prête pour brancher les paramètres de modèle, les chemins d'index vectoriel, l'authentification et les rôles.
      </p>
      <div className="grid" style={{ marginTop: 20 }}>
        <div className="card" style={{ padding: 16, background: 'rgba(255,255,255,0.03)' }}>
          <strong>LLM</strong>
          <p style={{ marginBottom: 0, color: '#a8bde4' }}>Ollama avec Llama 3.1 ou Mistral.</p>
        </div>
        <div className="card" style={{ padding: 16, background: 'rgba(255,255,255,0.03)' }}>
          <strong>Stockage</strong>
          <p style={{ marginBottom: 0, color: '#a8bde4' }}>SQLite pour les métadonnées, ChromaDB pour les embeddings.</p>
        </div>
      </div>
    </section>
  )
}
