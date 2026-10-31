/**
 * One UPI payment claim — a deposit or a withdrawal charge. Both are the same
 * thing to the API: an amount, the UTR the bank gave it, and a screenshot.
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
  const fields: Record<string, string> = { amount: values.amount }
  // Left out when empty — the UTR is optional on every claim.
  if (values.reference) fields.reference = values.reference
  if (values.payer_name) fields.payer_name = values.payer_name
  if (values.payer_upi_id) fields.payer_upi_id = values.payer_upi_id
  if (values.paid_at) fields.paid_at = values.paid_at

  if (!values.screenshot) return fields

  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) form.append(key, value)
  form.append('screenshot', values.screenshot)
  return form
}

/** Phone photos are routinely 5–12 MB; this is the longest side we keep. */
const MAX_SIDE = 2400

/**
 * Brings a screenshot under the 4 MB cap instead of turning it away. A file
 * already small enough goes as-is; a bigger one is redrawn as a JPEG, shrinking
 * the quality and then the size until it fits. Null when the browser cannot
 * decode it or it still will not fit — the caller asks for another image.
 */
export async function fitScreenshot(file: File): Promise<File | null> {
  if (file.size <= MAX_SCREENSHOT) return file

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return null
  }

  try {
    let scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))

    for (let attempt = 0; attempt < 6; attempt++) {
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(bitmap.width * scale))
      canvas.height = Math.max(1, Math.round(bitmap.height * scale))
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

      const quality = attempt < 3 ? 0.85 - attempt * 0.15 : 0.6
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', quality),
      )
      if (blob && blob.size <= MAX_SCREENSHOT) {
        const name = file.name.replace(/\.[^.]+$/, '') || 'screenshot'
        return new File([blob], `${name}.jpg`, { type: 'image/jpeg' })
      }

      // Quality alone was not enough — start shrinking the picture too.
      if (attempt >= 2) scale *= 0.75
    }

    return null
  } finally {
    bitmap.close()
  }
}
