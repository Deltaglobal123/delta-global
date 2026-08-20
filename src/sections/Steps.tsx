import type { CSSProperties } from 'react'
import { STEPS, STEPS_INTRO } from '../data'
import { SectionHead } from '../components/SectionHead'
import { useReveal } from '../useReveal'

function Step({
  step,
  index,
}: {
  step: (typeof STEPS)[number]
  index: number
}) {
  const ref = useReveal<HTMLLIElement>()

  return (
    <li
      ref={ref}
      className="step reveal"
      style={{ '--delay': `${index * 80}ms` } as CSSProperties}
    >
      <span className="step-n">{step.n}</span>
      <h3>{step.title}</h3>
      <p>{step.body}</p>
    </li>
  )
}

export function Steps() {
  return (
    <section className="section steps-section band" id="how-it-works">
      <div className="shell">
        <SectionHead
          badge={STEPS_INTRO.badge}
          heading={STEPS_INTRO.heading}
          body={STEPS_INTRO.body}
        />

        <ol className="steps">
          {STEPS.map((step, i) => (
            <Step key={step.n} step={step} index={i} />
          ))}
        </ol>
      </div>
    </section>
  )
}
