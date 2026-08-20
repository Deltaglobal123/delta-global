import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../../lib/api'
import { useStatus } from '../../lib/status-context'
import { useList } from '../../lib/useList'
import { formatDate } from '../../lib/money'
import type { Trading as TradingRun, Wallet } from '../../lib/types'
import { AppPageHead } from '../../components/app/AppPageHead'
import { AppSection } from '../../components/app/AppSection'
import { Pager } from '../../components/app/Pager'
import { StatusPill } from '../../components/app/StatusPill'
import { ArrowIcon } from '../../icons'

export function Trading() {
  const { status, loading, refresh } = useStatus()
  const history = useList<TradingRun>('/trading')

  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [alert, setAlert] = useState<string | null>(null)
  const [sent, setSent] = useState<string | null>(null)

  const wallet = status?.wallet ?? null
  const trade = status?.active_trade ?? null
  const canStart = status?.can_start_trading ?? false

  async function start() {
    setAlert(null)
    setSent(null)
    setBusy(true)

    try {
      // No body: pressing the button commits the whole available balance, and
      // the response echoes back exactly what was taken.
      const response = await api.post<{
        data: TradingRun
        wallet: Wallet
        message: string
      }>('/trading/start')

      setSent(response.message)
      setConfirming(false)
      history.reload()
      refresh()
    } catch (caught) {
      setAlert(
        caught instanceof ApiError
          ? caught.message
          : 'Something went wrong. Please try again.',
      )
      setConfirming(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-page">
      <AppPageHead
        eyebrow="AI trading"
        title="Start a trading run"
        lead="Starting a run commits your entire available balance. The money stays yours — it is just held while the desk works, and comes back with the result."
      />

      {sent && (
        <p className="form-success" role="status">
          {sent}
        </p>
      )}
      {alert && (
        <p className="form-alert" role="alert">
          {alert}
        </p>
      )}

      <AppSection title={trade ? 'Run in progress' : 'Ready to trade'}>
        {trade ? (
          <div className="run-card">
            <div className="run-head">
              <div>
                <span className="run-label">Committed to this run</span>
                <strong className="run-amount">{trade.amount}</strong>
              </div>
              <StatusPill status={trade.status} label={trade.status_label} />
            </div>

            <div className="waiting-banner" role="status">
              <span className="spinner" aria-hidden="true" />
              <div>
                <strong>
                  {trade.status === 'pending'
                    ? 'Waiting for the desk to pick this up'
                    : 'Your run is live'}
                </strong>
                <p>
                  This page updates itself. Your stake returns to your wallet
                  with the result as soon as the run settles.
                </p>
              </div>
            </div>

            <dl className="detail-grid">
              <div>
                <dt>Run</dt>
                <dd>#{trade.id}</dd>
              </div>
              <div>
                <dt>Requested</dt>
                <dd>{formatDate(trade.created_at)}</dd>
              </div>
              <div>
                <dt>Started</dt>
                <dd>{formatDate(trade.started_at)}</dd>
              </div>
            </dl>

            <p className="app-muted">
              Only one run can be open at a time, and withdrawals are on hold
              until it settles. Money you deposit meanwhile stays spendable.
            </p>
          </div>
        ) : (
          <div className="start-card">
            <span className="run-label">Available to commit</span>
            <strong className="start-amount">
              {wallet?.available ?? (loading ? '…' : '₹0.00')}
            </strong>

            {confirming ? (
              <>
                <p className="start-confirm">
                  This commits <strong>{wallet?.available}</strong> — your whole
                  available balance — to one trading run. You cannot withdraw
                  until it settles.
                </p>
                <div className="start-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={start}
                    disabled={busy}
                  >
                    {busy ? 'Committing…' : `Yes, commit ${wallet?.available}`}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-lg"
                    onClick={() => setConfirming(false)}
                    disabled={busy}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="app-muted">
                  {canStart
                    ? 'The whole amount above goes into the run. There is no partial stake.'
                    : 'You need money in your wallet before a run can start.'}
                </p>
                <div className="start-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={() => setConfirming(true)}
                    disabled={!canStart || loading}
                  >
                    Start AI trading
                    <ArrowIcon />
                  </button>
                  {!canStart && (
                    <Link className="btn btn-ghost btn-lg" to="/app/deposit">
                      Add money
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </AppSection>

      <AppSection title="Your runs">
        {history.error && (
          <p className="form-alert" role="alert">
            {history.error}
          </p>
        )}
        {history.loading && history.items.length === 0 ? (
          <p className="app-muted">Loading…</p>
        ) : history.items.length === 0 ? (
          <p className="app-muted">You have not started a trading run yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="app-table">
              <thead>
                <tr>
                  <th scope="col">Started</th>
                  <th scope="col">Committed</th>
                  <th scope="col">Result</th>
                  <th scope="col">Returned</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.items.map((run) => (
                  <tr key={run.id}>
                    <td>{formatDate(run.created_at)}</td>
                    <td>{run.amount}</td>
                    {/* Profit is signed once settled — negative is a loss. */}
                    <td
                      className={
                        run.profit_paise == null
                          ? undefined
                          : run.profit_paise < 0
                            ? 'num-down'
                            : 'num-up'
                      }
                    >
                      {run.profit ?? '—'}
                    </td>
                    <td className="num-strong">{run.returned ?? '—'}</td>
                    <td>
                      <StatusPill status={run.status} label={run.status_label} />
                      {run.admin_note && (
                        <p className="row-note">{run.admin_note}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager meta={history.meta} page={history.page} onPage={history.setPage} />
      </AppSection>
    </div>
  )
}
