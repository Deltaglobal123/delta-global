import type { Wallet } from '../../lib/types'

/**
 * Balance is everything the customer owns; locked is the slice committed to a
 * live run or a pending payout; available is what any new action can draw on.
 */
export function WalletSummary({ wallet }: { wallet: Wallet | null }) {
  const cards = [
    {
      label: 'Total balance',
      value: wallet?.balance,
      note: 'Everything in your wallet',
      tone: 'strong',
    },
    {
      label: 'Locked',
      value: wallet?.locked,
      note: 'Committed to trading or a payout',
      tone: 'gold',
    },
    {
      label: 'Available',
      value: wallet?.available,
      note: 'Free to trade or withdraw',
      tone: 'accent',
    },
  ]

  return (
    <div className="wallet-cards">
      {cards.map((card) => (
        <div key={card.label} className={`wallet-card wallet-${card.tone}`}>
          <span className="wallet-label">{card.label}</span>
          <strong className="wallet-value">
            {card.value ?? <span className="skeleton" aria-hidden="true" />}
          </strong>
          <span className="wallet-note">{card.note}</span>
        </div>
      ))}
    </div>
  )
}
