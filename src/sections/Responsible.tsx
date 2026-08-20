import { Link } from 'react-router-dom'
import { RESPONSIBLE } from '../data'
import { ArrowIcon } from '../icons'
import { useReveal } from '../useReveal'

export function Responsible() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section className="section">
      <div className="shell">
        <div className="responsible reveal" ref={ref}>
          <span className="eyebrow eyebrow-warn">{RESPONSIBLE.badge}</span>
          <h2>{RESPONSIBLE.heading}</h2>

          {RESPONSIBLE.body.map((text) => (
            <p key={text}>{text}</p>
          ))}

          <Link
            className="btn btn-ghost responsible-cta"
            to="/legal/risk-disclosure"
          >
            {RESPONSIBLE.cta}
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  )
}
