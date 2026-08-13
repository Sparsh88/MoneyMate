import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Trash2, Loader2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { budgetService } from '../services/budgetService'
import { categoryService } from '../services/categoryService'

const schema = z.object({
  category: z.string().optional(),
  amount: z.coerce.number().positive('Must be positive'),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020).max(2100),
})
type FormData = z.infer<typeof schema>

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function BudgetsPage() {
  const qc = useQueryClient()
  const now = new Date()
  const [open, setOpen] = useState(false)

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetService.getAll(now.getMonth() + 1, now.getFullYear()),
  })
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
    staleTime: 5 * 60 * 1000,
  })


  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { month: now.getMonth() + 1, year: now.getFullYear() },
  })

  const createMutation = useMutation({
    mutationFn: budgetService.createOrUpdate,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['budgets'] }); toast.success('Budget saved!'); setOpen(false); reset() },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: budgetService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['budgets'] }); toast.success('Budget removed') },
  })

  const expenseCategories = categories.filter((c) => c.type === 'expense')
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Budgets</h1>
          <p className="text-slate-600 dark:text-neutral-400 text-sm">Monthly spending limits · Total: ₹{totalBudget.toLocaleString('en-IN')}</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> Set Budget</button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : budgets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {budgets.map((b, i) => (
            <motion.div
              key={b._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="card group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{b.category?.name ?? 'Overall Budget'}</p>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">{MONTHS[(b.month - 1)]} {b.year}</p>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(b._id)}
                  className="btn-icon btn-ghost text-slate-500 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-3">₹{b.amount.toLocaleString('en-IN')}</p>
              <div className="progress-bar">
                <div className="progress-fill bg-brand-gradient" style={{ width: '40%' }} />
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-2">Monthly limit set</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card py-16 text-center">
          <p className="text-slate-500 dark:text-neutral-400 mb-4">No budgets set for this month</p>
          <button onClick={() => setOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> Set First Budget</button>
        </div>
      )}

      {/* Add Budget Modal */}
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Set Budget</h2>
              <button onClick={() => setOpen(false)} className="btn-icon btn-ghost"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
              <div>
                <label className="label">Category (leave blank for overall)</label>
                <select className="input" {...register('category')}>
                  <option value="">Overall Budget</option>
                  {expenseCategories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Budget Limit (₹)</label>
                <input type="number" step="0.01" placeholder="5000" className={`input ${errors.amount ? 'input-error' : ''}`} {...register('amount')} />
                {errors.amount && <p className="text-xs text-danger mt-1">{errors.amount.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Month</label>
                  <select className="input" {...register('month')}>
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Year</label>
                  <input type="number" className="input" {...register('year')} />
                </div>
              </div>
              <button type="submit" disabled={createMutation.isPending} className="btn-primary w-full">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Save Budget
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
