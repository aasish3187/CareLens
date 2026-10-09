import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, FileText, Pill } from 'lucide-react'
import { Link } from 'react-router'
import { organById } from '../data/organs'
import { labs } from '../data/labs'
import { medications } from '../data/medications'
import { docById } from '../data/documents'
import { useT } from '../i18n/I18nContext'
import StatusPill, { statusStyles } from './ui/StatusPill'
import SafetyBadge from './ui/SafetyBadge'
import GroundingBar from './GroundingBar'
import DotRangeSlider from './DotRangeSlider'
import Sparkline from './Sparkline'

export default function OrganPanel({ organId, compact = false }: { organId: string; compact?: boolean }) {
  const t = useT()
  const organ = organById(organId)
  const lab = labs[organ.labId]
  const doc = docById(organ.docId)
  const meds = medications.filter((m) => organ.meds.includes(m.id))

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={organ.id}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -16 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex flex-col gap-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted">{t(organ.system)}</p>
            <h2 className="mt-0.5 text-2xl font-bold tracking-tight text-heading">{t(`organ.${organ.id}`)}</h2>
          </div>
          <StatusPill status={organ.status} size="md" />
        </div>

        <div className="rounded-xl bg-subtle/70 p-4">
          <p className="text-xs font-medium text-muted">
            {t('panel.primary')} · {lab.name}
          </p>
          <p className="mt-1 font-mono text-4xl font-semibold tracking-tight" style={{ color: organ.status === 'normal' ? '#0F172A' : statusStyles[organ.status].hex }}>
            {lab.display}
            <span className="ml-1.5 text-base font-medium text-muted">{lab.unit}</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-body">{t(`note.${organ.id}`)}</p>
        </div>

        <GroundingBar value={organ.confidence} />

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{t('panel.range')}</p>
          <DotRangeSlider value={lab.value} display={lab.display} unit={lab.unit} zones={lab.zones} />
        </div>

        {organ.extra && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{t('panel.other')}</p>
            <ul className="divide-y divide-line rounded-xl border border-line">
              {organ.extra.map((e) => (
                <li key={e.label} className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm">
                  <span className="text-body">{e.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-heading">
                      {e.value} <span className="text-xs font-normal text-muted">{e.unit}</span>
                    </span>
                    <StatusPill status={e.status} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!compact && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">
              {t('panel.history')} · {lab.unit}
            </p>
            <Sparkline data={organ.history} color={statusStyles[organ.status].hex} />
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{t('panel.meds')}</p>
          {meds.length ? (
            <ul className="space-y-2">
              {meds.map((m) => (
                <li key={m.id} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-teal-tint text-teal">
                    <Pill className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 text-sm">
                    <p className="font-semibold text-heading">{m.brand}</p>
                    <p className="truncate font-mono text-xs text-muted">
                      {m.composition.map((c) => `${c.name} ${c.strength}`).join(' + ')} · {m.dose}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-line px-3 py-2.5 text-sm text-muted">{t('panel.noMeds')}</p>
          )}
        </div>

        <div className="rounded-xl border border-line p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{t('panel.source')}</p>
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-cyan-tint text-cyan">
              <FileText className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-medium text-heading">{doc.file}</p>
              <p className="text-xs text-muted">
                {doc.date} · <span className="font-mono">[{organ.fact}]</span>
              </p>
            </div>
            <Link
              to={`/evidence/${doc.id}?fact=${organ.fact}`}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-teal px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-teal-hover"
            >
              {t('panel.openEvidence')}
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <SafetyBadge kind="grounded" />
          <SafetyBadge kind="notDiagnosis" />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
