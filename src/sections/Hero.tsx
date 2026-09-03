import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { HERO, HERO_STATS } from '../data'
import { HeroArt } from '../art'
import { ArrowIcon, CheckIcon } from '../icons'
import { useReveal } from '../useReveal'
import { getWhatsAppSupportUrl } from '../lib/support'

function Stat({
  stat,
  index,
}: {
  stat: (typeof HERO_STATS)[number]
  index: number
}) {
  const ref = useReveal<HTMLLIElement>()

  return (
    <li
      ref={ref}
      className="hero-stat reveal"
      style={{ '--delay': `${index * 90}ms` } as CSSProperties}
    >
      <p className="hero-stat-label">{stat.label}</p>
      <p className="hero-stat-value">{stat.value}</p>
      <p className="hero-stat-body">{stat.body}</p>
    </li>
  )
}

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />

      <div className="shell hero-inner">
        <span className="eyebrow">{HERO.badge}</span>

        <h1 className="hero-title">
          {HERO.title}
          <span className="grad hero-title-grad">{HERO.gradient}</span>
        </h1>

        {HERO.body.map((text) => (
          <p className="hero-sub" key={text}>
            {text}
          </p>
        ))}

        <div className="hero-actions">
          <Link className="btn btn-primary btn-lg" to="/get-started">
            Start trading
            <ArrowIcon />
          </Link>
          <Link className="btn btn-ghost btn-lg" to="/#how-it-works">
            Explore how it works
            <ArrowIcon />
          </Link>
          <a
            className="btn btn-primary btn-lg"
            href={getWhatsAppSupportUrl('Hello Delta Global, I would like to start a project.')}
            target="_blank"
            rel="noopener noreferrer"
          >
            Start project
            <ArrowIcon />
          </a>
        </div>

        <ul className="trust">
          {HERO.trust.map((item) => (
            <li key={item}>
              <CheckIcon />
              {item}
            </li>
          ))}
        </ul>

        <p className="hero-disclaimer">{HERO.disclaimer}</p>

        <figure className="hero-art">
          <HeroArt />
          <figcaption>Illustrative interface preview — not live data.</figcaption>
        </figure>

        <ul className="hero-stats">
          {HERO_STATS.map((stat, i) => (
            <Stat key={stat.label} stat={stat} index={i} />
          ))}
        </ul>
      </div>
    </section>
  )
}
