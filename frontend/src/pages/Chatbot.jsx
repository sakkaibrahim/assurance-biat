import ChatWindow from '../components/Chat/ChatWindow'

export default function Chatbot() {
  return (
    <div>
      <div className="mb-5">
        <div className="text-xs tracking-widest uppercase text-blue-300">Chat IA</div>
        <h2 className="text-4xl font-bold mt-2">Conversation assistée par les sources</h2>
      </div>
      <ChatWindow />
    </div>
  )
}
