import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  _id: string
  id?: string
  username: string
  email: string
  image?: string | null
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isDark: boolean
  _hasHydrated: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
  setHydrated: () => void
}

const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      accessToken: null,
      isDark: false,
      _hasHydrated: false,
      login: (token, user) =>
        set({
          accessToken: token,
          user
        }),
      logout: () =>
        set({
          user: null,
          accessToken: null
        }),
      setHydrated: () => set({ _hasHydrated: true })
    }),
    {
      name: 'auth-store',
      partialize: state => ({
        user: state.user,
        accessToken: state.accessToken
      }),
      onRehydrateStorage: () => state => {
        state?.setHydrated()
      }
    }
  )
)

export default useAuthStore
