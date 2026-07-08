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
    <section className="grid" style={{ minHeight: 560 }}>
      <div style={{ display: 'grid', gap: 14 }}>
        {messages.map((message, index) => (
          <article
            key={`${message.role}-${index}`}
            className="card"
            style={{
              padding: 16,
              marginLeft: message.role === 'user' ? 'auto' : 0,
              maxWidth: '88%',
              background: message.role === 'user' ? 'rgba(93, 124, 255, 0.18)' : 'rgba(255, 255, 255, 0.04)',
            }}
          >
            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#8db1ff' }}>
              {message.role === 'user' ? 'Vous' : 'Assistant'}
            </div>
            <p style={{ margin: '10px 0 0', whiteSpace: 'pre-wrap' }}>{message.content}</p>
            {message.sources?.length ? (
              <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
                <strong style={{ fontSize: 14 }}>Sources</strong>
                {message.sources.map((source, sourceIndex) => (
                  <div key={`${source.filename}-${sourceIndex}`} style={{ fontSize: 14, color: '#cfe0ff' }}>
                    {source.filename}: {source.excerpt}
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <form onSubmit={submitQuestion} className="card glow" style={{ marginTop: 'auto', padding: 16, display: 'grid', gap: 12 }}>
        <textarea
          className="textarea"
          rows="4"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Exemple: Quelle est la procédure de gestion d'un sinistre ?"
        />
        <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#a8bde4', fontSize: 14 }}>{loading ? 'Réflexion en cours...' : 'Réponse générée à partir de la base documentaire.'}</span>
          <button className="button" type="submit" disabled={loading}>
            Envoyer
          </button>
        </div>
      </form>
    </section>
  )
}
