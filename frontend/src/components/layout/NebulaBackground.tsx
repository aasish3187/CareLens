import { useEffect, useRef } from 'react'

interface GridDot {
  x: number
  y: number
  baseRadius: number
  color: string
  opacity: number
  // Sequential phase factor based on diagonal position
  seqPhase: number
  // Randomized individual pulsation parameters
  randFreq1: number
  randFreq2: number
  randPhase: number
  randAmp: number
  isAccent: boolean
}

interface ConstellationEdge {
  fromIndex: number
  toIndex: number
  color: string
}

export default function NebulaBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId: number
    let width = 0
    let height = 0
    let dpr = 1
    let dots: GridDot[] = []
    let edges: ConstellationEdge[] = []

    const SPACING = 38 // Grid interval in pixels (matches the high-tech matrix from reference)

    // Palette calibrated for bio-digital health aesthetic
    const TEAL = 'rgba(13, 148, 136,'
    const CYAN = 'rgba(14, 165, 233,'
    const EMERALD = 'rgba(16, 185, 129,'
    const INDIGO = 'rgba(99, 102, 241,'
    const SLATE = 'rgba(100, 116, 139,'

    const buildGrid = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      const cols = Math.ceil(width / SPACING) + 2
      const rows = Math.ceil(height / SPACING) + 2
      const offsetX = (width - (cols - 1) * SPACING) / 2
      const offsetY = (height - (rows - 1) * SPACING) / 2

      dots = []
      const accentIndices: number[] = []

      // Pseudo-random deterministic hash for stable visual distribution
      const pseudoRand = (seed: number) => {
        const x = Math.sin(seed * 9999) * 10000
        return x - Math.floor(x)
      }

      let dotCounter = 0
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * SPACING
          const y = offsetY + r * SPACING
          const seed = r * 1000 + c + 1
          const randVal = pseudoRand(seed)
          const randVal2 = pseudoRand(seed * 3.7 + 11)

          // 3 Distinct size tiers matching user's reference screenshot:
          // 1) Dominant pinpoints (1.1px - 1.4px)
          // 2) Medium harmonic nodes (2.0px - 2.5px)
          // 3) Luminous accent nodes (3.2px - 4.2px)
          let baseRadius: number
          let color: string
          let baseOpacity: number
          let isAccent = false

          if (randVal < 0.08) {
            // Luminous Accent Node (~8%)
            baseRadius = 3.2 + randVal2 * 1.0
            const colPick = pseudoRand(seed * 7.1)
            color = colPick < 0.4 ? CYAN : colPick < 0.75 ? TEAL : colPick < 0.9 ? INDIGO : EMERALD
            baseOpacity = 0.52
            isAccent = true
          } else if (randVal < 0.28) {
            // Medium Harmonic Node (~20%)
            baseRadius = 2.0 + randVal2 * 0.6
            color = pseudoRand(seed * 2.3) > 0.5 ? TEAL : CYAN
            baseOpacity = 0.35
          } else {
            // Subtle Base Pinpoint (~72%)
            baseRadius = 1.0 + randVal2 * 0.4
            color = pseudoRand(seed * 1.7) > 0.4 ? TEAL : SLATE
            baseOpacity = 0.18
          }

          // Sequential phase based on diagonal wave coordinate
          const seqPhase = (x * 0.005 + y * 0.005)

          // Randomized organic frequencies for individual shimmer
          const randFreq1 = 0.8 + pseudoRand(seed * 5.3) * 1.6
          const randFreq2 = 0.5 + pseudoRand(seed * 8.9) * 1.2
          const randPhase = pseudoRand(seed * 13.1) * Math.PI * 2
          const randAmp = 0.35 + pseudoRand(seed * 4.1) * 0.45

          const dotIndex = dots.length
          dots.push({
            x,
            y,
            baseRadius,
            color,
            opacity: baseOpacity,
            seqPhase,
            randFreq1,
            randFreq2,
            randPhase,
            randAmp,
            isAccent,
          })

          if (isAccent) {
            accentIndices.push(dotIndex)
          }

          dotCounter++
        }
      }

      // Connect nearby accent nodes with delicate constellation lines (as seen in user's image)
      edges = []
      const maxConnectDist = SPACING * 4.2
      for (let i = 0; i < accentIndices.length; i++) {
        const idxA = accentIndices[i]
        const a = dots[idxA]
        let connections = 0

        for (let j = i + 1; j < accentIndices.length && connections < 2; j++) {
          const idxB = accentIndices[j]
          const b = dots[idxB]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)

          if (dist > SPACING * 1.2 && dist < maxConnectDist) {
            edges.push({
              fromIndex: idxA,
              toIndex: idxB,
              color: a.color === INDIGO || b.color === INDIGO ? INDIGO : a.color === CYAN ? CYAN : TEAL,
            })
            connections++
          }
        }
      }
    }

    buildGrid()

    const handleResize = () => {
      buildGrid()
    }
    window.addEventListener('resize', handleResize)

    // Ultra-smooth 60 FPS Render Loop
    let startTime = performance.now()

    const render = (currentTime: number) => {
      const elapsed = (currentTime - startTime) * 0.001 // seconds

      ctx.save()
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, width, height)

      // 1. Draw delicate dashed constellation links between accent nodes
      ctx.save()
      ctx.setLineDash([3, 4])
      ctx.lineWidth = 1

      for (let e = 0; e < edges.length; e++) {
        const edge = edges[e]
        const p1 = dots[edge.fromIndex]
        const p2 = dots[edge.toIndex]
        if (!p1 || !p2) continue

        // Pulse line opacity gently with wave
        const wave = Math.sin((p1.seqPhase + p2.seqPhase) * 0.5 - elapsed * 1.2)
        const lineAlpha = 0.06 + 0.06 * ((wave + 1) * 0.5)

        ctx.strokeStyle = `${edge.color} ${lineAlpha})`
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
      }
      ctx.restore()

      // 2. Draw all dots with SEQUENTIAL Wave + RANDOM Organic Pulsation
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i]

        // --- Component A: SEQUENTIAL Wave Propagation ---
        // Sweeps diagonally across rows and columns like a rhythmic bio-telemetry scan
        const seqWave = Math.sin(dot.seqPhase - elapsed * 1.35)
        const seqScaleFactor = (seqWave + 1) * 0.5 // 0.0 to 1.0

        // --- Component B: RANDOM Organic Jitter & Scintillation ---
        // Independent micro-frequencies per dot so individual nodes flare & breathe unpredictably
        const randJitter =
          Math.sin(elapsed * dot.randFreq1 + dot.randPhase) *
          Math.cos(elapsed * dot.randFreq2)
        const randScaleFactor = randJitter * dot.randAmp // -dot.randAmp to +dot.randAmp

        // --- Combined Scale Modulation ---
        // Dots dynamically vary from small pinpoints up to enlarged luminous beacons
        const combinedScale = Math.max(0.45, 1.0 + 0.42 * (seqScaleFactor - 0.5) + randScaleFactor)

        const currentR = dot.baseRadius * combinedScale
        const currentAlpha = Math.min(0.58, Math.max(0.06, dot.opacity * (0.6 + 0.45 * combinedScale)))

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, currentR, 0, Math.PI * 2)
        ctx.fillStyle = `${dot.color} ${currentAlpha})`
        ctx.fill()

        // Soft luminous corona for large active accent nodes
        if (dot.isAccent && combinedScale > 1.15) {
          ctx.beginPath()
          ctx.arc(dot.x, dot.y, currentR * 1.8, 0, Math.PI * 2)
          ctx.fillStyle = `${dot.color} ${currentAlpha * 0.16})`
          ctx.fill()
        }
      }

      ctx.restore()

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* 1. Luminous Ambient Multi-Chromatic Nebula Clouds (Smooth organic atmospheric depth) */}
      <div className="absolute -top-[16rem] left-[6%] h-[780px] w-[780px] rounded-full bg-gradient-to-br from-teal/16 via-emerald/8 to-transparent blur-[145px]" />
      <div className="absolute top-[0rem] right-[-2%] h-[740px] w-[740px] rounded-full bg-gradient-to-bl from-cyan/15 via-sky/8 to-transparent blur-[150px]" />
      <div className="absolute top-[14rem] left-[30%] h-[640px] w-[640px] rounded-full bg-gradient-to-tr from-indigo-500/10 via-purple-500/6 to-teal/8 blur-[165px]" />
      <div className="absolute bottom-[-12rem] left-[18%] h-[800px] w-[800px] rounded-full bg-gradient-to-t from-teal/12 via-cyan/6 to-transparent blur-[165px]" />

      {/* 2. Dynamic Bio-Digital Dot Matrix Canvas (Retina, 60 FPS, Sequential + Random Size Variation) */}
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />

      {/* 3. Global Smooth Vignette Framing for Medical Data Readability */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_0%,transparent_55%,rgba(241,245,249,0.45)_100%)]" />
    </div>
  )
}
