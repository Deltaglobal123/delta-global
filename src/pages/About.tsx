import React from 'react'
import { ABOUT, COMPANY_DETAILS, DELTA_OPS_CONTENT, FOUNDER, OPERATING_ENTITY } from '../data'
import { GrowthArt, QuoteIcon } from '../icons'
import { PageHeader } from '../components/PageHeader'
import { CtaBand } from '../sections/CtaBand'
import { useReveal } from '../useReveal'

const DIVISION_ICONS: Record<string, React.ReactNode> = {
  trading: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="28" height="28">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  outsourcing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="28" height="28">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  consultancy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="28" height="28">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 1 0 20M12 2a14.5 14.5 0 0 0 0 20M2 12h20" />
    </svg>
  ),
}

function DeltaOpsContent() {
  return (
    <section className="section dops-section">
      <div className="dops-glow" aria-hidden="true" />
      <div className="shell">

        {/* Intro paragraph */}
        <p className="dops-intro">{DELTA_OPS_CONTENT.intro}</p>

        {/* Core Business Divisions */}
        <div className="dops-divisions-head">
          <span className="eyebrow">Our Core Business Divisions</span>
        </div>

        <div className="dops-divisions">
          {DELTA_OPS_CONTENT.divisions.map((div, i) => (
            <div
              key={div.number}
              className="dops-div-card reveal"
              style={{ '--delay': `${i * 120}ms` } as React.CSSProperties}
            >
              <div className="dops-div-top">
                <span className="dops-div-num">{div.number}</span>
                <div className="dops-div-icon">{DIVISION_ICONS[div.icon]}</div>
              </div>
              <h3 className="dops-div-title">{div.title}</h3>
              <ul className="dops-div-points">
                {div.points.map((pt) => (
                  <li key={pt.label}>
                    <strong>{pt.label}:</strong> {pt.detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Why Delta Operations */}
        <div className="dops-why">
          <h3 className="dops-why-title">{DELTA_OPS_CONTENT.whyTitle}</h3>
          <div className="dops-why-grid">
            {DELTA_OPS_CONTENT.whyPoints.map((pt, i) => (
              <div
                key={pt.label}
                className="dops-why-card reveal"
                style={{ '--delay': `${i * 100}ms` } as React.CSSProperties}
              >
                <div className="dops-why-dot" aria-hidden="true" />
                <div>
                  <strong className="dops-why-label">{pt.label}</strong>
                  <p className="dops-why-detail">{pt.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

function Philosophy() {
  const ref = useReveal<HTMLElement>()
  const artRef = useReveal<HTMLDivElement>()

  return (
    <section className="section about">
      <div className="about-glow" aria-hidden="true" />

      <div className="shell">
        <div className="about-layout">
          <div className="about-intro">
            <span className="eyebrow">{ABOUT.philosophyTitle}</span>
            <h2>What we believe</h2>
            <p className="lead">
              The principles below drive every plan, session and roadmap we
              deliver.
            </p>
          </div>

          <aside className="philosophy reveal" ref={ref}>
            <span className="philosophy-rail" aria-hidden="true" />
            <h3>{ABOUT.philosophyTitle}</h3>
            <p>{ABOUT.philosophy}</p>
          </aside>
        </div>

        <div className="difference reveal" ref={artRef}>
          <h3 className="difference-title">{ABOUT.differenceTitle}</h3>
          <figure className="difference-figure">
            {/* Swap this illustration for the brand photo when one exists. */}
            <GrowthArt />
          </figure>
        </div>
      </div>
    </section>
  )
}

function FounderCard() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section className="section founder">
      <div className="shell">
        <figure className="founder-card reveal" ref={ref}>
          <QuoteIcon />

          <blockquote>{FOUNDER.quote}</blockquote>

          <figcaption className="founder-meta">
            <span className="avatar" aria-hidden="true">
              {FOUNDER.initials}
            </span>
            <span className="founder-id">
              <strong>{FOUNDER.name}</strong>
              <span>{FOUNDER.role}</span>
            </span>
          </figcaption>

          <dl className="founder-stats">
            {FOUNDER.stats.map((stat) => (
              <div key={stat.label}>
                <dt>{stat.value}</dt>
                <dd>{stat.label}</dd>
              </div>
            ))}
          </dl>
        </figure>
      </div>
    </section>
  )
}

function CompanyDetails() {
  const ref = useReveal<HTMLDivElement>()
  return (
    <section className="section co-details">
      <div className="co-details-glow" aria-hidden="true" />
      <div className="shell">
        <div className="section-head">
          <span className="eyebrow">Key Company Details</span>
          <h2>Built on <span className="grad">expertise & trust</span></h2>
          <p>A regulated, venture-backed exchange founded by seasoned professionals from top-tier institutions.</p>
        </div>

        {/* Quick facts */}
        <div className="co-quick-facts reveal" ref={ref}>
          <div className="co-fact-card">
            <span className="co-fact-label">Founded</span>
            <span className="co-fact-value">{COMPANY_DETAILS.founded}</span>
          </div>
          <div className="co-fact-card">
            <span className="co-fact-label">Headquarters</span>
            <span className="co-fact-value">{COMPANY_DETAILS.headquarters}</span>
          </div>
          <div className="co-fact-card">
            <span className="co-fact-label">Investors</span>
            <div className="co-investor-pills">
              {COMPANY_DETAILS.investors.map((inv) => (
                <span key={inv} className="co-investor-pill">{inv}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Founding Team */}
        <div className="co-team-wrap">
          <h3 className="co-sub-heading">Founding Team</h3>
          <div className="co-team-grid">
            {COMPANY_DETAILS.foundingTeam.map((member, i) => (
              <div
                key={member.name}
                className="co-team-card reveal"
                style={{ '--delay': `${i * 100}ms` } as React.CSSProperties}
              >
                <span className="co-team-avatar">{member.initials}</span>
                <div className="co-team-info">
                  <strong className="co-team-name">{member.name}</strong>
                  <span className="co-team-role eyebrow" style={{ fontSize: '11px' }}>{member.role}</span>
                  <p className="co-team-bg">{member.background}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function PlatformOfferings() {
  const ref = useReveal<HTMLDivElement>()
  const indiaRef = useReveal<HTMLDivElement>()
  return (
    <section className="section co-platform">
      <div className="shell">
        <div className="section-head">
          <span className="eyebrow">Platform &amp; Offerings</span>
          <h2>Everything you need to <span className="grad">trade smarter</span></h2>
        </div>

        <div className="co-platform-grid">
          {/* Products column */}
          <div className="co-platform-card reveal" ref={ref}>
            <div className="co-platform-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="28" height="28">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <h3>Products</h3>
            <ul className="co-platform-list">
              {COMPANY_DETAILS.products.map((p) => (
                <li key={p}>
                  <svg className="check" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143z" clipRule="evenodd" />
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Delta Exchange India */}
          <div className="co-platform-card co-india-card reveal" ref={indiaRef}>
            <div className="co-platform-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="28" height="28">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 1 0 20M12 2a14.5 14.5 0 0 0 0 20M2 12h20" />
              </svg>
            </div>
            <h3>{COMPANY_DETAILS.indiaLabel}</h3>
            <p className="co-india-desc">{COMPANY_DETAILS.indiaDescription}</p>
            <div className="co-india-badge">
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1zm3 8V5.5a3 3 0 1 0-6 0V9h6z" clipRule="evenodd" />
              </svg>
              FIU Registered
            </div>
          </div>

          {/* Trading Features */}
          <div className="co-platform-card reveal">
            <div className="co-platform-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="28" height="28">
                <path d="M12 20V10M18 20V4M6 20v-4" />
              </svg>
            </div>
            <h3>Trading Features</h3>
            <ul className="co-platform-list">
              {COMPANY_DETAILS.tradingFeatures.map((f) => (
                <li key={f}>
                  <svg className="check" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143z" clipRule="evenodd" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function OperatingEntity() {
  const ref = useReveal<HTMLDivElement>()
  return (
    <section className="section oe-section">
      <div className="oe-glow" aria-hidden="true" />
      <div className="shell">
        <div className="section-head">
          <span className="eyebrow">Operating Entity</span>
          <h2>Regulated &amp; <span className="grad">Transparent</span></h2>
          <p>Fully registered and compliant with Indian financial regulations.</p>
        </div>

        <div className="oe-card reveal" ref={ref}>
          {/* Entity name + CIN */}
          <div className="oe-top">
            <div className="oe-entity-name">
              <div className="oe-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="26" height="26">
                  <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                </svg>
              </div>
              <div>
                <p className="oe-meta-label">Operating Entity</p>
                <h3 className="oe-name">{OPERATING_ENTITY.name}</h3>
              </div>
            </div>
            <div className="oe-cin-badge">
              <span className="oe-cin-label">CIN</span>
              <span className="oe-cin-value">{OPERATING_ENTITY.cin}</span>
            </div>
          </div>

          <div className="oe-divider" />

          {/* Info grid */}
          <div className="oe-info-grid">
            {/* Address */}
            <div className="oe-info-item">
              <div className="oe-info-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="18" height="18">
                  <path d="M12 21s-7-6.686-7-11.5a7 7 0 1 1 14 0C19 14.314 12 21 12 21z" />
                  <circle cx="12" cy="9.5" r="2.5" />
                </svg>
              </div>
              <div>
                <p className="oe-info-label">Registered Office Address</p>
                <p className="oe-info-value">{OPERATING_ENTITY.address}</p>
              </div>
            </div>

            {/* Regulatory */}
            <div className="oe-info-item">
              <div className="oe-info-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="18" height="18">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <p className="oe-info-label">{OPERATING_ENTITY.regulatoryLabel}</p>
                <p className="oe-info-value">
                  Registered with the <strong>{OPERATING_ENTITY.regulatoryBody}</strong> under registration number{' '}
                  <span className="oe-reg-number">{OPERATING_ENTITY.registrationNumber}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="oe-divider" />

          {/* Leadership */}
          <div>
            <p className="oe-meta-label" style={{ marginBottom: '16px' }}>Founders / Leadership</p>
            <div className="oe-leadership">
              {OPERATING_ENTITY.leadership.map((person) => (
                <div key={person.name} className="oe-leader">
                  <span className="oe-leader-avatar">{person.initials}</span>
                  <div>
                    <strong className="oe-leader-name">{person.name}</strong>
                    <span className="oe-leader-role">{person.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function About() {
  return (
    <>
      <PageHeader
        eyebrow={ABOUT.eyebrow}
        title={ABOUT.heading}
        lead={ABOUT.lead}
      />
      <DeltaOpsContent />
      <Philosophy />
      <CompanyDetails />
      <PlatformOfferings />
      <OperatingEntity />
      <FounderCard />
      <CtaBand />
    </>
  )
}
