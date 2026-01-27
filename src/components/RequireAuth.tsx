import { useEffect } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, hydrate } = useAuthStore()
  const loc = useLocation()

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  }
  return <>{children}</>
}

