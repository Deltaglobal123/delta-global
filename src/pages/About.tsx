import { ABOUT, FOUNDER } from '../data'
import { GrowthArt, QuoteIcon } from '../icons'
import { PageHeader } from '../components/PageHeader'
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

export function About() {
  return (
    <>
      <PageHeader
        eyebrow={ABOUT.eyebrow}
        title={ABOUT.heading}
        lead={ABOUT.lead}
      />
      <Philosophy />
      <FounderCard />
      <CtaBand />
    </>
  )
}
