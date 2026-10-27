import { Link } from 'react-router-dom'
import { CONTACT, COPYRIGHT, FOOTER } from '../data'
import { LogoMark } from '../icons'
import { useWhatsAppSupportUrl } from '../lib/support'

export function Footer() {
  const whatsappUrl = useWhatsAppSupportUrl()

  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-top">
          <div className="footer-brand">
            <Link className="brand" to="/">
              <LogoMark />
              <span className="brand-text">
                Delta <span>Global</span>
              </span>
            </Link>
            <p className="footer-blurb">{FOOTER.blurb}</p>
            <address className="footer-address">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                width="14"
                height="14"
                aria-hidden="true"
                className="footer-pin"
              >
                <path d="M12 21s-7-6.686-7-11.5a7 7 0 1 1 14 0C19 14.314 12 21 12 21z" />
                <circle cx="12" cy="9.5" r="2.5" />
              </svg>
              {FOOTER.address}
            </address>
          </div>

          {FOOTER.columns.map((column) => (
            <nav
              className="footer-col"
              aria-label={column.title}
              key={column.title}
            >
              <h2>{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="footer-col">
            <h2>Contact</h2>
            <ul>
              {CONTACT.email && (
                <li>
                  <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                </li>
              )}
              {CONTACT.phone && (
                <li>
                  <a href={`tel:${CONTACT.phone.replace(/[^+0-9]/g, '')}`}>
                    {CONTACT.phone}
                  </a>
                </li>
              )}
              <li>
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  WhatsApp support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-disclaimer">
            <strong>Risk disclosure:</strong> {FOOTER.disclaimer}
          </p>
          <p className="copyright">{COPYRIGHT}</p>
        </div>
      </div>
    </footer>
  )
}
