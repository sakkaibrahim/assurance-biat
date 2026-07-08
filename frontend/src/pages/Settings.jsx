export default function Settings() {
  return (
    <section className="rounded-3xl border border-border bg-white shadow-sm p-6">
      <div className="text-xs tracking-widest uppercase text-primary font-semibold">Paramètres</div>
      <h2 className="text-4xl font-bold mt-2 text-text">Configuration du MVP</h2>
      <p className="text-muted max-w-3xl mt-2">
        Cette page est prête pour brancher les paramètres de modèle, les chemins d'index vectoriel, l'authentification et les rôles.
      </p>
      <div className="grid gap-4 mt-5">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <strong className="text-text">LLM</strong>
          <p className="mb-0 text-muted">Ollama avec Llama 3.1 ou Mistral.</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <strong className="text-text">Stockage</strong>
          <p className="mb-0 text-muted">MySQL (XAMPP) pour les métadonnées, ChromaDB pour les embeddings.</p>
        </div>
      </div>
    </section>
  )
}
