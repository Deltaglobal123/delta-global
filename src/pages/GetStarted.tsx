import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PLANS, STEPS } from '../data'
import { ArrowIcon, CheckIcon } from '../icons'
import { PageHeader } from '../components/PageHeader'

type Fields = {
  name: string
  email: string
  phone: string
  plan: string
  message: string
  consent: boolean
}

type Errors = Partial<Record<keyof Fields, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^[+\d][\d\s-]{7,15}$/

function validate(fields: Fields): Errors {
  const errors: Errors = {}

  if (!fields.name.trim()) errors.name = 'Enter your name.'
  if (!fields.email.trim()) errors.email = 'Enter your email address.'
  else if (!EMAIL_RE.test(fields.email.trim()))
    errors.email = 'That email address does not look right.'
  if (!fields.phone.trim()) errors.phone = 'Enter a phone number.'
  else if (!PHONE_RE.test(fields.phone.trim()))
    errors.phone = 'Enter a valid phone number.'
  if (!fields.plan) errors.plan = 'Select a plan.'
  if (!fields.consent)
    errors.consent = 'Please confirm you have read the risk disclosure.'

  return errors
}

export function GetStarted() {
  const [params] = useSearchParams()
  const planFromUrl = params.get('plan') ?? ''

  const [fields, setFields] = useState<Fields>({
    name: '',
    email: '',
    phone: '',
    plan: PLANS.some((p) => p.id === planFromUrl) ? planFromUrl : '',
    message: '',
    consent: false,
  })
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = validate(fields)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      const first = document.querySelector<HTMLElement>('[aria-invalid="true"]')
      first?.focus()
      return
    }

    // TODO: POST `fields` to your booking endpoint / CRM here.
    setSent(true)
  }

  if (sent) {
    return (
      <>
        <PageHeader eyebrow="Get started" title="Request received" />
        <section className="section">
          <div className="shell">
            <div className="sent-card">
              <span className="sent-icon" aria-hidden="true">
                <CheckIcon />
              </span>
              <h2>Thanks, {fields.name.split(' ')[0]}.</h2>
              <p>
                Your request has been captured in the browser. Wire this form to
                your booking endpoint to actually deliver it — nothing has been
                sent yet.
              </p>
              <Link className="btn btn-ghost" to="/">
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="Get started"
        title="Book your first session"
        lead="Tell us which plan fits and how to reach you. We will confirm a time for your session."
      />

      <section className="section">
        <div className="shell form-layout">
          <form className="form-card" onSubmit={onSubmit} noValidate>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                value={fields.name}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'name-error' : undefined}
                onChange={(e) => set('name', e.target.value)}
              />
              {errors.name && (
                <p className="field-error" id="name-error">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={fields.email}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  onChange={(e) => set('email', e.target.value)}
                />
                {errors.email && (
                  <p className="field-error" id="email-error">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={fields.phone}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                  onChange={(e) => set('phone', e.target.value)}
                />
                {errors.phone && (
                  <p className="field-error" id="phone-error">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="field">
              <label htmlFor="plan">Plan</label>
              <select
                id="plan"
                name="plan"
                value={fields.plan}
                aria-invalid={Boolean(errors.plan)}
                aria-describedby={errors.plan ? 'plan-error' : undefined}
                onChange={(e) => set('plan', e.target.value)}
              >
                <option value="">Select a plan…</option>
                {PLANS.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} — ₹{plan.price}
                  </option>
                ))}
              </select>
              {errors.plan && (
                <p className="field-error" id="plan-error">
                  {errors.plan}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="message">
                Anything we should know <span className="optional">optional</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={fields.message}
                onChange={(e) => set('message', e.target.value)}
              />
            </div>

            <div className="field">
              <label className="checkbox" htmlFor="consent">
                <input
                  id="consent"
                  name="consent"
                  type="checkbox"
                  checked={fields.consent}
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby={errors.consent ? 'consent-error' : undefined}
                  onChange={(e) => set('consent', e.target.checked)}
                />
                <span>
                  I have read the{' '}
                  <Link to="/legal/risk-disclosure">risk disclosure</Link> and
                  the <Link to="/legal/terms">terms of service</Link>.
                </span>
              </label>
              {errors.consent && (
                <p className="field-error" id="consent-error">
                  {errors.consent}
                </p>
              )}
            </div>

            <button className="btn btn-primary btn-lg" type="submit">
              Request my session
              <ArrowIcon />
            </button>
          </form>

          <aside className="form-aside">
            <h2>What happens next</h2>
            <ol className="mini-steps">
              {STEPS.map((step) => (
                <li key={step.n}>
                  <span className="step-n">{step.n}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>
    </>
  )
}
