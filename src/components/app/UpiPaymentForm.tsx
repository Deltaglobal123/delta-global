import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { validateAmount } from '../../lib/money'
import {
  MAX_SCREENSHOT,
  type UpiPaymentErrors,
  type UpiPaymentValues,
} from '../../lib/upi-payment'

type Field = keyof UpiPaymentValues

const EMPTY: UpiPaymentValues = {
  amount: '',
  reference: '',
  payer_name: '',
  payer_upi_id: '',
  paid_at: '',
  screenshot: null,
}

type Props = {
  /** Ids stay unique when a popup opens over the page that owns a form. */
  idPrefix: string
  /**
   * The amount to send when the system fixes it — a charge. Left null, the
   * customer types it, which is what the deposit screen wants.
   */
  fixedAmount?: string | null
  /** The pre-formatted figure shown in place of the input: `₹270.00`. */
  fixedAmountLabel?: string
  amountLabel?: string
  amountHint?: ReactNode
  /** Field errors the API sent back. Each clears as its field is edited. */
  serverErrors?: UpiPaymentErrors
  busy: boolean
  submitLabel: string
  busyLabel: string
  footNote?: ReactNode
  onSubmit: (values: UpiPaymentValues) => void
}

/**
 * The "I have paid" form. One bank payment, one reference — which is exactly
 * why it is shared: a withdrawal charge is claimed with the same fields under
 * the same uniqueness rule as a deposit, with only the amount pinned down.
 *
 * It owns the field state, so a caller resets it by changing its `key`.
 */
export function UpiPaymentForm({
  idPrefix,
  fixedAmount = null,
  fixedAmountLabel,
  amountLabel = 'Amount paid (₹)',
  amountHint,
  serverErrors,
  busy,
  submitLabel,
  busyLabel,
  footNote,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<UpiPaymentValues>(EMPTY)
  const [local, setLocal] = useState<UpiPaymentErrors>({})
  // A server error stands until the field it names is touched; a fresh
  // response from the API brings the whole set back.
  const [edited, setEdited] = useState<Partial<Record<Field, true>>>({})

  useEffect(() => setEdited({}), [serverErrors])

  const id = (field: string) => `${idPrefix}-${field}`

  function error(field: Field): string | undefined {
    if (local[field]) return local[field]
    return edited[field] ? undefined : serverErrors?.[field]
  }

  function set<K extends Field>(field: K, value: UpiPaymentValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setLocal((prev) => ({ ...prev, [field]: undefined }))
    setEdited((prev) => ({ ...prev, [field]: true }))
  }

  function onFile(file: File | null) {
    if (file && file.size > MAX_SCREENSHOT) {
      setValues((prev) => ({ ...prev, screenshot: null }))
      setLocal((prev) => ({
        ...prev,
        screenshot: 'That image is over 4 MB. Pick a smaller one.',
      }))
      return
    }
    set('screenshot', file)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const found: UpiPaymentErrors = {}

    // A fixed amount is not the customer's to get wrong.
    if (fixedAmount === null) {
      const amountError = validateAmount(values.amount)
      if (amountError) found.amount = amountError
    }

    const reference = values.reference.trim()
    if (reference.length < 6 || reference.length > 60)
      found.reference =
        'Enter the UTR or reference from your UPI app, 6 to 60 characters.'

    setLocal(found)
    if (Object.keys(found).length > 0) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }

    onSubmit({
      ...values,
      amount: fixedAmount ?? values.amount.trim(),
      reference,
      payer_name: values.payer_name.trim(),
      payer_upi_id: values.payer_upi_id.trim(),
    })
  }

  return (
    <form className="app-form" onSubmit={submit} noValidate>
      <div className="field-row">
        <div className="field">
          <label htmlFor={id('amount')}>{amountLabel}</label>
          {fixedAmount === null ? (
            <input
              id={id('amount')}
              inputMode="decimal"
              placeholder="2500.50"
              value={values.amount}
              aria-invalid={Boolean(error('amount'))}
              onChange={(event) => set('amount', event.target.value)}
            />
          ) : (
            <output className="amount-fixed" id={id('amount')}>
              {fixedAmountLabel ?? fixedAmount}
            </output>
          )}
          {error('amount') ? (
            <p className="field-error">{error('amount')}</p>
          ) : amountHint ? (
            <p className="field-hint">{amountHint}</p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor={id('reference')}>UTR / reference</label>
          <input
            id={id('reference')}
            value={values.reference}
            aria-invalid={Boolean(error('reference'))}
            onChange={(event) => set('reference', event.target.value)}
          />
          {error('reference') ? (
            <p className="field-error">{error('reference')}</p>
          ) : (
            <p className="field-hint">One bank payment, one reference.</p>
          )}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor={id('payer_name')}>
            Name on the payment <span className="optional">optional</span>
          </label>
          <input
            id={id('payer_name')}
            value={values.payer_name}
            aria-invalid={Boolean(error('payer_name'))}
            onChange={(event) => set('payer_name', event.target.value)}
          />
          {error('payer_name') && (
            <p className="field-error">{error('payer_name')}</p>
          )}
        </div>

        <div className="field">
          <label htmlFor={id('payer_upi_id')}>
            Your UPI ID <span className="optional">optional</span>
          </label>
          <input
            id={id('payer_upi_id')}
            placeholder="you@okhdfc"
            value={values.payer_upi_id}
            aria-invalid={Boolean(error('payer_upi_id'))}
            onChange={(event) => set('payer_upi_id', event.target.value)}
          />
          {error('payer_upi_id') && (
            <p className="field-error">{error('payer_upi_id')}</p>
          )}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor={id('paid_at')}>
            Paid on <span className="optional">optional</span>
          </label>
          <input
            id={id('paid_at')}
            type="date"
            value={values.paid_at}
            aria-invalid={Boolean(error('paid_at'))}
            onChange={(event) => set('paid_at', event.target.value)}
          />
          {error('paid_at') && <p className="field-error">{error('paid_at')}</p>}
        </div>

        <div className="field">
          <label htmlFor={id('screenshot')}>
            Payment screenshot <span className="optional">optional</span>
          </label>
          <input
            id={id('screenshot')}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            aria-invalid={Boolean(error('screenshot'))}
            onChange={(event) => onFile(event.target.files?.[0] ?? null)}
          />
          {error('screenshot') ? (
            <p className="field-error">{error('screenshot')}</p>
          ) : (
            <p className="field-hint">PNG, JPG or WEBP, up to 4 MB.</p>
          )}
        </div>
      </div>

      <button className="btn btn-primary btn-lg" type="submit" disabled={busy}>
        {busy ? busyLabel : submitLabel}
      </button>
      {footNote}
    </form>
  )
}
