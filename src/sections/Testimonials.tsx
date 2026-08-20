import { TESTIMONIALS } from '../data'
import { QuoteIcon } from '../icons'
import { SectionHead } from '../components/SectionHead'
import { Placeholder } from '../components/Placeholder'

/**
 * Deliberately shipped empty. The content brief is explicit that only real,
 * consented customer quotes go here, so the section shows the shape a quote will
 * take and nothing that could be mistaken for one.
 */
export function Testimonials() {
  return (
    <section className="section band">
      <div className="shell">
        <SectionHead
          badge={TESTIMONIALS.badge}
          heading={TESTIMONIALS.heading}
          body={TESTIMONIALS.body}
        />

        <Placeholder
          label="Customer quotes"
          hint="Written permission to be quoted, and a real attribution — first name and city is enough. Do not publish an invented name, a stock photo or a quote you wrote yourself."
        >
          <figure className="quote-shape" aria-hidden="true">
            <QuoteIcon />
            <blockquote>
              “The dashboard makes it much easier for me to track my strategies
              and understand what's happening with my account.”
            </blockquote>
            <figcaption>— Customer name, city</figcaption>
          </figure>
        </Placeholder>
      </div>
    </section>
  )
}
