import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { isEmployee, useAuth } from '../../lib/auth-context'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { LogoMark } from '../../icons'
import { LogoutIcon } from '../../components/app/app-icons'

/**
 * Where employees land after signing in. The backend gives them no features
 * yet, so this shows who is signed in and a way out — and must never call a
 * customer endpoint (/status, /wallet, …), all of which answer 403 for them.
 */
export function EmployeeHome() {
  const { user, booting, signOut } = useAuth()
  const navigate = useNavigate()
  const [leaving, setLeaving] = useState(false)
  useDocumentTitle('Employee — Delta Global')

  if (booting) {
    return (
      <div className="app-boot">
        <span className="spinner" aria-hidden="true" />
        <p>Loading your account…</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace state={{ from: '/employee' }} />

  // An admin can take the role away mid-session; customers belong in /app.
  if (!isEmployee(user)) return <Navigate to="/app" replace />

  async function onSignOut() {
    setLeaving(true)
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <main className="auth-page">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />

      <div className="employee-shell">
        <Link className="brand auth-brand" to="/">
          <LogoMark />
          <span className="brand-text">
            Delta <span>Global</span>
          </span>
        </Link>

        <div className="auth-card">
          <span className="eyebrow">Employee</span>
          <h1>Hello, {user.name}</h1>
          <p className="auth-lead">
            You are signed in with an employee account. Employee tools will
            appear here as they become available.
          </p>

          <div className="app-user employee-user">
            <span className="app-avatar" aria-hidden="true">
              {user.name?.[0]?.toUpperCase() ?? '·'}
            </span>
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>

          <div className="auth-foot">
            <button
              type="button"
              className="app-signout"
              onClick={onSignOut}
              disabled={leaving}
            >
              <LogoutIcon />
              {leaving ? 'Signing out…' : 'Log out'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
