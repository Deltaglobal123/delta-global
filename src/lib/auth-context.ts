import { createContext, use } from 'react'
import type { User } from './types'

export type SignInResult =
  | { kind: 'customer'; user: User }
  /** Admin and manager accounts belong in the Blade panel, not this app. */
  | { kind: 'staff'; user: User }

export type AuthValue = {
  user: User | null
  /** True while a stored token is being traded back for the account on boot. */
  booting: boolean
  signIn: (email: string, password: string) => Promise<SignInResult>
  signUp: (fields: {
    name: string
    email: string
    mobile_number: string
    password: string
    password_confirmation: string
  }) => Promise<SignInResult>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthValue | null>(null)

export function useAuth(): AuthValue {
  const value = use(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>.')
  return value
}

/** Staff hold a role; customers come back with an empty permission list. */
export function isStaff(user: User): boolean {
  return user.roles.some((role) => role.name === 'admin' || role.name === 'manager')
}
