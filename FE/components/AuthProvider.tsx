'use client'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loginUser, registerUser, getCurrentUser, setAuthToken } from '../lib/api'
import { AuthResponse, UserSummary } from '../lib/types'

type AuthContextValue = {
  user: UserSummary | null
  token: string | null
  initializing: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)
const STORAGE_KEY = 'uma_store_auth_v1'

type PersistedAuth = {
  token: string
  user: UserSummary
}

function readStoredAuth(): PersistedAuth | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as PersistedAuth
    if (!parsed.token || !parsed.user) return null
    return parsed
  } catch {
    return null
  }
}

function writeStoredAuth(data: PersistedAuth | null) {
  if (typeof window === 'undefined') return
  if (!data) {
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function mapAuthResponse(payload: AuthResponse): PersistedAuth {
  return { token: payload.token, user: payload.user }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    let cancelled = false

    async function bootstrap() {
      const stored = readStoredAuth()
      if (!stored) {
        setInitializing(false)
        return
      }

      setAuthToken(stored.token)
      setToken(stored.token)
      setUser(stored.user)

      try {
        const me = await getCurrentUser(stored.token)
        if (!cancelled) {
          setUser(me)
          writeStoredAuth({ token: stored.token, user: me })
        }
      } catch (err) {
        if (!cancelled) {
          clearAuthState()
        }
      } finally {
        if (!cancelled) setInitializing(false)
      }
    }

    function clearAuthState() {
      setAuthToken(null)
      setToken(null)
      setUser(null)
      writeStoredAuth(null)
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  const persist = React.useCallback((payload: PersistedAuth) => {
    setAuthToken(payload.token)
    setToken(payload.token)
    setUser(payload.user)
    writeStoredAuth(payload)
  }, [])

  const clear = React.useCallback(() => {
    setAuthToken(null)
    setToken(null)
    setUser(null)
    writeStoredAuth(null)
  }, [])

  const login = React.useCallback(async (email: string, password: string) => {
    const res = await loginUser({ email, password })
    persist(mapAuthResponse(res))
  }, [persist])

  const register = React.useCallback(async (email: string, password: string) => {
    const res = await registerUser({ email, password })
    persist(mapAuthResponse(res))
  }, [persist])

  const refresh = React.useCallback(async () => {
    if (!token) throw new Error('Not authenticated')
    const me = await getCurrentUser(token)
    persist({ token, user: me })
  }, [persist, token])

  const logout = React.useCallback(() => {
    clear()
  }, [clear])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    initializing,
    login,
    register,
    logout,
    refresh
  }), [initializing, login, logout, refresh, register, token, user])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
