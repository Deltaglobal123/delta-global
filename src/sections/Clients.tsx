import type { CSSProperties } from 'react'
import { CLIENTS, CLIENTS_INTRO } from '../data'

function ClientLogos({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="clients-row" aria-hidden={hidden || undefined}>
      {CLIENTS.map((client) => (
        <li
          key={client.name}
          className="client"
          style={{ '--brand': client.color } as CSSProperties}
        >
          {client.logo ? (
            <img src={client.logo} alt={hidden ? '' : client.name} loading="lazy" />
          ) : (
            <span className="client-mark">{client.name}</span>
          )}
        </li>
      ))}
    </ul>
  )
}

export function Clients() {
  return (
    <section className="clients" aria-labelledby="clients-heading">
      <div className="shell">
        <div className="clients-head">
          <span className="eyebrow">{CLIENTS_INTRO.eyebrow}</span>
          <h2 id="clients-heading">{CLIENTS_INTRO.heading}</h2>
        </div>
      </div>

      {/* The list is rendered twice so the marquee can loop seamlessly; the
          copy is hidden from assistive tech. */}
      <div className="clients-marquee">
        <div className="clients-track">
          <ClientLogos />
          <ClientLogos hidden />
        </div>
      </div>
    </section>
  )
}
