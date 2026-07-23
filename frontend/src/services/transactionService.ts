import api from './api'
import type { Transaction, Pagination } from '../types'

export interface TransactionFilters {
  search?: string
  type?: 'income' | 'expense'
  category?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export const transactionService = {
  getAll: async (filters: TransactionFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '') params.append(k, String(v)) })
    const { data } = await api.get(`/transactions?${params}`)
    return data as { transactions: Transaction[]; pagination: Pagination }
  },

  create: async (payload: Partial<Transaction> & { category: string }) => {
    const { data } = await api.post('/transactions', payload)
    return data.transaction as Transaction
  },

  update: async (id: string, payload: Partial<Transaction>) => {
    const { data } = await api.put(`/transactions/${id}`, payload)
    return data.transaction as Transaction
  },

  delete: async (id: string) => {
    await api.delete(`/transactions/${id}`)
  },

  uploadReceipt: async (file: File) => {
    const form = new FormData()
    form.append('receipt', file)
    const { data } = await api.post('/transactions/upload-receipt', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.receiptUrl as string
  },

  importCSV: async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post('/transactions/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data as { success: boolean; message: string }
  },

  exportCSV: () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    window.open(`${baseUrl}/transactions/export/csv`, '_blank')
  },

  exportPDF: () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    window.open(`${baseUrl}/transactions/export/pdf`, '_blank')
  },
}
