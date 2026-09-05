import { useEffect, useRef } from 'react'
import type { WithdrawalChargeNotice } from '../../lib/types'
import { WhatsAppIcon } from './app-icons'
import { getWhatsAppSupportUrl } from '../../lib/support'

/**
 * The charge popup that stands in front of a payout request.
 *
 * It is **display-only**: it shows the QR, what is being charged and why, and
 * the customer pays that by hand in their own UPI app. Nothing is collected
 * from them, so the button is a plain acknowledgement — the API cannot tell
 * whether they really paid, and the admin checks the credit against the bank
 * statement before approving the payout.
 *
 * Every word on screen — the heading, the body, the button label and every line
 * of the bill — is admin-written and arrives in `notice`. Nothing is hard-coded,
 * and the items are looped rather than indexed, because the desk can add a third
 * and fourth charge at any time without a frontend deploy.
 */
export function WithdrawalChargeModal({
  notice,
  amountLabel,
  busy,
  alert,
  onCancel,
  onContinue,
}: {
  notice: WithdrawalChargeNotice
  /** The payout these charges were quoted against, formatted for display. */
  amountLabel: string
  busy: boolean
  alert: string | null
  onCancel: () => void
  onContinue: () => void
}) {
  const dialog = useRef<HTMLDivElement>(null)
  const confirm = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    confirm.current?.focus()
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
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

  return (
    // Clicking away would dismiss a bill the customer may already have paid, so
    // only the explicit Cancel closes this.
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
                  {/* The reason for the charge, in the desk's own words. */}
                  {item.description && <span>{item.description}</span>}
                  {/* `rule` only earns its place on a percentage row, where it
                      says where the figure on the right came from. On a fixed
                      row it is that same figure again. */}
                  {item.type === 'percent' && (
                    <span className="charge-rule">{item.rule}</span>
                  )}
                </div>
                <span className="charge-amount">{item.amount}</span>
              </li>
            ))}
            <li className="charge-total">
              <div>
                <strong>Total to pay now</strong>
                <span>Worked out on the {amountLabel} you are withdrawing</span>
              </div>
              <span className="charge-amount">{notice.total}</span>
            </li>
          </ul>

          <p className="form-notice">
            Pay this in your UPI app before continuing. It is{' '}
            <strong>not deducted from your wallet</strong> — you still receive the
            full {amountLabel}. Our team checks the payment before approving the
            payout.
          </p>

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
            type="button"
            className="btn btn-primary"
            ref={confirm}
            onClick={onContinue}
            disabled={busy}
          >
            {busy ? 'Submitting…' : notice.confirm_label}
          </button>
        </footer>
      </div>
    </div>
  )
}
