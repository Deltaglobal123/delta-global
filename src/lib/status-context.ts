import { createContext, use } from 'react'
import type { Status } from './types'

export type StatusValue = {
  status: Status | null
  /** True only for the very first load, so cards can skeleton once. */
  loading: boolean
  error: string | null
  /** Pull a fresh snapshot now — call it after any action that moves money. */
  refresh: () => Promise<void>
}

export const StatusContext = createContext<StatusValue | null>(null)

export function useStatus(): StatusValue {
  const value = use(StatusContext)
  if (!value) throw new Error('useStatus must be used inside <StatusProvider>.')
  return value
}
