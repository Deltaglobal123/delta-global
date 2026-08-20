/**
 * The badge / heading / description block that opens almost every section on the
 * home page. `body` takes a string or several paragraphs.
 */
export function SectionHead({
  badge,
  heading,
  body,
}: {
  badge: string
  heading: string
  body?: string | string[]
}) {
  const paragraphs = typeof body === 'string' ? [body] : (body ?? [])

  return (
    <div className="section-head">
      <span className="eyebrow">{badge}</span>
      <h2>{heading}</h2>
      {paragraphs.map((text) => (
        <p key={text}>{text}</p>
      ))}
    </div>
  )
}
