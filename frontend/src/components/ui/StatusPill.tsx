import type { Status } from '../../data/types'
import { useT } from '../../i18n/I18nContext'

export type HealthStatus = Status

export const statusStyles: Record<string, { pill: string; dot: string; hex: string }> = {
  low: { pill: 'bg-blue-50 text-blue-700 ring-blue-200', dot: 'bg-st-low', hex: '#3B82F6' },
  normal: { pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-st-normal', hex: '#10B981' },
  elevated: { pill: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-st-elevated', hex: '#F59E0B' },
  high: { pill: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-st-elevated', hex: '#F59E0B' },
  critical: { pill: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-st-critical', hex: '#EF4444' },
}

export default function StatusPill({ status, size = 'sm' }: { status: Status | string; size?: 'sm' | 'md' }) {
  const t = useT()
  const key = (status || 'normal').toLowerCase()
  const s = statusStyles[key] || statusStyles['normal']
  const displayStatus = key === 'high' ? 'elevated' : key
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset ${s.pill} ${
        size === 'md' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs'
      }`}
    >
      <span className={`size-1.5 rounded-full ${s.dot}`} aria-hidden />
      {t(`status.${displayStatus}`) || displayStatus}
    </span>
  )
}
