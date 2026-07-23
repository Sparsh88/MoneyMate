import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const pageTitles: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/transactions':  'Transactions',
  '/analytics':     'Analytics',
  '/budgets':       'Budgets',
  '/goals':         'Savings Goals',
  '/recurring':     'Recurring',
  '/ai':            'AI Advisor',
  '/notifications': 'Notifications',
  '/settings':      'Settings',
  '/admin':         'Admin Panel',
}

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
}

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? 'MoneyMate'

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-black dark:text-white transition-colors duration-300">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setMobileOpen(true)} title={title} />

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="p-3 sm:p-5 lg:p-6 min-h-full max-w-7xl mx-auto w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
