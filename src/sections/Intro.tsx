import { INTRO } from '../data'
import { CardGrid } from '../components/CardGrid'
import { SectionHead } from '../components/SectionHead'

export function Intro() {
  return (
    <section className="section">
      <div className="shell">
        <SectionHead
          badge={INTRO.badge}
          heading={INTRO.heading}
          body={INTRO.body}
        />
        <CardGrid items={INTRO.cards} min={280} />
      </div>
    </section>
  )
}
