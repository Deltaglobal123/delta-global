import { useEffect, useMemo, useState } from 'react'
import { shuffledQuiz, type QuizQuestion } from '../../lib/trading-quiz'
import { CheckIcon } from '../../icons'

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
 * Twelve questions, one at a time, in a fresh order per run. Either answer
 * advances; the true answer is shown either way, because the point is that the
 * statement has been read, not that a score was achieved. The last card asks
 * whether the customer is ready, and only a Yes gets past it. The run is
 * committed by the caller once that card is answered.
 */
export function TradingQuizModal({
  amountLabel,
  busy,
  alert,
  onCancel,
  onComplete,
}: Props) {
  // Shuffled once per mount: re-rolling on every render would swap the question
  // out from under the customer mid-answer.
  const questions = useMemo<QuizQuestion[]>(() => shuffledQuiz(), [])

  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<'yes' | 'no' | null>(null)

  const current = questions[index]
  const isLast = index === questions.length - 1

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [busy, onCancel])

  function answer(choice: 'yes' | 'no') {
    setPicked(choice)
  }

  function next() {
    if (isLast) {
      onComplete()
      return
    }
    setPicked(null)
    setIndex((prev) => prev + 1)
  }

  const correct = picked !== null && picked === current.answer
  // A required question stays open until its answer is picked.
  const locked = picked !== null && !current.required
  const canAdvance = picked !== null && (!current.required || correct)

  return (
    <div className="quiz-backdrop" role="presentation">
      <section
        className="quiz-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-question"
      >
        <header className="quiz-head">
          <div>
            <span className="quiz-step">
              Question {index + 1} of {questions.length}
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

        <div className="quiz-progress" aria-hidden="true">
          <span style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
        </div>

        <div className="quiz-body">
          <h2 className="quiz-question" id="quiz-question">
            {current.question}
          </h2>

          {alert && (
            <p className="form-alert" role="alert">
              {alert}
            </p>
          )}

          <div className="quiz-options">
            {(['yes', 'no'] as const).map((choice) => (
              <button
                key={choice}
                type="button"
                className={
                  picked === choice ? 'quiz-option is-picked' : 'quiz-option'
                }
                onClick={() => answer(choice)}
                disabled={locked || busy}
              >
                {choice === 'yes' ? 'Yes' : 'No'}
              </button>
            ))}
          </div>

          {picked !== null && current.required && !correct && (
            <p className="quiz-verdict">
              You need to choose Yes to start AI trading.
            </p>
          )}

          {picked !== null && !current.required && (
            <p className={correct ? 'quiz-verdict is-right' : 'quiz-verdict'}>
              {correct ? <CheckIcon /> : null}
              {correct
                ? 'That is right.'
                : `The answer is ${current.answer === 'yes' ? 'Yes' : 'No'}.`}
            </p>
          )}
        </div>

        <footer className="quiz-foot">
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={next}
            disabled={!canAdvance || busy}
          >
            {busy
              ? 'Starting…'
              : isLast
                ? `Start AI trading with ${amountLabel}`
                : 'Next question'}
          </button>
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
