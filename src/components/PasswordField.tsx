import { useId, useState } from 'react'
import { EyeIcon, EyeOffIcon } from './app/app-icons'

export function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  autoComplete = 'current-password',
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
  autoComplete?: string
}) {
  const [shown, setShown] = useState(false)
  const describedBy = useId()

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>

      <div className="password-field">
        <input
          id={id}
          name={id}
          type={shown ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? describedBy : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="password-toggle"
          // The label carries the action, so screen readers get the state too.
          aria-label={shown ? 'Hide password' : 'Show password'}
          aria-pressed={shown}
          onClick={() => setShown((previous) => !previous)}
        >
          {shown ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      {error ? (
        <p className="field-error" id={describedBy}>
          {error}
        </p>
      ) : hint ? (
        <p className="field-hint" id={describedBy}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
