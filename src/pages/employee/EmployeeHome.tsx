import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { isEmployee, useAuth } from '../../lib/auth-context'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { useList } from '../../lib/useList'
import type {
  Attendance,
  AttendanceToday,
  IncentivesEnvelope,
  PerformanceWarningsEnvelope,
  User,
} from '../../lib/types'
import { LogoMark } from '../../icons'
import { LogoutIcon } from '../../components/app/app-icons'
import { AppPageHead } from '../../components/app/AppPageHead'
import { AttendanceCard } from '../../components/employee/AttendanceCard'
import { AttendanceHistory } from '../../components/employee/AttendanceHistory'
import { IncentivesTile } from '../../components/employee/IncentivesTile'
import { WarningsSection } from '../../components/employee/WarningsSection'

/**
 * Where employees land after signing in. Only /employee/* and /auth/* are
 * called from here — every customer endpoint (/status, /wallet, …) answers 403
 * for an employee.
 */
export function EmployeeHome() {
  const { user, booting } = useAuth()
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

  // Mounted only once the role is settled, so no employee call fires for a
  // customer or before the stored session is restored.
  return <EmployeeDashboard user={user} />
}

/** A fetch-on-mount for one employee endpoint, re-runnable on demand. */
function useResource<T>(path: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const response = await api.get<T>(path, signal)
        if (signal?.aborted) return
        setData(response)
        setError(null)
      } catch (caught) {
        if (signal?.aborted || (caught as Error)?.name === 'AbortError') return
        setError((caught as Error).message)
      } finally {
        if (!signal?.aborted) setLoading(false)
      }
    },
    [path],
  )

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  return { data, loading, error, load }
}

function EmployeeDashboard({ user }: { user: User }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [leaving, setLeaving] = useState(false)

  const today = useResource<AttendanceToday>('/employee/attendance/today')
  const warnings = useResource<PerformanceWarningsEnvelope>('/employee/performance-warnings')
  const incentives = useResource<IncentivesEnvelope>('/employee/incentives')
  const history = useList<Attendance>('/employee/attendance')

  const { load: loadToday } = today
  const { load: loadWarnings } = warnings
  const { load: loadIncentives } = incentives
  const { reload: reloadHistory } = history

  // There is no push when a warning or incentive is given, and a tab left open
  // overnight shows yesterday's buttons — so coming back to the tab re-reads them.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      loadToday()
      loadWarnings()
      loadIncentives()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [loadToday, loadWarnings, loadIncentives])

  const onAttendanceChanged = useCallback(async () => {
    reloadHistory()
    await loadToday()
  }, [loadToday, reloadHistory])

  async function onSignOut() {
    setLeaving(true)
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="employee-page">
      <header className="employee-bar">
        <Link className="brand" to="/">
          <LogoMark />
          <span className="brand-text">
            Delta <span>Global</span>
          </span>
        </Link>

        <div className="employee-bar-end">
          <div className="app-user">
            <span className="app-avatar" aria-hidden="true">
              {user.name?.[0]?.toUpperCase() ?? '·'}
            </span>
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
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
      </header>

      <main className="app-page employee-main">
        <AppPageHead
          eyebrow="Employee"
          title={`Hello, ${user.name}`}
          lead="Mark your attendance for the day and keep an eye on any performance warnings."
        />

        <div className="employee-grid">
          <AttendanceCard
            today={today.data}
            loading={today.loading}
            error={today.error}
            onChanged={onAttendanceChanged}
          />
          <div className="employee-stack">
            <IncentivesTile
              count={incentives.data?.data.count ?? null}
              loading={incentives.loading}
              error={incentives.error}
              onRetry={() => void loadIncentives()}
            />
            <WarningsSection
              warnings={warnings.data}
              loading={warnings.loading}
              error={warnings.error}
            />
          </div>
        </div>

        <AttendanceHistory
          items={history.items}
          meta={history.meta}
          page={history.page}
          onPage={history.setPage}
          loading={history.loading}
          error={history.error}
          todayDate={today.data?.date ?? null}
        />
      </main>
    </div>
  )
}
