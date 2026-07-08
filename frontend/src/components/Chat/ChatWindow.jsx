import { useEffect, useState } from 'react'
import { askQuestion, fetchChatHistory } from '../../services/api'

export default function ChatWindow() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Pose une question sur un contrat, une procédure ou une FAQ interne.',
    },
  ])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchChatHistory()
      .then((response) => {
        if (!response.items?.length) return

        const restoredMessages = response.items.flatMap((item) => [
          { role: 'user', content: item.question },
          { role: 'assistant', content: item.answer, sources: item.sources || [] },
        ])
        setMessages([
          {
            role: 'assistant',
            content: 'Historique chargé depuis la base locale.',
          },
          ...restoredMessages,
        ])
      })
      .catch(() => null)
  }, [])

  const submitQuestion = async (event) => {
    event.preventDefault()
    if (!question.trim() || loading) return

    const nextQuestion = question.trim()
    setMessages((current) => [...current, { role: 'user', content: nextQuestion }])
    setQuestion('')
    setLoading(true)

    try {
      const response = await askQuestion(nextQuestion)
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: response.answer,
          sources: response.sources || [],
        },
      ])
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: "Le backend n'est pas disponible pour le moment.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="grid gap-4 min-h-[560px]">
      <div className="grid gap-3">
        {messages.map((message, index) => (
          <article
            key={`${message.role}-${index}`}
            className="rounded-3xl border border-border bg-white shadow-sm p-4 max-w-[88%]"
            style={{ marginLeft: message.role === 'user' ? 'auto' : 0 }}
          >
            <div className="text-xs uppercase tracking-wider text-primary font-semibold">
              {message.role === 'user' ? 'Vous' : 'Assistant'}
            </div>
            <p className="mt-2 text-text whitespace-pre-wrap">{message.content}</p>
            {message.sources?.length ? (
              <div className="mt-3 grid gap-2">
                <strong className="text-sm text-text">Sources</strong>
                {message.sources.map((source, sourceIndex) => (
                  <div key={`${source.filename}-${sourceIndex}`} className="text-sm text-muted">
                    {source.filename}: {source.excerpt}
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <form onSubmit={submitQuestion} className="rounded-3xl border border-border bg-white shadow-sm p-4 grid gap-3 mt-auto">
        <textarea
          className="w-full rounded-2xl border border-border bg-surface p-3 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,122,61,0.12)] text-text"
          rows="4"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Exemple: Quelle est la procédure de gestion d'un sinistre ?"
        />
        <div className="flex gap-3 justify-between items-center">
          <span className="text-muted text-sm">{loading ? 'Réflexion en cours...' : 'Réponse générée à partir de la base documentaire.'}</span>
          <button type="submit" disabled={loading} className="rounded-2xl bg-primary px-4 py-2 text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
            Envoyer
          </button>
        </div>
      </form>
    </section>
  )
}
