import { useEffect, useRef, useState } from 'react'

type Candle = { t: number; o: number; h: number; l: number; c: number }
type Feed = 'connecting' | 'live' | 'reconnecting' | 'sim'

/** Width of one candle slot, body plus gap, in CSS pixels. */
const SLOT = 14
/** How long one candle stays open before the next one starts, in ms. */
const PERIOD = 1000
/** How often the simulated open candle's price moves, in ms. */
const STEP = 90
const PAD_TOP = 18
const PAD_BOTTOM = 14
/** Room on the right for the live candle and the price tag beside it. */
const PAD_RIGHT = 112

/** The real market shown — Binance's public spot feed, no key needed. */
const PAIR = 'BTC/USDT'
const SYMBOL = 'BTCUSDT'
const HISTORY_URL = `https://api.binance.com/api/v3/klines?symbol=${SYMBOL}&interval=1s&limit=240`
const STREAM_URL = `wss://stream.binance.com:9443/ws/${SYMBOL.toLowerCase()}@kline_1s`
/** Give up on the live feed and simulate if history hasn't landed by then. */
const CONNECT_TIMEOUT = 6000
const RECONNECT_DELAY = 3000

/** Where the simulated fallback opens, and the level it wanders around. */
const ANCHOR = 66051

const usdt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const CAPTIONS: Record<Feed, string> = {
  connecting: `Connecting to ${PAIR}…`,
  live: `${PAIR} · live market`,
  reconnecting: `${PAIR} · reconnecting…`,
  sim: 'Market activity · illustrative',
}

function cssVar(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
  return value || fallback
}

/**
 * A gentle random walk with a slow drift, so it reads like a market. A faint
 * pull towards the anchor lets it rise and fall without wandering off.
 */
function nextPrice(price: number, drift: number) {
  const tick = ANCHOR * 0.00058
  const shock = (Math.random() - 0.5) * 1.6 * tick
  const pull = (ANCHOR - price) * 0.002
  return price + shock + drift * tick + pull
}

function seed(count: number): Candle[] {
  const candles: Candle[] = []
  let price = ANCHOR
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
    candles.push({ t: i, o, h, l, c })
    price = c
  }
  // Shift the history so the live price opens exactly on the anchor.
  const shift = ANCHOR - price
  for (const candle of candles) {
    candle.o += shift
    candle.h += shift
    candle.l += shift
    candle.c += shift
  }
  // The open candle, which grows live from here.
  candles.push({ t: count, o: ANCHOR, h: ANCHOR, l: ANCHOR, c: ANCHOR })
  return candles
}

/**
 * A candlestick chart that keeps flowing while a run is open. It streams the
 * real BTC/USDT market, one-second candles, from Binance's public feed. That
 * is the market, not the customer's run, and the caption names the pair so it
 * never reads as their position. If the feed can't be reached it falls back
 * to a simulated walk and the caption says it is illustrative.
 */
export function MarketPulseChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tagRef = useRef<HTMLSpanElement>(null)
  const [feed, setFeed] = useState<Feed>('connecting')

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const tag = tagRef.current
    if (!canvas || !ctx || !tag) return

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const up = cssVar('--accent', '#2ee6a8')
    const down = '#ff7a7a'
    const grid = cssVar('--border', 'rgba(255,255,255,0.08)')

    let width = 0
    let height = 0
    let mode: Feed = 'connecting'
    let candles: Candle[] = []
    // When the open candle appeared here, so it slides by local time and a
    // skewed device clock can't freeze or rush the chart.
    let periodStart = performance.now()
    let lastStep = periodStart
    let drift = 0
    // Smoothed so the axis eases instead of snapping when a new high lands.
    let lo = 0
    let hi = 0
    let frame = 0
    let shownPrice = ''
    let disposed = false
    let socket: WebSocket | null = null
    let retry = 0

    function setMode(next: Feed) {
      mode = next
      setFeed(next)
    }

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
      if (mode !== 'sim') return
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
        candles.push({ t: live.t + 1, o: live.c, h: live.c, l: live.c, c: live.c })
        if (candles.length > 300) candles.shift()
      }
    }

    function draw(now: number) {
      ctx!.clearRect(0, 0, width, height)
      if (candles.length === 0) return

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

      // The price tag is DOM, not canvas, so the edge fade doesn't dim it.
      const price = (mode === 'sim' ? inr : usdt).format(live.c)
      if (price !== shownPrice) {
        shownPrice = price
        tag!.textContent = price
      }
      tag!.style.visibility = 'visible'
      tag!.style.background = colour
      tag!.style.transform = `translateY(${canvas!.offsetTop + ly}px) translateY(-50%)`
    }

    function loop(now: number) {
      advance(now)
      draw(now)
      frame = requestAnimationFrame(loop)
    }

    function simulate() {
      if (disposed || mode !== 'connecting') return
      candles = seed(80)
      periodStart = performance.now()
      lastStep = periodStart
      setMode('sim')
      if (still) draw(performance.now())
    }

    function onKline(event: MessageEvent) {
      const k = JSON.parse(event.data).k
      if (!k) return
      const candle: Candle = { t: k.t, o: +k.o, h: +k.h, l: +k.l, c: +k.c }
      const last = candles[candles.length - 1]
      if (last && last.t === candle.t) {
        Object.assign(last, candle)
      } else if (!last || candle.t > last.t) {
        candles.push(candle)
        periodStart = performance.now()
        if (candles.length > 300) candles.shift()
      }
      if (still) draw(performance.now())
    }

    function connect() {
      if (disposed) return
      socket = new WebSocket(STREAM_URL)
      socket.onmessage = onKline
      socket.onopen = () => setMode('live')
      socket.onclose = () => {
        if (disposed) return
        setMode('reconnecting')
        retry = window.setTimeout(connect, RECONNECT_DELAY)
      }
    }

    // History first, so the chart opens full; then the stream keeps it moving.
    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      controller.abort()
      simulate()
    }, CONNECT_TIMEOUT)
    fetch(HISTORY_URL, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<[number, string, string, string, string][]>
      })
      .then((rows) => {
        window.clearTimeout(timeout)
        if (disposed || mode !== 'connecting') return
        candles = rows.map(([t, o, h, l, c]) => ({ t, o: +o, h: +h, l: +l, c: +c }))
        periodStart = performance.now()
        if (still) draw(performance.now())
        connect()
      })
      .catch(() => {
        window.clearTimeout(timeout)
        simulate()
      })

    resize()
    const observer = new ResizeObserver(() => {
      resize()
      draw(performance.now())
    })
    observer.observe(canvas)

    if (!still) frame = requestAnimationFrame(loop)

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
      disposed = true
      controller.abort()
      window.clearTimeout(timeout)
      window.clearTimeout(retry)
      socket?.close()
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return (
    <figure className="market-pulse">
      <canvas ref={canvasRef} className="market-pulse-canvas" aria-hidden="true" />
      <span
        ref={tagRef}
        className="market-pulse-price"
        style={{ visibility: 'hidden' }}
        aria-hidden="true"
      />
      <figcaption className="market-pulse-caption">
        <span className="market-pulse-dot" aria-hidden="true" />
        {CAPTIONS[feed]}
      </figcaption>
    </figure>
  )
}
