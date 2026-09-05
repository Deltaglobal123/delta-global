import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { WithdrawalChargeNotice } from '../../lib/types'
import { WhatsAppIcon } from './app-icons'
import { getWhatsAppSupportUrl } from '../../lib/support'

/** The same ceiling the API puts on the upload, checked before the round trip. */
const MAX_SCREENSHOT = 4 * 1024 * 1024

const UPI_RE = /^[\w.-]{2,}@[a-zA-Z]{2,}$/

export type ChargePayment = {
  charge_upi_id: string
  charge_reference: string
  charge_paid_at: string
  screenshot: File | null
}

/** The server-side keys for the popup half of the withdrawal form. */
export type ChargeErrors = Partial<
  Record<
    'charge_upi_id' | 'charge_reference' | 'charge_paid_at' | 'charge_screenshot',
    string
  >
>

/**
 * The charge popup that stands in front of a payout request.
 *
 * Every word on screen — the heading, the body, the button label and every line
 * of the bill — is admin-written and arrives in `notice`. Nothing is hard-coded,
 * and the items are looped rather than indexed, because the desk can add a third
 * and fourth charge at any time without a frontend deploy.
 *
 * The charges are *not* taken out of the wallet. The customer pays them from
 * their own UPI app exactly as they would a deposit, then sends back the same
 * proof the deposit form asks for.
 */
