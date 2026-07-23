import { motion } from 'framer-motion'
import { Repeat, Calendar, Info } from 'lucide-react'

export default function RecurringPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Repeat className="w-5 h-5 text-brand-400" /> Recurring Transactions
        </h1>
        <p className="text-slate-400 text-sm">Automatic bill and income tracking</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex items-start gap-4 p-2">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white mb-1">How Recurring Works</p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Recurring transactions are configured in the backend and are automatically processed by a background worker 
              every 12 hours. When a recurring transaction is due, it is automatically added to your transaction history 
              and you receive an in-app notification. To set up recurring transactions, use the API or contact your admin.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card py-16 text-center"
      >
        <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-white mb-2">No Recurring Transactions</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Recurring transaction management UI is coming in the next release. 
          Your scheduled transactions are still processed automatically by the backend worker.
        </p>
      </motion.div>
    </div>
  )
}
