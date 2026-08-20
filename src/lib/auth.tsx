import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, getToken, onSessionExpired, setToken } from './api'
import { AuthContext, isStaff, type AuthValue, type SignInResult } from './auth-context'
import type { AuthEnvelope, User } from './types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [booting, setBooting] = useState(() => Boolean(getToken()))

  // Rehydrate the session from a stored token on app boot.
  useEffect(() => {
    if (!getToken()) {
      setBooting(false)
      return
    }

    let live = true
    api
      .get<{ data: User }>('/auth/me')
      .then((response) => {
        if (live) setUser(response.data)
      })
      .catch(() => {
        setToken(null)
        if (live) setUser(null)
      })
      .finally(() => {
        if (live) setBooting(false)
      })

    return () => {
      live = false
    }
  }, [])

  // A token that could not be refreshed drops the session wherever we are.
  useEffect(() => onSessionExpired(() => setUser(null)), [])

  const adopt = useCallback((envelope: AuthEnvelope): SignInResult => {
    if (isStaff(envelope.data)) {
      // Never hold a staff session in the customer app — hand it straight back
      // so the caller can bounce them to the panel.
      setToken(null)
      setUser(null)
      return { kind: 'staff', user: envelope.data }
    }

    setToken(envelope.token)
    setUser(envelope.data)
    return { kind: 'customer', user: envelope.data }
  }, [])

  const signIn = useCallback(
    async (email: string, password: string) =>
      adopt(await api.post<AuthEnvelope>('/auth/login', { email, password }, { auth: false })),
    [adopt],
  )

  const signUp = useCallback(
    async (fields: Parameters<AuthValue['signUp']>[0]) =>
      adopt(await api.post<AuthEnvelope>('/auth/register', fields, { auth: false })),
    [adopt],
  )

  const signOut = useCallback(async () => {
    try {
      // Blacklists the token server-side; a failure here still logs us out.
      await api.post('/auth/logout')
    } catch {
      /* the local session goes either way */
    }
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, booting, signIn, signUp, signOut }),
    [user, booting, signIn, signUp, signOut],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