export function WithdrawalChargeModal({
  notice,
  amountLabel,
  busy,
  errors,
  alert,
  onCancel,
  onConfirm,
}: {
  notice: WithdrawalChargeNotice
  /** The payout being quoted for, so the customer sees what they are paying on. */
  amountLabel: string
  busy: boolean
  errors: ChargeErrors
  alert: string | null
  onCancel: () => void
  onConfirm: (payment: ChargePayment) => void
}) {
  const [chargeUpiId, setChargeUpiId] = useState('')
  const [reference, setReference] = useState('')
  const [paidAt, setPaidAt] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [local, setLocal] = useState<ChargeErrors>({})

  const dialog = useRef<HTMLDivElement>(null)
  const firstField = useRef<HTMLInputElement>(null)

  // A server-side error replaces whatever we complained about locally, so the
  // customer never reads two contradictory messages on one field.
  const shown: ChargeErrors = { ...local, ...errors }

  useEffect(() => {
    firstField.current?.focus()
  }, [])

  // The page behind must not scroll away under the dialog on a phone.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      // Escape abandons the payout, so it is refused mid-submit: the request may
      // already be on its way to the server.
      if (event.key === 'Escape' && !busy) {
        onCancel()
        return
      }

      if (event.key !== 'Tab') return

      // Keep tabbing inside the dialog. With the form behind still in the tab
      // order a customer could otherwise type into a field they cannot see.
      const focusable = dialog.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable || focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [busy, onCancel])

  function onFile(file: File | null) {
    if (file && file.size > MAX_SCREENSHOT) {
      setScreenshot(null)
      setLocal((prev) => ({
        ...prev,
        charge_screenshot: 'That image is over 4 MB. Pick a smaller one.',
      }))
      return
    }
    setLocal((prev) => ({ ...prev, charge_screenshot: undefined }))
    setScreenshot(file)
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const found: ChargeErrors = {}
    if (!UPI_RE.test(chargeUpiId.trim()))
      found.charge_upi_id = 'Enter the UPI ID you paid from, in the form handle@bank.'

    // Optional, but the API rejects a stub, so catch that here rather than after
    // a round trip the customer has to read an error out of.
    const trimmedReference = reference.trim()
    if (trimmedReference && (trimmedReference.length < 6 || trimmedReference.length > 60))
      found.charge_reference =
        'The reference is 6 to 60 characters. Leave it empty if you do not have it.'

    setLocal(found)
    if (Object.keys(found).length > 0) {
      dialog.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }

    onConfirm({
      charge_upi_id: chargeUpiId.trim(),
      charge_reference: trimmedReference,
      charge_paid_at: paidAt,
      screenshot,
    })
  }

  return (
    // Clicking away would throw out a charge the customer may already have paid,
    // so only the explicit Cancel closes this.
    <div className="modal-backdrop" role="presentation">
      <div
        className="modal charge-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="charge-title"
        ref={dialog}
      >
        <header className="modal-head">
          <div>
            <span className="modal-eyebrow">Withdrawing {amountLabel}</span>
            <h2 id="charge-title">{notice.title}</h2>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onCancel}
            disabled={busy}
            aria-label="Cancel this withdrawal"
          >
            &times;
          </button>
        </header>

        <div className="modal-body">
          {alert && (
            <p className="form-alert" role="alert">
              {alert}
            </p>
          )}

          {notice.body && <p className="charge-lead">{notice.body}</p>}

          <div className="charge-pay">
            <img
              className="qr-image"
              src={notice.qr_image_url}
              alt="Scan this QR in your UPI app to pay the withdrawal charges"
            />
            {notice.upi_id && (
              <dl className="detail-grid">
                <div>
                  <dt>Or pay this UPI ID</dt>
                  <dd className="mono">{notice.upi_id}</dd>
                </div>
              </dl>
            )}
          </div>

          <ul className="charge-lines">
            {notice.items.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  {/* `rule` explains where a percentage figure came from, so the
                      number is never a mystery. */}
                  <span>{item.description ?? item.rule}</span>
                </div>
                <span className="charge-amount">{item.amount}</span>
              </li>
            ))}
            <li className="charge-total">
              <div>
                <strong>Total to pay now</strong>
                <span>Paid by UPI, not taken from your wallet</span>
              </div>
              <span className="charge-amount">{notice.total}</span>
            </li>
          </ul>

          <p className="form-notice">
            These charges are paid separately from your own UPI app and are{' '}
            <strong>not deducted from your wallet</strong>. You still receive the
            full {amountLabel}.
          </p>

          <form className="app-form" onSubmit={onSubmit} noValidate id="charge-form">
            <div className="field">
              <label htmlFor="charge_upi_id">UPI ID you paid the charges from</label>
              <input
                id="charge_upi_id"
                ref={firstField}
                placeholder="you@okhdfc"
                value={chargeUpiId}
                aria-invalid={Boolean(shown.charge_upi_id)}
                onChange={(event) => {
                  setChargeUpiId(event.target.value)
                  setLocal((prev) => ({ ...prev, charge_upi_id: undefined }))
                }}
              />
              {shown.charge_upi_id ? (
                <p className="field-error">{shown.charge_upi_id}</p>
              ) : (
                <p className="field-hint">
                  The account the charges left — not where your payout is sent. We
                  match it against the credit we receive.
                </p>
              )}
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="charge_reference">
                  UTR / reference <span className="optional">optional</span>
                </label>
                <input
                  id="charge_reference"
                  value={reference}
                  aria-invalid={Boolean(shown.charge_reference)}
                  onChange={(event) => {
                    setReference(event.target.value)
                    setLocal((prev) => ({ ...prev, charge_reference: undefined }))
                  }}
                />
                {shown.charge_reference ? (
                  <p className="field-error">{shown.charge_reference}</p>
                ) : (
                  <p className="field-hint">The reference your UPI app showed.</p>
                )}
              </div>

              <div className="field">
                <label htmlFor="charge_paid_at">
                  Paid on <span className="optional">optional</span>
                </label>
                <input
                  id="charge_paid_at"
                  type="date"
                  value={paidAt}
                  aria-invalid={Boolean(shown.charge_paid_at)}
                  onChange={(event) => {
                    setPaidAt(event.target.value)
                    setLocal((prev) => ({ ...prev, charge_paid_at: undefined }))
                  }}
                />
                {shown.charge_paid_at && (
                  <p className="field-error">{shown.charge_paid_at}</p>
                )}
              </div>
            </div>

            <div className="field">
              <label htmlFor="charge_screenshot">
                Payment screenshot <span className="optional">optional</span>
              </label>
              <input
                id="charge_screenshot"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                aria-invalid={Boolean(shown.charge_screenshot)}
                onChange={(event) => onFile(event.target.files?.[0] ?? null)}
              />
              {shown.charge_screenshot ? (
                <p className="field-error">{shown.charge_screenshot}</p>
              ) : (
                <p className="field-hint">PNG, JPG or WEBP, up to 4 MB.</p>
              )}
            </div>
          </form>

          <div className="charge-support">
            <span className="withdraw-support-text">Stuck paying the charges?</span>
            <a
              href={getWhatsAppSupportUrl(
                'Hello Delta Global Support, I need help paying my withdrawal charges.',
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="support-whatsapp-btn"
            >
              <WhatsAppIcon className="whatsapp-btn-icon" />
              <span>Contact Support on WhatsApp</span>
            </a>
          </div>
        </div>

        <footer className="modal-foot">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            type="submit"
            form="charge-form"
            disabled={busy}
          >
            {busy ? 'Submitting…' : notice.confirm_label}
          </button>
        </footer>
      </div>
    </div>
  )
}
