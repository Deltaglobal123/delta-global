import { WHY_US } from '../data'
import { CardGrid } from '../components/CardGrid'
import { SectionHead } from '../components/SectionHead'

export function WhyUs() {
  return (
    <section className="section band">
      <div className="shell">
        <SectionHead
          badge={WHY_US.badge}
          heading={WHY_US.heading}
          body={WHY_US.body}
        />
        <CardGrid items={WHY_US.cards} />
      </div>
    </section>
  )
}
