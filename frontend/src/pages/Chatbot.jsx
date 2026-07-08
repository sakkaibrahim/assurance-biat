import ChatWindow from '../components/Chat/ChatWindow'

export default function Chatbot() {
  return (
    <div>
      <div className="mb-5">
        <div className="text-xs tracking-widest uppercase text-primary font-semibold">Chat IA</div>
        <h2 className="text-4xl font-bold mt-2 text-text">Conversation assistée par les sources</h2>
      </div>
      <ChatWindow />
    </div>
  )
}
