import api from './api'
import type { Category } from '../types'

export const categoryService = {
  getAll: async () => {
    const { data } = await api.get('/categories')
    return data.categories as Category[]
  },
  create: async (payload: { name: string; type: string; icon: string; color: string }) => {
    const { data } = await api.post('/categories', payload)
    return data.category as Category
  },
  delete: async (id: string) => {
    await api.delete(`/categories/${id}`)
  },
}
