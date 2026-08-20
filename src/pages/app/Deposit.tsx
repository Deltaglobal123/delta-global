import { useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../lib/api'
import { useStatus } from '../../lib/status-context'
import { useList } from '../../lib/useList'
import { formatDate, validateAmount } from '../../lib/money'
import type { Deposit as DepositRequest, PaymentQr } from '../../lib/types'
import { AppPageHead } from '../../components/app/AppPageHead'
import { AppSection } from '../../components/app/AppSection'
import { Pager } from '../../components/app/Pager'
import { StatusPill } from '../../components/app/StatusPill'
import { QrIcon } from '../../components/app/app-icons'

const MAX_SCREENSHOT = 4 * 1024 * 1024

type Fields = {
  amount: string
  reference: string
  payer_name: string
  payer_upi_id: string
  paid_at: string
}

/** The upload is validated under its own key server-side, so errors cover it too. */
type Errors = Partial<Record<keyof Fields | 'screenshot', string>>

const EMPTY: Fields = {
  amount: '',
  reference: '',
  payer_name: '',
  payer_upi_id: '',
  paid_at: '',
}

export function Deposit() {
  const { refresh } = useStatus()
  const history = useList<DepositRequest>('/deposits')

  const [qr, setQr] = useState<PaymentQr | null>(null)
  const [qrLoading, setQrLoading] = useState(true)

  const [fields, setFields] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [alert, setAlert] = useState<string | null>(null)
  const [sent, setSent] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

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

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function onFile(file: File | null) {
    if (file && file.size > MAX_SCREENSHOT) {
      setScreenshot(null)
      setErrors((prev) => ({
        ...prev,
        screenshot: 'That image is over 4 MB. Pick a smaller one.',
      }))
      return
    }
    setErrors((prev) => ({ ...prev, screenshot: undefined }))
    setScreenshot(file)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAlert(null)
    setSent(null)

    const found: Errors = {}
    const amountError = validateAmount(fields.amount)
    if (amountError) found.amount = amountError

    const reference = fields.reference.trim()
    if (reference.length < 6 || reference.length > 60)
      found.reference =
        'Enter the UTR or reference from your UPI app, 6 to 60 characters.'

    setErrors(found)
    if (Object.keys(found).length > 0) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }

    setBusy(true)
    try {
      // Only reach for multipart when there is actually a file to carry.
      let body: FormData | Record<string, string>
      if (screenshot) {
        const form = new FormData()
        form.append('amount', fields.amount.trim())
        form.append('reference', reference)
        if (fields.payer_name.trim()) form.append('payer_name', fields.payer_name.trim())
        if (fields.payer_upi_id.trim())
          form.append('payer_upi_id', fields.payer_upi_id.trim())
        if (fields.paid_at) form.append('paid_at', fields.paid_at)
        form.append('screenshot', screenshot)
        body = form
      } else {
        const json: Record<string, string> = {
          amount: fields.amount.trim(),
          reference,
        }
        if (fields.payer_name.trim()) json.payer_name = fields.payer_name.trim()
        if (fields.payer_upi_id.trim()) json.payer_upi_id = fields.payer_upi_id.trim()
        if (fields.paid_at) json.paid_at = fields.paid_at
        body = json
      }

      const response = await api.post<{ data: DepositRequest; message: string }>(
        '/deposits',
        body,
      )

      setSent(response.message)
      setFields(EMPTY)
      setScreenshot(null)
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
        eyebrow="Add money"
        title="Top up your wallet"
        lead="Scan the QR in your UPI app, pay, then tell us the reference. Our team matches it against the bank statement and credits your wallet."
      />

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
            </div>
          ) : (
            <div className="qr-unavailable">
              <QrIcon className="qr-placeholder-icon" />
              <strong>Payments are unavailable right now</strong>
              <p>
                No payment code has been published yet. Please check back shortly
                or get in touch.
              </p>
            </div>
          )}
        </AppSection>

        <AppSection title="I have paid">
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

          <form className="app-form" onSubmit={onSubmit} noValidate>
            <div className="field-row">
              <div className="field">
                <label htmlFor="amount">Amount paid (₹)</label>
                <input
                  id="amount"
                  inputMode="decimal"
                  placeholder="2500.50"
                  value={fields.amount}
                  aria-invalid={Boolean(errors.amount)}
                  onChange={(event) => set('amount', event.target.value)}
                />
                {errors.amount ? (
                  <p className="field-error">{errors.amount}</p>
                ) : (
                  <p className="field-hint">Digits only, no commas or symbols.</p>
                )}
              </div>

              <div className="field">
                <label htmlFor="reference">UTR / reference</label>
                <input
                  id="reference"
                  value={fields.reference}
                  aria-invalid={Boolean(errors.reference)}
                  onChange={(event) => set('reference', event.target.value)}
                />
                {errors.reference ? (
                  <p className="field-error">{errors.reference}</p>
                ) : (
                  <p className="field-hint">One bank payment, one reference.</p>
                )}
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="payer_name">
                  Name on the payment <span className="optional">optional</span>
                </label>
                <input
                  id="payer_name"
                  value={fields.payer_name}
                  aria-invalid={Boolean(errors.payer_name)}
                  onChange={(event) => set('payer_name', event.target.value)}
                />
                {errors.payer_name && (
                  <p className="field-error">{errors.payer_name}</p>
                )}
              </div>

              <div className="field">
                <label htmlFor="payer_upi_id">
                  Your UPI ID <span className="optional">optional</span>
                </label>
                <input
                  id="payer_upi_id"
                  placeholder="you@okhdfc"
                  value={fields.payer_upi_id}
                  aria-invalid={Boolean(errors.payer_upi_id)}
                  onChange={(event) => set('payer_upi_id', event.target.value)}
                />
                {errors.payer_upi_id && (
                  <p className="field-error">{errors.payer_upi_id}</p>
                )}
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="paid_at">
                  Paid on <span className="optional">optional</span>
                </label>
                <input
                  id="paid_at"
                  type="date"
                  value={fields.paid_at}
                  aria-invalid={Boolean(errors.paid_at)}
                  onChange={(event) => set('paid_at', event.target.value)}
                />
                {errors.paid_at && <p className="field-error">{errors.paid_at}</p>}
              </div>

              <div className="field">
                <label htmlFor="screenshot">
                  Payment screenshot <span className="optional">optional</span>
                </label>
                <input
                  id="screenshot"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  aria-invalid={Boolean(errors.screenshot)}
                  onChange={(event) => onFile(event.target.files?.[0] ?? null)}
                />
                {errors.screenshot ? (
                  <p className="field-error">{errors.screenshot}</p>
                ) : (
                  <p className="field-hint">PNG, JPG or WEBP, up to 4 MB.</p>
                )}
              </div>
            </div>

            <button className="btn btn-primary btn-lg" type="submit" disabled={busy}>
              {busy ? 'Submitting…' : 'Submit payment details'}
            </button>
            <p className="app-muted">
              Nothing reaches your wallet until our team verifies the payment.
            </p>
          </form>
        </AppSection>
      </div>

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
