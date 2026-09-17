import { Link } from 'react-router-dom'
import { CONTACT } from '../data'
import { PageHeader } from '../components/PageHeader'
import { Placeholder } from '../components/Placeholder'

const DETAILS = [
  { label: 'Email', value: CONTACT.email, href: CONTACT.email ? `mailto:${CONTACT.email}` : '' },
  {
    label: 'Phone',
    value: CONTACT.phone,
    href: CONTACT.phone ? `tel:${CONTACT.phone.replace(/[^+0-9]/g, '')}` : '',
  },
  { label: 'Registered address', value: CONTACT.address, href: '' },
].filter((item) => item.value)

/** Which details the deployment has not supplied yet, for the reviewer note. */
const MISSING = (
  [
    ['a support email', CONTACT.email],
    ['a phone number', CONTACT.phone],
    ['the registered office address', CONTACT.address],
  ] as const
)
  .filter(([, value]) => !value)
  .map(([label]) => label)

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
                <dd>
                  {item.href ? (
                    <a href={item.href}>{item.value}</a>
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="contact-side">
            {MISSING.length > 0 && (
              <Placeholder
                label="Missing contact details"
                hint={`Still to be set in the deployment environment: ${MISSING.join(', ')}. A finance site without these reads as untrustworthy — and in India the address and CIN are required disclosures.`}
              />
            )}

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
