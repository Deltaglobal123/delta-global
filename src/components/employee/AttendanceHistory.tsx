import { formatDayShort, formatTime, formatWorked } from '../../lib/attendance'
import type { Attendance, Paginated } from '../../lib/types'
import { AppSection } from '../app/AppSection'
import { Pager } from '../app/Pager'

/**
 * Past days, newest first. Days without a check-in have no record at all and
 * are simply absent — the backend does not know which days were working days,
 * so nothing is shown as "absent".
 */
export function AttendanceHistory({
  items,
  meta,
  page,
  onPage,
  loading,
  error,
  todayDate,
}: {
  items: Attendance[]
  meta: Paginated<Attendance>['meta'] | null
  page: number
  onPage: (page: number) => void
  loading: boolean
  error: string | null
  /** Today's India date, so an open record today reads "Checked in", not "No check-out". */
  todayDate: string | null
}) {
  return (
    <AppSection title="Attendance history">
      {error && (
        <p className="form-alert" role="alert">
          {error}
        </p>
      )}
      {loading && items.length === 0 ? (
        <p className="app-muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="app-muted">No attendance recorded yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Check in</th>
                <th scope="col">Check out</th>
                <th scope="col">Worked</th>
              </tr>
            </thead>
            <tbody>
              {items.map((day) => {
                const open = day.status === 'checked_in'
                // A past day still open is a forgotten check-out; it stays that way.
                const forgotten = open && day.date !== todayDate

                return (
                  <tr key={day.id}>
                    <td className="num-strong">{formatDayShort(day.date)}</td>
                    <td>{formatTime(day.check_in_at)}</td>
                    <td>
                      {forgotten ? (
                        <span className="pill pill-bad">No check-out</span>
                      ) : open ? (
                        <span className="pill pill-running">
                          <span className="pill-dot" aria-hidden="true" />
                          Checked in
                        </span>
                      ) : (
                        formatTime(day.check_out_at)
                      )}
                    </td>
                    <td>{formatWorked(day.worked_minutes)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <Pager meta={meta} page={page} onPage={onPage} />
    </AppSection>
  )
}
