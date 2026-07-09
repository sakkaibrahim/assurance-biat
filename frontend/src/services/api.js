import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const login = (payload) => api.post('/auth/login', payload).then((response) => response.data)
export const register = (payload) => api.post('/auth/register', payload).then((response) => response.data)
export const fetchDocuments = () => api.get('/documents').then((response) => response.data)
export const fetchChatHistory = () => api.get('/chat/history').then((response) => response.data)
export const deleteDocument = (documentId) => api.delete(`/documents/${documentId}`).then((response) => response.data)
export const reindexDocument = (documentId) => api.post(`/documents/${documentId}/reindex`).then((response) => response.data)
export const uploadDocument = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((response) => response.data)
}
export const askQuestion = (question) => api.post('/chat', { question }).then((response) => response.data)
export const fetchMe = () => api.get('/users/me').then((response) => response.data)
export const fetchTasks = () => api.get('/tasks').then((response) => response.data)
export const createTask = (payload) => api.post('/tasks', payload).then((response) => response.data)
export const updateTask = (taskId, payload) => api.put(`/tasks/${taskId}`, payload).then((response) => response.data)
export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}`).then((response) => response.data)
export const fetchDailyPlan = (date) => api.get(`/planning/daily?date=${date}`).then((response) => response.data)
export const fetchWeeklySummary = () => api.get('/planning/weekly').then((response) => response.data)
export const fetchAppointments = () => api.get('/calendar').then((response) => response.data)
export const createAppointment = (payload) => api.post('/calendar', payload).then((response) => response.data)
export const updateAppointment = (appointmentId, payload) => api.put(`/calendar/${appointmentId}`, payload).then((response) => response.data)
export const deleteAppointment = (appointmentId) => api.delete(`/calendar/${appointmentId}`).then((response) => response.data)
export const fetchNotifications = (userId) => api.get(`/notifications?user_id=${userId}`).then((response) => response.data)
export const markNotificationRead = (notificationId) => api.put(`/notifications/${notificationId}/read`).then((response) => response.data)
export const fetchClients = () => api.get('/clients').then((response) => response.data)
export const createClient = (payload) => api.post('/clients', payload).then((response) => response.data)
export const updateClient = (clientId, payload) => api.put(`/clients/${clientId}`, payload).then((response) => response.data)
export const deleteClient = (clientId) => api.delete(`/clients/${clientId}`).then((response) => response.data)
export const fetchOnboardings = (params) => api.get('/onboarding', { params }).then((response) => response.data)
export const fetchOnboarding = (id) => api.get(`/onboarding/${id}`).then((response) => response.data)
export const createOnboarding = (payload) => api.post('/onboarding', payload).then((response) => response.data)
export const updateOnboarding = (id, payload) => api.put(`/onboarding/${id}`, payload).then((response) => response.data)
export const deleteOnboarding = (id) => api.delete(`/onboarding/${id}`).then((response) => response.data)
export const fetchSteps = (caseId) => api.get(`/steps${caseId ? `?case_id=${caseId}` : ''}`).then((response) => response.data)
export const createStep = (payload) => api.post('/steps', payload).then((response) => response.data)
export const updateStep = (stepId, payload) => api.put(`/steps/${stepId}`, payload).then((response) => response.data)
export const deleteStep = (stepId) => api.delete(`/steps/${stepId}`).then((response) => response.data)
export const fetchInteractions = (caseId) => api.get(`/interactions${caseId ? `?case_id=${caseId}` : ''}`).then((response) => response.data)
export const createInteraction = (payload) => api.post('/interactions', payload).then((response) => response.data)
export const updateInteraction = (interactionId, payload) => api.put(`/interactions/${interactionId}`, payload).then((response) => response.data)
export const deleteInteraction = (interactionId) => api.delete(`/interactions/${interactionId}`).then((response) => response.data)
export const fetchRiskScores = (params) => api.get('/risk-scores', { params }).then((response) => response.data)
export const calculateRiskScore = (caseId) => api.post(`/risk-scores/calculate?case_id=${caseId}`).then((response) => response.data)
export const fetchPrioritizedCases = (limit = 10) => api.get(`/risk-scores/prioritized?limit=${limit}`).then((response) => response.data)
export const fetchOnboardingDashboard = () => api.get('/dashboard/onboarding').then((response) => response.data)

export default api
