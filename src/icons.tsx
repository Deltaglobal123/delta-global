export function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="url(#logo-grad)" />
      <path d="M16 8.5 23.5 22h-15L16 8.5Z" fill="#04120c" />
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
          <stop stopColor="#2ee6a8" />
          <stop offset="1" stopColor="#4f8cff" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg className="check" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="m5.5 10.5 3 3 6-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ArrowIcon() {
  return (
    <svg className="arrow" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M4 10h12m-5-5 5 5-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PlusIcon() {
  return (
    <svg className="plus" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M10 4v12M4 10h12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function QuoteIcon() {
  return (
    <svg className="quote-mark" viewBox="0 0 40 32" aria-hidden="true">
      <path
        d="M0 32V18.4C0 8.2 5.1 1.9 15.2 0l1.9 4.6c-5.7 1.5-8.6 4.7-8.6 9.6h7.4V32H0Zm22.9 0V18.4C22.9 8.2 28 1.9 38.1 0L40 4.6c-5.7 1.5-8.6 4.7-8.6 9.6h7.4V32H22.9Z"
        fill="currentColor"
      />
    </svg>
  )
}

/**
 * Decorative growth visual for the "difference you'll experience" section.
 * Swap for the brand photo/illustration when one is available.
 */
export function GrowthArt() {
  const bars = [34, 58, 80, 108, 140, 178]

  return (
    <svg
      className="growth-art"
      viewBox="0 0 520 240"
      role="img"
      aria-label="Illustration of steadily rising returns"
    >
      <defs>
        <linearGradient id="bar-grad" x1="0" y1="240" x2="0" y2="0">
          <stop stopColor="#2ee6a8" stopOpacity="0.15" />
          <stop offset="1" stopColor="#2ee6a8" stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id="line-grad" x1="0" y1="0" x2="520" y2="0">
          <stop stopColor="#2ee6a8" />
          <stop offset="1" stopColor="#4f8cff" />
        </linearGradient>
        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="240">
          <stop stopColor="#4f8cff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#4f8cff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1="0"
          x2="520"
          y1={40 + i * 50}
          y2={40 + i * 50}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="1"
        />
      ))}

      {bars.map((h, i) => (
        <rect
          key={h}
          x={38 + i * 78}
          y={206 - h}
          width="44"
          height={h}
          rx="10"
          fill="url(#bar-grad)"
        />
      ))}

      <path
        d="M60 176 138 152 216 130 294 102 372 74 450 34"
        fill="none"
        stroke="url(#line-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M60 176 138 152 216 130 294 102 372 74 450 34V206H60Z"
        fill="url(#area-grad)"
      />

      {[
        [60, 176],
        [138, 152],
        [216, 130],
        [294, 102],
        [372, 74],
        [450, 34],
      ].map(([cx, cy]) => (
        <circle
          key={cx}
          cx={cx}
          cy={cy}
          r="5"
          fill="#05070c"
          stroke="#2ee6a8"
          strokeWidth="2.5"
        />
      ))}

      <line
        x1="0"
        x2="520"
        y1="206"
        y2="206"
        stroke="rgba(255,255,255,0.16)"
        strokeWidth="1"
      />
    </svg>
  )
}
