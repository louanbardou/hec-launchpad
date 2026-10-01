import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from './api'
import type { Profile, User } from './types'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthState>({ user: null, profile: null, loading: true, refreshProfile: async () => {}, signOut: async () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (!user) { setProfile(null); return }
    setProfile(await api.getProfile(user.id))
  }, [user])

  useEffect(() => {
    let alive = true
    api.getUser().then((u) => { if (alive) { setUser(u); setLoading(false) } })
    const off = api.onAuthChange((u) => { if (alive) { setUser(u); setLoading(false) } })
    return () => { alive = false; off() }
  }, [])

  useEffect(() => { void refreshProfile() }, [refreshProfile])

  // Nettoie ?code=... laissé par le lien magique Supabase.
  useEffect(() => {
    if (user && window.location.search.includes('code=')) {
      window.history.replaceState({}, '', window.location.pathname + window.location.hash)
    }
  }, [user])

  const signOut = useCallback(async () => { await api.signOut(); setUser(null); setProfile(null) }, [])

  return <Ctx.Provider value={{ user, profile, loading, refreshProfile, signOut }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
