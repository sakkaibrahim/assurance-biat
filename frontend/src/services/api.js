import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
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

export default api
