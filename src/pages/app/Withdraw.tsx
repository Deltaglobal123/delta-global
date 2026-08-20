import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../../lib/api'
import { useAuth } from '../../lib/auth-context'
import { useStatus } from '../../lib/status-context'
import { useList } from '../../lib/useList'
import { formatDate, paiseToInput, validateAmount } from '../../lib/money'
import type { Wallet, Withdrawal } from '../../lib/types'
import { AppPageHead } from '../../components/app/AppPageHead'
import { AppSection } from '../../components/app/AppSection'
import { Pager } from '../../components/app/Pager'
import { StatusPill } from '../../components/app/StatusPill'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MOBILE_RE = /^\+?\d{10,20}$/
const UPI_RE = /^[\w.-]{2,}@[a-zA-Z]{2,}$/

type Fields = {
  amount: string
  name: string
  email: string
  mobile_number: string
  upi_id: string
}

type Errors = Partial<Record<keyof Fields, string>>

export function Withdraw() {
  const { user } = useAuth()
  const { status, refresh } = useStatus()
  const history = useList<Withdrawal>('/withdrawals')

  const wallet = status?.wallet ?? null
  const available = wallet?.available_paise ?? 0
  const tradeOpen = Boolean(status?.active_trade)

  // Prefilled from the profile, but sent anyway: the payout goes to what was
  // approved, not to whatever the profile says later.
  const [fields, setFields] = useState<Fields>({
    amount: '',
    name: user?.name ?? '',
    email: user?.email ?? '',
    mobile_number: user?.mobile_number ?? '',
    upi_id: '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [alert, setAlert] = useState<string | null>(null)
  const [sent, setSent] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAlert(null)
    setSent(null)

    const found: Errors = {}
    const amountError = validateAmount(fields.amount, available)
    if (amountError) found.amount = amountError
    if (!fields.name.trim()) found.name = 'Enter the name on the account.'
    if (!EMAIL_RE.test(fields.email.trim()))
      found.email = 'That email address does not look right.'
    if (!MOBILE_RE.test(fields.mobile_number.replace(/[\s-]/g, '')))
      found.mobile_number = 'Use 10 to 20 digits, with an optional leading +.'
    if (!UPI_RE.test(fields.upi_id.trim()))
      found.upi_id = 'Enter a UPI ID in the form handle@bank.'

    setErrors(found)
    if (Object.keys(found).length > 0) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }

    setBusy(true)
    try {
      const response = await api.post<{
        data: Withdrawal
        wallet: Wallet
        message: string
      }>('/withdrawals', {
        amount: fields.amount.trim(),
        name: fields.name.trim(),
        email: fields.email.trim(),
        mobile_number: fields.mobile_number.replace(/[\s-]/g, ''),
        upi_id: fields.upi_id.trim(),
      })

      setSent(response.message)
      setFields((prev) => ({ ...prev, amount: '' }))
      history.reload()
      refresh()
    } catch (caught) {
      if (caught instanceof ApiError) {
        setAlert(caught.message)
        setErrors(
          Object.fromEntries(
            Object.entries(caught.errors).map(([key, list]) => [key, list[0]]),
          ) as Errors,
        )
      } else {
        setAlert('Something went wrong. Please try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-page">
      <AppPageHead
        eyebrow="Withdraw"
        title="Send money to your UPI"
        lead="Submitting holds the money right away, so it cannot be spent twice. Our team approves the request and transfers it to the UPI ID you give here."
      />

      <div className="withdraw-layout">
        <AppSection title="Withdrawal request">
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

          {tradeOpen && (
            <p className="form-notice">
              A trading run is open, so your available balance is ₹0.00 and
              nothing can be withdrawn until it settles.{' '}
              <Link to="/app/trading">See the run</Link>
            </p>
          )}

          <form className="app-form" onSubmit={onSubmit} noValidate>
            <div className="field">
              <label htmlFor="amount">Amount (₹)</label>
              <div className="amount-field">
                <input
                  id="amount"
                  inputMode="decimal"
                  placeholder="1500"
                  value={fields.amount}
                  aria-invalid={Boolean(errors.amount)}
                  onChange={(event) => set('amount', event.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={available <= 0}
                  onClick={() => set('amount', paiseToInput(available))}
                >
                  Max
                </button>
              </div>
              {errors.amount ? (
                <p className="field-error">{errors.amount}</p>
              ) : (
                <p className="field-hint">
                  You can withdraw up to {wallet?.available ?? '₹0.00'} right now.
                </p>
              )}
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  autoComplete="name"
                  value={fields.name}
                  aria-invalid={Boolean(errors.name)}
                  onChange={(event) => set('name', event.target.value)}
                />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>

              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={fields.email}
                  aria-invalid={Boolean(errors.email)}
                  onChange={(event) => set('email', event.target.value)}
                />
                {errors.email && <p className="field-error">{errors.email}</p>}
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="mobile_number">Mobile number</label>
                <input
                  id="mobile_number"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={fields.mobile_number}
                  aria-invalid={Boolean(errors.mobile_number)}
                  onChange={(event) => set('mobile_number', event.target.value)}
                />
                {errors.mobile_number && (
                  <p className="field-error">{errors.mobile_number}</p>
                )}
              </div>

              <div className="field">
                <label htmlFor="upi_id">UPI ID</label>
                <input
                  id="upi_id"
                  placeholder="you@okhdfc"
                  value={fields.upi_id}
                  aria-invalid={Boolean(errors.upi_id)}
                  onChange={(event) => set('upi_id', event.target.value)}
                />
                {errors.upi_id ? (
                  <p className="field-error">{errors.upi_id}</p>
                ) : (
                  <p className="field-hint">The money is sent here. Check it twice.</p>
                )}
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg"
              type="submit"
              disabled={busy || available <= 0}
            >
              {busy ? 'Submitting…' : 'Request withdrawal'}
            </button>
          </form>
        </AppSection>

        <aside className="withdraw-aside">
          <h2>How a payout works</h2>
          <ol className="mini-steps">
            <li>
              <span className="step-n">1</span>
              <div>
                <strong>You submit</strong>
                <p>The amount is held immediately so it cannot be spent twice.</p>
              </div>
            </li>
            <li>
              <span className="step-n">2</span>
              <div>
                <strong>We approve</strong>
                <p>Our team checks the request against your wallet.</p>
              </div>
            </li>
            <li>
              <span className="step-n">3</span>
              <div>
                <strong>We transfer</strong>
                <p>
                  The money leaves your wallet only when it is actually sent, and
                  the transfer reference appears in your history.
                </p>
              </div>
            </li>
          </ol>
        </aside>
      </div>

      <AppSection title="Your payouts">
        {history.error && (
          <p className="form-alert" role="alert">
            {history.error}
          </p>
        )}
        {history.loading && history.items.length === 0 ? (
          <p className="app-muted">Loading…</p>
        ) : history.items.length === 0 ? (
          <p className="app-muted">You have not requested a payout yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="app-table">
              <thead>
                <tr>
                  <th scope="col">Requested</th>
                  <th scope="col">Amount</th>
                  <th scope="col">UPI ID</th>
                  <th scope="col">Transfer ref</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.items.map((payout) => (
                  <tr key={payout.id}>
                    <td>{formatDate(payout.created_at)}</td>
                    <td className="num-strong">{payout.amount}</td>
                    <td className="mono">{payout.upi_id}</td>
                    <td className="mono">{payout.payment_reference ?? '—'}</td>
                    <td>
                      <StatusPill
                        status={payout.status}
                        label={payout.status_label}
                      />
                      {payout.admin_note && (
                        <p className="row-note">{payout.admin_note}</p>
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
