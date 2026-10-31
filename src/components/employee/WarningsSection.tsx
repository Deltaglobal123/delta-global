import { useState } from 'react'
import { formatIssued } from '../../lib/attendance'
import type { PerformanceWarningsEnvelope } from '../../lib/types'
import { AppSection } from '../app/AppSection'

/** How many of the latest warnings show before "Show all". */
const COLLAPSED = 3

/**
 * Warnings an admin has issued, read-only. There is no limit on how many, so
 * only the latest few show until the employee asks for the rest. Numbered by
 * position, not id: an admin can remove one issued by mistake, so ids have
 * gaps and the count can drop.
 */
export function WarningsSection({
  warnings,
  loading,
  error,
}: {
  warnings: PerformanceWarningsEnvelope | null
  loading: boolean
  error: string | null
}) {
  const [expanded, setExpanded] = useState(false)

  const list = warnings?.data ?? []
  const count = warnings?.meta.count ?? list.length
  // Oldest first from the API, so the latest few are the tail. Their numbers
  // still come from their position in the whole list.
  const hidden = expanded ? 0 : Math.max(0, list.length - COLLAPSED)
  const shown = list.slice(hidden)

  return (
    <AppSection
      title="Performance warnings"
      aside={
        warnings && (
          <span className={`pill ${count > 0 ? 'pill-pending' : 'pill-good'}`}>{count}</span>
        )
      }
    >
      {error && (
        <p className="form-alert" role="alert">
          {error}
        </p>
      )}
      {!warnings ? (
        loading && <p className="app-muted">Loading…</p>
      ) : list.length === 0 ? (
        <p className="app-muted">No performance warnings.</p>
      ) : (
        <>
          {hidden > 0 && (
            <p className="app-muted">
              Showing the latest {shown.length} of {list.length}.
            </p>
          )}
          <ol className={`warning-list${expanded ? ' is-expanded' : ''}`}>
            {shown.map((warning, offset) => (
              <li key={warning.id} className="warning-item">
                <h3>Performance warning {hidden + offset + 1}</h3>
                <p className="warning-reason">{warning.reason}</p>
                <small className="app-muted">Issued {formatIssued(warning.issued_at)}</small>
              </li>
            ))}
          </ol>
          {list.length > COLLAPSED && (
            <button
              type="button"
              className="btn btn-ghost btn-sm warning-toggle"
              onClick={() => setExpanded((open) => !open)}
            >
              {expanded ? 'Show latest only' : `Show all ${list.length}`}
            </button>
          )}
        </>
      )}
    </AppSection>
  )
}
