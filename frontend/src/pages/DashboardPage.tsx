import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { analyticsService } from '../services/analyticsService'
import { useAuthStore } from '../store/authStore'
import StatCard from '../components/common/StatCard'
import TransactionRow from '../components/common/TransactionRow'
import { SkeletonCard, SkeletonRow, SkeletonChart } from '../components/common/LoadingSkeleton'
import AddTransactionModal from '../components/transactions/AddTransactionModal'
import { useState } from 'react'

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  if (percent < 0.07) return null
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>{`${(percent * 100).toFixed(0)}%`}</text>
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [addOpen, setAddOpen] = useState(false)

  const { data: summaryData, isLoading: loadingSummary } = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: analyticsService.getSummary,
    refetchInterval: 60000,
  })

  const { data: categoryData, isLoading: loadingCategory } = useQuery({
    queryKey: ['analytics', 'category'],
    queryFn: analyticsService.getCategorySpending,
  })

  const { data: trendsData, isLoading: loadingTrends } = useQuery({
    queryKey: ['analytics', 'trends'],
    queryFn: analyticsService.getTrends,
  })

  const s = summaryData?.summary
  const recentTransactions = summaryData?.recentTransactions ?? []

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Good {getGreeting()}, <span className="text-gradient">{user?.name?.split(' ')[0]}!</span>
          </h1>
          <p className="text-slate-600 dark:text-neutral-400 text-sm mt-1">Here's your financial overview for {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="btn-primary shadow-glow"
        >
          <Plus className="w-4 h-4" /> Add Transaction
        </button>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loadingSummary ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard title="Total Balance" value={formatCurrency(s?.balance ?? 0)} subtitle="Lifetime net balance" icon={Wallet} variant="balance" index={0} />
            <StatCard title="Monthly Income" value={formatCurrency(s?.monthlyIncome ?? 0)} subtitle="This month" icon={TrendingUp} variant="income" index={1} />
            <StatCard title="Monthly Expenses" value={formatCurrency(s?.monthlyExpense ?? 0)} subtitle="This month" icon={TrendingDown} variant="expense" index={2} />
            <StatCard title="Monthly Savings" value={formatCurrency(s?.monthlySavings ?? 0)} subtitle="Income – Expenses" icon={PiggyBank} variant="savings" index={3} />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Income vs Expense 6-month trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4 sm:p-6 xl:col-span-3"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Income vs Expenses</h2>
            <span className="text-xs text-slate-500 dark:text-neutral-400">Last 6 months</span>
          </div>
          {loadingTrends ? (
            <SkeletonChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trendsData?.incomeVsExpense ?? []} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#88888825" />
                <XAxis dataKey="month" tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card-bg, #0d0d0d)', border: '1px solid #88888840', borderRadius: '12px', color: 'inherit' }}
                  labelStyle={{ color: '#737373', fontSize: 12 }}
                  formatter={(v: number) => [`₹${v.toFixed(0)}`, '']}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Category Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card xl:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Spending by Category</h2>
            <span className="text-xs text-slate-500 dark:text-neutral-400">This month</span>
          </div>
          {loadingCategory ? (
            <SkeletonChart />
          ) : categoryData && categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card-bg, #0d0d0d)', border: '1px solid #88888840', borderRadius: '12px', color: 'inherit' }}
                  formatter={(v: number) => [`₹${v.toFixed(0)}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500 dark:text-neutral-400 text-sm">
              No expense data for this month
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Transactions</h2>
          <Link to="/transactions" className="btn-ghost text-xs py-1.5 px-3 rounded-lg flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loadingSummary ? (
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : recentTransactions.length > 0 ? (
          <div className="divide-y divide-slate-200 dark:divide-neutral-800">
            {recentTransactions.map((t: any, i: number) => (
              <TransactionRow key={t._id} transaction={t} index={i} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-slate-500 dark:text-neutral-400 text-sm">No transactions yet.</p>
            <button onClick={() => setAddOpen(true)} className="btn-primary mt-4">
              <Plus className="w-4 h-4" /> Add Your First Transaction
            </button>
          </div>
        )}
      </motion.div>

      <AddTransactionModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
}
