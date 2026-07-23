import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Upload, Image, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { transactionService } from '../../services/transactionService'
import { categoryService } from '../../services/categoryService'

const schema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Select a category'),
  description: z.string().min(2, 'Description too short').max(200),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  initial?: any
}

export default function AddTransactionModal({ open, onClose, initial }: Props) {
  const qc = useQueryClient()
  const [receiptUrl, setReceiptUrl] = useState(initial?.receiptUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  })

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: initial?.type ?? 'expense',
      amount: initial?.amount ?? undefined,
      category: initial?.category?._id ?? '',
      description: initial?.description ?? '',
      date: initial?.date ? initial.date.split('T')[0] : new Date().toISOString().split('T')[0],
      notes: initial?.notes ?? '',
    },
  })

  const selectedType = watch('type')
  const filteredCategories = categories.filter((c) => c.type === selectedType)

  const mutation = useMutation({
    mutationFn: (data: FormData & { receiptUrl?: string }) =>
      initial
        ? transactionService.update(initial._id, { ...data, receiptUrl })
        : transactionService.create({ ...data, receiptUrl }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['analytics'] })
      toast.success(initial ? 'Transaction updated!' : 'Transaction added!')
      handleClose()
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Something went wrong'),
  })

  const handleClose = () => {
    reset()
    setReceiptUrl('')
    onClose()
  }

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await transactionService.uploadReceipt(file)
      setReceiptUrl(url)
      toast.success('Receipt uploaded!')
    } catch {
      toast.error('Failed to upload receipt')
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = (data: FormData) => mutation.mutate({ ...data, receiptUrl })

  return (
    <AnimatePresence>
      {open && (
        <div className="modal-overlay" onClick={handleClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="modal-box max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {initial ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <button onClick={handleClose} className="btn-icon btn-ghost">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Type Toggle */}
              <div className="flex rounded-xl overflow-hidden border border-surface-border">
                {(['expense', 'income'] as const).map((t) => (
                  <label
                    key={t}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold cursor-pointer transition-all ${selectedType === t
                      ? t === 'income' ? 'bg-success text-white' : 'bg-danger text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <input type="radio" value={t} {...register('type')} className="sr-only" />
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </label>
                ))}
              </div>

              {/* Amount */}
              <div>
                <label className="label">Amount (₹)</label>
                <input type="number" step="0.01" placeholder="0.00" className={`input ${errors.amount ? 'input-error' : ''}`} {...register('amount')} />
                {errors.amount && <p className="text-xs text-danger mt-1">{errors.amount.message}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="label">Category</label>
                <select className={`input ${errors.category ? 'input-error' : ''}`} {...register('category')}>
                  <option value="">Select a category</option>
                  {filteredCategories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                {errors.category && <p className="text-xs text-danger mt-1">{errors.category.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="label">Description</label>
                <input type="text" placeholder="What was this for?" className={`input ${errors.description ? 'input-error' : ''}`} {...register('description')} />
                {errors.description && <p className="text-xs text-danger mt-1">{errors.description.message}</p>}
              </div>

              {/* Date */}
              <div>
                <label className="label">Date</label>
                <input type="date" className={`input ${errors.date ? 'input-error' : ''}`} {...register('date')} />
                {errors.date && <p className="text-xs text-danger mt-1">{errors.date.message}</p>}
              </div>

              {/* Notes */}
              <div>
                <label className="label">Notes (optional)</label>
                <textarea rows={2} placeholder="Any additional notes..." className="input resize-none" {...register('notes')} />
              </div>

              {/* Receipt Upload */}
              <div>
                <label className="label">Receipt (optional)</label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleReceiptUpload} />
                {receiptUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-surface-border h-28">
                    <img src={receiptUrl} alt="Receipt" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setReceiptUrl('')}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full border-2 border-dashed border-surface-border rounded-xl p-4 flex flex-col items-center gap-2 text-slate-500 hover:border-brand-500 hover:text-brand-400 transition-colors duration-200"
                  >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Image className="w-5 h-5" />}
                    <span className="text-xs">{uploading ? 'Uploading…' : 'Click to upload receipt'}</span>
                  </button>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={mutation.isPending}
                className={`btn-primary w-full ${selectedType === 'income' ? 'bg-income-gradient' : 'bg-expense-gradient'}`}
              >
                {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {initial ? 'Save Changes' : `Add ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
