import { motion } from 'motion/react'
import type { Zone } from '../data/types'
import { statusStyles } from './ui/StatusPill'
import { useT } from '../i18n/I18nContext'

type Props = { value: number; display?: string; unit: string; zones: Zone[]; dots?: number }

function position(value: number, zones: Zone[]) {
  const n = zones.length
  const first = zones[0].min
  const last = zones[n - 1].max
  if (value <= first) return 0.01
  if (value >= last) return 0.99
  const i = zones.findIndex((z) => value >= z.min && value < z.max)
  const z = zones[i]
  return (i + (value - z.min) / (z.max - z.min)) / n
}

export default function DotRangeSlider({ value, display, unit, zones, dots = 28 }: Props) {
  const t = useT()
  const pos = position(value, zones)
  const n = zones.length
  const activeZone = Math.min(n - 1, Math.max(0, Math.floor(pos * n)))
  const activeZoneKey = zones[activeZone]?.key || 'normal'
  const pinColor = (statusStyles[activeZoneKey] || statusStyles['normal']).hex

  return (
    <div className="select-none">
      <div className="relative pt-9">
        <motion.div
          className="absolute top-0 -translate-x-1/2"
          initial={{ left: '0%', opacity: 0 }}
          animate={{ left: `${pos * 100}%`, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        >
          <div className="flex flex-col items-center">
            <span
              className="whitespace-nowrap rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold text-white shadow-sm"
              style={{ background: pinColor }}
            >
              {display ?? value} {unit}
            </span>
            <span className="h-2 w-px" style={{ background: pinColor }} />
            <span className="size-2.5 rounded-full ring-2 ring-white" style={{ background: pinColor, boxShadow: `0 0 0 4px ${pinColor}33` }} />
          </div>
        </motion.div>
        <div className="flex items-center justify-between gap-[2px]" aria-hidden>
          {Array.from({ length: dots }, (_, d) => {
            const zi = Math.min(n - 1, Math.max(0, Math.floor(((d + 0.5) / dots) * n)))
            const zKey = zones[zi]?.key || 'normal'
            const dotClass = (statusStyles[zKey] || statusStyles['normal']).dot
            const active = zi === activeZone
            return (
              <span
                key={d}
                className={`h-2 flex-1 rounded-full transition-opacity ${dotClass} ${active ? 'opacity-100' : 'opacity-25'}`}
              />
            )
          })}
        </div>
      </div>
      <div className="mt-2 grid text-center" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {zones.map((z, i) => (
          <div key={i} className={`px-0.5 ${i === activeZone ? 'text-heading' : 'text-muted'}`}>
            <div className="text-[10px] font-semibold uppercase tracking-wide">{t(`status.${z.key}`)}</div>
            <div className="font-mono text-[10px]">{z.label}</div>
          </div>
        ))}
      </div>
      <span className="sr-only">
        {display ?? value} {unit}, {t(`status.${zones[activeZone].key}`)}
      </span>
    </div>
  )
}
