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

export const eventIcon: Record<EventType, typeof FlaskConical> = {
  lab: FlaskConical,
  rx: Pill,
  discharge: ClipboardList,
  visit: Stethoscope,
}

function Kpi({ icon: Icon, label, value, note, tone, index }: { icon: typeof Activity; label: string; value: string; note: string; tone: string; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card className="card-hover-lift flex h-full items-start gap-4 p-5 cursor-pointer">
        <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tone} transition-transform duration-200 group-hover:scale-110`}>
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-0.5 font-mono text-3xl font-semibold tracking-tight text-heading">{value}</p>
          <p className="mt-1 text-xs text-muted">{note}</p>
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
  const [organ, setOrgan] = useState('pancreas')
  const [twinMode, setTwinMode] = useState<'3d' | '2d'>('3d')
  const { data } = usePatientData()

  // Dynamic live organ statuses
  const liveOrganStatuses: Record<string, HealthStatus> = {}
  Object.entries(organToSystemMap).forEach(([orgId, sysKey]) => {
    if (data.organ_systems[sysKey]) {
      liveOrganStatuses[orgId] = data.organ_systems[sysKey].status
    }
  })

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
          <p className="mt-1 text-sm text-muted sm:text-base">{t('overview.subtitle')}</p>
        </div>
        <Card className="flex items-center gap-3 px-4 py-3">
          <div className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-teal to-cyan text-sm font-bold text-white">
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
          value={`${data.kpis.health_score || defaultPatient.healthScore}`}
          note={t('kpi.scoreNote')}
          tone="bg-teal-tint text-teal"
        />
        <Kpi
          index={1}
          icon={AlertTriangle}
          label={t('kpi.abnormal')}
          value={`${data.kpis.abnormal_count}`}
          note={t('kpi.abnormalNote')}
          tone={data.kpis.abnormal_count > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}
        />
        <Kpi
          index={2}
          icon={Pill}
          label={t('kpi.meds')}
          value={`${data.kpis.total_medications || 2}`}
          note={t('kpi.medsNote')}
          tone="bg-cyan-tint text-cyan"
        />
        <Kpi
          index={3}
          icon={FileText}
          label={t('kpi.docs')}
          value={`${data.kpis.total_documents || 3}`}
          note={t('kpi.docsNote')}
          tone="bg-emerald-50 text-emerald-600"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="font-semibold text-heading">{t('overview.twinTitle')}</h2>
            <p className="text-sm text-muted">{t('overview.twinHint')}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg bg-subtle p-1 ring-1 ring-line">
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

        <div className="grid lg:grid-cols-[1fr_400px]">
          <div className="relative h-[520px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-4">
            {twinMode === '3d' ? (
              <BodyTwin3D selected={organ} onSelect={setOrgan} organStatuses={liveOrganStatuses} />
            ) : (
              <div className="relative mx-auto h-full max-w-sm py-4">
                <BodyTwin selected={organ} onSelect={setOrgan} />
              </div>
            )}
          </div>
          <div className="border-t border-line p-5 lg:border-l lg:border-t-0">
            <OrganPanel organId={organ} compact />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card className="card-hover-lift p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-heading">{t('overview.recent')}</h2>
            <Link to="/timeline" className="btn-interactive text-sm font-semibold text-teal hover:text-teal-hover">
              {t('overview.viewAll')}
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {recentEvents.map((e) => {
              const Icon = eventIcon[e.type] || FileText
              return (
                <li key={e.id} className="interactive-item -mx-2 flex items-center gap-4 rounded-xl px-2 py-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-subtle text-teal">
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

        <Card className="card-hover-lift relative overflow-hidden p-5">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-gradient-to-br from-teal/15 to-cyan/15 blur-2xl" aria-hidden />
          <div className="relative">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-heading">{t('overview.abhaTitle')}</h2>
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">Mock</span>
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
