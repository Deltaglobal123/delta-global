import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../../lib/api'
import { useStatus } from '../../lib/status-context'
import { paiseToInput, MIN_TRADE_PAISE } from '../../lib/money'
import type { Trading as TradingRun, Wallet } from '../../lib/types'
import { AppPageHead } from '../../components/app/AppPageHead'
import { AppSection } from '../../components/app/AppSection'
import { StatusPill } from '../../components/app/StatusPill'
import { TradingQuizModal } from '../../components/app/TradingQuizModal'
import { ArrowIcon } from '../../icons'

/**
 * Where the "Start project" button lands. It shows what is in the wallet and
 * offers the only two moves that matter — put money in, or commit what is
 * already there. Committing runs the full question set first, then posts the
 * whole available balance as one run.
 */
export function StartProject() {
  const { status, loading, refresh } = useStatus()

  const [quizOpen, setQuizOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [alert, setAlert] = useState<string | null>(null)
  const [sent, setSent] = useState<string | null>(null)

  const wallet = status?.wallet ?? null
  const available = wallet?.available_paise ?? 0
  const trade = status?.active_trade ?? null

  const belowMinimum = available < MIN_TRADE_PAISE
  const blockedByRun = Boolean(trade) || status?.can_start_trading === false

  function onStart() {
    setSent(null)

    // An empty wallet is the common case here, so it is answered in place
    // rather than by sending the customer to a page that says the same thing.
    if (belowMinimum) {
      setAlert(
        available <= 0
          ? 'Your wallet is empty. Add money before starting an AI trading run.'
          : `You need at least ₹499.00 available to start a run — you have ${wallet?.available ?? '₹0.00'}. Add money to continue.`,
      )
      return
    }

    if (blockedByRun) {
      setAlert('A trading run is already open. It has to settle before you can start another.')
      return
    }

    setAlert(null)
    setQuizOpen(true)
  }

  /** Called once the last question has been answered. */
  async function commit() {
    setBusy(true)
    setAlert(null)

    try {
      const response = await api.post<{
        data: TradingRun
        wallet: Wallet
        message: string
      }>('/trading/start', {
        // The whole available balance goes in — the amount is not chosen here.
        amount: paiseToInput(available),
      })

      setSent(response.message)
      setQuizOpen(false)
      refresh()
    } catch (caught) {
      setAlert(
        caught instanceof ApiError
          ? caught.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-page">
      <AppPageHead
        eyebrow="Start project"
        title="Put your balance to work"
        lead="Add money to your wallet, or commit what is already available to an AI trading run."
      />

      {sent && (
        <p className="form-success" role="status">
          {sent}
        </p>
      )}
      {!quizOpen && alert && (
        <p className="form-alert" role="alert">
          {alert}
        </p>
      )}

      <AppSection title="Your wallet">
        <div className="start-card">
          <div className="start-balance">
            <span className="run-label">Total balance</span>
            <strong className="start-amount">
              {wallet?.balance ?? (loading ? '…' : '₹0.00')}
            </strong>
            <p className="app-muted">
              {wallet?.available ?? '₹0.00'} available to trade
              {wallet && wallet.locked_paise > 0
                ? ` · ${wallet.locked} held against an open request`
                : ''}
            </p>
          </div>

          {trade && (
            <div className="run-head">
              <div>
                <span className="run-label">Run in progress</span>
                <strong className="run-amount">{trade.amount}</strong>
              </div>
              <StatusPill status={trade.status} label={trade.status_label} />
            </div>
          )}

          <div className="start-actions">
            <Link className="btn btn-ghost btn-lg" to="/app/deposit">
              Add money
              <ArrowIcon />
            </Link>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={onStart}
              disabled={loading || busy}
            >
              Start AI trading
              <ArrowIcon />
            </button>
          </div>

          <p className="app-muted start-note">
            Starting commits your full available balance to one run, after a
            short set of questions. A minimum of ₹499.00 is required.
          </p>
        </div>
      </AppSection>

      {quizOpen && (
        <TradingQuizModal
          amountLabel={wallet?.available ?? '₹0.00'}
          busy={busy}
          alert={alert}
          onCancel={() => {
            setQuizOpen(false)
            setAlert(null)
          }}
          onComplete={() => void commit()}
        />
      )}
    </div>
  )
}
