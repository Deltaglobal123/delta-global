import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../../lib/api'
import { useStatus } from '../../lib/status-context'
import { useList } from '../../lib/useList'
import { formatDate, paiseToInput, validateTradeAmount, MIN_TRADE_PAISE } from '../../lib/money'
import type { Trading as TradingRun, Wallet } from '../../lib/types'
import { AppPageHead } from '../../components/app/AppPageHead'
import { AppSection } from '../../components/app/AppSection'
import { Pager } from '../../components/app/Pager'
import { StatusPill } from '../../components/app/StatusPill'
import { ArrowIcon } from '../../icons'

export function Trading() {
  const { status, loading, refresh } = useStatus()
  const history = useList<TradingRun>('/trading')

  const [amount, setAmount] = useState('')
  const [amountError, setAmountError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [alert, setAlert] = useState<string | null>(null)
  const [sent, setSent] = useState<string | null>(null)

  const wallet = status?.wallet ?? null
  const available = wallet?.available_paise ?? 0
  const trade = status?.active_trade ?? null
  const canStart = Boolean(status?.can_start_trading && available >= MIN_TRADE_PAISE)

  function handleInitiate(event?: FormEvent) {
    if (event) event.preventDefault()
    setAlert(null)
    setSent(null)

    const err = validateTradeAmount(amount, available)
    if (err) {
      setAmountError(err)
      return
    }

    setAmountError(null)
    setConfirming(true)
  }

  async function start() {
    setAlert(null)
    setSent(null)

    const err = validateTradeAmount(amount, available)
    if (err) {
      setAmountError(err)
      setConfirming(false)
      return
    }

    setBusy(true)

    try {
      const response = await api.post<{
        data: TradingRun
        wallet: Wallet
        message: string
      }>('/trading/start', {
        amount: amount.trim(),
      })

      setSent(response.message)
      setAmount('')
      setConfirming(false)
      history.reload()
      refresh()
    } catch (caught) {
      if (caught instanceof ApiError) {
        setAlert(caught.message)
        if (caught.errors.amount) {
          setAmountError(caught.errors.amount[0])
        }
      } else {
        setAlert('Something went wrong. Please try again.')
      }
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
        lead="Enter your desired trade amount (minimum ₹499.00 up to your available balance). The money stays yours — it is held while the desk works and returns with the result."
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
            <div className="start-balance-row">
              <div>
                <span className="run-label">Available balance</span>
                <strong className="start-amount">
                  {wallet?.available ?? (loading ? '…' : '₹0.00')}
                </strong>
              </div>
            </div>

            {available < MIN_TRADE_PAISE ? (
              <div className="trade-insufficient">
                <p className="app-muted">
                  You need a minimum balance of <strong>₹499.00</strong> to start an AI trading run.
                </p>
                <div className="start-actions">
                  <Link className="btn btn-primary btn-lg" to="/app/deposit">
                    Add money
                    <ArrowIcon />
                  </Link>
                </div>
              </div>
            ) : confirming ? (
              <div className="start-confirm-box">
                <p className="start-confirm">
                  This commits <strong>₹{amount}</strong> to an AI trading run. The money is held while the desk trades and returns with the profit/loss upon settlement. Any remaining balance stays free.
                </p>
                <div className="start-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={start}
                    disabled={busy}
                  >
                    {busy ? 'Committing…' : `Yes, commit ₹${amount}`}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-lg"
                    onClick={() => setConfirming(false)}
                    disabled={busy}
                  >
                    Change amount
                  </button>
                </div>
              </div>
            ) : (
              <form className="trade-amount-form" onSubmit={handleInitiate} noValidate>
                <div className="field trade-amount-field">
                  <label htmlFor="trade_amount">Trade Amount (₹)</label>
                  <div className="amount-field">
                    <input
                      id="trade_amount"
                      inputMode="decimal"
                      placeholder="499"
                      value={amount}
                      aria-invalid={Boolean(amountError)}
                      onChange={(e) => {
                        setAmount(e.target.value)
                        setAmountError(null)
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setAmount('499')
                        setAmountError(null)
                      }}
                    >
                      Min ₹499
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setAmount(paiseToInput(available))
                        setAmountError(null)
                      }}
                    >
                      Max
                    </button>
                  </div>
                  {amountError ? (
                    <p className="field-error">{amountError}</p>
                  ) : (
                    <p className="field-hint">
                      Min: ₹499.00 · Max: {wallet?.available ?? '₹0.00'} · You can trade any amount in between.
                    </p>
                  )}
                </div>

                <div className="start-actions">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={!canStart || loading}
                  >
                    Start AI trading
                    <ArrowIcon />
                  </button>
                </div>
              </form>
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
