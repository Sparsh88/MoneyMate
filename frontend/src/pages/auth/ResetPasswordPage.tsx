import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { TrendingUp, Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const schema = z.object({
  password: z.string().min(8, 'Min 8 characters').regex(/[A-Za-z]/).regex(/\d/),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })
type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')
  const [showPw, setShowPw] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    if (!token) { toast.error('Invalid reset link'); return }
    try {
      await api.post('/auth/reset-password', { token, password: data.password })
      toast.success('Password reset successful!')
      navigate('/login')
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Reset failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-gradient shadow-glow mb-4">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Set New Password</h1>
          <p className="text-slate-400 text-sm mt-1">Choose a strong password for your account</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {(['password', 'confirm'] as const).map((field) => (
              <div key={field}>
                <label className="label">{field === 'password' ? 'New Password' : 'Confirm Password'}</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`input pr-10 ${errors[field] ? 'input-error' : ''}`}
                    {...register(field)}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors[field] && <p className="text-xs text-danger mt-1">{errors[field]?.message}</p>}
              </div>
            ))}
            <button type="submit" disabled={isSubmitting || !token} className="btn-primary w-full">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Reset Password
            </button>
            <Link to="/login" className="block text-center text-sm text-slate-400 hover:text-white mt-2">Back to Login</Link>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
