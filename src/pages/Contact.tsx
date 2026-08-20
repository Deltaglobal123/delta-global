import { Link } from 'react-router-dom'
import { CONTACT } from '../data'
import { PageHeader } from '../components/PageHeader'
import { Placeholder } from '../components/Placeholder'

const DETAILS = [
  { label: 'Email', value: CONTACT.email },
  { label: 'Phone', value: CONTACT.phone },
  { label: 'Hours', value: CONTACT.hours },
  { label: 'Registered address', value: CONTACT.address },
]

export function Contact() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Talk to us"
        lead="Questions about a plan, a payment or a complaint — here is how to reach a person."
      />

      <section className="section">
        <div className="shell contact-layout">
          <dl className="contact-details">
            {DETAILS.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>

          <div className="contact-side">
            <Placeholder
              label="Real contact details"
              hint="A working email, a phone number someone answers, opening hours, and the registered office address. A finance site without these reads as untrustworthy — and in India the address and CIN are required disclosures."
            />

            <div className="note-card">
              <h2>Complaints</h2>
              <p>
                If something has gone wrong, write to the grievance officer named
                in the{' '}
                <Link to="/legal/risk-disclosure">risk disclosure</Link>. You
                should receive an acknowledgement within the stated window.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
