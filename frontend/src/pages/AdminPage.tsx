import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, DollarSign, Activity, Ticket, Ban, CheckCircle, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { format } from 'date-fns'

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(n)

export default function AdminPage() {
  const qc = useQueryClient()

  const { data: statsData } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => { const { data } = await api.get('/admin/stats'); return data.stats },
  })

  const { data: usersData } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => { const { data } = await api.get('/admin/users'); return data },
  })

  const { data: ticketsData } = useQuery({
    queryKey: ['admin', 'tickets'],
    queryFn: async () => { const { data } = await api.get('/admin/tickets'); return data.tickets },
  })

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/admin/users/${id}/status`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users'] }); toast.success('User status updated') },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed'),
  })

  const resolveTicket = useMutation({
    mutationFn: (id: string) => api.put(`/admin/tickets/${id}/resolve`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'tickets'] }); toast.success('Ticket resolved') },
  })

  const s = statsData

  const statCards = [
    { label: 'Total Users', value: s?.totalUsers ?? 0, icon: Users, color: 'text-brand-400', bg: 'bg-brand-400/20' },
    { label: 'Transactions', value: s?.totalTransactions ?? 0, icon: Activity, color: 'text-success', bg: 'bg-success/20' },
    { label: 'Transaction Volume', value: formatCurrency(s?.totalVolume ?? 0), icon: DollarSign, color: 'text-warning', bg: 'bg-warning/20' },
    { label: 'Open Tickets', value: s?.openTickets ?? 0, icon: Ticket, color: 'text-danger', bg: 'bg-danger/20' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-brand-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-400 text-sm">Platform management & analytics</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className={`text-2xl font-bold ${color} tabular-nums`}>{value.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Users Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card overflow-hidden p-0">
        <div className="p-5 border-b border-surface-border">
          <h2 className="text-base font-semibold text-white">User Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface/50">
                <th className="table-header text-left p-4">User</th>
                <th className="table-header text-left p-4">Role</th>
                <th className="table-header text-left p-4">Status</th>
                <th className="table-header text-left p-4">Joined</th>
                <th className="table-header text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {(usersData?.users ?? []).map((u: any) => (
                <tr key={u._id} className="hover:bg-surface-hover transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold">
                        {u.avatar ? <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" /> : u.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-white">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`badge ${u.role === 'admin' ? 'badge-info' : 'badge-income'}`}>{u.role}</span>
                  </td>
                  <td className="p-4">
                    <span className={`badge ${u.status === 'active' ? 'badge-income' : 'badge-expense'}`}>{u.status}</span>
                  </td>
                  <td className="p-4 text-slate-500 text-xs">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                  <td className="p-4 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => statusMut.mutate({ id: u._id, status: u.status === 'active' ? 'banned' : 'active' })}
                        className={`btn text-xs py-1.5 px-3 ${u.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                      >
                        {u.status === 'active' ? <><Ban className="w-3 h-3" /> Ban</> : <><CheckCircle className="w-3 h-3" /> Activate</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Support Tickets */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card overflow-hidden p-0">
        <div className="p-5 border-b border-surface-border">
          <h2 className="text-base font-semibold text-white">Support Tickets</h2>
        </div>
        <div className="divide-y divide-surface-border">
          {(ticketsData ?? []).length === 0 ? (
            <p className="text-slate-500 text-sm text-center p-8">No tickets</p>
          ) : (
            (ticketsData ?? []).map((t: any) => (
              <div key={t._id} className="p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-white">{t.subject}</p>
                    <span className={`badge ${t.status === 'open' ? 'badge-warning' : 'badge-income'}`}>{t.status}</span>
                  </div>
                  <p className="text-xs text-slate-400">{t.message}</p>
                  <p className="text-xs text-slate-600 mt-1">by {t.user?.name} · {format(new Date(t.createdAt), 'MMM d, yyyy')}</p>
                </div>
                {t.status === 'open' && (
                  <button onClick={() => resolveTicket.mutate(t._id)} className="btn-success text-xs px-3 py-1.5 flex-shrink-0">
                    <CheckCircle className="w-3 h-3" /> Resolve
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}
