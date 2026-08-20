import { SECURITY } from '../data'
import { CardGrid } from '../components/CardGrid'
import { SectionHead } from '../components/SectionHead'

export function Security() {
  return (
    <section className="section">
      <div className="shell">
        <SectionHead
          badge={SECURITY.badge}
          heading={SECURITY.heading}
          body={SECURITY.body}
        />
        <CardGrid items={SECURITY.cards} min={230} />
      </div>
    </section>
  )
}
