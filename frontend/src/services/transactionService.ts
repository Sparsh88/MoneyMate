import api, { API_BASE_URL } from './api'
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

  create: async (payload: Record<string, any>) => {
    const { data } = await api.post('/transactions', payload)
    return data.transaction as Transaction
  },

  update: async (id: string, payload: Record<string, any>) => {
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
    window.open(`${API_BASE_URL}/transactions/export/csv`, '_blank')
  },

  exportPDF: () => {
    window.open(`${API_BASE_URL}/transactions/export/pdf`, '_blank')
  },
}
