import { formatIssued } from '../../lib/attendance'
import type { PerformanceWarningsEnvelope } from '../../lib/types'
import { AppSection } from '../app/AppSection'

/**
 * Warnings an admin has issued, read-only. Numbered by position, not id: an
 * admin can remove one issued by mistake, so ids have gaps and the count can
 * drop. The limit comes from `meta.max` rather than a hard-coded 3.
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
  const count = warnings?.meta.count ?? 0
  const max = warnings?.meta.max ?? 0
  const atLimit = max > 0 && count >= max

  return (
    <AppSection
      title="Performance warnings"
      aside={
        warnings && (
          <span className={`pill ${atLimit ? 'pill-bad' : count > 0 ? 'pill-pending' : 'pill-good'}`}>
            {count} of {max}
          </span>
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
      ) : warnings.data.length === 0 ? (
        <p className="app-muted">No performance warnings.</p>
      ) : (
        <>
          {atLimit && (
            <p className="form-alert" role="alert">
              You have reached the maximum of {max} performance warnings.
            </p>
          )}
          <ol className="warning-list">
            {warnings.data.map((warning, index) => (
              <li key={warning.id} className="warning-item">
                <h3>Performance warning {index + 1}</h3>
                <p className="warning-reason">{warning.reason}</p>
                <small className="app-muted">Issued {formatIssued(warning.issued_at)}</small>
              </li>
            ))}
          </ol>
        </>
      )}
    </AppSection>
  )
}
