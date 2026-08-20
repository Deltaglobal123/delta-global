/**
 * Product visuals, drawn as inline SVG rather than sourced as images.
 *
 * Three reasons this is not a folder of stock photography:
 *   - nothing loads from a third-party host, so there is no licensing exposure
 *     and no extra network request;
 *   - the palette is the site's palette, so the art cannot drift from the brand;
 *   - a few KB of vector stays sharp at any size and in any theme.
 *
 * IMPORTANT: every value slot in these mockups is a neutral bar, never a number.
 * A mockup showing "+₹42,300 P&L" would read as a performance claim, which is
 * exactly what the risk copy on this site says it will not do.
 */

/* ------------------------------- primitives ------------------------------- */

/** Shared defs. Rendered once per SVG; ids are namespaced by `k` to stay unique. */
function ArtDefs({ k }: { k: string }) {
  return (
    <defs>
      <linearGradient id={`${k}-line`} x1="0" y1="0" x2="1" y2="0">
        <stop stopColor="#2ee6a8" />
        <stop offset="1" stopColor="#4f8cff" />
      </linearGradient>
      <linearGradient id={`${k}-area`} x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#2ee6a8" stopOpacity="0.3" />
        <stop offset="1" stopColor="#2ee6a8" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`${k}-panel`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#ffffff" stopOpacity="0.07" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0.02" />
      </linearGradient>
    </defs>
  )
}

/** A neutral stand-in for a value that only exists once a user is signed in. */
function ValueBar({
  x,
  y,
  w,
  h = 9,
  o = 0.28,
}: {
  x: number
  y: number
  w: number
  h?: number
  o?: number
}) {
  return (
    <rect x={x} y={y} width={w} height={h} rx={h / 2} fill="#fff" opacity={o} />
  )
}

/* --------------------------------- hero ----------------------------------- */

/**
 * The hero product shot: a strategy panel over a chart, with the surrounding
 * dashboard chrome implied rather than drawn in full.
 */
