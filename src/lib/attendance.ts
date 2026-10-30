/**
 * Attendance mixes two kinds of value: `date` is a plain India calendar date,
 * the timestamps are UTC instants. Keeping their formatters side by side makes
 * it hard to run the wrong one through the wrong conversion.
 */

const TIME = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' })

/** A UTC instant as the employee's local clock time: `9:00 am`. */
export function formatTime(iso: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '—' : TIME.format(date)
}

/** Whole minutes as `8h 30m`. */
export function formatWorked(minutes: number | null): string {
  if (minutes === null) return '—'
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

const DAY_LONG = new Intl.DateTimeFormat('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})

const DAY_SHORT = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

/**
 * `2026-10-30` is already the right day. Pinning it to UTC midnight and
 * formatting in UTC means no device timezone can nudge it to the 29th.
 */
function calendarDay(ymd: string): Date | null {
  const [y, m, d] = ymd.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(Date.UTC(y, m - 1, d))
}

/** `Thursday, 30 October` — for the heading over today's card. */
export function formatDayLong(ymd: string): string {
  const day = calendarDay(ymd)
  return day ? DAY_LONG.format(day) : ymd
}

/** `Thu, 30 Oct 2026` — for history rows. */
export function formatDayShort(ymd: string): string {
  const day = calendarDay(ymd)
  return day ? DAY_SHORT.format(day) : ymd
}

const ISSUED = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/** A UTC instant as a local calendar date: `28 Oct 2026`. */
export function formatIssued(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '—' : ISSUED.format(date)
}
