import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Nav } from '../sections/Nav'
import { Footer } from '../sections/Footer'

const TITLES: Record<string, string> = {
  '/': 'Delta Global — AI-powered trading platform',
  '/about': 'About us — Delta Global',
  '/pricing': 'Pricing — Delta Global',
  '/get-started': 'Get started — Delta Global',
  '/contact': 'Contact — Delta Global',
  '/legal/risk-disclosure': 'Risk disclosure — Delta Global',
  '/legal/terms': 'Terms of service — Delta Global',
  '/legal/privacy': 'Privacy policy — Delta Global',
  '/legal/refunds': 'Refund policy — Delta Global',
}

export function Layout() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    document.title = TITLES[pathname] ?? 'Delta Global'

    // A `/#section` link has to reach its section even when it also changes the
    // route, so the scroll-to-top only applies when there is no target.
    if (hash) {
      const target = document.querySelector(hash)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }

    // Land at the top of each new page, the way a real page load would.
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
