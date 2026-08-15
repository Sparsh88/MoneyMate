import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

interface Props {
  children: React.ReactNode
  adminOnly?: boolean
}

export const ADMIN_EMAIL = 'sparshchauhan050@gmail.com'

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (
    adminOnly &&
    (user?.role !== 'admin' || user?.email?.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase())
  ) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
