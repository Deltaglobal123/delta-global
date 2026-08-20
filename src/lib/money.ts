/**
 * Money is integer paise everywhere. 100 paise = ₹1. Nothing here ever turns an
 * amount into a float — `0.1 + 0.2` is the exact bug the paise contract exists
 * to prevent — so rupee strings are assembled from integer division instead.
 */

const RUPEES = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Renders paise the same way the API's display twin does: `₹5,000.00`. */
export function formatPaise(paise: number): string {
  const sign = paise < 0 ? '-' : ''
  const abs = Math.abs(Math.trunc(paise))
  // Divide only at the last moment, and only for the formatter's benefit.
  return sign + RUPEES.format(abs / 100)
}

/** Paise as the plain rupee string the API accepts in a request body. */
export function paiseToInput(paise: number): string {
  const abs = Math.abs(Math.trunc(paise))
  return `${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`
}

/** The shape the API validates request amounts against. */
export const AMOUNT_RE = /^\d{1,9}(\.\d{1,2})?$/

/** Rupee string to paise, for local ceiling checks before we hit the API. */
export function inputToPaise(value: string): number | null {
  const trimmed = value.trim()
  if (!AMOUNT_RE.test(trimmed)) return null
  const [whole, fraction = ''] = trimmed.split('.')
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
}

/**
 * The client-side half of the amount rules. The API validates the same things —
 * this only exists so the customer sees the problem before a round trip.
 */
export function validateAmount(value: string, ceilingPaise?: number): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return 'Enter an amount.'
  if (!AMOUNT_RE.test(trimmed))
    return 'Use digits only, up to two decimals — no commas or symbols.'

  const paise = inputToPaise(trimmed)
  if (paise === null || paise <= 0) return 'Enter an amount greater than zero.'
  if (ceilingPaise !== undefined && paise > ceilingPaise)
    return `You can withdraw up to ${formatPaise(ceilingPaise)} right now.`

  return undefined
}

const DATE = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '—' : DATE.format(date)
}
