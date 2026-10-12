import { useState } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, TrendingDown, TrendingUp, FlaskConical, Pill, ClipboardList, Stethoscope, FileText } from 'lucide-react'
import { useT } from '../i18n/I18nContext'
import { timeline as defaultTimeline, type EventType } from '../data/timeline'
import Card from '../components/ui/Card'
import PageHeader from '../components/PageHeader'
import StatusPill from '../components/ui/StatusPill'
import { usePatientData } from '../hooks/usePatientData'

export const eventIcon: Record<EventType, typeof FlaskConical> = {
  lab: FlaskConical,
  rx: Pill,
  discharge: ClipboardList,
  visit: Stethoscope,
}

const filters: { key: string; types: EventType[] | null }[] = [
  { key: 'filter.all', types: null },
  { key: 'filter.labs', types: ['lab'] },
  { key: 'filter.rx', types: ['rx'] },
  { key: 'filter.discharge', types: ['discharge'] },
]

const typeTone: Record<EventType, string> = {
  lab: 'bg-cyan-tint text-cyan ring-cyan/25',
  rx: 'bg-teal-tint text-teal ring-teal/25',
  discharge: 'bg-violet-50 text-violet-600 ring-violet-200',
  visit: 'bg-subtle text-muted ring-line',
}

export default function Timeline() {
  const t = useT()
  const [filter, setFilter] = useState(0)
  const { data } = usePatientData()

  const types = filters[filter].types
  const hasLiveTimeline = data.timeline && data.timeline.length > 0

  // Build unified groups from live data or fallback to defaults
  let groups: Array<{
    monthKey: string
    events: Array<{
      id: string
      type: EventType
      title: string
      detail: string
      date: string
      facility: string
      status?: 'normal' | 'elevated' | 'critical'
      docId?: string
      trendKey?: string
      trendDir?: 'up' | 'down'
    }>
  }> = []

  if (hasLiveTimeline) {
    const liveFiltered = data.timeline
      .map((item) => {
        const evType: EventType =
          item.type === 'prescription' ? 'rx' : item.type === 'lab_report' ? 'lab' : 'discharge'
        return {
          id: item.id,
          type: evType,
          title: item.title,
          detail: `${item.filename || 'Record'} · ${item.observations_count} tests extracted · ${item.medications_count} medicines`,
          date: item.date,
          facility: item.facility || 'Healthcare Facility',
          status: 'normal' as const,
          docId: item.id,
        }
      })
      .filter((e) => !types || types.includes(e.type))

    groups = [
      {
        monthKey: 'timeline.live',
        events: liveFiltered,
      },
    ]
  } else {
    groups = defaultTimeline
      .map((g) => ({
        monthKey: g.monthKey,
        events: g.events
          .filter((e) => !types || types.includes(e.type))
          .map((e) => ({
            id: e.id,
            type: e.type,
            title: t(e.titleKey),
            detail: e.detail,
            date: e.date,
            facility: e.facility,
            status: e.status,
            docId: e.docId,
            trendKey: e.trendKey,
            trendDir: e.trendDir,
          })),
      }))
      .filter((g) => g.events.length)
  }

  return (
    <div className="max-w-4xl">
      <PageHeader title={t('timeline.title')} subtitle={t('timeline.subtitle')} />
      <div className="mb-8 flex flex-wrap gap-2.5" role="radiogroup">
        {filters.map((f, i) => (
          <button
            key={f.key}
            type="button"
            role="radio"
            aria-checked={filter === i}
            onClick={() => setFilter(i)}
            className={`btn-interactive rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
              filter === i
                ? 'bg-teal text-white shadow-md shadow-teal/25 ring-2 ring-teal/30 scale-[1.02]'
                : 'liquid-glass-pill text-body hover:text-heading hover:border-teal/40'
            }`}
          >
            {t(f.key)}
          </button>
        ))}
      </div>

      {groups.length === 0 || groups[0].events.length === 0 ? (
        <p className="text-sm text-muted">{t('timeline.empty')}</p>
      ) : null}

      <div className="space-y-10">
        {groups.map((g, gIdx) => (
          <section key={g.monthKey || gIdx}>
            <h2 className="mb-4 inline-flex items-center gap-2 rounded-lg bg-white/60 px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.14em] text-teal-hover border border-white/80 backdrop-blur-md shadow-2xs">
              <span className="size-2 rounded-full bg-teal animate-pulse" />
              {hasLiveTimeline ? 'Uploaded Medical Documents' : t(g.monthKey)}
            </h2>
            <ol className="relative ml-5 border-l-2 border-dashed border-teal/40 shadow-[0_0_12px_rgba(13,148,136,0.12)]">
              <AnimatePresence initial={false}>
                {g.events.map((e) => {
                  const Icon = eventIcon[e.type] || FileText
                  return (
                    <motion.li
                      key={e.id}
                      layout
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="relative pb-6 pl-9 last:pb-0"
                    >
                      <span
                        className={`liquid-glass absolute -left-[21px] top-3 grid size-10 place-items-center rounded-full shadow-md ring-1 ring-white/90 backdrop-blur-md transition-transform hover:scale-110 ${
                          typeTone[e.type] || 'bg-white/80 text-muted'
                        }`}
                      >
                        <Icon className="size-[18px]" aria-hidden />
                      </span>
                      <div className="liquid-glass-lens rounded-2xl border border-white/80 p-5 shadow-sm overflow-hidden hover:border-white transition-all duration-300">
                        <div className="relative z-10">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="font-mono font-semibold text-heading">{e.date}</span>
                                <span className="text-muted">·</span>
                                <span className="font-medium text-muted capitalize">{e.type}</span>
                              </div>
                              <p className="mt-1 font-bold text-heading text-base drop-shadow-2xs">{e.title}</p>
                              <p className="mt-0.5 font-mono text-xs text-body">{e.detail}</p>
                              <p className="mt-1 text-xs text-muted">{e.facility}</p>
                            </div>
                            {e.status && <StatusPill status={e.status} />}
                          </div>
                          {(e.trendKey || e.docId) && (
                            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-white/60 pt-3">
                              {e.trendKey ? (
                                <span className="liquid-glass-pill inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-300">
                                  {e.trendDir === 'down' ? (
                                    <TrendingDown className="size-3.5 text-emerald-600" aria-hidden />
                                  ) : (
                                    <TrendingUp className="size-3.5 text-emerald-600" aria-hidden />
                                  )}
                                  {t(e.trendKey)}
                                </span>
                              ) : (
                                <span />
                              )}
                              {e.docId && (
                                <Link
                                  to={`/evidence/${e.docId}`}
                                  className="btn-interactive inline-flex items-center gap-1.5 rounded-lg bg-teal-tint/70 px-3 py-1.5 text-xs font-bold text-teal hover:bg-teal hover:text-white transition-all shadow-2xs"
                                >
                                  {t('timeline.view')} <ArrowRight className="size-3.5" aria-hidden />
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ol>
          </section>
        ))}
      </div>
    </div>
  )
}
