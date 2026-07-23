import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'
import api from '../services/api'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setAccessToken: (token: string | null) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAccessToken: (token) => {
        set({ accessToken: token })
        if (token) localStorage.setItem('accessToken', token)
        else localStorage.removeItem('accessToken')
      },

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          set({
            user: data.user,
            accessToken: data.accessToken,
            isAuthenticated: true,
            isLoading: false,
          })
          localStorage.setItem('accessToken', data.accessToken)
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } catch (_) { /* ignore */ }
        set({ user: null, accessToken: null, isAuthenticated: false })
        localStorage.removeItem('accessToken')
      },

      refreshUser: async () => {
        try {
          const { data } = await api.get('/auth/me')
          set({ user: data.user, isAuthenticated: true })
        } catch (_) {
          set({ user: null, isAuthenticated: false })
        }
      },
    }),
    {
      name: 'moneymate-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, isAuthenticated: state.isAuthenticated }),
    }
  )
)
