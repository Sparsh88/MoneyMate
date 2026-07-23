import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, Download, Upload, Trash2, Pencil, FileText, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { transactionService } from '../services/transactionService'
import TransactionRow from '../components/common/TransactionRow'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import AddTransactionModal from '../components/transactions/AddTransactionModal'
import type { Transaction } from '../types'

const LIMIT = 10

export default function TransactionsPage() {
  const qc = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Transaction | null>(null)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<'' | 'income' | 'expense'>('')
  const [page, setPage] = useState(1)
  const csvRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', { search, type, page }],
    queryFn: () => transactionService.getAll({ search, type: type || undefined, page, limit: LIMIT }),
    placeholderData: (prev) => prev,
  })

  const deleteMutation = useMutation({
    mutationFn: transactionService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Transaction deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  const handleDelete = (id: string) => {
    if (confirm('Delete this transaction?')) deleteMutation.mutate(id)
  }

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const result = await transactionService.importCSV(file)
      toast.success(result.message)
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['analytics'] })
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Import failed')
    } finally {
      setImporting(false)
      if (csvRef.current) csvRef.current.value = ''
    }
  }

  const transactions = data?.transactions ?? []
  const pagination = data?.pagination

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Transactions</h1>
          <p className="text-slate-600 dark:text-neutral-400 text-sm">{pagination?.total ?? 0} total records</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* Import */}
          <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
          <button
            onClick={() => csvRef.current?.click()}
            disabled={importing}
            className="btn-secondary text-xs gap-1.5 flex-1 sm:flex-none justify-center"
          >
            {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Import CSV
          </button>

          {/* Export */}
          <button onClick={transactionService.exportCSV} className="btn-secondary text-xs gap-1.5 flex-1 sm:flex-none justify-center">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={transactionService.exportPDF} className="btn-secondary text-xs gap-1.5 flex-1 sm:flex-none justify-center">
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>

          <button onClick={() => setAddOpen(true)} className="btn-primary text-xs gap-1.5 w-full sm:w-auto justify-center">
            <Plus className="w-3.5 h-3.5" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by description…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="input pl-9"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          )}
        </div>
        <div className="flex rounded-xl overflow-hidden border border-surface-border flex-shrink-0">
          {(['', 'income', 'expense'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setType(t); setPage(1) }}
              className={`px-3 py-2 text-xs font-medium transition-all ${type === t
                ? t === 'income' ? 'bg-success text-white' : t === 'expense' ? 'bg-danger text-white' : 'bg-brand-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              {t === '' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="card p-0">
        {isLoading ? (
          <LoadingSkeleton rows={8} />
        ) : transactions.length > 0 ? (
          <>
            <div className="divide-y divide-surface-border">
              {transactions.map((t, i) => (
                <TransactionRow
                  key={t._id}
                  transaction={t}
                  index={i}
                  onEdit={() => setEditTarget(t)}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-surface-border">
                <p className="text-xs text-slate-500">
                  Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, pagination.total)} of {pagination.total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-slate-400">{page} / {pagination.pages}</span>
                  <button
                    disabled={page >= pagination.pages}
                    onClick={() => setPage(p => p + 1)}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-slate-500 text-sm mb-4">No transactions found</p>
            <button onClick={() => setAddOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Add Transaction
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddTransactionModal open={addOpen} onClose={() => setAddOpen(false)} />
      {editTarget && (
        <AddTransactionModal
          open={true}
          onClose={() => setEditTarget(null)}
          initial={editTarget}
        />
      )}
    </div>
  )
}
