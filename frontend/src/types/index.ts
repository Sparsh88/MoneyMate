// ─── User / Auth ────────────────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  avatar?: string
  isVerified: boolean
  status: 'active' | 'banned'
}

// ─── Category ───────────────────────────────────────────────────────────────
export interface Category {
  _id: string
  user?: string | null
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
}

// ─── Transaction ─────────────────────────────────────────────────────────────
export interface Transaction {
  _id: string
  user: string
  amount: number
  type: 'income' | 'expense'
  category: Category
  date: string
  description: string
  receiptUrl?: string
  isRecurring: boolean
  recurringId?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// ─── Budget ──────────────────────────────────────────────────────────────────
export interface Budget {
  _id: string
  user: string
  category: Category | null
  amount: number
  month: number
  year: number
}

// ─── Savings Goal ────────────────────────────────────────────────────────────
export interface SavingsGoal {
  _id: string
  user: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  status: 'active' | 'achieved'
  createdAt: string
  updatedAt: string
}

// ─── Recurring Transaction ───────────────────────────────────────────────────
export interface RecurringTransaction {
  _id: string
  user: string
  amount: number
  type: 'income' | 'expense'
  category: Category
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  startDate: string
  endDate?: string
  nextExecutionDate: string
  lastExecutedDate?: string
  description: string
  isActive: boolean
}

// ─── Notification ────────────────────────────────────────────────────────────
export interface Notification {
  _id: string
  user: string
  title: string
  message: string
  type: 'budget_alert' | 'bill_reminder' | 'goal_achieved' | 'system'
  read: boolean
  createdAt: string
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export interface DashboardSummary {
  balance: number
  totalIncome: number
  totalExpense: number
  monthlyIncome: number
  monthlyExpense: number
  monthlySavings: number
}

export interface CategorySpend {
  _id: string
  value: number
  name: string
  color: string
  icon: string
}

export interface TrendPoint {
  month: string
  income: number
  expense: number
}

export interface BudgetComparison {
  categoryName: string
  limit: number
  actual: number
  percent: number
}

export interface CashFlowPoint {
  date: string
  income: number
  expense: number
}

// ─── Admin ───────────────────────────────────────────────────────────────────
export interface PlatformStats {
  totalUsers: number
  totalTransactions: number
  totalVolume: number
  activeUsersThisMonth: number
  openTickets: number
}

export interface SupportTicket {
  _id: string
  user: { _id: string; name: string; email: string; avatar?: string }
  subject: string
  message: string
  status: 'open' | 'resolved'
  createdAt: string
}

// ─── Pagination ──────────────────────────────────────────────────────────────
export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

// ─── AI ──────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}
