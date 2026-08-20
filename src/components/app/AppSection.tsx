import type { ReactNode } from 'react'

/** The panel every dashboard block sits in — one border, one heading, one body. */
export function AppSection({
  title,
  aside,
  children,
}: {
  title: string
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="app-panel">
      <div className="app-panel-head">
        <h2>{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}
