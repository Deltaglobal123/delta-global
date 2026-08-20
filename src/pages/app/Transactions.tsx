import { useList } from '../../lib/useList'
import { formatDate, formatPaise } from '../../lib/money'
import type { Transaction } from '../../lib/types'
import { AppPageHead } from '../../components/app/AppPageHead'
import { AppSection } from '../../components/app/AppSection'
import { Pager } from '../../components/app/Pager'

/**
 * A hold or a release moves nothing in or out — it carries `amount_paise: 0`
 * and a non-zero `locked_delta_paise`, so those rows get their own wording
 * rather than showing a misleading ₹0.00.
 */
function movement(entry: Transaction) {
  if (entry.amount_paise !== 0) {
    return {
      text: `${entry.amount_paise > 0 ? '+' : ''}${entry.amount}`,
      className: entry.amount_paise > 0 ? 'num-up' : 'num-down',
    }
  }

  if (entry.locked_delta_paise > 0) {
    return {
      text: `${formatPaise(entry.locked_delta_paise)} held`,
      className: 'num-held',
    }
  }

  if (entry.locked_delta_paise < 0) {
    return {
      text: `${formatPaise(-entry.locked_delta_paise)} released`,
      className: 'num-held',
    }
  }

  return { text: entry.amount, className: undefined }
}

export function Transactions() {
  const ledger = useList<Transaction>('/wallet/transactions')

  return (
    <div className="app-page">
      <AppPageHead
        eyebrow="Transactions"
        title="Wallet history"
        lead="Every movement behind your balance, newest first — deposits, trading holds and settlements, and payouts."
      />

      <AppSection title="Ledger">
        {ledger.error && (
          <p className="form-alert" role="alert">
            {ledger.error}
          </p>
        )}
        {ledger.loading && ledger.items.length === 0 ? (
          <p className="app-muted">Loading…</p>
        ) : ledger.items.length === 0 ? (
          <p className="app-muted">
            Nothing has moved through your wallet yet.
          </p>
        ) : (
          <div className="table-wrap">
            <table className="app-table">
              <thead>
                <tr>
                  <th scope="col">When</th>
                  <th scope="col">Movement</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Balance after</th>
                </tr>
              </thead>
              <tbody>
                {ledger.items.map((entry) => {
                  const { text, className } = movement(entry)

                  return (
                    <tr key={entry.id}>
                      <td>{formatDate(entry.created_at)}</td>
                      <td>
                        <strong className="ledger-type">{entry.type_label}</strong>
                        {entry.description && (
                          <p className="row-note">{entry.description}</p>
                        )}
                      </td>
                      <td className={className}>{text}</td>
                      <td className="num-strong">{entry.balance_after}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pager meta={ledger.meta} page={ledger.page} onPage={ledger.setPage} />
      </AppSection>
    </div>
  )
}
