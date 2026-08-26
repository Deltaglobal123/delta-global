import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { LOGIN_URL, NAV_LINKS } from '../data'
import { useAuth } from '../lib/auth-context'
import { LogoMark } from '../icons'

/**
 * NavLink decides "active" from the pathname alone, so every `/#section` link
 * would light up at once on the home page. Those render as plain links instead.
 */
function NavItem({ to, label }: { to: string; label: string }) {
  if (to.includes('#')) return <Link to={to}>{label}</Link>

  return (
    <NavLink
      to={to}
      className={({ isActive }) => (isActive ? 'is-active' : undefined)}
      end={to === '/'}
    >
      {label}
    </NavLink>
  )
}

export function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const { user } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [pathname])

  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
      <div className="shell nav-inner">
        <Link className="brand" to="/">
          <LogoMark />
          <span className="brand-text">
            Delta <span>Global</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavItem key={link.to} to={link.to} label={link.label} />
          ))}
        </nav>

        <div className="nav-actions">
          {user ? (
            <Link className="btn btn-primary btn-sm nav-cta" to="/app">
              My dashboard
            </Link>
          ) : (
            <>
              <Link className="btn btn-quiet btn-sm nav-login" to={LOGIN_URL}>
                Login
              </Link>
              <Link className="btn btn-primary btn-sm nav-cta" to="/register">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`burger${open ? ' is-open' : ''}`} aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </div>

      <div id="mobile-menu" className={`mobile-menu${open ? ' is-open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <NavItem key={link.to} to={link.to} label={link.label} />
        ))}
        <div className="mobile-menu-actions">
          {user ? (
            <Link className="btn btn-primary" to="/app">
              My dashboard
            </Link>
          ) : (
            <>
              <Link className="btn btn-ghost" to={LOGIN_URL}>
                Login
              </Link>
              <Link className="btn btn-primary" to="/register">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
