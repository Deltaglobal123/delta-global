import React from 'react'
import { Link } from 'react-router-dom'
import { DELTA_OPS_CONTENT } from '../data'
import { useReveal } from '../useReveal'

const DIVISION_ICONS: Record<string, React.ReactNode> = {
  trading: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="26" height="26">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  outsourcing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="26" height="26">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  consultancy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="26" height="26">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 1 0 20M12 2a14.5 14.5 0 0 0 0 20M2 12h20" />
    </svg>
  ),
}

export function DeltaOps() {
  const introRef = useReveal<HTMLParagraphElement>()

  return (
    <section id="delta-ops" className="section dops-home-section">
      <div className="dops-home-glow" aria-hidden="true" />

      <div className="shell">

        {/* Section header */}
        <div className="dops-home-head">
          <span className="eyebrow">What We Do</span>
          <h2 className="dops-home-title">
            Delta Operations —{' '}
            <span className="grad">Global AI Innovation,</span>
            <br className="dops-home-br" />
            Trading Models &amp; Enterprise Solutions
          </h2>
          <p className="dops-home-lead reveal" ref={introRef}>
            {DELTA_OPS_CONTENT.intro}
          </p>
        </div>

        {/* Core Business Divisions */}
        <div className="dops-home-eyebrow-row">
          <span className="eyebrow">Our Core Business Divisions</span>
        </div>

        <div className="dops-home-divisions">
          {DELTA_OPS_CONTENT.divisions.map((div, i) => (
            <div
              key={div.number}
              className="dops-home-card reveal"
              style={{ '--delay': `${i * 120}ms` } as React.CSSProperties}
            >
              <div className="dops-home-card-top">
                <span className="dops-home-num">{div.number}</span>
                <div className="dops-home-icon">{DIVISION_ICONS[div.icon]}</div>
              </div>
              <h3 className="dops-home-card-title">{div.title}</h3>
              <ul className="dops-home-points">
                {div.points.map((pt) => (
                  <li key={pt.label}>
                    <strong>{pt.label}:</strong> {pt.detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Why Delta Operations strip */}
        <div className="dops-home-why">
          <h3 className="dops-home-why-title">{DELTA_OPS_CONTENT.whyTitle}</h3>
          <div className="dops-home-why-grid">
            {DELTA_OPS_CONTENT.whyPoints.map((pt, i) => (
              <div
                key={pt.label}
                className="dops-home-why-card reveal"
                style={{ '--delay': `${i * 100}ms` } as React.CSSProperties}
              >
                <div className="dops-home-why-dot" aria-hidden="true" />
                <div>
                  <strong className="dops-home-why-label">{pt.label}</strong>
                  <p className="dops-home-why-detail">{pt.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA link to About page */}
          <div className="dops-home-cta">
            <Link to="/about" className="btn btn-ghost btn-sm">
              Learn more about us
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" className="arrow" aria-hidden="true">
                <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
