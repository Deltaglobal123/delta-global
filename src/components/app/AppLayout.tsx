import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth-context'
import { useStatus } from '../../lib/status-context'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { LogoMark } from '../../icons'
import {
  DashboardIcon,
  DepositIcon,
  LedgerIcon,
  LogoutIcon,
  TradingIcon,
  WithdrawIcon,
} from './app-icons'

const LINKS = [
  { to: '/app', label: 'Dashboard', Icon: DashboardIcon, end: true },
  { to: '/app/deposit', label: 'Add money', Icon: DepositIcon },
  { to: '/app/trading', label: 'AI trading', Icon: TradingIcon },
  { to: '/app/withdraw', label: 'Withdraw', Icon: WithdrawIcon },
  { to: '/app/transactions', label: 'Transactions', Icon: LedgerIcon },
]

export function AppLayout() {
  const { user, signOut } = useAuth()
  const { status } = useStatus()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [leaving, setLeaving] = useState(false)

  const current = LINKS.find((link) =>
    link.end ? pathname === link.to : pathname.startsWith(link.to),
  )
  useDocumentTitle(`${current?.label ?? 'Account'} — Delta Global`)

  async function onSignOut() {
    setLeaving(true)
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className="app-side">
        <Link className="brand app-brand" to="/">
          <LogoMark />
          <span className="brand-text">
            Delta <span>Global</span>
          </span>
        </Link>

        <nav className="app-nav" aria-label="Account">
          {LINKS.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                isActive ? 'app-nav-link is-active' : 'app-nav-link'
              }
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="app-side-foot">
          {status?.is_waiting && (
            <p className="app-waiting">
              <span className="pill-dot" aria-hidden="true" />
              Waiting on our team
            </p>
          )}
          <div className="app-user">
            <span className="app-avatar" aria-hidden="true">
              {user?.name?.[0]?.toUpperCase() ?? '·'}
            </span>
            <div>
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
          <button
            type="button"
            className="app-signout"
            onClick={onSignOut}
            disabled={leaving}
          >
            <LogoutIcon />
            {leaving ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      <div className="app-main">
        <Outlet />
      </div>
    </div>
  )
}
