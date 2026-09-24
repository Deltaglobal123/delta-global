/**
 * The questions a customer works through before a run is committed. Every one
 * of them is asked, in a fresh order each time, so the sequence cannot be
 * tapped through from memory.
 *
 * `answer` is what is true, not a gate: any choice moves the customer on and
 * the right answer is shown either way. The point is that nobody commits a
 * balance without having read twelve plain statements about what trading is.
 */
export type QuizQuestion = {
  id: string
  question: string
  answer: 'yes' | 'no'
  /** Only `answer` advances — the other choice asks the customer to pick again. */
  required?: boolean
}

export const TRADING_QUIZ: QuizQuestion[] = [
  {
    id: 'earnings',
    question: 'Can people earn ₹2–4 lakh profit from trading?',
    answer: 'yes',
  },
  {
    id: 'guaranteed',
    question: 'Is trading a guaranteed way to make money?',
    answer: 'no',
  },
  {
    id: 'regulated',
    question: 'Does the government regulate financial markets?',
    answer: 'yes',
  },
  {
    id: 'learning',
    question: 'Can anyone become profitable without learning?',
    answer: 'no',
  },
  {
    id: 'tax',
    question: 'Is tax applicable on eligible trading profits?',
    answer: 'yes',
  },
  {
    id: 'withdraw',
    question: 'Can traders legally withdraw their profits?',
    answer: 'yes',
  },
  {
    id: 'every-trade',
    question: 'Is every trade profitable?',
    answer: 'no',
  },
  {
    id: 'policy',
    question: 'Can government policies affect the financial markets?',
    answer: 'yes',
  },
  {
    id: 'strategy',
    question: 'Should you trade without a strategy?',
    answer: 'no',
  },
  {
    id: 'risk',
    question: 'Is risk management important in trading?',
    answer: 'yes',
  },
  {
    id: 'full-time',
    question: 'Can trading be a full-time profession for some people?',
    answer: 'yes',
  },
  {
    id: 'profit-guarantee',
    question: 'Can profits be guaranteed in trading?',
    answer: 'no',
  },
]

/** Always asked last, after the shuffled set — a run starts only on a Yes. */
export const READY_QUESTION: QuizQuestion = {
  id: 'ready',
  question: 'Are you ready for AI trading?',
  answer: 'yes',
  required: true,
}

/**
 * A shuffled copy — Fisher-Yates, so the original export is never reordered —
 * with the readiness check appended at the end.
 */
export function shuffledQuiz(): QuizQuestion[] {
  const list = [...TRADING_QUIZ]
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return [...list, READY_QUESTION]
}
