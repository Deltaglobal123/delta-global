import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { api } from './api'
import { StatusContext } from './status-context'
import type { Status } from './types'

/**
 * Every money flow ends with an admin pressing a button, so the app is always
 * waiting on a human. `/status` returns the wallet plus everything outstanding
 * in one call, which is why this polls that single endpoint rather than four.
 */
const POLL_WAITING = 6000
const POLL_IDLE = 20000

export function StatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Held in a ref so the polling effect does not restart on every snapshot.
  const waitingRef = useRef(false)

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await api.get<{ data: Status }>('/status', signal)
      if (signal?.aborted) return
      setStatus(response.data)
      waitingRef.current = response.data.is_waiting
      setError(null)
    } catch (caught) {
      if (signal?.aborted || (caught as Error)?.name === 'AbortError') return
      setError((caught as Error).message)
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  const refresh = useCallback(() => load(), [load])

  useEffect(() => {
    const controller = new AbortController()
    let timer: number | undefined

    const tick = async () => {
      // Polling a background tab burns the customer's battery for nothing.
      if (document.visibilityState === 'visible') {
        await load(controller.signal)
      }
      if (controller.signal.aborted) return
      timer = window.setTimeout(
        tick,
        waitingRef.current ? POLL_WAITING : POLL_IDLE,
      )
    }

    tick()

    // Coming back to the tab should show current numbers immediately.
    const onVisible = () => {
      if (document.visibilityState === 'visible') load(controller.signal)
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      controller.abort()
      if (timer) clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [load])

  const value = useMemo(
    () => ({ status, loading, error, refresh }),
    [status, loading, error, refresh],
  )

  return <StatusContext value={value}>{children}</StatusContext>
}
