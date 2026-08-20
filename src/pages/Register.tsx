import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../lib/api'
import { useAuth } from '../lib/auth-context'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { AuthLayout, type AuthPoint } from '../components/AuthLayout'
import { PasswordField } from '../components/PasswordField'

const ADMIN_URL = import.meta.env.VITE_ADMIN_URL ?? 'http://localhost/login'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MOBILE_RE = /^\+?\d{10,20}$/

const POINTS: AuthPoint[] = [
  {
    title: 'Your wallet is ready instantly',
    body: 'Sign up and the wallet exists — no waiting, no second form.',
  },
  {
    title: 'Top up over UPI',
    body: 'Scan the QR, pay from any UPI app, and tell us the reference.',
  },
  {
    title: 'Withdraw straight to UPI',
    body: 'Request a payout and the money is on hold until it reaches you.',
  },
]

type Fields = {
  name: string
  email: string
  mobile_number: string
  password: string
  password_confirmation: string
}

type Errors = Partial<Record<keyof Fields, string>>

const EMPTY: Fields = {
  name: '',
  email: '',
  mobile_number: '',
  password: '',
  password_confirmation: '',
}

/** Mirrors the API's rules so a mistake shows up before a round trip. */
function validate(fields: Fields): Errors {
  const errors: Errors = {}

  if (!fields.name.trim()) errors.name = 'Enter your name.'
  if (!fields.email.trim()) errors.email = 'Enter your email address.'
  else if (!EMAIL_RE.test(fields.email.trim()))
    errors.email = 'That email address does not look right.'
  if (!fields.mobile_number.trim())
    errors.mobile_number = 'Enter your mobile number.'
  else if (!MOBILE_RE.test(fields.mobile_number.replace(/[\s-]/g, '')))
    errors.mobile_number = 'Use 10 to 20 digits, with an optional leading +.'
  if (fields.password.length < 8) errors.password = 'Use at least 8 characters.'
  if (fields.password !== fields.password_confirmation)
    errors.password_confirmation = 'Both passwords must match.'

  return errors
}

/** Four coarse buckets — enough to nudge, not enough to pretend it is a score. */
function strengthOf(password: string): { level: number; label: string } {
  if (!password) return { level: 0, label: '' }

  let level = 0
  if (password.length >= 8) level += 1
  if (password.length >= 12) level += 1
  if (/[^a-zA-Z0-9]/.test(password) || (/[a-z]/.test(password) && /[A-Z]/.test(password)))
    level += 1
  if (/\d/.test(password) && password.length >= 10) level += 1

  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']
  return { level, label: labels[level] }
}

export function Register() {
  const { user, booting, signUp } = useAuth()
  const navigate = useNavigate()
  useDocumentTitle('Create an account — Delta Global')

  const [fields, setFields] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [alert, setAlert] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!booting && user) return <Navigate to="/app" replace />

  const strength = strengthOf(fields.password)

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAlert(null)

    const found = validate(fields)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }

    setBusy(true)
    try {
      const result = await signUp({
        ...fields,
        name: fields.name.trim(),
        email: fields.email.trim().toLowerCase(),
        mobile_number: fields.mobile_number.replace(/[\s-]/g, ''),
      })

      if (result.kind === 'staff') {
        window.location.href = ADMIN_URL
        return
      }

      navigate('/app', { replace: true })
    } catch (caught) {
      if (caught instanceof ApiError) {
        setAlert(caught.message)
        setErrors(
          Object.fromEntries(
            Object.entries(caught.errors).map(([key, list]) => [key, list[0]]),
          ) as Errors,
        )
      } else {
        setAlert('Something went wrong. Please try again.')
      }
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      wide
      eyebrow="Get started"
      title="Create your account"
      lead="It takes a minute, and your wallet is live the moment you finish."
      headline="Everything you need, from the first rupee."
      points={POINTS}
      footer={
        <p className="auth-alt">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      }
    >
      {alert && (
        <p className="form-alert" role="alert">
          {alert}
        </p>
      )}

      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Asha Rao"
            value={fields.name}
            aria-invalid={Boolean(errors.name)}
            onChange={(event) => set('name', event.target.value)}
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
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
              placeholder="you@example.com"
              value={fields.email}
              aria-invalid={Boolean(errors.email)}
              onChange={(event) => set('email', event.target.value)}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="field">
            <label htmlFor="mobile_number">Mobile number</label>
            <input
              id="mobile_number"
              name="mobile_number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="9876543210"
              value={fields.mobile_number}
              aria-invalid={Boolean(errors.mobile_number)}
              onChange={(event) => set('mobile_number', event.target.value)}
            />
            {errors.mobile_number && (
              <p className="field-error">{errors.mobile_number}</p>
            )}
          </div>
        </div>

        <div className="field-row">
          <div>
            <PasswordField
              id="password"
              label="Password"
              autoComplete="new-password"
              value={fields.password}
              onChange={(value) => set('password', value)}
              error={errors.password}
              hint={strength.label ? undefined : 'At least 8 characters.'}
            />
            {!errors.password && strength.label && (
              <div className="strength">
                <div className="strength-bars" aria-hidden="true">
                  {[1, 2, 3, 4].map((step) => (
                    <span
                      key={step}
                      className={step <= strength.level ? 'is-on' : undefined}
                    />
                  ))}
                </div>
                <span className="strength-label">{strength.label}</span>
              </div>
            )}
          </div>

          <PasswordField
            id="password_confirmation"
            label="Confirm password"
            autoComplete="new-password"
            value={fields.password_confirmation}
            onChange={(value) => set('password_confirmation', value)}
            error={errors.password_confirmation}
          />
        </div>

        <button className="btn btn-primary btn-lg" type="submit" disabled={busy}>
          {busy && <span className="spinner spinner-sm" aria-hidden="true" />}
          {busy ? 'Creating account…' : 'Create account'}
        </button>

        <p className="auth-terms">
          By creating an account you agree to our{' '}
          <Link to="/legal/terms">terms of service</Link> and{' '}
          <Link to="/legal/privacy">privacy policy</Link>.
        </p>
      </form>
    </AuthLayout>
  )
}
