import ChatWindow from '../components/Chat/ChatWindow'

export default function Chatbot() {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8db1ff' }}>Chat IA</div>
        <h2 style={{ margin: '10px 0 0', fontSize: 34 }}>Conversation assistée par les sources</h2>
      </div>
      <ChatWindow />
    </div>
  )
}
