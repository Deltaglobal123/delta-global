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
  /** Bonus amount credited on top of the deposit (deposit × 2 total). */
  bonus: string
  /** Total wallet credit after bonus: deposit + bonus. */
  total: string
}

export const DEPOSIT_PLANS: DepositPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹499',
    amount: '499',
    body: 'The minimum for one AI trading run. A low-cost way to see how the platform works.',
    bonus: '₹499',
    total: '₹998',
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '₹999',
    amount: '999',
    body: 'Room for a larger first run, with your full balance visible in the wallet.',
    bonus: '₹999',
    total: '₹1,998',
  },
  {
    id: 'plus',
    name: 'Plus',
    price: '₹1,499',
    amount: '1499',
    body: 'The largest first-deposit plan, for customers ready to commit more to a run.',
    bonus: '₹1,499',
    total: '₹2,998',
  },
]

export const DEPOSIT_PLAN_TERMS = [
  'Plans are available on your first deposit only.',
  'Choosing a plan only fills in the deposit amount. You still pay by scanning the QR and submit your payment reference.',
  'Your deposit is credited with the amount our team verifies against the bank statement.',
  'The bonus equals your verified first deposit (100%) and is added on top of it once the deposit is verified, e.g. ₹499 → ₹998, ₹999 → ₹1,998, ₹1,499 → ₹2,998.',  'The 100% bonus is a one-time first-deposit offer. It is not applicable on subsequent deposits.',
  'Bonus credits can be used for AI trading runs but cannot be withdrawn directly as cash.',
  'No plan guarantees a profit or any fixed return. Trading involves market risk, and you may lose part or all of the amount you trade.',
  'Delta Global reserves the right to modify or withdraw the bonus offer at any time without prior notice.',
]
