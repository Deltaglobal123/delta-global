import { Link } from 'react-router-dom'
import { PRICING_INTRO } from '../data'
import { ArrowIcon } from '../icons'
import { SectionHead } from '../components/SectionHead'
import { Hero } from '../sections/Hero'
import { Intro } from '../sections/Intro'
import { Steps } from '../sections/Steps'
import { AiTrading } from '../sections/AiTrading'
import { DashboardSection } from '../sections/DashboardSection'
import { Strategies } from '../sections/Strategies'
import { WhyUs } from '../sections/WhyUs'
import { Security } from '../sections/Security'
import { Awards } from '../sections/Awards'
import { Performance } from '../sections/Performance'
import { Testimonials } from '../sections/Testimonials'
import { Plans } from '../sections/Plans'
import { Faq } from '../sections/Faq'
import { Responsible } from '../sections/Responsible'
import { CtaBand } from '../sections/CtaBand'

function Proof() {
  return (
    <section className="section band">
      <div className="shell">
        <SectionHead
          badge="Track record"
          heading="Proof, not promises"
          body="Anyone can claim a result. These are the things a prospective client can check for themselves before funding an account."
        />

        <Awards />
      </div>
    </section>
  )
}

function PlansPreview() {
  return (
    <section className="section band">
      <div className="shell">
        <SectionHead
          badge={PRICING_INTRO.badge}
          heading={PRICING_INTRO.heading}
          body={PRICING_INTRO.body}
        />

        <Plans />

        <p className="section-foot">
          <Link className="text-link" to="/pricing">
            See what's included and read the FAQ
            <ArrowIcon />
          </Link>
        </p>
      </div>
    </section>
  )
}

export function Home() {
  return (
    <>
      <Hero />
      {/* Proof sits high: the awards are the first outside verification a
          visitor meets, and they work hardest before the feature tour, not
          after it. */}
      <Proof />
      <Intro />
      <Steps />
      <AiTrading />
      <DashboardSection />
      <Strategies />
      <WhyUs />
      <Security />
      <PlansPreview />
      <Performance />
      <Testimonials />
      <Faq />
      <Responsible />
      <CtaBand />
    </>
  )
}
