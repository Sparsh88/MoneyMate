import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { User, Lock, Palette, Loader2, Save, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import api from '../services/api'

const profileSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  avatar: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function SettingsPage() {
  const { user, setUser } = useAuthStore()
  const { theme, toggle } = useThemeStore()
  const [showPw, setShowPw] = useState(false)

  const { register: regP, handleSubmit: handleProfile, formState: { errors: pErrors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', avatar: user?.avatar ?? '' },
  })

  const { register: regPw, handleSubmit: handlePassword, reset: resetPw, formState: { errors: pwErrors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const profileMut = useMutation({
    mutationFn: (d: ProfileForm) => api.put('/users/profile', d),
    onSuccess: ({ data }) => { setUser(data.user); toast.success('Profile updated!') },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed'),
  })

  const passwordMut = useMutation({
    mutationFn: (d: PasswordForm) => api.put('/users/change-password', d),
    onSuccess: () => { toast.success('Password changed!'); resetPw() },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed'),
  })

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-white">Settings</h1>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
            <User className="w-4 h-4 text-brand-400" />
          </div>
          <h2 className="text-base font-semibold text-white">Profile Information</h2>
        </div>

        <form onSubmit={handleProfile((d) => profileMut.mutate(d))} className="space-y-4">
          {/* Avatar preview */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-full bg-brand-gradient flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {user?.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <span className={`badge mt-1 ${user?.role === 'admin' ? 'badge-info' : 'badge-income'}`}>{user?.role}</span>
            </div>
          </div>

          <div>
            <label className="label">Display Name</label>
            <input type="text" className={`input ${pErrors.name ? 'input-error' : ''}`} {...regP('name')} />
            {pErrors.name && <p className="text-xs text-danger mt-1">{pErrors.name.message}</p>}
          </div>
          <div>
            <label className="label">Avatar URL (optional)</label>
            <input type="url" placeholder="https://..." className={`input ${pErrors.avatar ? 'input-error' : ''}`} {...regP('avatar')} />
            {pErrors.avatar && <p className="text-xs text-danger mt-1">{pErrors.avatar.message}</p>}
          </div>
          <button type="submit" disabled={profileMut.isPending} className="btn-primary">
            {profileMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile
          </button>
        </form>
      </motion.div>

      {/* Password */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center">
            <Lock className="w-4 h-4 text-warning" />
          </div>
          <h2 className="text-base font-semibold text-white">Change Password</h2>
        </div>
        <form onSubmit={handlePassword((d) => passwordMut.mutate(d))} className="space-y-4">
          {([
            { name: 'currentPassword', label: 'Current Password' },
            { name: 'newPassword', label: 'New Password' },
            { name: 'confirmPassword', label: 'Confirm New Password' },
          ] as const).map(({ name, label }) => (
            <div key={name}>
              <label className="label">{label}</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className={`input pr-10 ${pwErrors[name] ? 'input-error' : ''}`}
                  {...regPw(name)}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pwErrors[name] && <p className="text-xs text-danger mt-1">{pwErrors[name]?.message}</p>}
            </div>
          ))}
          <button type="submit" disabled={passwordMut.isPending} className="btn-primary">
            {passwordMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Update Password
          </button>
        </form>
      </motion.div>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Palette className="w-4 h-4 text-purple-400" />
          </div>
          <h2 className="text-base font-semibold text-white">Appearance</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Theme</p>
            <p className="text-xs text-slate-500">Currently: {theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
          </div>
          <button onClick={toggle} className="btn-secondary">
            Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
        </div>
      </motion.div>
    </div>
  )
}
