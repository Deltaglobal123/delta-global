import { useState } from 'react'
import { api, ApiError } from '../../lib/api'
import { formatDayLong, formatTime, formatWorked } from '../../lib/attendance'
import type { Attendance, AttendanceToday } from '../../lib/types'
import { AppSection } from '../app/AppSection'

/**
 * Today's attendance. Which button shows is read straight off the backend's
 * `can_check_in` / `can_check_out` flags — never inferred from the times — and
 * every attempt, good or refused, ends with a fresh read of today's state.
 */
export function AttendanceCard({
  today,
  loading,
  error,
  onChanged,
}: {
  today: AttendanceToday | null
  loading: boolean
  error: string | null
  /** Re-read today's state and the history after a check-in or check-out. */
  onChanged: () => Promise<void>
}) {
  const [busy, setBusy] = useState(false)
  const [alert, setAlert] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function mark(action: 'check-in' | 'check-out') {
    setBusy(true)
    setAlert(null)
    setNotice(null)
    try {
      const response = await api.post<{ data: Attendance; message: string }>(
        `/employee/attendance/${action}`,
      )
      setNotice(response.message)
    } catch (caught) {
      // A 422 here means the screen was stale — another tab, or left open
      // since yesterday. The message says which; the refresh below fixes it.
      setAlert(
        caught instanceof ApiError ? caught.message : 'Something went wrong. Please try again.',
      )
    } finally {
      await onChanged()
      setBusy(false)
    }
  }

  return (
    <AppSection
      title="Today"
      aside={today && <span className="app-muted">{formatDayLong(today.date)}</span>}
    >
      {(alert ?? error) && (
        <p className="form-alert" role="alert">
          {alert ?? error}
        </p>
      )}
      {notice && (
        <p className="form-success" role="status">
          {notice}
        </p>
      )}

      {!today ? (
        <p className="app-muted">{loading ? 'Loading…' : 'Could not load today’s attendance.'}</p>
      ) : today.can_check_in ? (
        <div className="attendance-state">
          <p>You have not checked in yet today.</p>
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy}
            onClick={() => mark('check-in')}
          >
            {busy && <span className="spinner spinner-sm" aria-hidden="true" />}
            {busy ? 'Checking in…' : 'Check in'}
          </button>
        </div>
      ) : today.can_check_out && today.data ? (
        <div className="attendance-state">
          <p>
            Checked in at <strong>{formatTime(today.data.check_in_at)}</strong>
          </p>
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy}
            onClick={() => mark('check-out')}
          >
            {busy && <span className="spinner spinner-sm" aria-hidden="true" />}
            {busy ? 'Checking out…' : 'Check out'}
          </button>
        </div>
      ) : today.data ? (
        <div className="attendance-state">
          <p>
            <strong>Done for today.</strong> {formatTime(today.data.check_in_at)} to{' '}
            {formatTime(today.data.check_out_at)} ({formatWorked(today.data.worked_minutes)})
          </p>
        </div>
      ) : (
        <p className="app-muted">Done for today.</p>
      )}
    </AppSection>
  )
}
