import { Menu, Sun, Moon, Bell, Search, TrendingUp } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'
import { useAuthStore } from '../../store/authStore'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface TopbarProps {
  onMenuClick: () => void
  title: string
}

export default function Topbar({ onMenuClick, title }: TopbarProps) {
  const { theme, toggle } = useThemeStore()
  const { user } = useAuthStore()

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-slate-200 dark:border-neutral-800 px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4 transition-colors duration-300">
      {/* Left */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 hover:text-emerald-500 transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand Logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{title}</span>
        </div>

        {/* Desktop Title */}
        <h1 className="text-base font-semibold text-slate-900 dark:text-white hidden lg:block">{title}</h1>
      </div>

      {/* Center – search (desktop only) */}
      <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search transactions…"
            className="input pl-9 py-2 text-sm"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Theme toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={toggle}
          className="p-2 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 hover:border-emerald-500 transition-all duration-200"
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-emerald-600" />}
        </motion.button>

        {/* Notifications */}
        <Link to="/notifications" className="p-2 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 hover:text-emerald-500 transition-colors relative" aria-label="Notifications">
          <Bell className="w-4.5 h-4.5" />
        </Link>

        {/* Avatar */}
        <Link to="/settings" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-glow hover:shadow-glow transition-all duration-200 flex-shrink-0">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover" />
          ) : (
            user?.name?.charAt(0).toUpperCase() ?? 'U'
          )}
        </Link>
      </div>
    </header>
  )
}
