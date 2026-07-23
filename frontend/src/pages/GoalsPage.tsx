import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Loader2, X, Target, Trophy, Coins } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { goalService } from '../services/goalService'
import { format, differenceInDays } from 'date-fns'
import type { SavingsGoal } from '../types'

const createSchema = z.object({
  name: z.string().min(2, 'Name required'),
  targetAmount: z.coerce.number().positive('Must be positive'),
  targetDate: z.string().min(1, 'Date required'),
  currentAmount: z.coerce.number().min(0).optional(),
})
type CreateForm = z.infer<typeof createSchema>

const contributeSchema = z.object({ contribution: z.coerce.number().positive('Must be positive') })
type ContributeForm = z.infer<typeof contributeSchema>

export default function GoalsPage() {
  const qc = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [contributeTarget, setContributeTarget] = useState<SavingsGoal | null>(null)

  const { data: goals = [], isLoading } = useQuery({ queryKey: ['goals'], queryFn: goalService.getAll })

  const { register: regCreate, handleSubmit: handleCreate, reset: resetCreate, formState: { errors: errs } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { currentAmount: 0 },
  })
  const { register: regContr, handleSubmit: handleContrib, reset: resetContr } = useForm<ContributeForm>({
    resolver: zodResolver(contributeSchema),
  })

  const createMutation = useMutation({
    mutationFn: goalService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['goals'] }); toast.success('Goal created!'); setAddOpen(false); resetCreate() },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed'),
  })
  const contributeMutation = useMutation({
    mutationFn: ({ id, contribution }: { id: string; contribution: number }) =>
      goalService.update(id, { contribution }),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      if (data.status === 'achieved') toast.success('🎉 Goal Achieved!')
      else toast.success('Contribution added!')
      setContributeTarget(null)
      resetContr()
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed'),
  })
  const deleteMutation = useMutation({
    mutationFn: goalService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['goals'] }); toast.success('Goal deleted') },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Savings Goals</h1>
          <p className="text-slate-600 dark:text-neutral-400 text-sm">{goals.filter(g => g.status === 'active').length} active goals</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Goal</button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map((g, i) => {
            const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100)
            const daysLeft = differenceInDays(new Date(g.targetDate), new Date())
            const achieved = g.status === 'achieved'
            return (
              <motion.div key={g._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className={`card group relative overflow-hidden ${achieved ? 'border-success/40' : ''}`}>
                {achieved && (
                  <div className="absolute top-3 right-10 flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-warning" />
                    <span className="text-xs font-bold text-warning">Achieved!</span>
                  </div>
                )}
                <button onClick={() => deleteMutation.mutate(g._id)}
                  className="absolute top-3 right-3 btn-icon btn-ghost text-slate-500 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${achieved ? 'bg-success/20' : 'bg-brand-500/20'}`}>
                    <Target className={`w-5 h-5 ${achieved ? 'text-success' : 'text-emerald-500'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{g.name}</p>
                    <p className="text-xs text-slate-500 dark:text-neutral-400">
                      {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today!' : 'Past due'}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-slate-700 dark:text-neutral-300">₹{g.currentAmount.toLocaleString('en-IN')} saved</span>
                    <span className="text-slate-500 dark:text-neutral-400">₹{g.targetAmount.toLocaleString('en-IN')} goal</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9 }}
                      className="progress-fill"
                      style={{ background: achieved ? '#10b981' : 'linear-gradient(90deg,#10b981,#059669)' }}
                    />
                  </div>
                  <p className={`text-right text-xs mt-1 font-semibold ${achieved ? 'text-success' : 'text-emerald-600 dark:text-emerald-400'}`}>{pct.toFixed(1)}%</p>
                </div>

                <p className="text-xs text-slate-500 dark:text-neutral-400 mb-4">Target: {format(new Date(g.targetDate), 'MMM d, yyyy')}</p>

                {!achieved && (
                  <button onClick={() => setContributeTarget(g)} className="btn-secondary w-full text-xs py-2">
                    <Coins className="w-3.5 h-3.5" /> Add Contribution
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="card py-16 text-center">
          <Target className="w-12 h-12 text-slate-600 dark:text-neutral-400 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-neutral-400 mb-4">No savings goals yet</p>
          <button onClick={() => setAddOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> Create First Goal</button>
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {addOpen && (
          <div className="modal-overlay" onClick={() => setAddOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">New Savings Goal</h2>
                <button onClick={() => setAddOpen(false)} className="btn-icon btn-ghost"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreate((d) => createMutation.mutate(d))} className="space-y-4">
                <div><label className="label">Goal Name</label>
                  <input type="text" placeholder="e.g. Emergency Fund" className={`input ${errs.name ? 'input-error' : ''}`} {...regCreate('name')} />
                  {errs.name && <p className="text-xs text-danger mt-1">{errs.name.message}</p>}
                </div>
                <div><label className="label">Target Amount (₹)</label>
                  <input type="number" step="0.01" placeholder="100000" className={`input ${errs.targetAmount ? 'input-error' : ''}`} {...regCreate('targetAmount')} />
                  {errs.targetAmount && <p className="text-xs text-danger mt-1">{errs.targetAmount.message}</p>}
                </div>
                <div><label className="label">Current Savings (₹)</label>
                  <input type="number" step="0.01" placeholder="0" className="input" {...regCreate('currentAmount')} />
                </div>
                <div><label className="label">Target Date</label>
                  <input type="date" className={`input ${errs.targetDate ? 'input-error' : ''}`} {...regCreate('targetDate')} />
                  {errs.targetDate && <p className="text-xs text-danger mt-1">{errs.targetDate.message}</p>}
                </div>
                <button type="submit" disabled={createMutation.isPending} className="btn-primary w-full">
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Goal
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contribute Modal */}
      <AnimatePresence>
        {contributeTarget && (
          <div className="modal-overlay" onClick={() => setContributeTarget(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="modal-box max-w-sm" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add to "{contributeTarget.name}"</h2>
                <button onClick={() => setContributeTarget(null)} className="btn-icon btn-ghost"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleContrib((d) => contributeMutation.mutate({ id: contributeTarget._id, contribution: d.contribution }))}
                className="space-y-4">
                <div><label className="label">Contribution Amount (₹)</label>
                  <input type="number" step="0.01" placeholder="1000" className="input" {...regContr('contribution')} autoFocus />
                </div>
                <button type="submit" disabled={contributeMutation.isPending} className="btn-primary w-full">
                  {contributeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
                  Add Contribution
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
