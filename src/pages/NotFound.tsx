import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'

export function NotFound() {
  return (
    <>
      <PageHeader
        eyebrow="404"
        title="Page not found"
        lead="That link does not lead anywhere. Try one of these instead."
      />
      <section className="section">
        <div className="shell notfound-actions">
          <Link className="btn btn-primary" to="/">
            Back to home
          </Link>
          <Link className="btn btn-ghost" to="/pricing">
            See pricing
          </Link>
          <Link className="btn btn-ghost" to="/contact">
            Contact us
          </Link>
        </div>
      </section>
    </>
  )
}
