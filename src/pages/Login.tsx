import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../lib/api'
import { useAuth } from '../lib/auth-context'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { AuthLayout, type AuthPoint } from '../components/AuthLayout'
import { PasswordField } from '../components/PasswordField'

const ADMIN_URL = import.meta.env.VITE_ADMIN_URL ?? 'http://localhost/login'

const POINTS: AuthPoint[] = [
  {
    title: 'One wallet, one view',
    body: 'Balance, what is locked and what is free to use — always on the same screen.',
  },
  {
    title: 'You always know where you stand',
    body: 'Deposits, trading runs and payouts show their real status while our team works.',
  },
  {
    title: 'Money moves on your say-so',
    body: 'Nothing leaves your wallet without a request you made yourself.',
  },
]

export function Login() {
  const { user, booting, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  useDocumentTitle('Sign in — Delta Global')

  const from = (location.state as { from?: string } | null)?.from ?? '/app'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [alert, setAlert] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  if (!booting && user) return <Navigate to={from} replace />

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAlert(null)
    setErrors({})
    setBusy(true)

    try {
      const result = await signIn(email.trim(), password)

      // Admin and manager accounts belong in the Blade panel, not this app.
      if (result.kind === 'staff') {
        window.location.href = ADMIN_URL
        return
      }

      navigate(from, { replace: true })
    } catch (caught) {
      if (caught instanceof ApiError) {
        setAlert(caught.message)
        setErrors(
          Object.fromEntries(
            Object.entries(caught.errors).map(([key, list]) => [key, list[0]]),
          ),
        )
      } else {
        setAlert('Something went wrong. Please try again.')
      }
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Sign in"
      title="Welcome back"
      lead="Pick up where you left off — your wallet, your runs, your payouts."
      headline="Your money, always accounted for."
      points={POINTS}
      footer={
        <>
          <p className="auth-alt">
            New to Delta Global? <Link to="/register">Create an account</Link>
          </p>
          <p className="auth-note">
            Admin and manager accounts are sent to the staff panel automatically.
          </p>
        </>
      }
    >
      {alert && (
        <p className="form-alert" role="alert">
          {alert}
        </p>
      )}

      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            aria-invalid={Boolean(errors.email)}
            onChange={(event) => setEmail(event.target.value)}
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          error={errors.password}
        />

        <button className="btn btn-primary btn-lg" type="submit" disabled={busy}>
          {busy && <span className="spinner spinner-sm" aria-hidden="true" />}
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  )
}
