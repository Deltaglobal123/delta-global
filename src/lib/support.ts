import { useEffect, useState } from 'react'
import { api } from './api'

const STORAGE_KEY = 'dg.whatsapp_number'

let currentWhatsAppNumber: string | null = (() => {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
})()

type Listener = (num: string | null) => void
const listeners = new Set<Listener>()

function notifyListeners() {
  for (const fn of listeners) {
    fn(currentWhatsAppNumber)
  }
}

/**
 * Update the dynamic WhatsApp number in memory and local storage.
 */
export function setDynamicWhatsAppNumber(number: string | null) {
  const trimmed = number ? number.trim() : null
  currentWhatsAppNumber = trimmed
  try {
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    /* Ignore storage errors */
  }
  notifyListeners()
}

/**
 * Fetch platform settings from the backend API to dynamically sync the WhatsApp number.
 */
export async function fetchWhatsAppSettings(): Promise<string | null> {
  try {
    const res = await api.get<{ data?: { whatsapp_number?: string; whatsapp_url?: string } }>('/settings')
    const number = res?.data?.whatsapp_number ?? null
    if (number !== undefined) {
      setDynamicWhatsAppNumber(number)
    }
    return number
  } catch {
    return currentWhatsAppNumber
  }
}

// Automatically initiate a public fetch once in browser environment
if (typeof window !== 'undefined') {
  fetchWhatsAppSettings().catch(() => {})
}

/**
 * Helper to build a WhatsApp redirection URL for customer support and project inquiry.
 * Uses the dynamic backend number first, then falls back to `VITE_WHATSAPP_NUMBER` or `VITE_WHATSAPP_URL`.
 */
export function getWhatsAppSupportUrl(message?: string): string {
  const dynamicNum = currentWhatsAppNumber?.replace(/[^\d]/g, '')
  if (dynamicNum) {
    const base = `https://wa.me/${dynamicNum}`
    if (message) {
      const separator = base.includes('?') ? '&' : '?'
      return `${base}${separator}text=${encodeURIComponent(message)}`
    }
    return base
  }

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

/**
 * React hook to get a reactive WhatsApp support URL that automatically updates
 * when settings change or are fetched from the backend.
 */
export function useWhatsAppSupportUrl(message?: string): string {
  const [, setNumber] = useState<string | null>(currentWhatsAppNumber)

  useEffect(() => {
    const onUpdate: Listener = (num) => setNumber(num)
    listeners.add(onUpdate)
    return () => {
      listeners.delete(onUpdate)
    }
  }, [])

  return getWhatsAppSupportUrl(message)
}
