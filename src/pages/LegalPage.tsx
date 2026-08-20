import { Link } from 'react-router-dom'
import { LEGAL_LINKS, type LegalDoc } from '../data'
import { PageHeader } from '../components/PageHeader'

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <PageHeader eyebrow="Legal" title={doc.title} lead={doc.intro} />

      <section className="section">
        <div className="shell legal-layout">
          <nav className="legal-nav" aria-label="Legal documents">
            <h2>Documents</h2>
            <ul>
              {LEGAL_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <article className="legal-doc">
            <p className="legal-updated">Last updated {doc.updated}</p>

            <div className="legal-warning" role="note">
              <strong>Draft — not legal advice.</strong> Every bracketed value
              below must be replaced with your real registered detail, and the
              finished text reviewed by a qualified lawyer before this page goes
              live.
            </div>

            {doc.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.body.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </section>
            ))}
          </article>
        </div>
      </section>
    </>
  )
}
