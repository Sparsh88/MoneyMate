import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  TrendingUp, Bot, PieChart, Target, Shield, Zap,
  ArrowRight, CheckCircle, BarChart2, Star, Sun, Moon,
} from 'lucide-react'
import { useThemeStore } from '../store/themeStore'
import { useAuthStore } from '../store/authStore'

const features = [
  { icon: BarChart2,  title: 'Smart Analytics',     desc: 'Beautiful charts showing income vs expenses, cash flow, and category spending breakdowns.' },
  { icon: Bot,        title: 'AI Financial Advisor', desc: 'Powered by Gemini AI – get personalized insights, budget tips, and spending predictions.' },
  { icon: PieChart,   title: 'Budget Management',   desc: 'Set category-level budgets with automatic alerts when you approach your limits.' },
  { icon: Target,     title: 'Savings Goals',        desc: 'Create and track savings goals with animated progress bars and milestone celebrations.' },
  { icon: Shield,     title: 'Bank-Level Security',  desc: 'JWT authentication, refresh tokens, encrypted passwords, and CORS protection.' },
  { icon: Zap,        title: 'Recurring Tracking',   desc: 'Automatic recurring transaction processing for bills and subscriptions.' },
]

const stats = [
  { value: '100%', label: 'Open Source' },
  { value: 'AI-Powered', label: 'Gemini Integration' },
  { value: 'Real-Time', label: 'Budget Alerts' },
  { value: '∞', label: 'Transactions' },
]

export default function LandingPage() {
  const { theme, toggle } = useThemeStore()
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-black dark:text-white overflow-x-hidden transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 text-slate-900 border-b border-slate-200 dark:bg-black/95 dark:text-white dark:border-neutral-800 backdrop-blur-md px-6 py-4 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-glow">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">MoneyMate</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={toggle}
            className="p-2.5 rounded-xl border border-slate-300 dark:border-neutral-800 bg-slate-100 dark:bg-neutral-900/80 text-slate-700 dark:text-neutral-300 hover:border-emerald-500 transition-all duration-200 flex items-center gap-1.5 text-xs font-semibold shadow-sm"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </motion.button>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5 shadow-glow">
              Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm px-4 py-2">Sign In</Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-2">Get Started Free</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-32 text-center overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/[0.04] rounded-full blur-3xl -z-10" />

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:bg-neutral-900 dark:border-neutral-800 dark:text-emerald-400 text-xs font-medium mb-6">
            <Star className="w-3.5 h-3.5" /> AI-Powered Personal Finance Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
            Take Control of<br />
            <span className="text-gradient">Your Finances</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            MoneyMate combines beautiful analytics, AI-powered insights, and smart budget management to help you build lasting financial freedom.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary text-base px-8 py-3.5 shadow-glow">
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-base px-8 py-3.5 shadow-glow">
                  Start Tracking Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="btn-secondary text-base px-8 py-3.5">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </motion.div>

        {/* Hero Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-20"
        >
          {stats.map(({ value, label }) => (
            <motion.div
              key={label}
              whileHover={{ y: -6, scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="bg-white border border-slate-200 dark:bg-neutral-900/60 dark:border-neutral-800 hover:border-emerald-500/40 rounded-2xl py-6 px-4 text-center cursor-default shadow-card hover:shadow-lg transition-colors duration-300"
            >
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Everything you need to manage money</h2>
          <p className="text-slate-600 dark:text-neutral-400 max-w-xl mx-auto">A complete financial management platform with AI intelligence built right in.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.02 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="bg-white border border-slate-200 dark:bg-neutral-900/60 dark:border-neutral-800 hover:border-emerald-500/50 p-6 rounded-2xl transition-colors duration-300 group cursor-pointer shadow-card hover:shadow-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center mb-4 shadow-glow group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 250, damping: 20 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-white border border-slate-200 dark:bg-neutral-950 dark:border-neutral-800 hover:border-emerald-500/40 rounded-3xl p-12 text-center relative overflow-hidden transition-colors duration-300 shadow-card hover:shadow-2xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-glow">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Ready to transform your finances?</h2>
          <p className="text-slate-600 dark:text-neutral-400 mb-8">Join thousands of people managing smarter with MoneyMate.</p>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary text-base px-10 py-3.5 shadow-glow inline-flex">
              Go to Dashboard <ArrowRight className="w-5 h-5 text-white" />
            </Link>
          ) : (
            <Link to="/register" className="btn-primary text-base px-10 py-3.5 shadow-glow inline-flex">
              Create Free Account <ArrowRight className="w-5 h-5 text-white" />
            </Link>
          )}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-100 text-slate-900 dark:border-neutral-900 dark:bg-black dark:text-white px-6 py-8 text-center transition-colors duration-300">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-sm">MoneyMate</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-neutral-500">© {new Date().getFullYear()} MoneyMate. Built for portfolio, internships & SWE placements.</p>
      </footer>
    </div>
  )
}
