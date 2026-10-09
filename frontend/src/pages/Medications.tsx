import { Link } from 'react-router'
import { ArrowRight, CheckCircle2, FileText, Moon, Pill, ShieldCheck, Sun } from 'lucide-react'
import { useT } from '../i18n/I18nContext'
import { medications as defaultMedications } from '../data/medications'
import { docById } from '../data/documents'
import Card from '../components/ui/Card'
import PageHeader from '../components/PageHeader'
import SafetyBadge from '../components/ui/SafetyBadge'
import { usePatientData } from '../hooks/usePatientData'

function DoseDots({ dose }: { dose: string }) {
  const t = useT()
  const slots = dose.includes('-') ? dose.split('-') : ['1', '0', '0']
  const labels = [
    { icon: Sun, key: 'timing.morning' },
    { icon: Sun, key: '' },
    { icon: Moon, key: 'timing.night' },
  ]
  return (
    <div className="flex items-center gap-1.5" aria-label={dose}>
      {slots.slice(0, 3).map((s, i) => {
        const on = s !== '0'
        const Icon = labels[i]?.icon || Sun
        return (
          <span
            key={i}
            title={labels[i]?.key ? t(labels[i].key) : undefined}
            className={`grid size-8 place-items-center rounded-lg ${
              on ? 'bg-teal text-white shadow-sm shadow-teal/30' : 'bg-subtle text-slate-300'
            }`}
          >
            <Icon className={`size-4 ${i === 1 ? 'opacity-60' : ''}`} aria-hidden />
          </span>
        )
      })}
      <span className="ml-1 font-mono text-sm font-semibold text-heading">{dose}</span>
    </div>
  )
}

export default function Medications() {
  const t = useT()
  const { data } = usePatientData()

  // Use live medications from extracted documents if available
  const hasLiveMeds = data.active_medications && data.active_medications.length > 0

  return (
    <div>
      <PageHeader title={t('meds.title')} subtitle={t('meds.subtitle')} actions={<SafetyBadge kind="notDiagnosis" />} />

      <Card className="mb-6 flex flex-wrap items-center gap-4 border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-5">
        <span className="grid size-12 place-items-center rounded-xl bg-st-normal text-white shadow-md shadow-emerald-500/25">
          <CheckCircle2 className="size-6" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">{t('meds.poly')}</p>
          <p className="text-lg font-semibold text-heading">
            {hasLiveMeds ? `${data.active_medications.length} Verified Medications Active` : t('meds.polyOk')}
          </p>
          <p className="text-sm text-body">{t('meds.polyBody')}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
          <ShieldCheck className="size-3.5" aria-hidden />
          {t('meds.kidneyCheck')}
        </span>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {hasLiveMeds
          ? data.active_medications.map((m, idx) => {
              const docTarget = m.document_id || 'live'
              return (
                <Card key={m.id || idx} className="card-interactive flex flex-col p-5">
                  <div className="flex items-start gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-teal-tint to-cyan-tint text-teal ring-1 ring-teal/15">
                      <Pill className="size-6" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xl font-bold tracking-tight text-heading">{m.brand_name}</p>
                      <p className="text-sm text-teal font-medium">
                        {m.generic_name || 'Active Therapeutic Salt'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{t('meds.composition')}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-subtle/60 px-3 py-1.5 text-sm">
                        <span className="font-medium text-heading">{m.generic_name || m.brand_name}</span>
                        {m.strength && <span className="font-mono text-xs font-semibold text-teal">{m.strength}</span>}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{t('meds.timing')}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <DoseDots dose={m.frequency || '1-0-0'} />
                      <span className="rounded-full bg-cyan-tint px-3 py-1 text-xs font-semibold text-sky-700 capitalize">
                        {m.timing?.replace('_', ' ') || 'After food'}
                      </span>
                      {m.duration && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {m.duration}
                        </span>
                      )}
                    </div>
                  </div>

                  <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
                    <div>
                      <dt className="text-xs text-muted">Prescribed Route</dt>
                      <dd className="font-medium text-heading">Oral Therapy</dd>
                      <dd className="text-xs text-muted">Indian Commercial Drug</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Status</dt>
                      <dd className="font-mono font-medium text-emerald-600">Active · Grounded</dd>
                    </div>
                  </dl>

                  <Link
                    to={`/evidence/${docTarget}?fact=${m.fact_id || 'med_1'}`}
                    className="mt-4 flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-sm transition-colors hover:border-teal/40 hover:bg-teal-tint/40"
                  >
                    <FileText className="size-4 text-cyan" aria-hidden />
                    <span className="text-xs text-muted">{t('meds.source')}</span>
                    <span className="min-w-0 flex-1 truncate font-mono text-xs text-heading">
                      Uploaded Prescription · [{m.fact_id || 'Rx Fact'}]
                    </span>
                    <ArrowRight className="size-4 text-teal" aria-hidden />
                  </Link>
                </Card>
              )
            })
          : defaultMedications.map((m) => {
              const doc = docById(m.docId)
              return (
                <Card key={m.id} className="card-interactive flex flex-col p-5">
                  <div className="flex items-start gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-teal-tint to-cyan-tint text-teal ring-1 ring-teal/15">
                      <Pill className="size-6" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xl font-bold tracking-tight text-heading">{m.brand}</p>
                      <p className="text-sm text-muted">{t(m.purposeKey)}</p>
                    </div>
                  </div>
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{t('meds.composition')}</p>
                    <div className="flex flex-wrap gap-2">
                      {m.composition.map((c) => (
                        <span key={c.name} className="inline-flex items-center gap-2 rounded-lg border border-line bg-subtle/60 px-3 py-1.5 text-sm">
                          <span className="font-medium text-heading">{c.name}</span>
                          <span className="font-mono text-xs font-semibold text-teal">{c.strength}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{t('meds.timing')}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <DoseDots dose={m.dose} />
                      <span className="rounded-full bg-cyan-tint px-3 py-1 text-xs font-semibold text-sky-700">{t(m.timingKey)}</span>
                    </div>
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
                    <div>
                      <dt className="text-xs text-muted">{t('meds.prescriber')}</dt>
                      <dd className="font-medium text-heading">{m.prescriber}</dd>
                      <dd className="text-xs text-muted">{m.facility}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">{t('meds.since')}</dt>
                      <dd className="font-mono font-medium text-heading">{m.since}</dd>
                    </div>
                  </dl>
                  <Link
                    to={`/evidence/${doc.id}?fact=${m.fact}`}
                    className="mt-4 flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-sm transition-colors hover:border-teal/40 hover:bg-teal-tint/40"
                  >
                    <FileText className="size-4 text-cyan" aria-hidden />
                    <span className="text-xs text-muted">{t('meds.source')}</span>
                    <span className="min-w-0 flex-1 truncate font-mono text-xs text-heading">
                      {doc.file} · [{m.fact}]
                    </span>
                    <ArrowRight className="size-4 text-teal" aria-hidden />
                  </Link>
                </Card>
              )
            })}
      </div>
    </div>
  )
}
