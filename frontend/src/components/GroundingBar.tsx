import { BadgeCheck } from 'lucide-react'
import { motion } from 'motion/react'
import { useT } from '../i18n/I18nContext'

export default function GroundingBar({ value }: { value: number }) {
  const t = useT()
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-muted">{t('grounding.label')}</span>
        <span className="inline-flex items-center gap-1 font-mono font-semibold text-teal">
          <BadgeCheck className="size-3.5" aria-hidden />
          {value.toFixed(1)}% {t('grounding.verified')}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-subtle" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-teal to-cyan"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}
