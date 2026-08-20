import type { ReactNode } from 'react'

/**
 * A deliberately loud slot for content that needs a real, verifiable fact —
 * testimonials, client numbers, team members, credentials, track record.
 *
 * It is styled to be impossible to ship by accident. Replace each one with real
 * material, or delete the section entirely; do not fill them with sample data.
 */
export function Placeholder({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children?: ReactNode
}) {
  return (
    <div className="placeholder" role="note">
      <span className="placeholder-tag">Needs real content</span>
      <p className="placeholder-label">{label}</p>
      {hint && <p className="placeholder-hint">{hint}</p>}
      {children}
    </div>
  )
}
