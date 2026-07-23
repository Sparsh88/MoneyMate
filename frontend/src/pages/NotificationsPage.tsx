import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Bell, Check, Trash2, AlertTriangle, Trophy, RefreshCw, Info } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { notificationService } from '../services/notificationService'
import type { Notification } from '../types'

const typeConfig = {
  budget_alert:  { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/20' },
  bill_reminder: { icon: RefreshCw,     color: 'text-brand-400', bg: 'bg-brand-400/20' },
  goal_achieved: { icon: Trophy,        color: 'text-success', bg: 'bg-success/20' },
  system:        { icon: Info,          color: 'text-slate-400', bg: 'bg-slate-400/20' },
}

export default function NotificationsPage() {
  const qc = useQueryClient()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getAll,
    refetchInterval: 30000,
  })

  const markRead = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const deleteNotif = useMutation({
    mutationFn: notificationService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('Notification deleted') },
  })

  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-400" /> Notifications
          </h1>
          <p className="text-slate-400 text-sm">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button
            onClick={() => notifications.filter(n => !n.read).forEach(n => markRead.mutate(n._id))}
            className="btn-secondary text-xs gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> Mark All Read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n, i) => {
            const cfg = typeConfig[n.type] ?? typeConfig.system
            const Icon = cfg.icon
            return (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`card flex items-start gap-4 group ${!n.read ? 'border-brand-500/30' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${n.read ? 'text-slate-300' : 'text-white'}`}>{n.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-slate-600 mt-2">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  {!n.read && (
                    <button onClick={() => markRead.mutate(n._id)} className="btn-icon btn-ghost py-1.5 px-2">
                      <Check className="w-3.5 h-3.5 text-success" />
                    </button>
                  )}
                  <button onClick={() => deleteNotif.mutate(n._id)} className="btn-icon btn-ghost py-1.5 px-2">
                    <Trash2 className="w-3.5 h-3.5 text-danger" />
                  </button>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-2" />
                )}
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="card py-20 text-center">
          <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500">You're all caught up!</p>
          <p className="text-slate-600 text-sm mt-1">No notifications at the moment.</p>
        </div>
      )}
    </div>
  )
}
