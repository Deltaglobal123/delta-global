import { Link } from 'react-router-dom'
import { HERO, PLANS, PRICING_INTRO } from '../data'
import { CheckIcon } from '../icons'
import { PageHeader } from '../components/PageHeader'
import { Plans } from '../sections/Plans'
import { Faq } from '../sections/Faq'
import { CtaBand } from '../sections/CtaBand'
import { useReveal } from '../useReveal'

/**
 * One entry per plan, in PLANS order. Rows are rendered by walking PLANS rather
 * than `values`, so a shorter or longer plan list degrades to "—" instead of
 * throwing.
 */
const COMPARISON = [
  { label: 'Trading time period', values: ['60 min'] },
  { label: 'Loss cover', values: ['100%'] },
  { label: 'Personalized career roadmap', values: ['Included'] },
]

function Comparison() {
  const ref = useReveal<HTMLDivElement>()

  // A side-by-side table needs at least two sides.
  if (PLANS.length < 2) return null

  return (
    <section className="section">
      <div className="shell">
        <div className="section-head">
          <span className="eyebrow">Compare</span>
          <h2>Plans side by side</h2>
        </div>

        <div className="table-wrap reveal" ref={ref}>
          <table className="compare">
            <caption className="sr-only">
              Feature comparison across the {PLANS.map((p) => p.name).join(', ')}{' '}
              plans
            </caption>
            <thead>
              <tr>
                <th scope="col">Feature</th>
                {PLANS.map((plan) => (
                  <th key={plan.id} scope="col">
                    {plan.name}
                    <span className="compare-price">₹{plan.price}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {PLANS.map((plan, i) => (
                    <td key={plan.id}>{row.values[i] ?? '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="section-foot">
          <Link className="text-link" to="/legal/risk-disclosure">
            Read the risk disclosure before purchasing
          </Link>
        </p>
      </div>
    </section>
  )
}

export function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow={PRICING_INTRO.badge}
        title={PRICING_INTRO.heading}
        lead={PRICING_INTRO.body}
      >
        <ul className="trust">
          {HERO.trust.map((item) => (
            <li key={item}>
              <CheckIcon />
              {item}
            </li>
          ))}
        </ul>
      </PageHeader>

      <section className="section pricing">
        <div className="shell">
          <Plans />
        </div>
      </section>

      <Comparison />
      <Faq />
      <CtaBand />
    </>
  )
}
