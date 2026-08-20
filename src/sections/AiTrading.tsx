import { AI_TRADING } from '../data'
import { MarketScanArt } from '../art'
import { CardGrid } from '../components/CardGrid'
import { SectionHead } from '../components/SectionHead'
import { useReveal } from '../useReveal'

export function AiTrading() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section className="section" id="features">
      <div className="shell">
        <div className="split reveal" ref={ref}>
          <SectionHead
            badge={AI_TRADING.badge}
            heading={AI_TRADING.heading}
            body={AI_TRADING.body}
          />
          <figure className="split-art">
            <MarketScanArt />
            <figcaption>
              How a scan reads price action — schematic, not a recorded trade.
            </figcaption>
          </figure>
        </div>

        <CardGrid items={AI_TRADING.cards} />
      </div>
    </section>
  )
}
