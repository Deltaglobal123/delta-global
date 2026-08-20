import { useState } from 'react'
import { FAQS, FAQ_INTRO } from '../data'
import { PlusIcon } from '../icons'
import { useReveal } from '../useReveal'

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const ref = useReveal<HTMLDivElement>()

  return (
    <section className="section faq" id="faq">
      <div className="shell faq-layout">
        <div className="section-head faq-head">
          <span className="eyebrow">{FAQ_INTRO.badge}</span>
          <h2>{FAQ_INTRO.heading}</h2>
          <p>{FAQ_INTRO.body}</p>
        </div>

        <div className="faq-list reveal" ref={ref}>
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div key={item.q} className={`faq-item${isOpen ? ' is-open' : ''}`}>
                <h3>
                  <button
                    type="button"
                    className="faq-trigger"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-trigger-${i}`}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                  >
                    <span>{item.q}</span>
                    <PlusIcon />
                  </button>
                </h3>
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${i}`}
                  className="faq-panel"
                  hidden={!isOpen}
                >
                  <p>{item.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
