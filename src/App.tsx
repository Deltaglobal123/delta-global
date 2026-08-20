import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { Layout } from './components/Layout'
import { RequireAuth } from './components/app/RequireAuth'
import { AuthProvider } from './lib/auth'
import { Home } from './pages/Home'
import { About } from './pages/About'
import { PricingPage } from './pages/PricingPage'
import { GetStarted } from './pages/GetStarted'
import { Contact } from './pages/Contact'
import { LegalPage } from './pages/LegalPage'
import { NotFound } from './pages/NotFound'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/app/Dashboard'
import { Deposit } from './pages/app/Deposit'
import { Trading } from './pages/app/Trading'
import { Withdraw } from './pages/app/Withdraw'
import { Transactions } from './pages/app/Transactions'
import { PRIVACY, REFUNDS, RISK_DISCLOSURE, TERMS } from './data'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* The customer account area. Everything under it needs a token. */}
          <Route path="/app" element={<RequireAuth />}>
            <Route index element={<Dashboard />} />
            <Route path="deposit" element={<Deposit />} />
            <Route path="trading" element={<Trading />} />
            <Route path="withdraw" element={<Withdraw />} />
            <Route path="transactions" element={<Transactions />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="get-started" element={<GetStarted />} />
            <Route path="contact" element={<Contact />} />
            <Route path="legal">
              <Route
                path="risk-disclosure"
                element={<LegalPage doc={RISK_DISCLOSURE} />}
              />
              <Route path="terms" element={<LegalPage doc={TERMS} />} />
              <Route path="privacy" element={<LegalPage doc={PRIVACY} />} />
              <Route path="refunds" element={<LegalPage doc={REFUNDS} />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
