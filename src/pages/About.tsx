import { ABOUT, FOUNDER } from '../data'
import { GrowthArt, QuoteIcon } from '../icons'
import { PageHeader } from '../components/PageHeader'
import { Placeholder } from '../components/Placeholder'
import { CtaBand } from '../sections/CtaBand'
import { useReveal } from '../useReveal'

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

function Team() {
  return (
    <section className="section">
      <div className="shell">
        <div className="section-head">
          <span className="eyebrow">The team</span>
          <h2>The people behind the work</h2>
          <p>
            "A group of career strategists, coaches, and industry professionals"
            — this section should name them.
          </p>
        </div>

        <div className="proof-grid">
          <Placeholder
            label="Team members"
            hint="Name, role, photo and a one-line background for each person. Link their LinkedIn so a visitor can verify them."
          />
          <Placeholder
            label="Company facts"
            hint="Registered entity name, incorporation date, CIN, office address, headcount."
          />
          <Placeholder
            label="Licences and memberships"
            hint="Any regulatory registration, exchange membership or professional body. Include the registration numbers."
          />
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

          <Placeholder
            label="Verify this attribution before launch"
            hint="This card names a real public figure as a co-founder of Delta Global Operations. Publish it only with documented authorisation from him; otherwise remove the section."
          />
        </figure>
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
      <Philosophy />
      <Team />
      <FounderCard />
      <CtaBand />
    </>
  )
}
