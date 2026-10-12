import { useMemo } from 'react'

interface Star {
  id: number
  x: number // percentage 0-100
  y: number // percentage 0-100
  size: number // base scale 1 to 4
  color: string
  duration: number // seconds 2.8 to 7.5
  delay: number // seconds 0 to 5
  type: 'flare' | 'diamond' | 'pinpoint'
}

export default function NebulaBackground() {
  // 46 Calibrated Natural Shining Stars with diverse flare shapes and staggered celestial shine cycles
  const stars: Star[] = useMemo(() => [
    // Top-Left Constellation (Near Header & Greeting)
    { id: 1, x: 12, y: 8, size: 3.5, color: '#0D9488', duration: 4.2, delay: 0.2, type: 'flare' },
    { id: 2, x: 18, y: 14, size: 2.0, color: '#14B8A6', duration: 5.6, delay: 1.4, type: 'diamond' },
    { id: 3, x: 27, y: 9, size: 3.8, color: '#0EA5E9', duration: 3.5, delay: 0.6, type: 'flare' },
    { id: 4, x: 22, y: 20, size: 1.4, color: '#38BDF8', duration: 6.2, delay: 2.1, type: 'pinpoint' },
    { id: 5, x: 7, y: 22, size: 2.6, color: '#0D9488', duration: 4.8, delay: 1.8, type: 'diamond' },
    { id: 6, x: 15, y: 29, size: 1.8, color: '#10B981', duration: 5.1, delay: 0.9, type: 'diamond' },
    { id: 7, x: 31, y: 24, size: 3.2, color: '#0EA5E9', duration: 4.4, delay: 2.6, type: 'flare' },

    // Top-Right Constellation (Near Patient Profile & Action Button)
    { id: 8, x: 73, y: 7, size: 4.0, color: '#0EA5E9', duration: 3.6, delay: 0.3, type: 'flare' },
    { id: 9, x: 82, y: 12, size: 2.2, color: '#38BDF8', duration: 5.9, delay: 1.7, type: 'diamond' },
    { id: 10, x: 92, y: 8, size: 3.2, color: '#0D9488', duration: 4.6, delay: 1.1, type: 'flare' },
    { id: 11, x: 87, y: 18, size: 1.5, color: '#14B8A6', duration: 6.8, delay: 2.3, type: 'pinpoint' },
    { id: 12, x: 78, y: 23, size: 3.6, color: '#6366F1', duration: 4.1, delay: 1.5, type: 'flare' },
    { id: 13, x: 95, y: 22, size: 2.0, color: '#0EA5E9', duration: 5.4, delay: 0.7, type: 'diamond' },
    { id: 14, x: 69, y: 16, size: 1.6, color: '#10B981', duration: 6.5, delay: 2.9, type: 'pinpoint' },

    // Center Upper Atmosphere (Behind Greeting & KPI Cards)
    { id: 15, x: 42, y: 11, size: 2.2, color: '#0EA5E9', duration: 4.9, delay: 1.3, type: 'diamond' },
    { id: 16, x: 53, y: 6, size: 3.6, color: '#6366F1', duration: 3.8, delay: 0.5, type: 'flare' },
    { id: 17, x: 62, y: 14, size: 1.8, color: '#14B8A6', duration: 6.0, delay: 2.4, type: 'diamond' },
    { id: 18, x: 48, y: 21, size: 2.8, color: '#0D9488', duration: 4.5, delay: 1.9, type: 'diamond' },
    { id: 19, x: 37, y: 31, size: 1.6, color: '#38BDF8', duration: 7.0, delay: 0.8, type: 'pinpoint' },
    { id: 20, x: 59, y: 29, size: 3.4, color: '#0EA5E9', duration: 4.2, delay: 2.2, type: 'flare' },
    { id: 21, x: 46, y: 39, size: 1.5, color: '#10B981', duration: 6.4, delay: 1.6, type: 'pinpoint' },
    { id: 22, x: 65, y: 36, size: 3.8, color: '#0D9488', duration: 3.4, delay: 0.9, type: 'flare' },

    // Left Wing (Flanking 3D Body Canvas)
    { id: 23, x: 6, y: 42, size: 2.0, color: '#0EA5E9', duration: 5.5, delay: 2.5, type: 'diamond' },
    { id: 24, x: 13, y: 50, size: 3.2, color: '#0D9488', duration: 3.9, delay: 0.7, type: 'flare' },
    { id: 25, x: 21, y: 45, size: 1.5, color: '#14B8A6', duration: 6.6, delay: 1.8, type: 'pinpoint' },
    { id: 26, x: 17, y: 60, size: 3.6, color: '#6366F1', duration: 4.3, delay: 1.2, type: 'flare' },
    { id: 27, x: 7, y: 67, size: 1.8, color: '#38BDF8', duration: 5.7, delay: 2.7, type: 'diamond' },
    { id: 28, x: 25, y: 63, size: 2.6, color: '#0EA5E9', duration: 4.6, delay: 0.4, type: 'diamond' },

    // Right Wing (Flanking Diagnostics Panel)
    { id: 29, x: 89, y: 36, size: 3.0, color: '#0D9488', duration: 4.3, delay: 1.1, type: 'flare' },
    { id: 30, x: 96, y: 46, size: 1.7, color: '#14B8A6', duration: 6.2, delay: 2.1, type: 'pinpoint' },
    { id: 31, x: 81, y: 53, size: 3.8, color: '#0EA5E9', duration: 3.7, delay: 0.3, type: 'flare' },
    { id: 32, x: 93, y: 61, size: 1.4, color: '#38BDF8', duration: 7.2, delay: 1.6, type: 'pinpoint' },
    { id: 33, x: 75, y: 65, size: 2.4, color: '#10B981', duration: 5.0, delay: 0.9, type: 'diamond' },
    { id: 34, x: 86, y: 73, size: 3.5, color: '#6366F1', duration: 4.5, delay: 2.4, type: 'flare' },

    // Lower Atmosphere (Timeline & Activity Horizon)
    { id: 35, x: 14, y: 79, size: 2.2, color: '#0EA5E9', duration: 5.3, delay: 1.5, type: 'diamond' },
    { id: 36, x: 29, y: 85, size: 3.2, color: '#0D9488', duration: 4.0, delay: 0.2, type: 'flare' },
    { id: 37, x: 39, y: 77, size: 1.5, color: '#14B8A6', duration: 6.5, delay: 2.5, type: 'pinpoint' },
    { id: 38, x: 51, y: 83, size: 3.9, color: '#0EA5E9', duration: 3.3, delay: 0.7, type: 'flare' },
    { id: 39, x: 63, y: 79, size: 1.8, color: '#38BDF8', duration: 5.6, delay: 1.3, type: 'diamond' },
    { id: 40, x: 73, y: 87, size: 2.8, color: '#0D9488', duration: 4.7, delay: 2.1, type: 'diamond' },
    { id: 41, x: 83, y: 83, size: 1.5, color: '#10B981', duration: 6.7, delay: 0.6, type: 'pinpoint' },
    { id: 42, x: 93, y: 91, size: 3.4, color: '#0EA5E9', duration: 4.4, delay: 1.7, type: 'flare' },
    { id: 43, x: 43, y: 93, size: 2.0, color: '#14B8A6', duration: 5.2, delay: 2.8, type: 'diamond' },
    { id: 44, x: 57, y: 95, size: 2.6, color: '#6366F1', duration: 4.8, delay: 0.5, type: 'diamond' },
    { id: 45, x: 33, y: 69, size: 1.6, color: '#0EA5E9', duration: 5.9, delay: 1.0, type: 'pinpoint' },
    { id: 46, x: 67, y: 70, size: 2.2, color: '#0D9488', duration: 5.3, delay: 2.2, type: 'diamond' },
  ], [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* 1. Luminous Ambient Multi-Chromatic Nebula Clouds (Smooth organic gas aura) */}
      <div className="absolute -top-[16rem] left-[6%] h-[780px] w-[780px] rounded-full bg-gradient-to-br from-teal/16 via-emerald/8 to-transparent blur-[145px]" />
      <div className="absolute top-[0rem] right-[-2%] h-[740px] w-[740px] rounded-full bg-gradient-to-bl from-cyan/15 via-sky/8 to-transparent blur-[150px]" />
      <div className="absolute top-[14rem] left-[30%] h-[640px] w-[640px] rounded-full bg-gradient-to-tr from-indigo-500/10 via-purple-500/6 to-teal/8 blur-[165px]" />
      <div className="absolute bottom-[-12rem] left-[18%] h-[800px] w-[800px] rounded-full bg-gradient-to-t from-teal/12 via-cyan/6 to-transparent blur-[165px]" />

      {/* 2. Natural Shining Stars (4-Point Diamond Sparkles & Prismatic Flares) */}
      {stars.map((s) => {
        const style: React.CSSProperties = {
          left: `${s.x}%`,
          top: `${s.y}%`,
          animation:
            s.type === 'flare'
              ? `naturalStarShine ${s.duration}s ease-in-out ${s.delay}s infinite`
              : s.type === 'diamond'
                ? `naturalDiamondShine ${s.duration}s ease-in-out ${s.delay}s infinite`
                : `naturalPinpointTwinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
        }

        if (s.type === 'flare') {
          // Brilliant 4-Point Star Sparkle with elongated diffraction spikes & white core
          const spikeLen = Math.round(s.size * 6.5)
          const spikeThickness = Math.max(1.2, s.size * 0.45)
          return (
            <div key={s.id} className="absolute -translate-x-1/2 -translate-y-1/2 will-change-transform" style={style}>
              <svg
                viewBox={`-${spikeLen} -${spikeLen} ${spikeLen * 2} ${spikeLen * 2}`}
                style={{ width: `${spikeLen * 2}px`, height: `${spikeLen * 2}px` }}
                className="overflow-visible"
              >
                {/* 4-Point Tapered Diamond Rays */}
                <path
                  d={`M 0 -${spikeLen} Q 0 0 ${spikeLen} 0 Q 0 0 0 ${spikeLen} Q 0 0 -${spikeLen} 0 Q 0 0 0 -${spikeLen} Z`}
                  fill={s.color}
                  opacity="0.9"
                />
                {/* Vertical Glint Beam */}
                <line x1="0" y1={-spikeLen} x2="0" y2={spikeLen} stroke="#FFFFFF" strokeWidth={spikeThickness} opacity="0.85" />
                {/* Horizontal Glint Beam */}
                <line x1={-spikeLen} y1="0" x2={spikeLen} y2="0" stroke="#FFFFFF" strokeWidth={spikeThickness} opacity="0.85" />
                {/* Center Brilliant Nucleus */}
                <circle cx="0" cy="0" r={s.size * 0.75} fill="#FFFFFF" />
              </svg>
            </div>
          )
        }

        if (s.type === 'diamond') {
          // Mid-Tier Diamond Sparkle (✧) with soft jewel taper
          const dLen = Math.round(s.size * 4.5)
          return (
            <div key={s.id} className="absolute -translate-x-1/2 -translate-y-1/2 will-change-transform" style={style}>
              <svg
                viewBox={`-${dLen} -${dLen} ${dLen * 2} ${dLen * 2}`}
                style={{ width: `${dLen * 2}px`, height: `${dLen * 2}px` }}
                className="overflow-visible"
              >
                <path
                  d={`M 0 -${dLen} Q 0 0 ${dLen} 0 Q 0 0 0 ${dLen} Q 0 0 -${dLen} 0 Q 0 0 0 -${dLen} Z`}
                  fill={s.color}
                  opacity="0.8"
                />
                <circle cx="0" cy="0" r={s.size * 0.6} fill="#FFFFFF" />
              </svg>
            </div>
          )
        }

        // Pinpoint Background Star (Delicate celestial glint)
        const pSize = Math.max(3, Math.round(s.size * 2))
        return (
          <div key={s.id} className="absolute -translate-x-1/2 -translate-y-1/2 will-change-transform" style={style}>
            <svg
              viewBox={`-${pSize} -${pSize} ${pSize * 2} ${pSize * 2}`}
              style={{ width: `${pSize * 2}px`, height: `${pSize * 2}px` }}
              className="overflow-visible"
            >
              <circle cx="0" cy="0" r={pSize * 0.7} fill={s.color} opacity="0.8" />
              <circle cx="0" cy="0" r={pSize * 0.35} fill="#FFFFFF" />
            </svg>
          </div>
        )
      })}

      {/* 3. Subtle Constellation Connecting Beams */}
      <svg className="absolute inset-0 size-full opacity-40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="naturalBeamTeal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="naturalBeamCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d="M 120 70 L 270 90 L 310 240" stroke="url(#naturalBeamTeal)" strokeWidth="1" strokeDasharray="4 6" fill="none" />
        <path d="M 730 70 L 820 120 L 920 80" stroke="url(#naturalBeamCyan)" strokeWidth="1" strokeDasharray="4 6" fill="none" />
        <path d="M 530 60 L 620 140 L 650 360" stroke="url(#naturalBeamTeal)" strokeWidth="1" strokeDasharray="4 6" fill="none" opacity="0.5" />
      </svg>

      {/* 4. Global Smooth Vignette Framing for Content Focus */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_0%,transparent_55%,rgba(241,245,249,0.45)_100%)]" />
    </div>
  )
}
