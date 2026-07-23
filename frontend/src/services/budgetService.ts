import api from './api'
import type { Budget } from '../types'

export const budgetService = {
  getAll: async (month?: number, year?: number) => {
    const params = new URLSearchParams()
    if (month) params.append('month', String(month))
    if (year) params.append('year', String(year))
    const { data } = await api.get(`/budgets?${params}`)
    return data.budgets as Budget[]
  },
  createOrUpdate: async (payload: { category?: string; amount: number; month: number; year: number }) => {
    const { data } = await api.post('/budgets', payload)
    return data.budget as Budget
  },
  delete: async (id: string) => {
    await api.delete(`/budgets/${id}`)
  },
}
