import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, ApiError } from '../../lib/api'
import { useStatus } from '../../lib/status-context'
import { useList } from '../../lib/useList'
import { formatDate } from '../../lib/money'
import type { Deposit as DepositRequest, PaymentQr } from '../../lib/types'
import { AppPageHead } from '../../components/app/AppPageHead'
import { AppSection } from '../../components/app/AppSection'
import { Pager } from '../../components/app/Pager'
import { StatusPill } from '../../components/app/StatusPill'
import { UpiPaymentForm } from '../../components/app/UpiPaymentForm'
import {
  toPaymentBody,
  type UpiPaymentErrors,
  type UpiPaymentValues,
} from '../../lib/upi-payment'
import { QrIcon, WhatsAppIcon } from '../../components/app/app-icons'
import { getWhatsAppSupportUrl } from '../../lib/support'
import { DEPOSIT_PLANS, DEPOSIT_PLAN_TERMS } from '../../lib/deposit-plans'

export function Deposit() {
  const { refresh } = useStatus()
  const history = useList<DepositRequest>('/deposits')

  const [qr, setQr] = useState<PaymentQr | null>(null)
  const [qrLoading, setQrLoading] = useState(true)

  const [errors, setErrors] = useState<UpiPaymentErrors>({})
  const [alert, setAlert] = useState<string | null>(null)
  const [sent, setSent] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  // The form owns its fields, so a successful submit clears it by remounting.
  const [formKey, setFormKey] = useState(0)

  // A pricing card's "Start now" links here with ?plan=, which skips step one.
  const [params] = useSearchParams()
  const linked = DEPOSIT_PLANS.find((item) => item.id === params.get('plan'))

  const [planId, setPlanId] = useState<string | null>(linked?.id ?? null)
  const [preset, setPreset] = useState<{ value: string; key: number } | null>(
    linked ? { value: linked.amount, key: 1 } : null,
  )

  // Step one is picking a plan; the QR and the form only appear after that.
  const plan = DEPOSIT_PLANS.find((item) => item.id === planId) ?? null

  function choosePlan(id: string, amount: string) {
    setSent(null)
    setPlanId(id)
    setPreset((prev) => ({ value: amount, key: (prev?.key ?? 0) + 1 }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function changePlan() {
    setPlanId(null)
    setAlert(null)
    setErrors({})
  }

  useEffect(() => {
    const controller = new AbortController()

    api
      .get<{ data: PaymentQr | null }>('/payment-qr', controller.signal)
      .then((response) => setQr(response.data))
      .catch(() => setQr(null))
      .finally(() => {
        if (!controller.signal.aborted) setQrLoading(false)
      })

    return () => controller.abort()
  }, [])

  async function onSubmit(values: UpiPaymentValues) {
    setAlert(null)
    setSent(null)
    setBusy(true)

    try {
      const response = await api.post<{ data: DepositRequest; message: string }>(
        '/deposits',
        toPaymentBody(values),
      )

      setSent(response.message)
      setErrors({})
      setFormKey((key) => key + 1)
      setPlanId(null)
      setPreset(null)
      history.reload()
      refresh()
    } catch (caught) {
      if (caught instanceof ApiError) {
        setAlert(caught.message)
        setErrors(
          Object.fromEntries(
            Object.entries(caught.errors).map(([key, list]) => [key, list[0]]),
          ) as UpiPaymentErrors,
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
        eyebrow="Add money"
        title="Top up your wallet"
        lead="Scan the QR in your UPI app, pay, then tell us the reference. Our team matches it against the bank statement and credits your wallet."
      />

      {/* Up here rather than in the form, which is gone once a payment is in. */}
      {sent && (
        <p className="form-success" role="status">
          {sent}
        </p>
      )}

      {!plan ? (
        <AppSection title="Choose a plan">
          <p className="app-muted plan-intro">
            Pick a plan to continue. You will then scan the QR, pay, and submit
            your payment reference.
          </p>

          <div className="deposit-plans">
            {DEPOSIT_PLANS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="deposit-plan"
                onClick={() => choosePlan(item.id, item.amount)}
              >
                <span className="deposit-plan-badge">100% Bonus</span>
                <span className="deposit-plan-name">{item.name}</span>
                <strong className="deposit-plan-price">{item.price}</strong>
                <span className="deposit-plan-body">{item.body}</span>
                <span className="deposit-plan-bonus">
                  <span>You receive</span>
                  <strong>{item.total}</strong>
                  <em>
                    {item.price} deposit + {item.bonus} bonus
                  </em>
                </span>
                <span className="deposit-plan-cta">Choose plan →</span>
              </button>
            ))}
          </div>

          <details className="plan-terms">
            <summary>Terms and conditions</summary>
            <ul>
              {DEPOSIT_PLAN_TERMS.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ul>
          </details>
        </AppSection>
      ) : (
        <>
          <div className="plan-chosen">
            <div>
              <span className="deposit-plan-name">Selected plan</span>
              <strong className="plan-chosen-name">
                {plan.name} · {plan.price}
              </strong>
              <span className="plan-chosen-bonus">
                You will receive <strong>{plan.total}</strong> ({plan.price} +{' '}
                {plan.bonus} bonus) in your wallet after verification. T&amp;C apply.
              </span>
            </div>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={changePlan}
              disabled={busy}
            >
              Change plan
            </button>
          </div>

          <div className="deposit-layout">
            <AppSection title="Scan and pay">
              {qrLoading ? (
                <p className="app-muted">Loading the payment code…</p>
              ) : qr ? (
                <div className="qr-block">
                  <img
                    className="qr-image"
                    src={qr.image_url}
                    alt={`UPI QR code for ${qr.label}`}
                  />
                  <dl className="detail-grid">
                    <div>
                      <dt>UPI ID</dt>
                      <dd className="mono">{qr.upi_id}</dd>
                    </div>
                    <div>
                      <dt>Account</dt>
                      <dd>{qr.label}</dd>
                    </div>
                  </dl>
                  <p className="app-muted">
                    Pay whatever you like, then fill in the form with the exact
                    reference your UPI app gave you.
                  </p>
                  <div className="qr-support">
                    <span className="qr-support-text">Facing any issue or need assistance?</span>
                    <a
                      href={getWhatsAppSupportUrl('Hello Delta Global Support, I need help with my deposit.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="support-whatsapp-btn"
                    >
                      <WhatsAppIcon className="whatsapp-btn-icon" />
                      <span>Contact Support on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="qr-unavailable">
                  <QrIcon className="qr-placeholder-icon" />
                  <strong>Payments are unavailable right now</strong>
                  <p>
                    No payment code has been published yet. Please check back shortly
                    or get in touch.
                  </p>
                  <div className="qr-support">
                    <a
                      href={getWhatsAppSupportUrl('Hello Delta Global Support, I need help with making a deposit.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="support-whatsapp-btn"
                    >
                      <WhatsAppIcon className="whatsapp-btn-icon" />
                      <span>Contact Support on WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}
            </AppSection>

            <AppSection title="I have paid">
              {alert && (
                <p className="form-alert" role="alert">
                  {alert}
                </p>
              )}

              <UpiPaymentForm
                key={formKey}
                idPrefix="deposit"
                presetAmount={preset}
                amountHint="Digits only, no commas or symbols."
                serverErrors={errors}
                busy={busy}
                submitLabel="Submit payment details"
                busyLabel="Submitting…"
                footNote={
                  <p className="app-muted">
                    Nothing reaches your wallet until our team verifies the payment.
                  </p>
                }
                onSubmit={onSubmit}
              />
            </AppSection>
          </div>
        </>
      )}

      <AppSection title="Your deposits">
        {history.error && (
          <p className="form-alert" role="alert">
            {history.error}
          </p>
        )}
        {history.loading && history.items.length === 0 ? (
          <p className="app-muted">Loading…</p>
        ) : history.items.length === 0 ? (
          <p className="app-muted">You have not submitted a payment yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="app-table">
              <thead>
                <tr>
                  <th scope="col">Submitted</th>
                  <th scope="col">Claimed</th>
                  <th scope="col">Credited</th>
                  <th scope="col">Reference</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.items.map((deposit) => (
                  <tr key={deposit.id}>
                    <td>{formatDate(deposit.created_at)}</td>
                    <td>{deposit.amount}</td>
                    {/* Our team credits what the bank statement says, which is
                        not always what was claimed. */}
                    <td className="num-strong">{deposit.credited ?? '—'}</td>
                    <td className="mono">{deposit.reference}</td>
                    <td>
                      <StatusPill
                        status={deposit.status}
                        label={deposit.status_label}
                      />
                      {deposit.admin_note && (
                        <p className="row-note">{deposit.admin_note}</p>
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
