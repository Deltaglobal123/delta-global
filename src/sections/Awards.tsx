import type { CSSProperties } from 'react'
import { AWARDS, AWARDS_INTRO } from '../data'
import { useReveal } from '../useReveal'

function AwardCard({
  award,
  index,
}: {
  award: (typeof AWARDS)[number]
  index: number
}) {
  const ref = useReveal<HTMLLIElement>()

  return (
    <li
      ref={ref}
      className="award reveal"
      style={{ '--delay': `${index * 90}ms` } as CSSProperties}
    >
      <div className="award-badge">
        <img src={award.image} alt={award.alt} loading="lazy" width="220" height="220" />
      </div>

      <p className="award-status">
        <span className="award-year">{award.year}</span>
        {award.status} · {award.region}
      </p>
      <h3>{award.category}</h3>
      <p className="award-by">{award.awardedBy}</p>
      <p className="award-note">{award.note}</p>
    </li>
  )
}

export function Awards() {
  return (
    <div className="awards-block">
      <div className="awards-intro">
        <span className="eyebrow">{AWARDS_INTRO.eyebrow}</span>
        <h3>{AWARDS_INTRO.heading}</h3>
        <p>{AWARDS_INTRO.lead}</p>
      </div>

      <ul className="awards">
        {AWARDS.map((award, i) => (
          <AwardCard key={award.id} award={award} index={i} />
        ))}
      </ul>

      <p className="awards-foot">{AWARDS_INTRO.footnote}</p>
    </div>
  )
}
