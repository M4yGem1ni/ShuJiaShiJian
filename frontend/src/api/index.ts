import axios from 'axios'
import type { AxiosInstance } from 'axios'

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    const user = JSON.parse(userStr)
    if (user.id) {
      config.headers['x-user-id'] = user.id
    }
  }
  return config
})

export interface Project {
  id: number
  title: string
  summary: string
  description: string
  region: string
  category: string
  targetAmount: number
  raisedAmount: number
  status: string
  coverImage: string | null
  organizationId: number
  organization?: { id: number; name: string }
  startDate: string | null
  endDate: string | null
  createdAt: string
  fundFlows?: FundFlow[]
  feedbacks?: Feedback[]
}

export interface Donation {
  id: number
  userId: number
  projectId: number
  amount: number
  isAnonymous: boolean
  message: string | null
  status: string
  createdAt: string
  project?: { id: number; title: string; region: string; category: string }
  user?: { name: string }
}

export interface FundFlow {
  id: number
  projectId: number
  title: string
  amount: number
  type: string
  description: string | null
  proofUrl: string | null
  status: string
  createdAt: string
  project?: { title: string }
}

export interface Feedback {
  id: number
  projectId: number
  title: string
  content: string
  usedAmount: number | null
  images: string | null
  status: string
  createdAt: string
  project?: { title: string }
}

export interface User {
  id: number
  name: string
  phone: string
  role: string
  avatar: string | null
  createdAt: string
}

export interface AdminStats {
  totalAmount: number
  totalProjects: number
  totalDonors: number
  regions: { region: string; _count: { id: number } }[]
  categoryStats: {
    category: string
    _sum: { targetAmount: number; raisedAmount: number }
    _count: { id: number }
  }[]
  recentDonations: Donation[]
  pendingAudits: number
  pendingFeedbacks: number
}


// Auth
export const login = (phone: string, password: string) =>
  api.post('/auth/login', { phone, password }).then(r => r.data)

export const register = (name: string, phone: string, password: string) =>
  api.post('/auth/register', { name, phone, password }).then(r => r.data)

export const getCurrentUser = () => api.get('/auth/me').then(r => r.data)

// Projects
export const getProjects = (params?: any) =>
  api.get('/projects', { params }).then(r => r.data)

export const getProjectDetail = (id: number) =>
  api.get(`/projects/${id}`).then(r => r.data)

export const getProjectFundFlows = (id: number) =>
  api.get(`/projects/${id}/fund-flows`).then(r => r.data)

export const getProjectFeedbacks = (id: number) =>
  api.get(`/projects/${id}/feedbacks`).then(r => r.data)

// Donations
export const createDonation = (data: { userId: number; projectId: number; amount: number; isAnonymous: boolean; message?: string }) =>
  api.post('/donations', data).then(r => r.data)

export const getUserDonations = (userId: number) =>
  api.get(`/donations/user/${userId}`).then(r => r.data)

// Admin
export const getAdminStats = () => api.get('/admin/statistics').then(r => r.data)
export const getAdminProjects = (params?: any) => api.get('/admin/projects', { params }).then(r => r.data)
export const updateProjectStatus = (id: number, status: string) => api.patch(`/admin/projects/${id}/status`, { status }).then(r => r.data)
export const getAdminDonations = (params?: any) => api.get('/admin/donations', { params }).then(r => r.data)
export const getAdminFunds = () => api.get('/admin/funds').then(r => r.data)
export const getAdminFeedbacks = () => api.get('/admin/feedbacks').then(r => r.data)
export const updateFeedbackStatus = (id: number, status: string) => api.patch(`/admin/feedbacks/${id}/status`, { status }).then(r => r.data)
export const getTrends = () => api.get('/admin/statistics/trends').then(r => r.data)
export const getAuditLogs = () => api.get('/admin/audit-logs').then(r => r.data)

export default api
