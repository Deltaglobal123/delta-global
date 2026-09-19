import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../../lib/api'
import { useAuth } from '../../lib/auth-context'
import { useStatus } from '../../lib/status-context'
import { useList } from '../../lib/useList'
import {
  formatDate,
  formatPaise,
  inputToPaise,
  paiseToInput,
  validateAmount,
} from '../../lib/money'
import type { Wallet, Withdrawal, WithdrawalChargeStep } from '../../lib/types'
import {
  fetchCharges,
  firstUnpaid,
  paymentIdsFor,
  payCharge,
  settledBy,
  type Settled,
} from '../../lib/withdrawal-charges'
import { AppPageHead } from '../../components/app/AppPageHead'
import { AppSection } from '../../components/app/AppSection'
import { ChargePopup } from '../../components/app/ChargePopup'
import { Pager } from '../../components/app/Pager'
import { StatusPill } from '../../components/app/StatusPill'
import type { UpiPaymentErrors, UpiPaymentValues } from '../../lib/upi-payment'
import { WhatsAppIcon } from '../../components/app/app-icons'
import { getWhatsAppSupportUrl } from '../../lib/support'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MOBILE_RE = /^\+?\d{10,20}$/
const UPI_RE = /^[\w.-]{2,}@[a-zA-Z]{2,}$/

