import { createContext, useContext } from 'react'

// The onrol.in community portal (Supabase-backed auth) has been retired as
// part of the Supabase → self-hosted migration. This provider is now a
// Supabase-free no-op so the app tree still compiles and any stray consumer
// resolves to a signed-out state. Community stats + survey forms now use the
// public onrol_tools endpoints directly; no client auth session is needed.

interface MinimalUser { id: string; email?: string }
interface MinimalSession { access_token: string; user: MinimalUser }

interface AuthContextType {
  session: MinimalSession | null
  user: MinimalUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: false,
  signOut: async () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthContext.Provider value={{ session: null, user: null, loading: false, signOut: async () => {} }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
