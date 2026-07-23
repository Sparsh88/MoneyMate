import api from './api'
import type { Notification } from '../types'

export const notificationService = {
  getAll: async () => {
    const { data } = await api.get('/notifications')
    return data.notifications as Notification[]
  },
  markRead: async (id: string) => {
    await api.put(`/notifications/${id}/read`)
  },
  delete: async (id: string) => {
    await api.delete(`/notifications/${id}`)
  },
}
