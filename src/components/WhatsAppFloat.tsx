import { useLocation } from 'react-router-dom'
import { useWhatsAppSupportUrl } from '../lib/support'
import { WhatsAppIcon } from './app/app-icons'

type Context = {
  /** Shown beside the button on hover, and read out to screen readers. */
  label: string
  /** Pre-filled in the chat, so support knows where the customer was. */
  message: string
}

const GREETING = 'Hello Delta Global Support,'

/** Most specific first: the first prefix that matches the path wins. */
const CONTEXTS: [string, Context][] = [
  ['/app/deposit', { label: 'Help with adding money', message: `${GREETING} I need help with adding money to my wallet.` }],
  ['/app/withdraw', { label: 'Help with a withdrawal', message: `${GREETING} I need help with a withdrawal.` }],
  ['/app/trading', { label: 'Questions about AI trading', message: `${GREETING} I have a question about my AI trading run.` }],
  ['/app/start', { label: 'Help starting a project', message: `${GREETING} I need help starting a project.` }],
  ['/app/transactions', { label: 'Questions about transactions', message: `${GREETING} I have a question about my transactions.` }],
  ['/app', { label: 'Help with your account', message: `${GREETING} I need help with my account.` }],
  ['/login', { label: 'Trouble signing in?', message: `${GREETING} I need help signing in.` }],
  ['/register', { label: 'Help creating an account', message: `${GREETING} I need help creating an account.` }],
  ['/pricing', { label: 'Questions about plans', message: `${GREETING} I have a question about your plans.` }],
  ['/get-started', { label: 'Help booking a session', message: `${GREETING} I need help booking a session.` }],
]

const FALLBACK: Context = {
  label: 'Chat with us on WhatsApp',
  message: `${GREETING} I would like to know more about Delta Global.`,
}

function contextFor(path: string): Context {
  for (const [prefix, context] of CONTEXTS) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return context
  }
  return FALLBACK
}

/**
 * The WhatsApp button that floats in the corner of every page. Its message
 * follows the page, so a chat opened from the withdrawal screen already says
 * it is about a withdrawal.
 */
export function WhatsAppFloat() {
  const { pathname } = useLocation()
  const context = contextFor(pathname)
  const href = useWhatsAppSupportUrl(context.message)

  return (
    <a
      className="wa-float"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${context.label} — contact support on WhatsApp`}
    >
      <span className="wa-float-label" aria-hidden="true">
        {context.label}
      </span>
      <span className="wa-float-icon">
        <WhatsAppIcon className="wa-float-svg" />
      </span>
    </a>
  )
}
