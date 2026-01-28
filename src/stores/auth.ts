import { create } from 'zustand'
import { apiGet, apiPost } from '@/utils/api'
import { toastService } from '@/lib/toast'

export type User = {
  id: string
  email: string
}

type AuthState = {
  user: User | null
  loading: boolean
  error: string | null
  hydrate: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
    return (err as { message: string }).message
  }
  if (err instanceof Error) return err.message
  return fallback
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  hydrate: async () => {
    set({ loading: true, error: null })
    try {
      const res = await apiGet<{ success: true; user: User }>('/api/auth/me')
      set({ user: res.user, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },
  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const res = await apiPost<{ success: true; user: User }>('/api/auth/login', { email, password })
      set({ user: res.user, loading: false })
      toastService.loginSuccess(res.user.email)
    } catch (e: unknown) {
      const errorMessage = getErrorMessage(e, 'Login failed')
      set({ error: errorMessage, loading: false })
      toastService.loginFailure(errorMessage)
      throw e
    }
  },
  register: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const res = await apiPost<{ success: true; user: User }>('/api/auth/register', { email, password })
      set({ user: res.user, loading: false })
      toastService.registerSuccess(res.user.email)
    } catch (e: unknown) {
      const errorMessage = getErrorMessage(e, 'Registration failed')
      set({ error: errorMessage, loading: false })
      toastService.registerFailure(errorMessage)
      throw e
    }
  },
  logout: async () => {
    set({ loading: true, error: null })
    try {
      await apiPost<{ success: true }>('/api/auth/logout')
      set({ user: null, loading: false })
      toastService.logoutSuccess()
    } catch {
      set({ user: null, loading: false })
    }
  },
}))
