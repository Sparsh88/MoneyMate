import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import api from '../../services/api'

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Invalid verification link.'); return }
    api.post('/auth/verify-email', { token })
      .then(() => { setStatus('success'); setMessage('Your email has been verified!') })
      .catch((err) => { setStatus('error'); setMessage(err.response?.data?.message ?? 'Verification failed.') })
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-10 text-center max-w-sm w-full">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-gradient shadow-glow mb-6 mx-auto">
          <TrendingUp className="w-7 h-7 text-white" />
        </div>
        {status === 'loading' && <><Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-4" /><p className="text-slate-400">Verifying your email…</p></>}
        {status === 'success' && <><CheckCircle className="w-12 h-12 text-success mx-auto mb-4" /><h2 className="text-xl font-bold text-white mb-2">Email Verified!</h2><p className="text-slate-400 mb-6">{message}</p><Link to="/login" className="btn-primary">Go to Login</Link></>}
        {status === 'error' && <><XCircle className="w-12 h-12 text-danger mx-auto mb-4" /><h2 className="text-xl font-bold text-white mb-2">Verification Failed</h2><p className="text-slate-400 mb-6">{message}</p><Link to="/login" className="btn-secondary">Back to Login</Link></>}
      </motion.div>
    </div>
  )
}
