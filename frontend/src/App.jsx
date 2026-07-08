import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/Layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Chatbot from './pages/Chatbot'
import Documents from './pages/Documents'
import Login from './pages/Login'
import Register from './pages/Register'
import History from './pages/History'
import Settings from './pages/Settings'
import Tasks from './pages/Tasks'
import Planning from './pages/Planning'
import Calendar from './pages/Calendar'
import Notifications from './pages/Notifications'
import Clients from './pages/Clients'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/planning" element={<Planning />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/clients" element={<Clients />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
