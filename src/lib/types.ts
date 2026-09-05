/**
 * Shapes returned by the Delta Global API. Every amount crosses the wire twice:
 * `*_paise` is the integer you do arithmetic on, the twin without the suffix is
 * already formatted for display.
 */

export type Role = { id: number; name: string; label: string }

export type User = {
  id: number
  name: string
  email: string
  mobile_number: string
  email_verified_at: string | null
  created_at: string
  roles: Role[]
  permissions: string[]
}

export type AuthEnvelope = {
  data: User
  token: string
  token_type: string
  expires_in: number
}

export type Wallet = {
  balance_paise: number
  balance: string
  locked_paise: number
  locked: string
  available_paise: number
  available: string
}

export type DepositStatus = 'pending' | 'approved' | 'rejected'

export type Deposit = {
  id: number
  status: DepositStatus
  status_label: string
  is_pending: boolean
  amount_paise: number
  amount: string
  credited_paise: number | null
  credited: string | null
  reference: string
  payer_name: string | null
  payer_upi_id: string | null
  paid_at: string | null
  admin_note: string | null
  reviewed_at: string | null
  created_at: string
}

export type TradingStatus = 'pending' | 'running' | 'completed' | 'rejected'

export type Trading = {
  id: number
  status: TradingStatus
  status_label: string
  is_open: boolean
  amount_paise: number
  amount: string
  profit_paise: number | null
  profit: string | null
  returned_paise: number | null
  returned: string | null
  admin_note: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export type ChargeType = 'fixed' | 'percent'

/**
 * One line of the withdrawal charge bill, already worked out against the amount
 * being withdrawn. `amount` is only sent by the live quote — the snapshot kept
 * on a past withdrawal carries `amount_paise` alone, so format that yourself.
 */
export type WithdrawalChargeItem = {
  id: number
  title: string
  description: string | null
  type: ChargeType
  /** Pre-rendered explanation: `₹49.00` or `18% of the withdrawal`. */
  rule: string
  percent: number | null
  amount_paise: number
  amount?: string
}

/**
 * The popup shown before a payout is accepted. Every string in it is written by
 * the admin and changes without a frontend deploy, so none of it is ever
 * substituted for wording of our own.
 */
export type WithdrawalChargeNotice = {
  id: number
  title: string
  body: string | null
  confirm_label: string
  upi_id: string | null
  qr_image_url: string
  /** Echoes the amount the lines below were quoted against. */
  withdrawal_amount_paise: number
  items: WithdrawalChargeItem[]
  total_paise: number
  total: string
  updated_at: string | null
}

export type WithdrawalStatus = 'pending' | 'approved' | 'paid' | 'rejected'

export type Withdrawal = {
  id: number
  status: WithdrawalStatus
  status_label: string
  is_open: boolean
  amount_paise: number
  amount: string
  name: string
  email: string
  mobile_number: string
  upi_id: string
  /** Null on payouts taken while no charges were being collected. */
  charge_total_paise: number | null
  charge_total: string | null
  charge_breakdown: WithdrawalChargeItem[] | null
  admin_note: string | null
  payment_reference: string | null
  approved_at: string | null
  paid_at: string | null
  created_at: string
}

export type TransactionType =
  | 'deposit'
  | 'trade_lock'
  | 'trade_payout'
  | 'trade_release'
  | 'withdrawal_lock'
  | 'withdrawal_paid'
  | 'withdrawal_release'
  | 'adjustment'

export type Transaction = {
  id: number
  type: TransactionType
  type_label: string
  amount_paise: number
  amount: string
  locked_delta_paise: number
  balance_after_paise: number
  balance_after: string
  description: string | null
  created_at: string
}

export type PaymentQr = {
  id: number
  label: string
  upi_id: string
  image_url: string
  updated_at: string
}

export type Status = {
  wallet: Wallet
  pending_deposits: Deposit[]
  active_trade: Trading | null
  pending_withdrawals: Withdrawal[]
  is_waiting: boolean
  can_start_trading: boolean
}

export type Paginated<T> = {
  data: T[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
  }
}
