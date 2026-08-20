import type { CSSProperties } from 'react'
import type { Card } from '../data'
import { useReveal } from '../useReveal'

function GridCard({ card, index }: { card: Card; index: number }) {
  const ref = useReveal<HTMLLIElement>()

  return (
    <li
      ref={ref}
      className="card reveal"
      style={{ '--delay': `${index * 70}ms` } as CSSProperties}
    >
      <span className="card-dot" aria-hidden="true" />
      <h3>{card.title}</h3>
      <p>{card.body}</p>
    </li>
  )
}

/**
 * Shared card grid for the feature-style sections. `min` sets the column width
 * the auto-fit grid breaks at, which is how a 3-card and a 6-card section end up
 * with different densities from the same component.
 */
export function CardGrid({ items, min = 260 }: { items: Card[]; min?: number }) {
  return (
    <ul className="cards" style={{ '--card-min': `${min}px` } as CSSProperties}>
      {items.map((card, i) => (
        <GridCard key={card.title} card={card} index={i} />
      ))}
    </ul>
  )
}
