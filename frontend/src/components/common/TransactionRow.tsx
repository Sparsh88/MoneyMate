import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import type { Transaction } from '../../types'

interface TransactionRowProps {
  transaction: Transaction
  onEdit?: (t: Transaction) => void
  onDelete?: (id: string) => void
  index?: number
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)

export default function TransactionRow({ transaction, onEdit, onDelete, index = 0 }: TransactionRowProps) {
  const isIncome = transaction.type === 'income'

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-900/60 transition-colors duration-200 group"
    >
      {/* Category icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: `${transaction.category?.color || '#10b981'}25`, color: transaction.category?.color || '#10b981' }}
      >
        {getCategoryEmoji(transaction.category?.icon)}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{transaction.description}</p>
        <p className="text-xs text-slate-500 dark:text-neutral-400 truncate">
          {transaction.category?.name} · {formatDistanceToNow(new Date(transaction.date), { addSuffix: true })}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-bold tabular-nums ${isIncome ? 'text-success' : 'text-danger'}`}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </p>
        {transaction.isRecurring && (
          <span className="text-xs text-slate-500 dark:text-neutral-400">Recurring</span>
        )}
      </div>

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(transaction)}
              className="btn-icon btn-ghost py-1.5 px-2 text-xs"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(transaction._id)}
              className="btn-icon btn-ghost py-1.5 px-2 text-xs text-danger hover:bg-danger/10"
            >
              Del
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}

function getCategoryEmoji(icon?: string): string {
  const map: Record<string, string> = {
    Briefcase: '💼', Laptop: '💻', TrendingUp: '📈', Gift: '🎁',
    Utensils: '🍽️', Home: '🏠', Car: '🚗', ShoppingBag: '🛍️',
    Film: '🎬', HeartPulse: '❤️', GraduationCap: '🎓', Plane: '✈️',
  }
  return icon ? (map[icon] ?? '💰') : '💰'
}
