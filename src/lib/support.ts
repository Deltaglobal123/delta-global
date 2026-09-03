/**
 * Helper to build a WhatsApp redirection URL for customer support.
 * Configurable via `VITE_WHATSAPP_NUMBER` (e.g. 919876543210) or `VITE_WHATSAPP_URL`.
 */
export function getWhatsAppSupportUrl(message?: string): string {
  const customUrl = (import.meta.env.VITE_WHATSAPP_URL || '').trim()
  if (customUrl) {
    if (message && !customUrl.includes('text=')) {
      const separator = customUrl.includes('?') ? '&' : '?'
      return `${customUrl}${separator}text=${encodeURIComponent(message)}`
    }
    return customUrl
  }

  const rawNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || '').trim()
  const cleanNumber = rawNumber.replace(/[^\d]/g, '')

  const base = cleanNumber ? `https://wa.me/${cleanNumber}` : 'https://wa.me/'

  if (message) {
    const separator = base.includes('?') ? '&' : '?'
    return `${base}${separator}text=${encodeURIComponent(message)}`
  }

  return base
}
