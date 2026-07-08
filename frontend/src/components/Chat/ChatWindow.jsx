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
            className="rounded-3xl border border-white/10 bg-white/5 p-4 max-w-[88%]"
            style={{ marginLeft: message.role === 'user' ? 'auto' : 0 }}
          >
            <div className="text-xs uppercase tracking-wider text-blue-300">
              {message.role === 'user' ? 'Vous' : 'Assistant'}
            </div>
            <p className="mt-2 whitespace-pre-wrap">{message.content}</p>
            {message.sources?.length ? (
              <div className="mt-3 grid gap-2">
                <strong className="text-sm">Sources</strong>
                {message.sources.map((source, sourceIndex) => (
                  <div key={`${source.filename}-${sourceIndex}`} className="text-sm text-blue-100">
                    {source.filename}: {source.excerpt}
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <form onSubmit={submitQuestion} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 grid gap-3 mt-auto">
        <textarea
          className="w-full rounded-2xl border border-white/10 bg-white/5 text-white p-3 outline-none focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(98,143,255,0.15)]"
          rows="4"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Exemple: Quelle est la procédure de gestion d'un sinistre ?"
        />
        <div className="flex gap-3 justify-between items-center">
          <span className="text-blue-200 text-sm">{loading ? 'Réflexion en cours...' : 'Réponse générée à partir de la base documentaire.'}</span>
          <button type="submit" disabled={loading} className="rounded-2xl bg-gradient-to-r from-blue-600 to-teal-400 px-4 py-2 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50">
            Envoyer
          </button>
        </div>
      </form>
    </section>
  )
}
