/**
 * How many incentives an admin has given. A count only — no amount, reason or
 * list behind it — so the tile is not tappable. The count can go down as well
 * as up (an admin can take one off), so it always shows what the API returned.
 */
export function IncentivesTile({
  count,
  loading,
  error,
  onRetry,
}: {
  count: number | null
  loading: boolean
  error: string | null
  onRetry: () => void
}) {
  const positive = count !== null && count > 0

  return (
    <div className={`wallet-card incentives-tile${positive ? ' wallet-accent' : ''}`}>
      <span className="wallet-label">Incentives</span>

      {count === null && error ? (
        // A failure here must not get in the way of attendance or warnings.
        <div className="incentives-failed">
          <strong className="wallet-value">—</strong>
          <button type="button" className="text-link" onClick={onRetry} disabled={loading}>
            {loading ? 'Retrying…' : 'Retry'}
          </button>
        </div>
      ) : count === null ? (
        <strong className="wallet-value">
          <span className="skeleton" aria-hidden="true" />
          <span className="sr-only">Loading</span>
        </strong>
      ) : (
        <strong className="wallet-value">{count}</strong>
      )}

      <span className="wallet-note">
        {count === 0 ? 'No incentives yet' : 'Given by the admin team'}
      </span>
    </div>
  )
}
