import type { AuthEnvelope } from './types'

const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost/api').replace(
  /\/+$/,
  '',
)

const TOKEN_KEY = 'dg.token'

/**
 * A backend that stalls — a database that is down, a stopped dev server — would
 * otherwise leave fetch pending forever and the submit button spinning with no
 * explanation. Every request gets a ceiling so a stall becomes a real error.
 */
const TIMEOUT_MS = 20000

/** Anything the API answered with that was not a 2xx. */
export class ApiError extends Error {
  status: number
  errors: Record<string, string[]>

  constructor(
    status: number,
    message: string,
    errors: Record<string, string[]> = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }

  /** The first message the API gave for a field, if it gave one. */
  fieldError(field: string): string | undefined {
    return this.errors[field]?.[0]
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* private mode — the session just won't survive a reload */
  }
}

/**
 * Fires when a request comes back unauthorised and the token could not be
 * refreshed. The auth provider listens so it can drop the session and bounce
 * the customer to the login screen from anywhere.
 */
type Listener = () => void
const expiryListeners = new Set<Listener>()

export function onSessionExpired(fn: Listener) {
  expiryListeners.add(fn)
  return () => {
    expiryListeners.delete(fn)
  }
}

function announceExpiry() {
  setToken(null)
  for (const fn of expiryListeners) fn()
}

type Options = {
  method?: string
  /** Plain object is sent as JSON; a FormData is sent as-is for file uploads. */
  body?: unknown
  /** Skip the bearer header — used by login and register. */
  auth?: boolean
  signal?: AbortSignal
}

async function parse(response: Response): Promise<unknown> {
  if (response.status === 204) return null
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function send(path: string, options: Options): Promise<Response> {
  const { method = 'GET', body, auth = true, signal } = options

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let payload: BodyInit | undefined
  if (body instanceof FormData) {
    // Let the browser set the multipart boundary itself.
    payload = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  const controller = new AbortController()
  const timer = setTimeout(
    () => controller.abort(new DOMException('Request timed out', 'TimeoutError')),
    TIMEOUT_MS,
  )

  // The caller's own signal (unmount, route change) still has to get through.
  const forward = () => controller.abort(signal?.reason)
  signal?.addEventListener('abort', forward, { once: true })

  try {
    return await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: payload,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', forward)
  }
}

/**
 * What to say when a rate limit trips. The API's own wording is "Too Many
 * Attempts.", which tells the customer nothing about when to come back, so the
 * wait from `Retry-After` is spelled out instead.
 *
 * The header only reaches us because the API lists it in `exposed_headers` —
 * it is not CORS-safelisted. If that is ever removed this reads as null and
 * falls back to the vaguer sentence rather than breaking.
 */
function retryMessage(response: Response): string {
  const seconds = Number(response.headers.get('Retry-After'))

  if (!Number.isFinite(seconds) || seconds <= 0)
    return 'Too many attempts. Please wait a moment and try again.'

  if (seconds < 60)
    return `Too many attempts. Please try again in ${Math.ceil(seconds)} seconds.`

  const minutes = Math.ceil(seconds / 60)
  return `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`
}

/** Turns a fetch rejection into the ApiError the UI knows how to show. */
function asApiError(error: unknown, signal?: AbortSignal): Error {
  // A caller-initiated abort is not a failure — let it propagate untouched.
  if (signal?.aborted) return error as Error
  if ((error as Error)?.name === 'TimeoutError')
    return new ApiError(
      0,
      'The server took too long to respond. Please try again in a moment.',
    )
  return new ApiError(0, 'Could not reach the server. Check your connection.')
}

/**
 * A 401 usually means the hour-long token lapsed, and /auth/refresh accepts a
 * recently-expired one — so trade it for a fresh token and replay the request
 * rather than throwing the customer back to the login screen. Only one refresh
 * runs at a time; parallel callers await the same promise.
 */
let refreshing: Promise<string | null> | null = null

function refreshToken(): Promise<string | null> {
  refreshing ??= (async () => {
    try {
      const response = await send('/auth/refresh', { method: 'POST' })
      if (!response.ok) return null
      const envelope = (await parse(response)) as AuthEnvelope | null
      if (!envelope?.token) return null
      setToken(envelope.token)
      return envelope.token
    } catch {
      return null
    } finally {
      // Cleared on the next tick so callers queued behind this one still see it.
      queueMicrotask(() => {
        refreshing = null
      })
    }
  })()

  return refreshing
}

export async function request<T>(path: string, options: Options = {}): Promise<T> {
  let response: Response
  try {
    response = await send(path, options)
  } catch (error) {
    throw asApiError(error, options.signal)
  }

  // Refresh-and-replay, once, for guarded calls that still had a token.
  if (response.status === 401 && options.auth !== false && getToken()) {
    const fresh = await refreshToken()
    if (fresh) {
      try {
        response = await send(path, options)
      } catch (error) {
        throw asApiError(error, options.signal)
      }
    } else {
      announceExpiry()
    }
  }

  const payload = (await parse(response)) as
    | { message?: string; errors?: Record<string, string[]> }
    | null

  if (!response.ok) {
    if (response.status === 401 && options.auth !== false) announceExpiry()
    throw new ApiError(
      response.status,
      response.status === 429
        ? retryMessage(response)
        : (payload?.message ?? 'Something went wrong. Please try again.'),
      payload?.errors ?? {},
    )
  }

  return payload as T
}

export const api = {
  get: <T,>(path: string, signal?: AbortSignal) =>
    request<T>(path, { signal }),
  post: <T,>(path: string, body?: unknown, options: Omit<Options, 'body' | 'method'> = {}) =>
    request<T>(path, { ...options, method: 'POST', body }),
}
