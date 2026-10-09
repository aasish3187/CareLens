import { useState } from 'react'
import { organs } from '../data/organs'
import { statusStyles } from './ui/StatusPill'
import { useT } from '../i18n/I18nContext'

const W = 300
const H = 600

// Left half of the silhouette (viewer's left), top to bottom; mirrored for the right half.
const leftHalf: [number, number][] = [
  [139, 84], [137, 104], [112, 112], [90, 122], [78, 140], [72, 170], [68, 215], [62, 262], [56, 310], [52, 345],
  [56, 364], [66, 362], [72, 344], [78, 300], [86, 256], [94, 214], [98, 196], [100, 240], [102, 290], [96, 330],
  [98, 380], [104, 440], [106, 480], [108, 530], [110, 568], [104, 588], [132, 590], [138, 572], [140, 530],
  [142, 480], [144, 430], [148, 374],
]

function smoothClosedPath(points: [number, number][]) {
  const n = points.length
  let d = `M${points[0][0]},${points[0][1]}`
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]
    const p1 = points[i]
    const p2 = points[(i + 1) % n]
    const p3 = points[(i + 2) % n]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0]},${p2[1]}`
  }
  return d + ' Z'
}

const bodyPath = smoothClosedPath([...leftHalf, ...[...leftHalf].reverse().map(([x, y]) => [W - x, y] as [number, number])])

const organShapes: Record<string, string[]> = {
  brain: ['M150,24 C134,24 124,34 124,46 C124,58 134,66 150,66 C166,66 176,58 176,46 C176,34 166,24 150,24 Z'],
  lungs: [
    'M141,140 C126,138 112,160 111,192 C110,212 117,222 128,222 C139,222 143,210 143,194 Z',
    'M159,140 C174,138 188,160 189,192 C190,212 183,222 172,222 C161,222 157,210 157,194 Z',
  ],
  heart: ['M156,174 C150,167 140,171 142,182 C144,193 156,200 161,206 C167,199 178,190 176,179 C174,169 162,167 156,174 Z'],
  liver: ['M104,228 C118,218 152,220 160,230 C158,242 140,250 122,253 C108,254 102,242 104,228 Z'],
  pancreas: ['M142,262 C150,252 172,250 190,254 C195,258 191,264 182,264 C170,266 156,268 146,268 C139,268 137,265 142,262 Z'],
  kidneys: [
    'M120,272 C112,272 108,282 110,292 C112,302 122,304 126,296 C123,290 123,284 127,280 C127,275 124,272 120,272 Z',
    'M180,272 C188,272 192,282 190,292 C188,302 178,304 174,296 C177,290 177,284 173,280 C173,275 176,272 180,272 Z',
  ],
  knee: [
    'M110,432 C104,432 100,440 102,448 C104,454 112,456 116,450 C118,444 116,432 110,432 Z',
    'M180,432 C186,432 190,440 188,448 C186,454 178,456 174,450 C172,444 174,432 180,432 Z',
  ],
}

type Props = { selected: string; onSelect: (id: string) => void; className?: string }

export default function BodyTwin({ selected, onSelect, className = '' }: Props) {
  const t = useT()
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div className={`relative mx-auto aspect-[1/2] h-full max-h-full ${className}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" aria-hidden>
        <defs>
          <linearGradient id="bodyStroke" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>
          <radialGradient id="bodyFill" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#CCFBF1" stopOpacity="0.25" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        <ellipse cx="150" cy="592" rx="70" ry="6" fill="#0D9488" opacity="0.08" />
        <path d={bodyPath} fill="url(#bodyStroke)" opacity="0.18" filter="url(#softGlow)" />
        <path d={bodyPath} fill="url(#bodyFill)" stroke="url(#bodyStroke)" strokeWidth="1.5" />
        <ellipse cx="150" cy="50" rx="30" ry="36" fill="url(#bodyFill)" stroke="url(#bodyStroke)" strokeWidth="1.5" />
        {/* spine + rib hints */}
        <path d="M150,96 L150,350" stroke="#0EA5E9" strokeOpacity="0.18" strokeDasharray="2 4" />
        {[146, 160, 174, 188, 202].map((y) => (
          <path key={y} d={`M150,${y} C134,${y + 2} 122,${y + 8} 116,${y + 16} M150,${y} C166,${y + 2} 178,${y + 8} 184,${y + 16}`} stroke="#0EA5E9" strokeOpacity="0.12" fill="none" />
        ))}

        {organs.map((o) => {
          const active = o.id === selected
          const hot = active || o.id === hovered
          const color = statusStyles[o.status].hex
          return (
            <g key={o.id} filter={hot ? 'url(#glow)' : undefined} style={{ transition: 'opacity .3s' }}>
              {(organShapes[o.id] || []).map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill={active ? color : '#0EA5E9'}
                  fillOpacity={active ? 0.55 : hot ? 0.35 : 0.16}
                  stroke={active ? color : '#0EA5E9'}
                  strokeOpacity={active ? 0.9 : 0.45}
                  strokeWidth={active ? 1.5 : 1}
                  style={{ transition: 'fill-opacity .3s, fill .3s' }}
                />
              ))}
            </g>
          )
        })}
      </svg>

      {/* scan line */}
      <div className="pointer-events-none absolute inset-x-[8%] scan-line" aria-hidden>
        <div className="h-px bg-gradient-to-r from-transparent via-cyan to-transparent" />
        <div className="h-8 -translate-y-full bg-gradient-to-t from-cyan/15 to-transparent" />
      </div>

      {organs.map((o) => {
        const color = statusStyles[o.status].hex
        const active = o.id === selected
        return (
          <div
            key={o.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${(o.pin.x / W) * 100}%`, top: `${(o.pin.y / H) * 100}%`, zIndex: hovered === o.id ? 20 : 10 }}
          >
            <button
              type="button"
              onClick={() => onSelect(o.id)}
              onMouseEnter={() => setHovered(o.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(o.id)}
              onBlur={() => setHovered(null)}
              aria-label={`${t(`organ.${o.id}`)} — ${t(`status.${o.status}`)}`}
              aria-pressed={active}
              className="relative grid size-7 place-items-center rounded-full"
            >
              <span className="absolute inset-1 rounded-full pin-pulse" style={{ background: color }} aria-hidden />
              <span
                className={`relative rounded-full ring-2 ring-white transition-all ${active ? 'size-4' : 'size-3'}`}
                style={{ background: color, boxShadow: `0 0 0 ${active ? 5 : 3}px ${color}40, 0 0 12px ${color}` }}
                aria-hidden
              />
            </button>
            {hovered === o.id && (
              <div className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-lg bg-heading px-2.5 py-1.5 text-xs text-white shadow-lg">
                <span className="font-semibold">{t(`organ.${o.id}`)}</span>
                <span className="ml-1.5 inline-flex items-center gap-1 text-white/80">
                  <span className="size-1.5 rounded-full" style={{ background: color }} />
                  {t(`status.${o.status}`)}
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
