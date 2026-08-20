import { useCallback, useEffect, useState } from 'react'
import { api } from './api'
import type { Paginated } from './types'

/**
 * The three history screens are the same paginated list with different rows, so
 * the fetching, paging and reload-after-submit live here once.
 */
export function useList<T>(path: string) {
  const [page, setPage] = useState(1)
  const [payload, setPayload] = useState<Paginated<T> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Bumped by reload() to re-run the effect without changing the page.
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)

    api
      .get<Paginated<T>>(`${path}?page=${page}`, controller.signal)
      .then((response) => {
        setPayload(response)
        setError(null)
      })
      .catch((caught: Error) => {
        if (caught.name === 'AbortError') return
        setError(caught.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [path, page, nonce])

  const reload = useCallback(() => {
    // A new submission is always on page one, so go back there and refetch.
    setPage(1)
    setNonce((n) => n + 1)
  }, [])

  return {
    items: payload?.data ?? [],
    meta: payload?.meta ?? null,
    page,
    setPage,
    loading,
    error,
    reload,
  }
}
