import { api } from './api'
import type {
  WithdrawalChargePayment,
  WithdrawalChargeStep,
  WithdrawalChargesEnvelope,
} from './types'
import { toPaymentBody, type UpiPaymentValues } from './upi-payment'

/**
 * The charge sequence for an amount. Percentage charges resolve to ₹0 when the
 * amount is left off, so it is always sent.
 */
export function fetchCharges(amount: string, signal?: AbortSignal) {
  return api.get<WithdrawalChargesEnvelope>(
    `/withdrawals/charges?amount=${encodeURIComponent(amount)}`,
    signal,
  )
}

/**
 * Records one charge payment. Called as each popup closes rather than batched
 * at the end: by the time the customer taps "Paid", real money has left their
 * account, so an abandoned walk still leaves something an admin can act on.
 */
export function payCharge(chargeId: number, values: UpiPaymentValues) {
  return api.post<{ data: WithdrawalChargePayment; message: string }>(
    `/withdrawals/charges/${chargeId}/pay`,
    toPaymentBody(values),
  )
}

/** Charge id → the id of the payment that settled it. */
export type Settled = Record<number, number>

/**
 * What an abandoned walk left behind. `paid` lists charge payments not yet
 * tied to any withdrawal, so keying by `charge_id` rather than trusting the
 * order is what stops anyone paying the same charge twice.
 */
export function settledBy(paid: WithdrawalChargePayment[]): Settled {
  return Object.fromEntries(paid.map((entry) => [entry.charge_id, entry.id]))
}

/** Which popup to open. -1 once every step is settled. */
export function firstUnpaid(steps: WithdrawalChargeStep[], settled: Settled) {
  return steps.findIndex((step) => settled[step.charge_id] === undefined)
}

/** The payment ids in step order — the order the payout expects them in. */
export function paymentIdsFor(
  steps: WithdrawalChargeStep[],
  settled: Settled,
): number[] {
  return steps
    .map((step) => settled[step.charge_id])
    .filter((id): id is number => id !== undefined)
}
