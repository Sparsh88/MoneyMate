import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  variant: 'income' | 'expense' | 'balance' | 'savings'
  trend?: { value: number; label: string }
  index?: number
}

const variantMap = {
  income:  { card: 'stat-card-income',  icon: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/20', value: 'text-emerald-600 dark:text-emerald-400' },
  expense: { card: 'stat-card-expense', icon: 'text-danger bg-danger/20',                                  value: 'text-danger' },
  balance: { card: 'stat-card-balance', icon: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/20', value: 'text-slate-900 dark:text-white' },
  savings: { card: 'stat-card-savings', icon: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/20', value: 'text-emerald-600 dark:text-emerald-400' },
}

export default function StatCard({ title, value, subtitle, icon: Icon, variant, trend, index = 0 }: StatCardProps) {
  const v = variantMap[variant]
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`card ${v.card} cursor-pointer`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-2">{title}</p>
          <p className={`text-2xl font-bold ${v.value} mb-1 tabular-nums`}>{value}</p>
          {subtitle && <p className="text-xs text-slate-500 dark:text-neutral-400">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.value >= 0 ? 'text-success' : 'text-danger'}`}>
              <span>{trend.value >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value).toFixed(1)}% {trend.label}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${v.icon}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  )
}
