import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, FileText, Pill, AlertTriangle, ChevronRight, Activity } from 'lucide-react'
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

interface Props {
  organId: string
  compact?: boolean
  onSelectOrgan?: (id: string) => void
}

export default function OrganPanel({ organId, compact = false, onSelectOrgan }: Props) {
  const t = useT()

  const isFullBody = organId === 'all' || organId === 'full' || organId === 'default'

  if (isFullBody) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="full-body-overview"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex flex-col gap-4 text-left"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Holistic Assessment · 7 Systems</p>
              <h2 className="mt-0.5 text-2xl font-bold tracking-tight text-heading">Full Body Diagnostics</h2>
            </div>
            <StatusPill status="elevated" size="md" />
          </div>

          {/* Global Alert Banner */}
          <div className="rounded-xl bg-amber-50/80 p-3.5 border border-amber-200/80 shadow-2xs">
            <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs">
              <AlertTriangle className="size-4 text-amber-600 shrink-0" />
              <span>2 Health Markers Flagged · Attention Needed</span>
            </div>
            <p className="mt-1 text-xs text-amber-900/90 leading-relaxed">
              Elevated metabolic biomarkers identified in recent lab report. Cardiovascular and hepatic systems currently stable.
            </p>
          </div>

          {/* Problem Systems Breakdown */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Active Findings & Organ Telemetry</p>
            <div className="space-y-2">
              {/* 1. Pancreas / Endocrine (Elevated) */}
              <div
                onClick={() => onSelectOrgan?.('pancreas')}
                className="group flex flex-col gap-1.5 rounded-xl border border-amber-200 bg-amber-50/40 p-3 hover:bg-amber-50 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="font-semibold text-xs text-heading">Endocrine & Pancreas</span>
                  </div>
                  <StatusPill status="elevated" size="sm" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-base font-bold text-amber-800">
                    HbA1c: 7.2% <span className="text-xs font-normal text-muted">(Fasting: 142 mg/dL)</span>
                  </span>
                  <span className="text-[11px] font-semibold text-teal group-hover:underline flex items-center gap-0.5">
                    Inspect <ChevronRight className="size-3" />
                  </span>
                </div>
                <p className="text-[11px] text-muted">Exceeds normal threshold (4.0–5.6%). Pre-diabetes/Diabetes range.</p>
              </div>

              {/* 2. Cardiovascular & Heart (Monitored) */}
              <div
                onClick={() => onSelectOrgan?.('heart')}
                className="group flex flex-col gap-1.5 rounded-xl border border-line bg-white p-3 hover:border-teal/50 hover:bg-teal-tint/30 hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-xs text-heading">Chest & Cardiovascular</span>
                  </div>
                  <StatusPill status="normal" size="sm" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-sm font-semibold text-heading">
                    BP: 120/80 mmHg <span className="text-xs font-normal text-muted">(HR: 72 bpm)</span>
                  </span>
                  <span className="text-[11px] font-semibold text-teal group-hover:underline flex items-center gap-0.5">
                    Inspect <ChevronRight className="size-3" />
                  </span>
                </div>
                <p className="text-[11px] text-muted">Blood pressure optimal under Tab. Telma 40 therapy. Cholesterol: 185 mg/dL.</p>
              </div>

              {/* 3. Hepatic & Metabolism (Active Rx) */}
              <div
                onClick={() => onSelectOrgan?.('liver')}
                className="group flex flex-col gap-1.5 rounded-xl border border-line bg-white p-3 hover:border-teal/50 hover:bg-teal-tint/30 hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-cyan-500" />
                    <span className="font-semibold text-xs text-heading">Hepatic Metabolism (Liver)</span>
                  </div>
                  <StatusPill status="normal" size="sm" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-sm font-semibold text-heading">
                    ALT: 28 U/L <span className="text-xs font-normal text-muted">(2 Active Meds)</span>
                  </span>
                  <span className="text-[11px] font-semibold text-teal group-hover:underline flex items-center gap-0.5">
                    Inspect <ChevronRight className="size-3" />
                  </span>
                </div>
                <p className="text-[11px] text-muted">Processing Tab. Glycomet-GP 1 & Telma 40. Normal liver enzyme profile.</p>
              </div>

              {/* 4. Lower Extremities & Joint Mobility */}
              <div
                onClick={() => onSelectOrgan?.('knee')}
                className="group flex flex-col gap-1.5 rounded-xl border border-line bg-white p-3 hover:border-teal/50 hover:bg-teal-tint/30 hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-blue-500" />
                    <span className="font-semibold text-xs text-heading">Lower Extremities & Joints</span>
                  </div>
                  <StatusPill status="normal" size="sm" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-sm font-semibold text-heading">
                    Right Knee <span className="text-xs font-normal text-muted">(Mobility Intact)</span>
                  </span>
                  <span className="text-[11px] font-semibold text-teal group-hover:underline flex items-center gap-0.5">
                    Inspect <ChevronRight className="size-3" />
                  </span>
                </div>
                <p className="text-[11px] text-muted">Full range of motion; mild post-activity joint stiffness observed.</p>
              </div>
            </div>
          </div>

          <GroundingBar value={99.4} />

          {/* Source Evidence Link */}
          <div className="rounded-xl border border-line p-3 bg-subtle/50">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">Clinical Source</p>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 text-xs">
                <p className="truncate font-medium text-heading">Apollo Diagnostics & Fortis OPD</p>
                <p className="text-muted">Report ID: APD-2610-55821</p>
              </div>
              <Link
                to="/evidence/apollo"
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-teal px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-teal-hover"
              >
                Open Evidence <ArrowUpRight className="size-3.5" />
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
        className="flex flex-col gap-5 text-left"
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
