import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Target, Repeat,
  Bot, Bell, Settings, LogOut, ChevronLeft, ChevronRight,
  TrendingUp, Shield, X,
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/analytics',   label: 'Analytics',    icon: TrendingUp },
  { to: '/budgets',     label: 'Budgets',      icon: PieChart },
  { to: '/goals',       label: 'Savings Goals',icon: Target },
  { to: '/recurring',   label: 'Recurring',    icon: Repeat },
  { to: '/ai',          label: 'AI Advisor',   icon: Bot },
  { to: '/notifications',label: 'Notifications',icon: Bell },
]

const pagePreloaders: Record<string, () => Promise<any>> = {
  '/dashboard': () => import('../../pages/DashboardPage'),
  '/transactions': () => import('../../pages/TransactionsPage'),
  '/analytics': () => import('../../pages/AnalyticsPage'),
  '/budgets': () => import('../../pages/BudgetsPage'),
  '/goals': () => import('../../pages/GoalsPage'),
  '/recurring': () => import('../../pages/RecurringPage'),
  '/ai': () => import('../../pages/AIAdvisorPage'),
  '/notifications': () => import('../../pages/NotificationsPage'),
  '/settings': () => import('../../pages/SettingsPage'),
  '/admin': () => import('../../pages/AdminPage'),
}

const prefetchRoute = (path: string) => {
  if (pagePreloaders[path]) {
    pagePreloaders[path]().catch(() => {})
  }
}

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Logo & Full Circle Collapse Toggle Header */}
      <div className={`flex items-center ${collapsed ? 'flex-col gap-2 justify-center py-4 px-2' : 'justify-between px-4 py-4'} border-b border-slate-200 dark:border-neutral-800 transition-all duration-300`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="min-w-0"
              >
                <p className="font-bold text-slate-900 dark:text-white text-sm truncate">MoneyMate</p>
                <p className="text-xs text-slate-500 dark:text-neutral-400 truncate">Smart Finance</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 100% Full Circle Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white items-center justify-center shadow-md transition-all duration-200 hover:scale-110 flex-shrink-0 focus:outline-none cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4 stroke-[2.5]" /> : <ChevronLeft className="w-4 h-4 stroke-[2.5]" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-3' : ''}`
            }
            title={collapsed ? label : undefined}
            onMouseEnter={() => prefetchRoute(to)}
            onTouchStart={() => prefetchRoute(to)}
            onClick={onMobileClose}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="text-sm"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}


        {user?.role === 'admin' && user?.email?.toLowerCase().trim() === 'sparshchauhan050@gmail.com' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-3' : ''}`
            }
            title={collapsed ? 'Admin' : undefined}
            onClick={onMobileClose}
          >
            <Shield className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="text-sm"
                >
                  Admin Panel
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-200 dark:border-neutral-800 p-3 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-3' : ''}`}
          onClick={onMobileClose}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Settings</span>}
        </NavLink>

        <button
          onClick={handleLogout}
          className={`nav-link w-full text-danger hover:bg-danger/10 ${collapsed ? 'justify-center px-3' : ''}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>

        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 pt-2">
            <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-neutral-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex relative flex-col h-screen bg-white dark:bg-black border-r border-slate-200 dark:border-neutral-800 flex-shrink-0 transition-colors duration-300 overflow-hidden"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full z-50 w-72 max-w-[85vw] bg-white dark:bg-black border-r border-slate-200 dark:border-neutral-800 lg:hidden overflow-hidden transition-colors duration-300 shadow-2xl"
            >
              <button
                onClick={onMobileClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
