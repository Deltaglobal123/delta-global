import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { STRATEGIES, type Strategy } from '../data'
import { StrategyShape } from '../art'
import { ArrowIcon } from '../icons'
import { SectionHead } from '../components/SectionHead'
import { useReveal } from '../useReveal'

function StrategyCard({
  strategy,
  index,
}: {
  strategy: Strategy
  index: number
}) {
  const ref = useReveal<HTMLLIElement>()

  return (
    <li
      ref={ref}
      className="strategy reveal"
      style={{ '--delay': `${index * 80}ms` } as CSSProperties}
    >
      <StrategyShape id={strategy.id} />
      <h3>{strategy.name}</h3>
      <p className="strategy-body">{strategy.body}</p>

      <dl className="strategy-meta">
        <div>
          <dt>Best for</dt>
          <dd>{strategy.bestFor}</dd>
        </div>
        <div>
          <dt>Risk</dt>
          <dd>{strategy.risk}</dd>
        </div>
      </dl>

      <Link
        className="btn btn-ghost btn-sm strategy-cta"
        to={`/get-started?strategy=${strategy.id}`}
      >
        {strategy.cta}
        <ArrowIcon />
      </Link>
    </li>
  )
}

export function Strategies() {
  return (
    <section className="section" id="strategies">
      <div className="shell">
        <SectionHead
          badge={STRATEGIES.badge}
          heading={STRATEGIES.heading}
          body={STRATEGIES.body}
        />

        <ul className="strategies">
          {STRATEGIES.items.map((strategy, i) => (
            <StrategyCard key={strategy.id} strategy={strategy} index={i} />
          ))}
        </ul>

        <p className="section-foot section-note">
          Every strategy carries market risk. Review the methodology and the
          potential downside before activating one.
        </p>
      </div>
    </section>
  )
}
