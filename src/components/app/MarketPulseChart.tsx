import { useEffect, useRef } from 'react'

type Candle = { o: number; h: number; l: number; c: number }

/** Width of one candle slot, body plus gap, in CSS pixels. */
const SLOT = 14
/** How long one candle stays open before the next one starts, in ms. */
const PERIOD = 1400
/** How often the open candle's price moves, in ms. */
const STEP = 90
const PAD_TOP = 18
const PAD_BOTTOM = 14
/** Room on the right for the live candle and its price line to breathe. */
const PAD_RIGHT = 34

function cssVar(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
  return value || fallback
}

/** A gentle random walk with a slow drift, so it reads like a market. */
function nextPrice(price: number, drift: number) {
  const shock = (Math.random() - 0.5) * 1.6
  return Math.max(20, price + shock + drift)
}

function seed(count: number): Candle[] {
  const candles: Candle[] = []
  let price = 100
  for (let i = 0; i < count; i++) {
    const o = price
    let h = o
    let l = o
    let c = o
    const drift = Math.sin(i / 9) * 0.12
    for (let s = 0; s < PERIOD / STEP; s++) {
      c = nextPrice(c, drift)
      h = Math.max(h, c)
      l = Math.min(l, c)
    }
    candles.push({ o, h, l, c })
    price = c
  }
  // The open candle, which grows live from here.
  candles.push({ o: price, h: price, l: price, c: price })
  return candles
}

/**
 * A decorative candlestick chart that keeps flowing while a run is open. The
 * prices are generated here, not fetched — it shows that the desk is at work,
 * not what the customer's run is doing — and the caption says so.
 */
export function MarketPulseChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const up = cssVar('--accent', '#2ee6a8')
    const down = '#ff7a7a'
    const grid = cssVar('--border', 'rgba(255,255,255,0.08)')

    let width = 0
    let height = 0
    const candles = seed(80)
    let periodStart = performance.now()
    let lastStep = periodStart
    let drift = 0
    // Smoothed so the axis eases instead of snapping when a new high lands.
    let lo = 0
    let hi = 0
    let frame = 0

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      const ratio = window.devicePixelRatio || 1
      width = rect.width
      height = rect.height
      canvas!.width = Math.round(width * ratio)
      canvas!.height = Math.round(height * ratio)
      ctx!.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    function advance(now: number) {
      const live = candles[candles.length - 1]

      while (now - lastStep >= STEP) {
        lastStep += STEP
        live.c = nextPrice(live.c, drift)
        live.h = Math.max(live.h, live.c)
        live.l = Math.min(live.l, live.c)
      }

      if (now - periodStart >= PERIOD) {
        periodStart += PERIOD
        // Trends come and go, so the chart has swings rather than noise.
        if (Math.random() < 0.18) drift = (Math.random() - 0.5) * 0.5
        candles.push({ o: live.c, h: live.c, l: live.c, c: live.c })
        if (candles.length > 200) candles.shift()
      }
    }

    function draw(now: number) {
      // Slides every candle left as the open one ages, so the chart flows
      // rather than stepping a slot at a time.
      const phase = still ? 0 : Math.min(1, (now - periodStart) / PERIOD)
      const visible = Math.ceil(width / SLOT) + 2
      const shown = candles.slice(-visible)

      let min = Infinity
      let max = -Infinity
      for (const candle of shown) {
        min = Math.min(min, candle.l)
        max = Math.max(max, candle.h)
      }
      const margin = (max - min) * 0.12 || 1
      if (hi === 0 || still) {
        lo = min - margin
        hi = max + margin
      } else {
        lo += (min - margin - lo) * 0.08
        hi += (max + margin - hi) * 0.08
      }

      const plot = height - PAD_TOP - PAD_BOTTOM
      const y = (price: number) => PAD_TOP + ((hi - price) / (hi - lo)) * plot

      ctx!.clearRect(0, 0, width, height)

      ctx!.strokeStyle = grid
      ctx!.lineWidth = 1
      ctx!.setLineDash([3, 5])
      for (let i = 1; i <= 3; i++) {
        const gy = Math.round(PAD_TOP + (plot * i) / 4) + 0.5
        ctx!.beginPath()
        ctx!.moveTo(0, gy)
        ctx!.lineTo(width, gy)
        ctx!.stroke()
      }
      ctx!.setLineDash([])

      const body = SLOT - 5
      shown.forEach((candle, i) => {
        const fromRight = shown.length - 1 - i
        const x = width - PAD_RIGHT - (fromRight + phase) * SLOT
        if (x < -SLOT || x > width) return

        const colour = candle.c >= candle.o ? up : down
        const isLive = i === shown.length - 1
        ctx!.globalAlpha = isLive ? 1 : 0.55 + 0.45 * (1 - fromRight / shown.length)
        ctx!.strokeStyle = colour
        ctx!.fillStyle = colour

        const cx = Math.round(x) + 0.5
        ctx!.beginPath()
        ctx!.moveTo(cx, y(candle.h))
        ctx!.lineTo(cx, y(candle.l))
        ctx!.stroke()

        const top = y(Math.max(candle.o, candle.c))
        const bottom = y(Math.min(candle.o, candle.c))
        ctx!.fillRect(Math.round(x - body / 2), top, body, Math.max(1.5, bottom - top))
      })
      ctx!.globalAlpha = 1

      const live = shown[shown.length - 1]
      const ly = y(live.c)
      const colour = live.c >= live.o ? up : down
      const liveX = width - PAD_RIGHT - phase * SLOT

      ctx!.strokeStyle = colour
      ctx!.globalAlpha = 0.6
      ctx!.setLineDash([4, 4])
      ctx!.beginPath()
      ctx!.moveTo(0, ly)
      ctx!.lineTo(width, ly)
      ctx!.stroke()
      ctx!.setLineDash([])
      ctx!.globalAlpha = 1

      // A pulse on the open candle, so it is obvious the chart is live.
      const pulse = still ? 0 : (now % 1200) / 1200
      ctx!.fillStyle = colour
      ctx!.globalAlpha = 0.35 * (1 - pulse)
      ctx!.beginPath()
      ctx!.arc(liveX, ly, 4 + pulse * 10, 0, Math.PI * 2)
      ctx!.fill()
      ctx!.globalAlpha = 1
      ctx!.beginPath()
      ctx!.arc(liveX, ly, 3.5, 0, Math.PI * 2)
      ctx!.fill()
    }

    function loop(now: number) {
      advance(now)
      draw(now)
      frame = requestAnimationFrame(loop)
    }

    resize()
    const observer = new ResizeObserver(() => {
      resize()
      draw(performance.now())
    })
    observer.observe(canvas)

    if (still) {
      draw(performance.now())
    } else {
      frame = requestAnimationFrame(loop)
    }

    // A tab in the background pauses rAF; jump the clocks so it doesn't
    // replay every missed candle in one frame when it comes back.
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      const now = performance.now()
      periodStart = now
      lastStep = now
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return (
    <figure className="market-pulse">
      <canvas ref={canvasRef} className="market-pulse-canvas" aria-hidden="true" />
      <figcaption className="market-pulse-caption">
        <span className="market-pulse-dot" aria-hidden="true" />
        Market activity · illustrative
      </figcaption>
    </figure>
  )
}
