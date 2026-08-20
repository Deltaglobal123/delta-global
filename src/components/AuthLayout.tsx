import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CheckIcon, LogoMark } from '../icons'

export type AuthPoint = { title: string; body: string }

/**
 * Both entry screens share a shape: a marketing rail that explains what the
 * account is for, and a form card. Below 900px the rail collapses to the brand
 * so the form gets the whole screen.
 */
export function AuthLayout({
  eyebrow,
  title,
  lead,
  headline,
  points,
  wide,
  children,
  footer,
}: {
  eyebrow: string
  title: string
  lead: string
  headline: string
  points: AuthPoint[]
  wide?: boolean
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <main className="auth-page">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />

      <div className={`auth-shell${wide ? ' is-wide' : ''}`}>
        <aside className="auth-aside">
          <Link className="brand auth-brand" to="/">
            <LogoMark />
            <span className="brand-text">
              Delta <span>Global</span>
            </span>
          </Link>

          <h2 className="auth-headline">{headline}</h2>

          <ul className="auth-points">
            {points.map((point) => (
              <li key={point.title}>
                <CheckIcon />
                <div>
                  <strong>{point.title}</strong>
                  <p>{point.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="auth-disclaimer">
            Trading carries risk. Read the{' '}
            <Link to="/legal/risk-disclosure">risk disclosure</Link> before you
            begin.
          </p>
        </aside>

        <div className="auth-card">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p className="auth-lead">{lead}</p>

          {children}

          <div className="auth-foot">{footer}</div>
        </div>
      </div>
    </main>
  )
}