export function HeroArt() {
  return (
    <svg
      className="art art-hero"
      viewBox="0 0 720 380"
      role="img"
      aria-label="Illustration of the trading dashboard: a market chart with an active strategy panel and portfolio summary"
    >
      <ArtDefs k="hero" />

      <rect
        x="1"
        y="1"
        width="718"
        height="378"
        rx="20"
        fill="url(#hero-panel)"
        stroke="rgba(255,255,255,0.12)"
      />

      {/* window chrome */}
      <g opacity="0.5">
        <circle cx="30" cy="28" r="5" fill="#2ee6a8" />
        <circle cx="48" cy="28" r="5" fill="#ffd27a" />
        <circle cx="66" cy="28" r="5" fill="#4f8cff" />
      </g>
      <line
        x1="0"
        x2="720"
        y1="54"
        y2="54"
        stroke="rgba(255,255,255,0.09)"
      />

      {/* stat row */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${28 + i * 158}, 76)`}>
          <rect
            width="142"
            height="62"
            rx="12"
            fill="#fff"
            opacity="0.035"
            stroke="rgba(255,255,255,0.08)"
          />
          <ValueBar x={16} y={16} w={54} h={7} o={0.22} />
          <ValueBar x={16} y={34} w={84} h={12} o={0.34} />
        </g>
      ))}

      {/* strategy status pill */}
      <g transform="translate(502, 76)">
        <rect
          width="190"
          height="62"
          rx="12"
          fill="rgba(46,230,168,0.1)"
          stroke="rgba(46,230,168,0.35)"
        />
        <circle cx="24" cy="31" r="6" fill="#2ee6a8" />
        <ValueBar x={40} y={19} w={92} h={7} o={0.3} />
        <ValueBar x={40} y={36} w={124} h={9} o={0.5} />
      </g>

      {/* chart — stops short of the panel edge so the line never kisses the border */}
      <g transform="translate(28, 164)">
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1="0"
            x2="640"
            y1={i * 46}
            y2={i * 46}
            stroke="rgba(255,255,255,0.06)"
          />
        ))}

        <path
          d="M0 128 L80 112 L160 122 L240 84 L320 92 L400 56 L480 62 L560 30 L640 14 L640 138 L0 138 Z"
          fill="url(#hero-area)"
        />
        <path
          d="M0 128 L80 112 L160 122 L240 84 L320 92 L400 56 L480 62 L560 30 L640 14"
          fill="none"
          stroke="url(#hero-line)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* signal markers — 2px surface ring keeps them legible over the line */}
        {[
          [240, 84],
          [480, 62],
        ].map(([cx, cy]) => (
          <circle
            key={cx}
            cx={cx}
            cy={cy}
            r="6"
            fill="#090d15"
            stroke="#2ee6a8"
            strokeWidth="2.5"
          />
        ))}

        <line
          x1="0"
          x2="640"
          y1="160"
          y2="160"
          stroke="rgba(255,255,255,0.12)"
        />
      </g>
    </svg>
  )
}

/* ------------------------------ market scan ------------------------------- */

/**
 * Candles with the scan window over the segment a strategy condition matched.
 *
 * Direction is teal-up / blue-down rather than the conventional green/red: red
 * and green are the one pair a red-green colourblind reader cannot separate, and
 * these two carry ΔE 29 under deuteranopia. Body direction says it too, so the
 * meaning never rests on hue alone.
 *
 * Coordinates are in SVG space, where y grows downward — a candle closed up when
 * `close` is the SMALLER number.
 */
const CANDLES: [high: number, low: number, open: number, close: number][] = [
  [100, 140, 132, 112],
  [96, 134, 112, 124],
  [88, 126, 124, 98],
  [84, 118, 98, 110],
  [72, 112, 110, 82],
  [66, 104, 82, 96],
  [58, 98, 96, 68],
  [54, 88, 68, 78],
  [44, 84, 78, 52],
  [38, 72, 52, 64],
  [28, 68, 64, 36],
  [20, 52, 36, 26],
]

export function MarketScanArt() {
  return (
    <svg
      className="art art-scan"
      viewBox="0 0 520 182"
      role="img"
      aria-label="Illustration of market scanning: price candles with a highlighted window where a strategy condition was met"
    >
      {[0, 1, 2].map((i) => (
        <line
          key={i}
          x1="0"
          x2="520"
          y1={40 + i * 40}
          y2={40 + i * 40}
          stroke="rgba(255,255,255,0.06)"
        />
      ))}

      {/* the matched window — a band across the last three candles */}
      <rect
        x="364"
        y="10"
        width="120"
        height="140"
        rx="12"
        fill="rgba(46,230,168,0.08)"
        stroke="rgba(46,230,168,0.45)"
        strokeDasharray="5 5"
      />

      {CANDLES.map(([high, low, open, close], i) => {
        const x = 24 + i * 40
        const up = close < open
        const color = up ? '#2ee6a8' : '#4f8cff'
        return (
          <g key={x}>
            <line
              x1={x}
              x2={x}
              y1={high}
              y2={low}
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.8"
            />
            <rect
              x={x - 7}
              y={Math.min(open, close)}
              width="14"
              height={Math.abs(close - open)}
              rx="4"
              fill={color}
              opacity="0.95"
            />
          </g>
        )
      })}

      <text
        x="424"
        y="170"
        textAnchor="middle"
        fill="#2ee6a8"
        fontSize="11"
        fontWeight="700"
        letterSpacing="0.1em"
      >
        CONDITION MET
      </text>
    </svg>
  )
}

/* ------------------------------- dashboard -------------------------------- */

/** The fuller dashboard mockup used in the "one dashboard" section. */
export function DashboardArt() {
  return (
    <svg
      className="art art-dashboard"
      viewBox="0 0 760 420"
      role="img"
      aria-label="Illustration of the dashboard: navigation, portfolio tiles, a performance chart and a list of open positions"
    >
      <ArtDefs k="dash" />

      <rect
        x="1"
        y="1"
        width="758"
        height="418"
        rx="20"
        fill="url(#dash-panel)"
        stroke="rgba(255,255,255,0.12)"
      />

      {/* sidebar */}
      <line x1="168" x2="168" y1="0" y2="420" stroke="rgba(255,255,255,0.09)" />
      <g transform="translate(24, 28)">
        <rect width="26" height="26" rx="8" fill="url(#dash-line)" />
        <ValueBar x={36} y={9} w={62} h={9} o={0.4} />
      </g>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(24, ${88 + i * 42})`}>
          {i === 0 && (
            <rect
              x="-8"
              y="-9"
              width="136"
              height="30"
              rx="9"
              fill="rgba(46,230,168,0.12)"
            />
          )}
          <rect
            width="12"
            height="12"
            rx="4"
            fill={i === 0 ? '#2ee6a8' : '#fff'}
            opacity={i === 0 ? 1 : 0.25}
          />
          <ValueBar x={24} y={1} w={72 - i * 6} h={10} o={i === 0 ? 0.5 : 0.22} />
        </g>
      ))}

      {/* tiles */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${192 + i * 188}, 28)`}>
          <rect
            width="168"
            height="72"
            rx="12"
            fill="#fff"
            opacity="0.035"
            stroke="rgba(255,255,255,0.08)"
          />
          <ValueBar x={16} y={18} w={60} h={7} o={0.22} />
          <ValueBar x={16} y={38} w={104} h={14} o={0.32} />
        </g>
      ))}

      {/* chart */}
      <g transform="translate(192, 124)">
        <rect
          width="356"
          height="164"
          rx="12"
          fill="#fff"
          opacity="0.025"
          stroke="rgba(255,255,255,0.08)"
        />
        {[0, 1, 2].map((i) => (
          <line
            key={i}
            x1="16"
            x2="340"
            y1={44 + i * 36}
            y2={44 + i * 36}
            stroke="rgba(255,255,255,0.06)"
          />
        ))}
        <path
          d="M16 124 L60 110 L104 118 L148 88 L192 96 L236 64 L280 72 L324 40 L324 140 L16 140 Z"
          fill="url(#dash-area)"
        />
        <path
          d="M16 124 L60 110 L104 118 L148 88 L192 96 L236 64 L280 72 L324 40"
          fill="none"
          stroke="url(#dash-line)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* risk panel */}
      <g transform="translate(564, 124)">
        <rect
          width="172"
          height="164"
          rx="12"
          fill="#fff"
          opacity="0.025"
          stroke="rgba(255,255,255,0.08)"
        />
        <ValueBar x={16} y={20} w={72} h={7} o={0.22} />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(16, ${48 + i * 36})`}>
            <ValueBar x={0} y={0} w={56} h={7} o={0.18} />
            <rect
              x="0"
              y="14"
              width="140"
              height="6"
              rx="3"
              fill="#fff"
              opacity="0.08"
            />
            <rect
              x="0"
              y="14"
              width={[96, 62, 118][i]}
              height="6"
              rx="3"
              fill={i === 1 ? '#ffd27a' : '#2ee6a8'}
              opacity="0.85"
            />
          </g>
        ))}
      </g>

      {/* positions table */}
      <g transform="translate(192, 308)">
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(0, ${i * 32})`}>
            <line
              x1="0"
              x2="544"
              y1="26"
              y2="26"
              stroke="rgba(255,255,255,0.06)"
            />
            <circle cx="8" cy="12" r="5" fill={i === 1 ? '#4f8cff' : '#2ee6a8'} />
            <ValueBar x={26} y={7} w={92} h={9} o={0.3} />
            <ValueBar x={190} y={7} w={64} h={9} o={0.2} />
            <ValueBar x={318} y={7} w={72} h={9} o={0.2} />
            <ValueBar x={452} y={7} w={92} h={9} o={0.26} />
          </g>
        ))}
      </g>
    </svg>
  )
}

/* ------------------------------- strategies ------------------------------- */

const SHAPES: Record<string, { d: string; label: string; mean?: boolean }> = {
  trend: {
    d: 'M4 44 L24 40 L44 34 L64 30 L84 22 L104 18 L124 10',
    label: 'A steadily rising line',
  },
  momentum: {
    d: 'M4 46 L24 44 L44 42 L64 36 L84 24 L104 12 L124 6',
    label: 'A line that accelerates upward',
  },
  'mean-reversion': {
    d: 'M4 26 L24 10 L44 30 L64 12 L84 34 L104 14 L124 28',
    label: 'A line oscillating around a middle level',
    mean: true,
  },
  custom: {
    d: 'M4 40 L24 28 L44 36 L64 16 L84 30 L104 14 L124 22',
    label: 'A configurable, irregular line',
  },
}

/** The shape a strategy is looking for — schematic, not a performance record. */
export function StrategyShape({ id }: { id: string }) {
  const shape = SHAPES[id] ?? SHAPES.custom

  return (
    <svg
      className="art-shape"
      viewBox="0 0 128 52"
      role="img"
      aria-label={`Schematic of the ${id.replace('-', ' ')} pattern: ${shape.label}`}
    >
      {shape.mean && (
        <line
          x1="4"
          x2="124"
          y1="22"
          y2="22"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
      )}
      <path
        d={shape.d}
        fill="none"
        stroke="#2ee6a8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ------------------------------- performance ------------------------------ */

/**
 * What a drawdown looks like against an equity curve. Deliberately unlabelled on
 * the y-axis — it explains the metric, it does not report one.
 */
export function DrawdownArt() {
  return (
    <svg
      className="art art-drawdown"
      viewBox="0 0 520 200"
      role="img"
      aria-label="Diagram explaining drawdown: an equity curve with the decline from its peak shaded"
    >
      <ArtDefs k="dd" />

      {[0, 1, 2].map((i) => (
        <line
          key={i}
          x1="0"
          x2="520"
          y1={40 + i * 44}
          y2={40 + i * 44}
          stroke="rgba(255,255,255,0.06)"
        />
      ))}

      {/* peak reference */}
      <line
        x1="150"
        x2="470"
        y1="48"
        y2="48"
        stroke="rgba(255,210,122,0.5)"
        strokeWidth="1.5"
        strokeDasharray="5 5"
      />

      {/* the drawdown region */}
      <path
        d="M150 48 L200 78 L250 104 L300 122 L350 96 L400 74 L440 48 Z"
        fill="rgba(255,210,122,0.14)"
      />

      <path
        d="M10 150 L80 110 L150 48 L200 78 L250 104 L300 122 L350 96 L400 74 L440 48 L510 22"
        fill="none"
        stroke="url(#dd-line)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="150" cy="48" r="6" fill="#090d15" stroke="#ffd27a" strokeWidth="2.5" />
      <circle cx="300" cy="122" r="6" fill="#090d15" stroke="#ffd27a" strokeWidth="2.5" />

      <text x="150" y="34" textAnchor="middle" fill="#ffd27a" fontSize="12" fontWeight="600">
        Peak
      </text>
      <text x="300" y="146" textAnchor="middle" fill="#ffd27a" fontSize="12" fontWeight="600">
        Trough
      </text>
      <text x="225" y="96" textAnchor="middle" fill="#ffd27a" fontSize="12" fontWeight="600" opacity="0.9">
        Drawdown
      </text>
    </svg>
  )
}
