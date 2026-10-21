/**
 * Suggested first-deposit amounts. Picking one only fills in the amount on the
 * "I have paid" form — the customer still pays by QR and the team still credits
 * what the bank statement shows. None of them promises a return.
 */
export type DepositPlan = {
  id: string
  name: string
  /** Shown on the card: `₹499`. */
  price: string
  /** Digits only, as the amount field expects. */
  amount: string
  body: string
}

export const DEPOSIT_PLANS: DepositPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹499',
    amount: '499',
    body: 'The minimum for one AI trading run. A low-cost way to see how the platform works.',
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '₹999',
    amount: '999',
    body: 'Room for a larger first run, with your full balance visible in the wallet.',
  },
  {
    id: 'plus',
    name: 'Plus',
    price: '₹1,499',
    amount: '1499',
    body: 'The largest first-deposit plan, for customers ready to commit more to a run.',
  },
]

export const DEPOSIT_PLAN_TERMS = [
  'Plans are available on your first deposit only.',
  'Choosing a plan only fills in the deposit amount. You still pay by scanning the QR and submit your payment reference.',
  'Your wallet is credited with the amount our team verifies against the bank statement.',
  'No plan guarantees a profit or any fixed return. Trading involves market risk, and you may lose part or all of the amount you trade.',
  'Delta Global may change or withdraw these plans at any time.',
]
