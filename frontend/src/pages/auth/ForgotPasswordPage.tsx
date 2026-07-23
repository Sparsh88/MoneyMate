import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { TrendingUp, Loader2, Mail, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const schema = z.object({ email: z.string().email('Invalid email') })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/auth/forgot-password', data)
      setSent(true)
      toast.success('Reset link sent! Check your inbox.')
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to send reset link')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-gradient shadow-glow mb-4">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
          <p className="text-slate-400 text-sm mt-1">We'll send a reset link to your email</p>
        </div>

        <div className="glass-card p-8">
          {sent ? (
            <div className="text-center py-4">
              <Mail className="w-12 h-12 text-brand-400 mx-auto mb-4" />
              <p className="text-white font-semibold mb-2">Check your inbox!</p>
              <p className="text-slate-400 text-sm mb-6">We've sent a password reset link. It expires in 1 hour.</p>
              <Link to="/login" className="btn-secondary w-full justify-center"><ArrowLeft className="w-4 h-4" /> Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input type="email" placeholder="you@example.com" className={`input ${errors.email ? 'input-error' : ''}`} {...register('email')} />
                {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                Send Reset Link
              </button>
              <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mt-2">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
