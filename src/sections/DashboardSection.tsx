import { DASHBOARD } from '../data'
import { DashboardArt } from '../art'
import { CardGrid } from '../components/CardGrid'
import { SectionHead } from '../components/SectionHead'
import { useReveal } from '../useReveal'

export function DashboardSection() {
  const ref = useReveal<HTMLElement>()

  return (
    <section className="section band" id="dashboard">
      <div className="shell">
        <SectionHead
          badge={DASHBOARD.badge}
          heading={DASHBOARD.heading}
          body={DASHBOARD.body}
        />

        <figure className="art-frame reveal" ref={ref}>
          <DashboardArt />
          <figcaption>
            Illustrative interface preview. Values appear once you are signed in.
          </figcaption>
        </figure>

        <CardGrid items={DASHBOARD.cards} />
      </div>
    </section>
  )
}
