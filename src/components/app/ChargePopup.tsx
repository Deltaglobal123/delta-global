import { useEffect, useState } from 'react'
import type { WithdrawalChargeStep } from '../../lib/types'
import { UpiPaymentForm } from './UpiPaymentForm'
import type { UpiPaymentErrors, UpiPaymentValues } from '../../lib/upi-payment'


type Props = {
  step: WithdrawalChargeStep
  /** Charge ids already paid — from this session or an abandoned earlier one. */
  /**
   * The withdrawal amount as the customer typed it. This — not the charge
   * figure — is what the claim carries, because it is how the server
   * re-resolves a percentage charge.
   */
  withdrawalAmount: string
  /** The same amount formatted, shown so the charge reads as separate. */
  withdrawalLabel: string
  /** True on the step that submits the payout. */
  isLast: boolean
  busy: boolean
  alert: string | null
  /** Set after a 429: the button stays down until the limit has passed. */
  cooling: boolean
  fieldErrors: UpiPaymentErrors
  onCancel: () => void
  onPaid: (values: UpiPaymentValues) => void
}

/**
 * One charge, one QR, one UTR. The body is the deposit form with the amount
 * pinned, because a charge is claimed exactly the way a top-up is — and the
 * reference is unique across all of them, so the same UTR cannot pay twice.
 */
export function ChargePopup({
  step,
  withdrawalAmount,
  withdrawalLabel,
  isLast,
  busy,
  alert,
  cooling,
  fieldErrors,
  onCancel,
  onPaid,
}: Props) {
  // Closing mid-walk loses nothing already paid, but it does leave the payout
  // unsubmitted — worth a deliberate second tap rather than a stray Escape.
  const [confirmClose, setConfirmClose] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) setConfirmClose(true)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [busy])

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  async function copyUpiId() {
    try {
      await navigator.clipboard.writeText(step.upi_id)
      setCopied(true)
    } catch {
      /* no clipboard permission — the id is on screen to type by hand */
    }
  }

  return (
    <div className="quiz-backdrop charge-backdrop" role="presentation">
      <section
        className="quiz-card charge-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="charge-title"
      >
        <header className="quiz-head">
          <div>
            <h2 className="charge-title" id="charge-title">
              {step.title}
            </h2>
            {step.description && (
              <p className="quiz-amount">{step.description}</p>
            )}
          </div>
          <button
            type="button"
            className="quiz-close"
            onClick={() => setConfirmClose(true)}
            disabled={busy}
            aria-label="Close"
          >
            ×
          </button>
        </header>



        <div className="quiz-body charge-body">
          <div className="charge-amount">
            <strong>{step.amount}</strong>
            <span>{step.rule}</span>
          </div>

          <p className="charge-separate">
            Paid separately, not taken out of your payout — you still receive{' '}
            <strong>{withdrawalLabel}</strong> in full.
          </p>

          <div className="charge-qr">
            <img
              className="qr-image"
              src={step.qr_image_url}
              alt={`UPI QR code for ${step.title}`}
            />
            <div className="charge-upi">
              <span className="mono">{step.upi_id}</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={copyUpiId}
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {step.instructions && (
            <p className="charge-instructions">{step.instructions}</p>
          )}

          {alert && (
            <p className="form-alert" role="alert">
              {alert}
            </p>
          )}

          {confirmClose ? (
            <div className="charge-confirm" role="alertdialog">
              <p>
                Anything you have already paid is recorded, but your payout is
                not submitted until the last step is done.
              </p>
              <div className="charge-confirm-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setConfirmClose(false)}
                >
                  Keep going
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={onCancel}
                >
                  Close anyway
                </button>
              </div>
            </div>
          ) : (
            <UpiPaymentForm
              idPrefix={`charge-${step.charge_id}`}
              fixedAmount={withdrawalAmount}
              fixedAmountLabel={step.amount}
              amountLabel="Amount to pay"
              referenceOptional
              serverErrors={fieldErrors}
              busy={busy || cooling}
              submitLabel={isLast ? 'Paid → Submit' : 'Paid → Continue'}
              busyLabel={cooling ? 'Please wait a moment…' : 'Recording…'}
              footNote={
                <p className="app-muted">
                  If you add a UTR, use the reference from this payment only —
                  the same UTR can't be used on two charges.
                </p>
              }
              onSubmit={onPaid}
            />
          )}
        </div>
      </section>
    </div>
  )
}
