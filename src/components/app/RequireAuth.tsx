import { Navigate, useLocation } from 'react-router-dom'
import { isEmployee, useAuth } from '../../lib/auth-context'
import { StatusProvider } from '../../lib/status'
import { AppLayout } from './AppLayout'

export function RequireAuth() {
  const { user, booting } = useAuth()
  const location = useLocation()

  // A stored token is still being traded for the account — showing the login
  // screen here would bounce a signed-in customer on every refresh.
  if (booting) {
    return (
      <div className="app-boot">
        <span className="spinner" aria-hidden="true" />
        <p>Loading your account…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  // Decided before StatusProvider mounts: it polls /status, and every customer
  // endpoint answers 403 for an employee.
  if (isEmployee(user)) return <Navigate to="/employee" replace />

  return (
    <StatusProvider>
      <AppLayout />
    </StatusProvider>
  )
}
