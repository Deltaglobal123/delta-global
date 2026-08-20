import type { CSSProperties } from 'react'
import { PERFORMANCE } from '../data'
import { DrawdownArt } from '../art'
import { SectionHead } from '../components/SectionHead'
import { Placeholder } from '../components/Placeholder'
import { useReveal } from '../useReveal'

function Metric({
  metric,
  index,
}: {
  metric: (typeof PERFORMANCE.metrics)[number]
  index: number
}) {
  const ref = useReveal<HTMLLIElement>()

  return (
    <li
      ref={ref}
      className="metric reveal"
      style={{ '--delay': `${index * 70}ms` } as CSSProperties}
    >
      <h3>{metric.title}</h3>
      <p>{metric.body}</p>
    </li>
  )
}

export function Performance() {
  return (
    <section className="section">
      <div className="shell">
        <SectionHead
          badge={PERFORMANCE.badge}
          heading={PERFORMANCE.heading}
          body={PERFORMANCE.body}
        />

        <figure className="art-frame">
          <DrawdownArt />
          <figcaption>
            What "drawdown" means: the decline from a peak before a new high is
            made. Diagram only — no account is represented.
          </figcaption>
        </figure>

        <ul className="metrics">
          {PERFORMANCE.metrics.map((metric, i) => (
            <Metric key={metric.title} metric={metric} index={i} />
          ))}
        </ul>

        <Placeholder
          label="Actual performance figures"
          hint="These five metrics are definitions, not results. Publish a real number against each only with its methodology, timeframe, instrument set, fee treatment and whether it is live or backtested stated alongside it."
        />

        <p className="disclaimer-note">{PERFORMANCE.disclaimer}</p>
      </div>
    </section>
  )
}
