import { useEffect, useRef, useState } from 'react'
import { loadQuiz, type QuizQuestion } from '../../lib/trading-quiz'
import { CheckIcon } from '../../icons'

/** How long "Next question" waits before the next card appears. */
const NEXT_QUESTION_DELAY_MS = 5000

type Props = {
  /** What will be committed once the last question is answered. */
  amountLabel: string
  /** True while the trading run is being posted, after the final answer. */
  busy: boolean
  /** A failed post — shown in place of the questions so nothing is lost. */
  alert: string | null
  onCancel: () => void
  onComplete: () => void
}

/**
 * The admin's questions, one at a time, in the order they were published. A
 * pick locks both buttons and shows whether it was right — the right answer is
 * highlighted either way — and any pick lets the customer move on. The last
 * card asks whether the customer is ready, and only a Yes gets past it. The run
 * is committed by the caller once that card is answered.
 *
 * Each move to the next card takes a short pause, and the count of questions is
 * never shown, so the customer cannot see how many remain.
 *
 * If the admin's set could not be loaded, a built-in set stands in.
 */
export function TradingQuizModal({
  amountLabel,
  busy,
  alert,
  onCancel,
  onComplete,
}: Props) {
  // Loaded once per mount: reloading mid-run would swap the question out from
  // under the customer mid-answer.
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null)

  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    loadQuiz(controller.signal)
      .then(setQuestions)
      .catch(() => {
        /* aborted on unmount */
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [busy, onCancel])

  // The pause between cards; cleared if the popup closes mid-wait.
  const [advancing, setAdvancing] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const loaded = questions?.[index] ?? null
  // Hidden while the next card is on its way, so nothing can be tapped early.
  const current = advancing ? null : loaded
  const total = questions?.length ?? 0
  const isLast = index === total - 1

  function next() {
    if (isLast) {
      onComplete()
      return
    }
    setAdvancing(true)
    timer.current = window.setTimeout(() => {
      setPicked(null)
      setIndex((prev) => prev + 1)
      setAdvancing(false)
    }, NEXT_QUESTION_DELAY_MS)
  }

  function answer(choice: string) {
    // No usable right answer means nothing to reveal — the tap moves on.
    if (current && current.answer === null && !isLast) {
      next()
      return
    }
    setPicked(choice)
  }

  const correct = picked !== null && picked === current?.answer
  // A required question stays open until its answer is picked.
  const locked = picked !== null && !current?.required
  const canAdvance = picked !== null && (!current?.required || correct)

  /** Once a pick is locked in, the right answer turns green and a wrong pick red. */
  function optionClass(choice: string) {
    if (locked && current?.answer) {
      if (choice === current.answer) return 'quiz-option is-correct'
      if (choice === picked) return 'quiz-option is-wrong'
      return 'quiz-option'
    }
    return picked === choice ? 'quiz-option is-picked' : 'quiz-option'
  }

  return (
    <div className="quiz-backdrop" role="presentation">
      <section
        className="quiz-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-question"
        aria-busy={!current}
      >
        <header className="quiz-head">
          <div>
            {/* No count — how many questions remain is not shown. */}
            <span className="quiz-step">
              {questions ? 'Before you start' : 'Loading questions…'}
            </span>
            <p className="quiz-amount">Committing {amountLabel}</p>
          </div>
          <button
            type="button"
            className="quiz-close"
            onClick={onCancel}
            disabled={busy}
            aria-label="Close and cancel"
          >
            ×
          </button>
        </header>

        <div className="quiz-body">
          {current ? (
            <h2 className="quiz-question" id="quiz-question">
              {current.question}
            </h2>
          ) : (
            // Stands in for the question and its buttons while one is loading.
            <div className="quiz-loading" role="status">
              <span className="spinner" aria-hidden="true" />
              <h2 className="quiz-question" id="quiz-question">
                {advancing
                  ? 'Loading next question…'
                  : 'Loading questions…'}
              </h2>
            </div>
          )}

          {alert && (
            <p className="form-alert" role="alert">
              {alert}
            </p>
          )}

          {current && (
            <div className="quiz-options">
              {current.options.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  className={optionClass(choice)}
                  onClick={() => answer(choice)}
                  disabled={locked || busy}
                >
                  {choice}
                </button>
              ))}
            </div>
          )}

          {current && picked !== null && current.required && !correct && (
            <p className="quiz-verdict">
              You need to choose {current.answer} to start AI trading.
            </p>
          )}

          {current && picked !== null && !current.required && current.answer && (
            <p
              className={correct ? 'quiz-verdict is-right' : 'quiz-verdict is-wrong'}
              role="status"
            >
              {correct ? <CheckIcon /> : null}
              {correct
                ? 'Correct!'
                : `Wrong. The right answer is ${current.answer}.`}
            </p>
          )}
        </div>

        <footer className="quiz-foot">
          {/* Only needed once there is something to read before moving on. */}
          {(current?.answer !== null || isLast) && (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={next}
              disabled={!canAdvance || advancing || busy}
            >
              {busy
                ? 'Starting…'
                : advancing
                  ? 'Loading…'
                  : isLast
                  ? `Start AI trading with ${amountLabel}`
                  : 'Next question'}
            </button>
          )}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
        </footer>
      </section>
    </div>
  )
}
