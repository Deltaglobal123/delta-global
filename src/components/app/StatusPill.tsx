type Tone = 'pending' | 'running' | 'good' | 'bad'

/** Statuses arrive as a machine value plus a label: switch on one, render the other. */
const TONES: Record<string, Tone> = {
  pending: 'pending',
  running: 'running',
  approved: 'running',
  completed: 'good',
  paid: 'good',
  rejected: 'bad',
}

export function StatusPill({ status, label }: { status: string; label: string }) {
  const tone = TONES[status] ?? 'pending'

  return (
    <span className={`pill pill-${tone}`}>
      {(tone === 'pending' || tone === 'running') && (
        <span className="pill-dot" aria-hidden="true" />
      )}
      {label}
    </span>
  )
}
