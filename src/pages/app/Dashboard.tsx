import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth-context'
import { useStatus } from '../../lib/status-context'
import { formatDate, formatPaise } from '../../lib/money'
import { AppPageHead } from '../../components/app/AppPageHead'
import { AppSection } from '../../components/app/AppSection'
import { EmptyState } from '../../components/app/EmptyState'
import { StatusPill } from '../../components/app/StatusPill'
import { WalletSummary } from '../../components/app/WalletSummary'
import { ArrowIcon } from '../../icons'
import { ClockIcon } from '../../components/app/app-icons'

/** "1 payout" / "2 payouts" — the banner reads as a sentence either way. */
function plural(count: number, noun: string) {
  return count === 1 ? `1 ${noun}` : `${count} ${noun}s`
}

/** Totals a list of requests back into a formatted amount. */
function sum(items: { amount_paise: number }[]) {
  return formatPaise(items.reduce((total, item) => total + item.amount_paise, 0))
}

export function Dashboard() {
  const { user } = useAuth()
  const { status, loading, error } = useStatus()

  const wallet = status?.wallet ?? null
  const trade = status?.active_trade ?? null
  const deposits = status?.pending_deposits ?? []
  const withdrawals = status?.pending_withdrawals ?? []

  /**
   * Name what the desk is holding. A banner that only says "something of yours"
   * leaves the customer hunting down the page for the row it means.
   */
  const waitingFor = [
    deposits.length > 0 &&
      `${plural(deposits.length, 'deposit')} of ${sum(deposits)} awaiting verification.`,
    trade && `Your trading run of ${trade.amount} is with the desk.`,
    withdrawals.length > 0 &&
      `${plural(withdrawals.length, 'payout')} of ${sum(withdrawals)} awaiting approval.`,
  ].filter((line): line is string => Boolean(line))

  return (
    <div className="app-page">
      <AppPageHead
        eyebrow="Dashboard"
        title={`Hello, ${user?.name?.split(' ')[0] ?? 'there'}`}
        lead="Everything moving through your wallet right now."
        actions={
          <>
            <Link className="btn btn-ghost btn-sm" to="/app/deposit">
              Add money
            </Link>
            <Link className="btn btn-primary btn-sm" to="/app/trading">
              Start AI trading
              <ArrowIcon />
            </Link>
          </>
        }
      />

      {error && (
        <p className="form-alert" role="alert">
          {error}
        </p>
      )}

      <WalletSummary wallet={wallet} />

      {status?.is_waiting && (
        <div className="waiting-banner" role="status">
          <ClockIcon className="waiting-icon" />
          <div>
            <strong>We are on it.</strong>
            <p>
              {waitingFor.length > 0
                ? `${waitingFor.join(' ')} This page updates itself — you do not need to refresh.`
                : 'Something of yours is with our team. This page updates itself — you do not need to refresh.'}
            </p>
          </div>
        </div>
      )}

      <AppSection
        title="AI trading"
        aside={
          <Link className="text-link" to="/app/trading">
            All runs
            <ArrowIcon />
          </Link>
        }
      >
        {trade ? (
          <div className="run-card">
            <div className="run-head">
              <div>
                <span className="run-label">Committed</span>
                <strong className="run-amount">{trade.amount}</strong>
              </div>
              <StatusPill status={trade.status} label={trade.status_label} />
            </div>
            <dl className="detail-grid">
              <div>
                <dt>Started</dt>
                <dd>{formatDate(trade.started_at)}</dd>
              </div>
              <div>
                <dt>Requested</dt>
                <dd>{formatDate(trade.created_at)}</dd>
              </div>
              <div>
                <dt>Run</dt>
                <dd>#{trade.id}</dd>
              </div>
            </dl>
            <p className="run-note">
              Your stake is held while the desk works. It comes back to your
              wallet with the result.
            </p>
          </div>
        ) : loading ? (
          <p className="app-muted">Loading…</p>
        ) : (
          <EmptyState
            title="No run in progress"
            body={
              status?.can_start_trading
                ? 'Your available balance is ready to commit whenever you are.'
                : 'Add money to your wallet to start a trading run.'
            }
          >
            <Link
              className="btn btn-primary btn-sm"
              to={status?.can_start_trading ? '/app/trading' : '/app/deposit'}
            >
              {status?.can_start_trading ? 'Start AI trading' : 'Add money'}
              <ArrowIcon />
            </Link>
          </EmptyState>
        )}
      </AppSection>

      <div className="app-two-col">
        <AppSection
          title="Deposits awaiting verification"
          aside={
            <Link className="text-link" to="/app/deposit">
              Add money
              <ArrowIcon />
            </Link>
          }
        >
          {deposits.length === 0 ? (
            <p className="app-muted">Nothing waiting to be verified.</p>
          ) : (
            <ul className="request-list">
              {deposits.map((deposit) => (
                <li key={deposit.id}>
                  <div>
                    <strong>{deposit.amount}</strong>
                    <span>Ref {deposit.reference}</span>
                  </div>
                  <StatusPill
                    status={deposit.status}
                    label={deposit.status_label}
                  />
                </li>
              ))}
            </ul>
          )}
        </AppSection>

        <AppSection
          title="Payouts in flight"
          aside={
            <Link className="text-link" to="/app/withdraw">
              Withdraw
              <ArrowIcon />
            </Link>
          }
        >
          {withdrawals.length === 0 ? (
            <p className="app-muted">No payouts pending.</p>
          ) : (
            <ul className="request-list">
              {withdrawals.map((withdrawal) => (
                <li key={withdrawal.id}>
                  <div>
                    <strong>{withdrawal.amount}</strong>
                    <span>To {withdrawal.upi_id}</span>
                  </div>
                  <StatusPill
                    status={withdrawal.status}
                    label={withdrawal.status_label}
                  />
                </li>
              ))}
            </ul>
          )}
        </AppSection>
      </div>
    </div>
  )
}
