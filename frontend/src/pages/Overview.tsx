import { useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import { Activity, AlertTriangle, ArrowRight, FileText, FlaskConical, HeartPulse, Pill, ShieldCheck, Stethoscope, ClipboardList, Box, MapPin } from 'lucide-react'
import { useT } from '../i18n/I18nContext'
import { patient as defaultPatient } from '../data/patient'
import { timeline as defaultTimeline, type EventType } from '../data/timeline'
import Card from '../components/ui/Card'
import StatusPill, { type HealthStatus } from '../components/ui/StatusPill'
import SafetyBadge from '../components/ui/SafetyBadge'
import BodyTwin from '../components/BodyTwin'
import BodyTwin3D from '../components/BodyTwin3D'
import OrganPanel from '../components/OrganPanel'
import { usePatientData } from '../hooks/usePatientData'

import AnimatedCounter from '../components/ui/AnimatedCounter'

export const eventIcon: Record<EventType, typeof FlaskConical> = {
  lab: FlaskConical,
  rx: Pill,
  discharge: ClipboardList,
  visit: Stethoscope,
}

function Kpi({
  icon: Icon,
  label,
  value,
  note,
  tone,
  index,
  onMouseEnter,
  onMouseLeave,
}: {
  icon: typeof Activity
  label: string
  value: string | number
  note: string
  tone: string
  index: number
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="liquid-glass-kpi group relative flex h-full items-start gap-4 p-5 cursor-pointer rounded-2xl overflow-hidden shadow-sm hover:border-white transition-all duration-300"
      >
        <span
          className={`relative z-10 grid size-11 shrink-0 place-items-center rounded-xl ${tone} transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:ring-1 group-hover:ring-white/80 shadow-xs`}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="relative z-10 min-w-0 flex-1">
          <p className="text-sm font-medium text-muted transition-colors group-hover:text-heading/85">{label}</p>
          <p className="mt-0.5 font-mono text-3xl font-bold tracking-tight text-heading transition-colors group-hover:text-teal drop-shadow-2xs">
            <AnimatedCounter value={value} />
          </p>
          <p className="mt-1 text-xs text-muted truncate transition-colors group-hover:text-body" title={note}>
            {note}
          </p>
        </div>
      </Card>
    </motion.div>
  )
}

const organToSystemMap: Record<string, string> = {
  pancreas: 'endocrine',
  heart: 'cardiovascular',
  lungs: 'respiratory',
  kidneys: 'renal',
  liver: 'hepatic',
  brain: 'neurological',
}

export default function Overview() {
  const t = useT()
  const [organ, setOrgan] = useState('all')
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null)
  const [twinMode, setTwinMode] = useState<'3d' | '2d'>('3d')
  const { data } = usePatientData()

  // Dynamic live organ statuses
  const liveOrganStatuses: Record<string, HealthStatus> = {}
  Object.entries(organToSystemMap).forEach(([orgId, sysKey]) => {
    if (data.organ_systems[sysKey]) {
      liveOrganStatuses[orgId] = data.organ_systems[sysKey].status
    }
  })

  // Dynamic notes derived from live reports & backend kpi metrics
  const scoreNote =
    data.kpis.score_note ||
    (data.kpis.abnormal_count === 0
      ? 'Optimal · All markers healthy'
      : data.kpis.abnormal_count === 1
        ? 'Good · 1 area to watch'
        : (data.kpis.health_score ?? 95) >= 70
          ? `Good · ${data.kpis.abnormal_count} areas to watch`
          : `Attention needed · ${data.kpis.abnormal_count} markers flagged`)

  const abnormalNote =
    data.kpis.abnormal_note ||
    (data.kpis.abnormal_count === 0
      ? 'All markers within normal limits'
      : `${data.kpis.abnormal_count} test${data.kpis.abnormal_count === 1 ? '' : 's'} flagged`)

  const medsNote =
    data.kpis.meds_note ||
    (data.kpis.total_medications === 0
      ? 'No active medicines'
      : `${data.kpis.total_medications} active · No clashes`)

  const docsNote =
    data.kpis.docs_note ||
    (data.kpis.total_documents === 0
      ? 'No records uploaded'
      : `${data.kpis.total_documents} verified document${data.kpis.total_documents === 1 ? '' : 's'}`)

  // Use live timeline if available, otherwise fallback to default
  const hasLiveTimeline = data.timeline && data.timeline.length > 0
  const recentEvents = hasLiveTimeline
    ? data.timeline.slice(0, 4).map((item) => ({
        id: item.id,
        type: item.type === 'prescription' ? ('rx' as EventType) : item.type === 'lab_report' ? ('lab' as EventType) : ('discharge' as EventType),
        title: item.title,
        detail: `${item.facility || 'Hospital'} · ${item.filename || 'Document'} (${item.observations_count} tests, ${item.medications_count} meds)`,
        date: item.date,
        status: (item.observations_count > 0 ? 'normal' : 'normal') as HealthStatus,
      }))
    : defaultTimeline.flatMap((m) => m.events).slice(0, 3).map((e) => ({
        id: e.id,
        type: e.type,
        title: t(e.titleKey),
        detail: e.detail,
        date: e.date,
        status: e.status,
      }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">{t('overview.greeting')}</h1>
          <p className="mt-1 text-sm text-muted sm:text-base">
            {data.kpis.total_documents > 0
              ? `Your health picture, grounded in ${data.kpis.total_documents} verified document${data.kpis.total_documents === 1 ? '' : 's'}.`
              : t('overview.subtitle')}
          </p>
        </div>
        <Card className="liquid-glass liquid-glass-interactive card-hover-lift group flex items-center gap-3 px-4 py-3 cursor-pointer rounded-2xl border border-white/80 shadow-sm hover:border-teal/50 hover:shadow-md transition-all duration-300">
          <div className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-teal to-cyan text-sm font-bold text-white transition-transform group-hover:scale-105 shadow-sm shadow-teal/20">
            {data.patient.name ? data.patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'AV'}
          </div>
          <div className="text-sm">
            <p className="font-semibold text-heading">
              {data.patient.name || defaultPatient.name}, {data.patient.age || defaultPatient.age}
              {data.patient.gender === 'female' ? 'F' : 'M'}
            </p>
            <p className="text-xs text-muted">
              ABHA: <span className="font-mono">{data.patient.abha_number || defaultPatient.abhaNumber}</span>
            </p>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          index={0}
          icon={HeartPulse}
          label={t('kpi.healthScore')}
          value={`${data.kpis.health_score ?? defaultPatient.healthScore}`}
          note={scoreNote}
          tone="bg-teal-tint text-teal"
        />
        <Kpi
          index={1}
          icon={AlertTriangle}
          label={t('kpi.abnormal')}
          value={`${data.kpis.abnormal_count ?? 0}`}
          note={abnormalNote}
          tone={(data.kpis.abnormal_count ?? 0) > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}
        />
        <Kpi
          index={2}
          icon={Pill}
          label={t('kpi.meds')}
          value={`${data.kpis.total_medications ?? 0}`}
          note={medsNote}
          tone="bg-cyan-tint text-cyan"
        />
        <Kpi
          index={3}
          icon={FileText}
          label={t('kpi.docs')}
          value={`${data.kpis.total_documents ?? 0}`}
          note={docsNote}
          tone="bg-emerald-50 text-emerald-600"
        />
      </div>

      <Card className="liquid-glass overflow-hidden rounded-2xl border border-white/80 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/70 px-5 py-4 bg-white/40 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-heading">{t('overview.twinTitle')}</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-teal/10 px-2 py-0.5 text-[10px] font-mono font-medium text-teal ring-1 ring-teal/20">
                <span className="size-1.5 rounded-full bg-teal animate-pulse" />
                3D Fly-Through Active
              </span>
            </div>
            <p className="text-xs text-muted">{t('overview.twinHint')}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg bg-white/60 p-1 ring-1 ring-white/80 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setTwinMode('3d')}
                className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                  twinMode === '3d' ? 'bg-teal text-white shadow-xs' : 'text-muted hover:text-heading'
                }`}
              >
                <Box className="size-3.5" />
                3D View
              </button>
              <button
                type="button"
                onClick={() => setTwinMode('2d')}
                className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                  twinMode === '2d' ? 'bg-teal text-white shadow-xs' : 'text-muted hover:text-heading'
                }`}
              >
                <MapPin className="size-3.5" />
                2D Map
              </button>
            </div>
            <Link to="/body-twin" className="inline-flex items-center gap-1 text-sm font-semibold text-teal hover:text-teal-hover">
              {t('overview.openTwin')} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>

        {/* Quick Organ Fly-Through Strip */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-white/60 bg-white/50 px-5 py-2.5 text-xs backdrop-blur-md">
          <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-muted mr-1 flex items-center gap-1.5 font-semibold">
            <Box className="size-3.5 text-teal" /> 3D View Target:
          </span>
          {[
            { id: 'all', label: '🌐 Full Body (All Problems)', isFullBody: true },
            { id: 'pancreas', label: 'Pancreas (HbA1c)' },
            { id: 'heart', label: 'Cardiovascular' },
            { id: 'liver', label: 'Hepatic (Meds)' },
            { id: 'kidneys', label: 'Renal' },
            { id: 'lungs', label: 'Lungs' },
            { id: 'brain', label: 'Neuro' },
            { id: 'knee', label: 'Knee' },
          ].map((item) => {
            const isSelected = organ === item.id || (item.id === 'all' && (organ === 'all' || organ === 'full' || organ === 'default'))
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setOrgan(item.id)}
                onMouseEnter={() => setHoveredOrgan(item.id === 'all' ? null : item.id)}
                onMouseLeave={() => setHoveredOrgan(null)}
                className={`shrink-0 rounded-full px-3 py-1 font-medium transition-all flex items-center gap-1.5 text-xs ${
                  isSelected
                    ? 'bg-teal text-white shadow-sm shadow-teal/30 font-semibold ring-2 ring-teal/20 scale-[1.02]'
                    : 'liquid-glass-pill text-slate-700 hover:text-slate-900 shadow-2xs'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-[1fr_400px]">
          <div className="relative h-[520px] bg-gradient-to-b from-white via-slate-50 to-slate-100 overflow-hidden">
            {twinMode === '3d' ? (
              <BodyTwin3D selected={organ} onSelect={setOrgan} organStatuses={liveOrganStatuses} hoveredOrgan={hoveredOrgan} />
            ) : (
              <div className="relative mx-auto h-full max-w-sm py-4">
                <BodyTwin selected={organ} onSelect={setOrgan} />
              </div>
            )}
          </div>
          <div className="border-t border-line p-5 lg:border-l lg:border-t-0">
            <OrganPanel organId={organ} compact onSelectOrgan={setOrgan} />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card className="liquid-glass card-hover-lift rounded-2xl p-5 border border-white/80 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-heading">{t('overview.recent')}</h2>
            <Link to="/timeline" className="btn-interactive text-sm font-semibold text-teal hover:text-teal-hover">
              {t('overview.viewAll')}
            </Link>
          </div>
          <ul className="divide-y divide-white/60">
            {recentEvents.map((e) => {
              const Icon = eventIcon[e.type] || FileText
              const linkedOrgan = e.type === 'lab' ? 'pancreas' : e.type === 'rx' ? 'liver' : 'heart'
              return (
                <li
                  key={e.id}
                  onMouseEnter={() => setHoveredOrgan(linkedOrgan)}
                  onMouseLeave={() => setHoveredOrgan(null)}
                  className="interactive-item -mx-2 flex items-center gap-4 rounded-xl px-3 py-3 cursor-pointer hover:bg-white/75 hover:shadow-2xs transition-all border border-transparent hover:border-white/80"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/80 text-teal shadow-2xs ring-1 ring-white/90">
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-heading">{e.title}</p>
                    <p className="truncate font-mono text-xs text-muted">{e.detail}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-xs text-muted">{e.date}</span>
                    {e.status && <StatusPill status={e.status} />}
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>

        <Card className="liquid-glass card-hover-lift relative overflow-hidden rounded-2xl p-5 border border-white/80 shadow-sm">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-gradient-to-br from-teal/15 to-cyan/15 blur-2xl" aria-hidden />
          <div className="relative">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-heading">{t('overview.abhaTitle')}</h2>
              <span className="rounded-full bg-amber-100/80 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800 ring-1 ring-amber-300/60">Mock</span>
            </div>
            <p className="mt-4 text-xs text-muted">{t('abha.number')}</p>
            <p className="font-mono text-lg font-semibold tracking-wider text-heading">
              {data.patient.abha_number || defaultPatient.abhaNumber}
            </p>
            <p className="mt-2 text-xs text-muted">{t('abha.address')}</p>
            <p className="font-mono text-sm text-body">{defaultPatient.abhaAddress}</p>
            <div className="mt-4 flex items-center justify-between">
              <SafetyBadge kind="pii" />
              <Link to="/abha" className="inline-flex items-center gap-1 text-sm font-semibold text-teal hover:text-teal-hover">
                <ShieldCheck className="size-4" aria-hidden />
                {t('overview.openCard')}
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