/** How long the charge popup keeps its button down after a 429. */
const COOLDOWN_MS = 15000

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
  const [notice, setNotice] = useState<string | null>(null)
  const [sent, setSent] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // The charge walk. `lockedAmount` is what the charges were quoted against,
  // so it is what every claim and the payout itself are sent with — the
  // amount field is frozen for the same reason.
  const [steps, setSteps] = useState<WithdrawalChargeStep[]>([])
  const [index, setIndex] = useState(0)
  const [paid, setPaid] = useState<Settled>({})
  const [lockedAmount, setLockedAmount] = useState('')
  const [chargeAlert, setChargeAlert] = useState<string | null>(null)
  const [chargeErrors, setChargeErrors] = useState<UpiPaymentErrors>({})
  const [cooling, setCooling] = useState(false)

  const walkOpen = steps.length > 0

  useEffect(() => {
    if (!cooling) return
    const timer = setTimeout(() => setCooling(false), COOLDOWN_MS)
    return () => clearTimeout(timer)
  }, [cooling])

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function closeWalk() {
    setLockedAmount('')
    setSteps([])
    setIndex(0)
    setPaid({})
    setChargeAlert(null)
    setChargeErrors({})
  }

  /**
   * Posts the payout. Nothing is held and no withdrawal is created when this
   * comes back 422, so restarting the walk from here is always safe.
   */
  async function post(chargePaymentIds: number[], amount: string) {
    setAlert(null)

    const body: Record<string, unknown> = {
      amount,
      name: fields.name.trim(),
      email: fields.email.trim(),
      mobile_number: fields.mobile_number.replace(/[\s-]/g, ''),
      upi_id: fields.upi_id.trim(),
    }
    if (chargePaymentIds.length > 0) body.charge_payment_ids = chargePaymentIds

    try {
      const response = await api.post<{
        data: Withdrawal
        wallet: Wallet
        message: string
      }>('/withdrawals', body)

      closeWalk()
      setNotice(null)
      setSent(response.message)
      setFields((prev) => ({ ...prev, amount: '' }))
      history.reload()
      refresh()
    } catch (caught) {
      if (!(caught instanceof ApiError)) {
        closeWalk()
        setAlert('Something went wrong. Please try again.')
        return
      }

      // A charge is unpaid, or these ids are spent or not this customer's.
      // The message names what is outstanding; re-walk from there.
      if (caught.fieldError('charge_payment_ids')) {
        await rewalk(caught.fieldError('charge_payment_ids') as string, amount)
        return
      }

      // The amount moved under a percentage charge, or the balance did.
      // Either way the walk is void — send them back to the form.
      const amountError = caught.fieldError('amount')
      if (amountError) {
        closeWalk()
        setErrors((prev) => ({ ...prev, amount: amountError }))
        setAlert(caught.message)
        return
      }

      closeWalk()
      setAlert(caught.message)
      setErrors(
        Object.fromEntries(
          Object.entries(caught.errors).map(([key, list]) => [key, list[0]]),
        ) as Errors,
      )
    }
  }

  /** Re-fetches the sequence and reopens it at the first unpaid step. */
  async function rewalk(message: string, amount: string) {
    try {
      const { data, meta } = await fetchCharges(amount)

      if (data.length === 0) {
        closeWalk()
        setAlert(message)
        return
      }

      const settled = settledBy(meta.paid)
      const next = firstUnpaid(data, settled)
      if (next === -1) {
        // Everything is settled yet the payout was still refused — nothing
        // useful left to reopen, so hand it back to the customer.
        closeWalk()
        setAlert(message)
        return
      }

      setLockedAmount(amount)
      setSteps(data)
      setPaid(settled)
      setIndex(next)
      setChargeErrors({})
      setChargeAlert(message)
    } catch {
      closeWalk()
      setAlert(message)
    }
  }

  /** "Withdraw" pressed: fetch the sequence, then either walk it or submit. */
  async function begin(amount: string) {
    setLockedAmount(amount)

    const { data, meta } = await fetchCharges(amount)

    // An empty sequence is a normal answer — nothing is being collected.
    if (data.length === 0) {
      await post([], amount)
      return
    }

    const settled = settledBy(meta.paid)
    const next = firstUnpaid(data, settled)

    if (next === -1) {
      // An earlier walk covered the whole sequence — go straight to the payout.
      await post(paymentIdsFor(data, settled), amount)
      return
    }

    setSteps(data)
    setPaid(settled)
    setIndex(next)
    setChargeAlert(null)
    setChargeErrors({})
    if (meta.paid.length > 0)
      setNotice(
        `Picking up where you left off — ${meta.paid.length} charge${meta.paid.length === 1 ? '' : 's'} already paid.`,
      )
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAlert(null)
    setNotice(null)
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
      await begin(fields.amount.trim())
    } catch (caught) {
      closeWalk()
      setAlert(
        caught instanceof ApiError
          ? caught.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  /**
   * One charge, recorded the moment its popup is done — never batched to the
   * end. Real money has already left the customer's account by then, so an
   * abandoned walk still leaves a record an admin can act on.
   */
  async function onChargePaid(values: UpiPaymentValues) {
    const step = steps[index]
    if (!step) return

    setBusy(true)
    setChargeAlert(null)
    setChargeErrors({})

    try {
      const { data } = await payCharge(step.charge_id, values)

      const settled = { ...paid, [step.charge_id]: data.id }
      setPaid(settled)

      const next = firstUnpaid(steps, settled)
      if (next === -1) await post(paymentIdsFor(steps, settled), lockedAmount)
      else setIndex(next)
    } catch (caught) {
      if (!(caught instanceof ApiError)) {
        setChargeAlert('Something went wrong. Please try again.')
        return
      }

      if (caught.status === 429) {
        setCooling(true)
        setChargeAlert(caught.message)
        return
      }

      const fieldErrors = Object.entries(caught.errors)
      if (caught.status === 422 && fieldErrors.length === 0) {
        // The charge was stood down mid-walk. Start the sequence over.
        await rewalk(caught.message, lockedAmount)
        return
      }

      setChargeErrors(
        Object.fromEntries(
          fieldErrors.map(([key, list]) => [key, list[0]]),
        ) as UpiPaymentErrors,
      )
      setChargeAlert(caught.message)
    } finally {
      setBusy(false)
    }
  }

  function onWalkCancelled() {
    const count = Object.keys(paid).length
    closeWalk()
    setNotice(
      count > 0
        ? `Your payout was not submitted. The ${count} charge${count === 1 ? '' : 's'} you paid ${count === 1 ? 'is' : 'are'} saved — press Request withdrawal again to carry on.`
        : 'Your payout was not submitted. Press Request withdrawal to start again.',
    )
  }

  const lockedPaise = inputToPaise(lockedAmount)
  const withdrawalLabel =
    lockedPaise === null ? lockedAmount : formatPaise(lockedPaise)

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
          {notice && <p className="form-notice">{notice}</p>}

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
                  // Frozen while charges are being collected: percentage
                  // charges were quoted against this figure, and changing it
                  // would void everything already paid.
                  disabled={walkOpen}
                  aria-invalid={Boolean(errors.amount)}
                  onChange={(event) => set('amount', event.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={available <= 0 || walkOpen}
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
              disabled={busy || walkOpen || available <= 0}
            >
              {busy ? 'Sending…' : 'Request withdrawal'}
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

          <div className="withdraw-support">
            <span className="withdraw-support-text">Need help with your payout?</span>
            <a
              href={getWhatsAppSupportUrl('Hello Delta Global Support, I need help with my withdrawal.')}
              target="_blank"
              rel="noopener noreferrer"
              className="support-whatsapp-btn"
            >
              <WhatsAppIcon className="whatsapp-btn-icon" />
              <span>Contact Support on WhatsApp</span>
            </a>
          </div>
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
                      {/* The charges are verified separately from the payout,
                          so each carries its own status. */}
                      {payout.charges && payout.charges.length > 0 && (
                        <ul className="charge-status-list">
                          {payout.charges.map((charge) => (
                            <li key={charge.id}>
                              <span className="charge-status-title">
                                {charge.title}
                              </span>
                              <span className="mono">{charge.amount}</span>
                              <StatusPill
                                status={charge.status}
                                label={charge.status_label}
                              />
                            </li>
                          ))}
                        </ul>
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

      {walkOpen && steps[index] && (
        <ChargePopup
          key={steps[index].charge_id}
          step={steps[index]}
          steps={steps}
          paidChargeIds={new Set(Object.keys(paid).map(Number))}
          withdrawalAmount={lockedAmount}
          withdrawalLabel={withdrawalLabel}
          isLast={
            steps.filter((entry) => paid[entry.charge_id] === undefined)
              .length === 1
          }
          busy={busy}
          alert={chargeAlert}
          cooling={cooling}
          fieldErrors={chargeErrors}
          onCancel={onWalkCancelled}
          onPaid={onChargePaid}
        />
      )}
    </div>
  )
}
