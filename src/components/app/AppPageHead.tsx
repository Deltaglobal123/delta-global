import type { ReactNode } from 'react'

export function AppPageHead({
  eyebrow,
  title,
  lead,
  actions,
}: {
  eyebrow: string
  title: string
  lead?: string
  actions?: ReactNode
}) {
  return (
    <header className="app-page-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {lead && <p className="app-lead">{lead}</p>}
      </div>
      {actions && <div className="app-page-actions">{actions}</div>}
    </header>
  )
}
