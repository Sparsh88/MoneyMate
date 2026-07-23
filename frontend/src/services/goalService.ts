import api from './api'
import type { SavingsGoal } from '../types'

export const goalService = {
  getAll: async () => {
    const { data } = await api.get('/goals')
    return data.goals as SavingsGoal[]
  },
  create: async (payload: { name: string; targetAmount: number; targetDate: string; currentAmount?: number }) => {
    const { data } = await api.post('/goals', payload)
    return data.goal as SavingsGoal
  },
  update: async (id: string, payload: Partial<SavingsGoal> & { contribution?: number }) => {
    const { data } = await api.put(`/goals/${id}`, payload)
    return data.goal as SavingsGoal
  },
  delete: async (id: string) => {
    await api.delete(`/goals/${id}`)
  },
}
