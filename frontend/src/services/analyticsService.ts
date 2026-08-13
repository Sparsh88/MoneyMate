import api from './api'
import type { DashboardSummary, CategorySpend, TrendPoint, BudgetComparison, CashFlowPoint } from '../types'

export const analyticsService = {
  getSummary: async () => {
    const { data } = await api.get('/analytics/summary')
    return data as { summary: DashboardSummary; recentTransactions: any[] }
  },
  getCategorySpending: async () => {
    const { data } = await api.get('/analytics/category')
    return (data.categorySpending ?? data.data ?? []) as CategorySpend[]
  },
  getTrends: async () => {
    const { data } = await api.get('/analytics/trends')
    return data as { incomeVsExpense: TrendPoint[]; budgetComparison: BudgetComparison[] }
  },
  getCashFlow: async () => {
    const { data } = await api.get('/analytics/cashflow')
    return (data.cashFlow ?? data.data ?? []) as CashFlowPoint[]
  },
}

