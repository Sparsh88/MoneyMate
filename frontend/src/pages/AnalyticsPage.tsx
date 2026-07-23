import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts'
import { analyticsService } from '../services/analyticsService'
import { SkeletonChart } from '../components/common/LoadingSkeleton'

const formatCurrency = (n: number) => `₹${n.toFixed(0)}`

export default function AnalyticsPage() {
  const { data: trends, isLoading: loadingTrends } = useQuery({
    queryKey: ['analytics', 'trends'],
    queryFn: analyticsService.getTrends,
  })
  const { data: cashFlow, isLoading: loadingCashFlow } = useQuery({
    queryKey: ['analytics', 'cashflow'],
    queryFn: analyticsService.getCashFlow,
  })
  const { data: categories, isLoading: loadingCats } = useQuery({
    queryKey: ['analytics', 'category'],
    queryFn: analyticsService.getCategorySpending,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-slate-600 dark:text-neutral-400 text-sm">Deep insights into your financial health</p>
      </div>

      {/* Income vs Expense Trend */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-6">Monthly Income vs Expenses</h2>
        {loadingTrends ? <SkeletonChart /> : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={trends?.incomeVsExpense ?? []} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888825" />
              <XAxis dataKey="month" tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card-bg, #0d0d0d)', border: '1px solid #88888840', borderRadius: '12px', color: 'inherit' }}
                formatter={(v: number) => [`₹${v.toFixed(0)}`, '']}
              />
              <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12 }} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Cash Flow */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-6">30-Day Cash Flow</h2>
        {loadingCashFlow ? <SkeletonChart /> : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={cashFlow ?? []}>
              <defs>
                <linearGradient id="cfIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cfExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888825" />
              <XAxis dataKey="date" tick={{ fill: '#737373', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card-bg, #0d0d0d)', border: '1px solid #88888840', borderRadius: '12px', color: 'inherit' }}
                formatter={(v: number) => [`₹${v.toFixed(0)}`, '']}
              />
              <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fill="url(#cfIncome)" />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2} fill="url(#cfExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Budget Comparison + Category Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Budget vs Actual */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-6">Budget vs Actual (This Month)</h2>
          {loadingTrends ? <SkeletonChart /> : (trends?.budgetComparison ?? []).length > 0 ? (
            <div className="space-y-4">
              {(trends?.budgetComparison ?? []).map((b, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{b.categoryName}</span>
                    <span className={`text-xs font-semibold ${b.percent >= 100 ? 'text-danger' : b.percent >= 80 ? 'text-warning' : 'text-success'}`}>
                      {b.percent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(b.percent, 100)}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="progress-fill"
                      style={{ background: b.percent >= 100 ? '#ef4444' : b.percent >= 80 ? '#f59e0b' : '#10b981' }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-slate-500 dark:text-neutral-400">Spent: ₹{b.actual.toFixed(0)}</span>
                    <span className="text-xs text-slate-500 dark:text-neutral-400">Limit: ₹{b.limit.toFixed(0)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-neutral-400 text-sm text-center py-12">Set budgets to see comparisons</p>
          )}
        </motion.div>

        {/* Category Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-6">Expense Breakdown by Category</h2>
          {loadingCats ? <SkeletonChart /> : (categories ?? []).length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categories} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name">
                    {(categories ?? []).map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg, #0d0d0d)', border: '1px solid #88888840', borderRadius: '12px', color: 'inherit' }} formatter={(v: number) => [`₹${v.toFixed(0)}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {(categories ?? []).slice(0, 6).map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-xs text-slate-600 dark:text-neutral-400 truncate">{c.name}</span>
                    <span className="text-xs text-slate-800 dark:text-neutral-300 font-semibold ml-auto">₹{c.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-slate-500 dark:text-neutral-400 text-sm text-center py-12">No expenses this month</p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
