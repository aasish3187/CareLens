import { useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertTriangle, Building2, ChevronDown, Download, FileJson, Check } from 'lucide-react'
import { useT } from '../i18n/I18nContext'
import { patient } from '../data/patient'
import { buildFhirBundle } from '../data/fhir'
import Card from '../components/ui/Card'
import PageHeader from '../components/PageHeader'
import SafetyBadge from '../components/ui/SafetyBadge'

function Guilloche() {
  const rings = Array.from({ length: 18 }, (_, i) => i)
  return (
    <svg className="absolute inset-0 size-full" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {rings.map((i) => (
        <ellipse
          key={i}
          cx="320"
          cy="40"
          rx={60 + i * 14}
          ry={30 + i * 9}
          transform={`rotate(${i * 10} 320 40)`}
          fill="none"
          stroke="white"
          strokeOpacity="0.09"
          strokeWidth="0.8"
        />
      ))}
      {rings.map((i) => (
        <path key={`w${i}`} d={`M0,${150 + i * 6} Q100,${120 + i * 6} 200,${150 + i * 6} T400,${150 + i * 6}`} fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="0.7" />
      ))}
    </svg>
  )
}

export default function AbhaCard() {
  const t = useT()
  const bundle = useMemo(() => buildFhirBundle(), [])
  const json = useMemo(() => JSON.stringify(bundle, null, 2), [bundle])
  const [preview, setPreview] = useState(false)
  const [exported, setExported] = useState(false)

  const download = () => {
    const blob = new Blob([json], { type: 'application/fhir+json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'carelens-arjun-verma-fhir-r4-MOCK.json'
    a.click()
    URL.revokeObjectURL(url)
    setExported(true)
    setTimeout(() => setExported(false), 2500)
  }

  return (
    <div>
      <PageHeader title={t('abha.title')} subtitle={t('abha.subtitle')} actions={<SafetyBadge kind="pii" />} />

      <div className="mb-6 flex items-start gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden />
        <div>
          <p className="font-bold uppercase tracking-wide text-amber-900">{t('abha.mock')}</p>
          <p className="text-sm text-amber-800">{t('abha.disclaimer')}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,560px)_1fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, rotateX: 12, y: 12 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[1.586/1] overflow-hidden rounded-[20px] bg-gradient-to-br from-[#0b3d5c] via-[#0f5f6e] to-[#0d9488] p-5 text-white shadow-2xl shadow-teal/30 sm:p-6"
            style={{ perspective: 800 }}
          >
            <Guilloche />
            <div className="holo pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-orange-400 via-white to-green-600 ring-2 ring-white/40">
                    <span className="size-3 rounded-full border-2 border-[#0b3d8c]" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-[10px] font-bold tracking-[0.12em] text-white/90 sm:text-[11px]">AYUSHMAN BHARAT DIGITAL MISSION (ABDM)</p>
                    <p className="text-[10px] font-semibold tracking-[0.2em] text-amber-300">— MOCK PROFILE</p>
                  </div>
                </div>
                <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-black text-amber-950">MOCK</span>
              </div>

              <div className="mt-auto flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xl font-bold tracking-tight sm:text-2xl">{patient.name}</p>
                  <p className="text-xs text-white/75">
                    {patient.age} · {t('abha.male')} · {t('abha.blood')} <span className="font-mono">{patient.bloodGroup}</span>
                  </p>
                  <p className="mt-3 text-[10px] uppercase tracking-widest text-white/60">{t('abha.number')}</p>
                  <p className="font-mono text-base font-semibold tracking-[0.12em] sm:text-lg">
                    {patient.abhaNumber} <span className="text-xs text-amber-300">(MOCK)</span>
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-white/60">{t('abha.address')}</p>
                  <p className="font-mono text-sm">{patient.abhaAddress}</p>
                </div>
                <div className="shrink-0 rounded-xl bg-white p-2 shadow-lg">
                  <QRCodeSVG value={`https://carelens.altrixlabs.example/fhir/Bundle/${bundle.id}?abha=MOCK`} size={92} fgColor="#0F172A" level="M" />
                </div>
              </div>
            </div>
          </motion.div>
          <p className="mt-3 text-center text-xs text-muted">{t('abha.scan')}</p>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-xs text-muted">{t('abha.dob')}</dt>
                <dd className="font-mono font-medium text-heading">{patient.dob}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">{t('abha.gender')}</dt>
                <dd className="font-medium text-heading">{t('abha.male')}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">{t('abha.blood')}</dt>
                <dd className="font-mono font-medium text-heading">{patient.bloodGroup}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">FHIR</dt>
                <dd className="font-mono font-medium text-heading">R4 · NRCeS</dd>
              </div>
            </dl>
            <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-muted">{t('abha.facilities')}</p>
            <ul className="space-y-2">
              {patient.facilities.map((f) => (
                <li key={f.name} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
                  <span className="grid size-9 place-items-center rounded-lg bg-teal-tint text-teal">
                    <Building2 className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-medium text-heading">{f.name}</p>
                    <p className="text-xs text-muted">{f.city}</p>
                  </div>
                  <span className="font-mono text-[11px] text-muted">HFR {f.hfrId}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <FileJson className="size-4 text-teal" aria-hidden />
              <h2 className="font-semibold text-heading">{t('abha.interop')}</h2>
              <span className="ml-auto font-mono text-xs text-muted">
                {bundle.entry.length} {t('abha.resources')}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={download} className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal px-4 text-sm font-semibold text-white shadow-sm shadow-teal/20 hover:bg-teal-hover">
                {exported ? <Check className="size-4" aria-hidden /> : <Download className="size-4" aria-hidden />}
                {exported ? t('abha.exported') : t('abha.export')}
              </button>
              <button
                type="button"
                onClick={() => setPreview((p) => !p)}
                aria-expanded={preview}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-heading hover:bg-subtle"
              >
                {preview ? t('abha.hide') : t('abha.preview')}
                <ChevronDown className={`size-4 transition-transform ${preview ? 'rotate-180' : ''}`} aria-hidden />
              </button>
            </div>
            <AnimatePresence initial={false}>
              {preview && (
                <motion.pre
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 max-h-96 overflow-auto rounded-xl bg-heading p-4 font-mono text-[11px] leading-relaxed text-cyan-100"
                >
                  {json}
                </motion.pre>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>
    </div>
  )
}
