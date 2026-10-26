import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { PLANS, type Plan } from '../data'
import { ArrowIcon, CheckIcon } from '../icons'
import { useReveal } from '../useReveal'

function PlanCard({
  plan,
  index,
  showBadge,
}: {
  plan: Plan
  index: number
  showBadge: boolean
}) {
  const ref = useReveal<HTMLElement>()

  return (
    <article
      ref={ref}
      className={`plan reveal${plan.featured ? ' is-featured' : ''}`}
      style={{ '--delay': `${index * 90}ms` } as CSSProperties}
    >
      {showBadge && <span className="plan-badge">Most popular</span>}

      <header className="plan-head">
        <span className="plan-bonus-badge">100% bonus on first deposit</span>
        <h3 className="plan-name">{plan.name}</h3>
        <p className="plan-tagline">{plan.tagline}</p>
      </header>

      <p className="plan-price">
        <span className="currency">₹</span>
        <span className="amount">{plan.price}</span>
      </p>

      {plan.total && (
        <p className="plan-total">
          You receive <strong>{plan.total}</strong> in your wallet
          <span className="plan-total-note">
            ₹{plan.price} deposit + ₹{plan.price} bonus · First deposit only · T&amp;C apply
          </span>
        </p>
      )}

      <Link
        className={`btn ${plan.featured ? 'btn-primary' : 'btn-ghost'} plan-cta`}
        // Straight to the deposit screen with this plan chosen. A signed-out
        // visitor is sent to /login first and lands back there.
        to={`/app/deposit?plan=${plan.id}`}
      >
        Start now
        <ArrowIcon />
      </Link>

      <ul className="plan-features">
        {plan.features.map((feature) => (
          <li key={feature}>
            <CheckIcon />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

export function Plans() {
  // "Most popular" only means something when there is something to be popular
  // against, so the badge is suppressed while a single plan is on sale.
  const single = PLANS.length === 1

  return (
    <div className={`plans${single ? ' is-single' : ''}`}>
      {PLANS.map((plan, i) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          index={i}
          showBadge={Boolean(plan.featured) && !single}
        />
      ))}
    </div>
  )
}
