import { EyeOff, ShieldCheck, Stethoscope } from 'lucide-react'
import { useT } from '../../i18n/I18nContext'

const config = {
  grounded: { icon: ShieldCheck, key: 'badge.grounded', cls: 'bg-teal-tint text-teal-hover ring-teal/20' },
  pii: { icon: EyeOff, key: 'badge.pii', cls: 'bg-cyan-tint text-sky-700 ring-cyan/20' },
  notDiagnosis: { icon: Stethoscope, key: 'badge.notDiagnosis', cls: 'bg-subtle text-muted ring-line' },
}

export default function SafetyBadge({ kind }: { kind: keyof typeof config }) {
  const t = useT()
  const { icon: Icon, key, cls } = config[kind]
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${cls}`}>
      <Icon className="size-3" aria-hidden />
      {t(key)}
    </span>
  )
}
