import { Link } from 'react-router-dom'
import { CTA } from '../data'
import { ArrowIcon } from '../icons'
import { useReveal } from '../useReveal'

export function CtaBand() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section className="section cta-section">
      <div className="shell">
        <div className="cta-band reveal" ref={ref}>
          <div className="cta-glow" aria-hidden="true" />
          <span className="eyebrow">{CTA.badge}</span>
          <h2>{CTA.heading}</h2>
          <p className="cta-body">{CTA.body}</p>

          <div className="cta-actions">
            <Link className="btn btn-primary btn-lg" to="/get-started">
              {CTA.button}
              <ArrowIcon />
            </Link>
            <Link className="btn btn-ghost btn-lg" to="/#features">
              {CTA.secondary}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
