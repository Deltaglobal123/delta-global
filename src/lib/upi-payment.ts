/**
 * One UPI payment claim — a deposit or a withdrawal charge. Both are the same
 * thing to the API: an amount, the UTR the bank gave it, and optional proof.
 */

export const MAX_SCREENSHOT = 4 * 1024 * 1024

export type UpiPaymentValues = {
  amount: string
  reference: string
  payer_name: string
  payer_upi_id: string
  paid_at: string
  screenshot: File | null
}

export type UpiPaymentErrors = Partial<Record<keyof UpiPaymentValues, string>>

/**
 * The request body for one claim. Multipart only when a file is actually going
 * with it — a plain object is cheaper and easier to read in the network tab.
 */
export function toPaymentBody(
  values: UpiPaymentValues,
): FormData | Record<string, string> {
  const fields: Record<string, string> = {
    amount: values.amount,
    reference: values.reference,
  }
  if (values.payer_name) fields.payer_name = values.payer_name
  if (values.payer_upi_id) fields.payer_upi_id = values.payer_upi_id
  if (values.paid_at) fields.paid_at = values.paid_at

  if (!values.screenshot) return fields

  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) form.append(key, value)
  form.append('screenshot', values.screenshot)
  return form
}
