import { useEffect, useRef, useState, useMemo } from 'react'

interface Star {
  id: number
  x: number // percentage 0-100
  y: number // percentage 0-100
  size: number // px 1.2 to 3.8
  color: string
  duration: number // seconds 3 to 8
  delay: number // seconds 0 to 5
  isPulsar?: boolean
}

export default function NebulaBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 })
  const [isHovering, setIsHovering] = useState(false)

  // Track mouse coordinates for interactive cursor aura
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
      if (!isHovering) setIsHovering(true)
    }

    const handleMouseLeave = () => {
      setIsHovering(false)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isHovering])

  // 48 Calibrated Constellation Stars with varying scales and rhythmic breathing
  const stars: Star[] = useMemo(() => [
    // Top-Left Cluster (Near Greeting & Header)
    { id: 1, x: 12, y: 8, size: 2.8, color: '#0D9488', duration: 4.2, delay: 0.2, isPulsar: true },
    { id: 2, x: 18, y: 14, size: 1.4, color: '#14B8A6', duration: 5.8, delay: 1.1 },
    { id: 3, x: 26, y: 9, size: 3.2, color: '#0EA5E9', duration: 3.6, delay: 0.5, isPulsar: true },
    { id: 4, x: 22, y: 19, size: 1.2, color: '#38BDF8', duration: 6.4, delay: 2.3 },
    { id: 5, x: 8, y: 22, size: 2.2, color: '#0D9488', duration: 4.8, delay: 1.6 },
    { id: 6, x: 15, y: 28, size: 1.5, color: '#10B981', duration: 5.2, delay: 0.8 },
    { id: 7, x: 29, y: 25, size: 2.6, color: '#0EA5E9', duration: 4.5, delay: 2.7 },

    // Top-Right Cluster (Near Patient Badge & Upload)
    { id: 8, x: 74, y: 7, size: 3.4, color: '#0EA5E9', duration: 3.8, delay: 0.3, isPulsar: true },
    { id: 9, x: 82, y: 12, size: 1.6, color: '#38BDF8', duration: 6.1, delay: 1.8 },
    { id: 10, x: 91, y: 8, size: 2.4, color: '#0D9488', duration: 4.9, delay: 0.9 },
    { id: 11, x: 86, y: 18, size: 1.2, color: '#14B8A6', duration: 7.0, delay: 2.1 },
    { id: 12, x: 78, y: 24, size: 2.8, color: '#6366F1', duration: 4.4, delay: 1.4, isPulsar: true },
    { id: 13, x: 94, y: 22, size: 1.8, color: '#0EA5E9', duration: 5.5, delay: 0.6 },
    { id: 14, x: 70, y: 16, size: 1.3, color: '#10B981', duration: 6.8, delay: 3.0 },

    // Center Atmosphere (Behind KPIs & 3D Twin)
    { id: 15, x: 42, y: 11, size: 1.5, color: '#0EA5E9', duration: 5.0, delay: 1.2 },
    { id: 16, x: 52, y: 6, size: 3.0, color: '#6366F1', duration: 4.0, delay: 0.4, isPulsar: true },
    { id: 17, x: 61, y: 14, size: 1.4, color: '#14B8A6', duration: 6.2, delay: 2.5 },
    { id: 18, x: 48, y: 22, size: 2.2, color: '#0D9488', duration: 4.6, delay: 1.7 },
    { id: 19, x: 38, y: 32, size: 1.3, color: '#38BDF8', duration: 7.2, delay: 0.9 },
    { id: 20, x: 58, y: 30, size: 2.6, color: '#0EA5E9', duration: 4.3, delay: 2.0 },
    { id: 21, x: 45, y: 42, size: 1.2, color: '#10B981', duration: 6.5, delay: 1.5 },
    { id: 22, x: 64, y: 38, size: 3.2, color: '#0D9488', duration: 3.7, delay: 0.7, isPulsar: true },

    // Left Wing (Flanking 3D Model & Side Panels)
    { id: 23, x: 6, y: 40, size: 1.6, color: '#0EA5E9', duration: 5.6, delay: 2.4 },
    { id: 24, x: 12, y: 48, size: 2.5, color: '#0D9488', duration: 4.1, delay: 0.8 },
    { id: 25, x: 20, y: 44, size: 1.3, color: '#14B8A6', duration: 6.7, delay: 1.9 },
    { id: 26, x: 16, y: 58, size: 3.0, color: '#6366F1', duration: 4.5, delay: 1.3, isPulsar: true },
    { id: 27, x: 8, y: 66, size: 1.4, color: '#38BDF8', duration: 5.9, delay: 2.8 },
    { id: 28, x: 24, y: 62, size: 2.0, color: '#0EA5E9', duration: 4.7, delay: 0.5 },

    // Right Wing (Flanking Telemetry & Diagnostics)
    { id: 29, x: 88, y: 35, size: 2.4, color: '#0D9488', duration: 4.4, delay: 1.0 },
    { id: 30, x: 95, y: 45, size: 1.5, color: '#14B8A6', duration: 6.3, delay: 2.2 },
    { id: 31, x: 82, y: 52, size: 3.2, color: '#0EA5E9', duration: 3.9, delay: 0.4, isPulsar: true },
    { id: 32, x: 92, y: 60, size: 1.2, color: '#38BDF8', duration: 7.1, delay: 1.7 },
    { id: 33, x: 76, y: 64, size: 2.1, color: '#10B981', duration: 5.1, delay: 0.9 },
    { id: 34, x: 85, y: 72, size: 2.7, color: '#6366F1', duration: 4.6, delay: 2.5, isPulsar: true },

    // Lower Floor & Horizon
    { id: 35, x: 14, y: 78, size: 1.8, color: '#0EA5E9', duration: 5.4, delay: 1.6 },
    { id: 36, x: 28, y: 84, size: 2.6, color: '#0D9488', duration: 4.2, delay: 0.3 },
    { id: 37, x: 38, y: 76, size: 1.3, color: '#14B8A6', duration: 6.6, delay: 2.6 },
    { id: 38, x: 50, y: 82, size: 3.4, color: '#0EA5E9', duration: 3.5, delay: 0.8, isPulsar: true },
    { id: 39, x: 62, y: 78, size: 1.5, color: '#38BDF8', duration: 5.7, delay: 1.4 },
    { id: 40, x: 72, y: 86, size: 2.3, color: '#0D9488', duration: 4.8, delay: 2.0 },
    { id: 41, x: 84, y: 82, size: 1.4, color: '#10B981', duration: 6.9, delay: 0.7 },
    { id: 42, x: 94, y: 90, size: 2.5, color: '#0EA5E9', duration: 4.5, delay: 1.8 },
    { id: 43, x: 44, y: 92, size: 1.6, color: '#14B8A6', duration: 5.3, delay: 2.9 },
    { id: 44, x: 56, y: 94, size: 2.2, color: '#6366F1', duration: 4.7, delay: 0.6 },
    { id: 45, x: 32, y: 68, size: 1.4, color: '#0EA5E9', duration: 6.0, delay: 1.1 },
    { id: 46, x: 68, y: 68, size: 1.7, color: '#0D9488', duration: 5.5, delay: 2.3 },
    { id: 47, x: 3, y: 90, size: 2.0, color: '#0EA5E9', duration: 4.8, delay: 1.0 },
    { id: 48, x: 97, y: 78, size: 1.5, color: '#14B8A6', duration: 6.4, delay: 0.2 },
  ], [])

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* 1. Luminous Multi-Chromatic Nebula Clouds (Organic Gas Glows) */}
      <div className="absolute -top-[16rem] left-[6%] h-[780px] w-[780px] rounded-full bg-gradient-to-br from-teal/18 via-emerald/10 to-transparent blur-[145px] transition-transform duration-1000 animate-pulse" style={{ animationDuration: '14s' }} />
      <div className="absolute top-[0rem] right-[-2%] h-[740px] w-[740px] rounded-full bg-gradient-to-bl from-cyan/16 via-sky/10 to-transparent blur-[150px] transition-transform duration-1000 animate-pulse" style={{ animationDuration: '18s' }} />
      <div className="absolute top-[14rem] left-[30%] h-[640px] w-[640px] rounded-full bg-gradient-to-tr from-indigo-500/12 via-purple-500/8 to-teal/10 blur-[165px]" />
      <div className="absolute bottom-[-12rem] left-[18%] h-[800px] w-[800px] rounded-full bg-gradient-to-t from-teal/14 via-cyan/8 to-transparent blur-[165px]" />

      {/* 2. Interactive Cursor Gravity Glow (Soft ambient halo following the user's mouse) */}
      {isHovering && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-300"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            width: '320px',
            height: '320px',
            background: 'radial-gradient(circle, rgba(13, 148, 136, 0.16) 0%, rgba(14, 165, 233, 0.08) 45%, transparent 70%)',
            filter: 'blur(35px)',
          }}
        />
      )}

      {/* 3. Deep Background Particle Matrix (Micro-stardust masked to luminous channels) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(13, 148, 136, 0.35) 1px, transparent 1px), radial-gradient(circle, rgba(14, 165, 233, 0.28) 1.5px, transparent 1.5px)`,
          backgroundSize: '40px 40px, 80px 80px',
          backgroundPosition: '0 0, 20px 20px',
          maskImage: 'radial-gradient(ellipse 95% 85% at 50% 25%, black 20%, rgba(0,0,0,0.5) 65%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 95% 85% at 50% 25%, black 20%, rgba(0,0,0,0.5) 65%, transparent 95%)',
        }}
      />

      {/* 4. Dynamic Breathing Stars & Bio-Nodes with Organically Varying Scales */}
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            backgroundColor: s.color,
            boxShadow: `0 0 ${s.size * 3}px ${s.color}`,
            animation: `bioStarBreath ${s.duration}s ease-in-out ${s.delay}s infinite alternate`,
          }}
        >
          {/* Concentric Pulsar Halo for primary anchors */}
          {s.isPulsar && (
            <span
              className="absolute inset-0 -m-1.5 rounded-full border border-teal/40"
              style={{
                borderColor: s.color,
                animation: `pulsarHalo ${s.duration * 0.9}s cubic-bezier(0.2, 0.8, 0.2, 1) ${s.delay}s infinite`,
              }}
            />
          )}
        </div>
      ))}

      {/* 5. Animated Constellation Telemetry Trajectories (Flowing dashed data links) */}
      <svg className="absolute inset-0 size-full opacity-65" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="nebulaLineTeal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="nebulaLineCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Trajectory Pathways */}
        <path d="M 120 70 L 260 90 L 320 180" stroke="url(#nebulaLineTeal)" strokeWidth="1.2" strokeDasharray="4 4" className="animate-pulse" style={{ animationDuration: '6s' }} fill="none" />
        <path d="M 740 60 L 840 120 L 960 80" stroke="url(#nebulaLineCyan)" strokeWidth="1.2" strokeDasharray="4 4" className="animate-pulse" style={{ animationDuration: '7s' }} fill="none" />
        <path d="M 520 60 L 640 140 L 760 110" stroke="url(#nebulaLineTeal)" strokeWidth="1" strokeDasharray="3 4" fill="none" opacity="0.6" />
        <path d="M 160 560 L 240 620 L 340 580" stroke="url(#nebulaLineTeal)" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.5" />
        <path d="M 820 520 L 920 600" stroke="url(#nebulaLineCyan)" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.5" />
      </svg>

      {/* 6. Smooth Global Vignette Framing for Content Focus */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_0%,transparent_55%,rgba(241,245,249,0.45)_100%)]" />
    </div>
  )
}
