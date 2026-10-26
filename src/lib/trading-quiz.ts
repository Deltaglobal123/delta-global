import { request } from './api'

/**
 * The questions a customer works through before a run is committed. They are
 * managed by the admin and served by `GET /popup-questions`, already filtered
 * to the visible ones and sorted by `sort_order` — so they are shown as given.
 *
 * Each one carries the admin's `correct_answer`. The customer's pick is checked
 * against it here in the frontend and never saved; the result is shown, and any
 * pick moves the customer on. With `required` the question is a gate instead,
 * and only its `answer` lets the customer through.
 */
export type QuizQuestion = {
  id: string
  question: string
  /** The buttons, in order. */
  options: string[]
  /** The option that is true, or null when any choice simply advances. */
  answer: string | null
  /** Only `answer` advances — another choice asks the customer to pick again. */
  required?: boolean
}

/** One row of `GET /popup-questions`. */
type PopupQuestion = {
  /** Null on the fixed last question, so it is never used as a key. */
  id: number | null
  question: string
  answers: string[]
  correct_answer: string
  sort_order: number | null
  /** True only for "Are you ready for AI trading?", always sent last. */
  is_fixed?: boolean
}

const YES_NO = ['Yes', 'No']

function fact(id: string, question: string, answer: 'Yes' | 'No'): QuizQuestion {
  return { id, question, options: YES_NO, answer }
}

/**
 * Asked when the API cannot be reached or has nothing published, so starting a
 * run never depends on the admin panel being filled in.
 */
const FALLBACK_QUIZ: QuizQuestion[] = [
  fact('earnings', 'Can people earn ₹2–4 lakh profit from trading?', 'Yes'),
  fact('guaranteed', 'Is trading a guaranteed way to make money?', 'No'),
  fact('regulated', 'Does the government regulate financial markets?', 'Yes'),
  fact('learning', 'Can anyone become profitable without learning?', 'No'),
  fact('tax', 'Is tax applicable on eligible trading profits?', 'Yes'),
  fact('withdraw', 'Can traders legally withdraw their profits?', 'Yes'),
  fact('every-trade', 'Is every trade profitable?', 'No'),
  fact('policy', 'Can government policies affect the financial markets?', 'Yes'),
  fact('strategy', 'Should you trade without a strategy?', 'No'),
  fact('risk', 'Is risk management important in trading?', 'Yes'),
  fact('full-time', 'Can trading be a full-time profession for some people?', 'Yes'),
  fact('profit-guarantee', 'Can profits be guaranteed in trading?', 'No'),
]

/** Always asked last — a run starts only on a Yes. */
export const READY_QUESTION: QuizQuestion = {
  id: 'ready',
  question: 'Are you ready for AI trading?',
  options: YES_NO,
  answer: 'Yes',
  required: true,
}

function toQuizQuestion(row: PopupQuestion, index: number): QuizQuestion {
  const options = (row.answers ?? []).filter((label) => label?.trim())
  // The API promises ["Yes", "No"]; an empty list would leave no way forward.
  const usable = options.length > 0 ? options : YES_NO
  // Compared exactly, as the API asks. One that matches no button cannot be
  // picked, so the question is treated as having no right answer instead.
  const answer = usable.includes(row.correct_answer) ? row.correct_answer : null

  return {
    // From the list position: `id` is null on the fixed question.
    id: `popup-${index}`,
    question: row.question,
    options: usable,
    answer,
    // The fixed readiness question is the gate — but only if it really has a
    // right answer to gate on, or it would trap the customer.
    required: Boolean(row.is_fixed) && answer !== null,
  }
}

/**
 * The full set for one run, ending on the readiness check. The backend sends
 * that check as its fixed last question; it is added here only when it is
 * missing (an older backend) or the request failed. Never rejects — a failed
 * request falls back instead, unless the caller aborted it.
 */
export async function loadQuiz(signal?: AbortSignal): Promise<QuizQuestion[]> {
  let questions = FALLBACK_QUIZ

  try {
    const response = await request<{ data: PopupQuestion[] }>('/popup-questions', {
      auth: false,
      signal,
    })
    const rows = (response?.data ?? []).filter((row) => row.question?.trim())
    if (rows.length > 0) questions = rows.map(toQuizQuestion)
  } catch (error) {
    if (signal?.aborted) throw error
  }

  const last = questions[questions.length - 1]
  return last?.required ? questions : [...questions, READY_QUESTION]
}
