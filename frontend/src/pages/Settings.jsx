export default function Settings() {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl p-6">
      <div className="text-xs tracking-widest uppercase text-blue-300">Paramètres</div>
      <h2 className="text-4xl font-bold mt-2">Configuration du MVP</h2>
      <p className="text-blue-200 max-w-3xl mt-2">
        Cette page est prête pour brancher les paramètres de modèle, les chemins d'index vectoriel, l'authentification et les rôles.
      </p>
      <div className="grid gap-4 mt-5">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <strong>LLM</strong>
          <p className="mb-0 text-blue-200">Ollama avec Llama 3.1 ou Mistral.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <strong>Stockage</strong>
          <p className="mb-0 text-blue-200">MySQL (XAMPP) pour les métadonnées, ChromaDB pour les embeddings.</p>
        </div>
      </div>
    </section>
  )
}
