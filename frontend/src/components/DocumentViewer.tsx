import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Minus, Plus, ScanLine } from 'lucide-react'
import type { DocMeta } from '../data/documents'
import { useT } from '../i18n/I18nContext'
import { apiUrl } from '../config/api'

type FactCtxValue = { active: string | null; nonce: number; onSelect: (fact: string) => void }
const FactCtx = createContext<FactCtxValue>({ active: null, nonce: 0, onSelect: () => {} })

function F({ id, children, className = '' }: { id: string; children: ReactNode; className?: string }) {
  const { active, nonce, onSelect } = useContext(FactCtx)
  const ref = useRef<HTMLButtonElement>(null)
  const isActive = active === id

  useEffect(() => {
    if (isActive) ref.current?.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' })
  }, [isActive, nonce])

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={isActive}
      aria-label={`Evidence ${id}`}
      className={`group relative -mx-1.5 rounded-[4px] px-1.5 text-left transition-colors ${
        isActive ? 'bg-teal/10 outline-2 outline-teal' : 'bg-cyan/[0.04] outline-1 outline-dashed outline-cyan/60 hover:bg-cyan/10'
      } ${className}`}
    >
      {isActive && <span key={nonce} className="pointer-events-none absolute inset-0 rounded-[4px] box-pulse" aria-hidden />}
      <span
        className={`absolute -top-[15px] left-0 rounded-t-[3px] px-1 font-mono text-[9px] font-semibold leading-[15px] ${
          isActive ? 'bg-teal text-white' : 'bg-cyan/80 text-white opacity-80 group-hover:opacity-100'
        }`}
      >
        [{id}]
      </span>
      {children}
    </button>
  )
}

const Redacted = ({ w = 'w-24' }: { w?: string }) => (
  <span className={`inline-block h-3 ${w} translate-y-0.5 rounded-[2px] bg-slate-800`} title="PII redacted" aria-label="redacted" />
)

function LabRow({ name, result, flag, unit, range }: { name: string; result: string; flag?: string; unit: string; range: string }) {
  return (
    <span className="grid grid-cols-[1.6fr_0.8fr_0.7fr_1fr] items-center gap-2 py-1.5">
      <span>{name}</span>
      <span className={`font-semibold ${flag ? 'text-red-700' : ''}`}>
        {result} {flag && <span className="text-[10px]">{flag}</span>}
      </span>
      <span className="text-slate-500">{unit}</span>
      <span className="text-slate-500">{range}</span>
    </span>
  )
}

const tableHead = (
  <div className="grid grid-cols-[1.6fr_0.8fr_0.7fr_1fr] gap-2 border-y border-slate-400 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
    <span>Test</span>
    <span>Result</span>
    <span>Unit</span>
    <span>Bio. Ref. Interval</span>
  </div>
)

function ApolloPage({ page }: { page: number }) {
  return (
    <div className="font-serif text-[12px] leading-snug text-slate-800">
      <div className="flex items-start justify-between border-b-2 border-[#0b4d8c] pb-3">
        <div className="flex items-center gap-2">
          <div className="grid size-10 place-items-center rounded-full bg-[#0b4d8c] font-sans text-lg font-black text-amber-300">A</div>
          <div className="font-sans">
            <p className="text-[15px] font-extrabold tracking-wide text-[#0b4d8c]">APOLLO DIAGNOSTICS</p>
            <p className="text-[10px] text-slate-500">Jubilee Hills, Hyderabad · NABL Accredited (MC-2104)</p>
          </div>
        </div>
        <div className="text-right font-sans">
          <p className="text-[11px] font-bold tracking-widest text-slate-700">LABORATORY REPORT</p>
          <p className="text-[10px] text-slate-500">Report ID: APD-2610-55821</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 border-b border-slate-300 py-3 text-[11px]">
        <p>
          Patient: <Redacted />
        </p>
        <p>Age / Sex: 42 Y / M</p>
        <p>Ref. by: Dr. R. Iyer</p>
        <p>Collected: 12/10/2026 08:10</p>
        <p>
          Phone: <Redacted w="w-20" />
        </p>
        <p>Reported: 12/10/2026 14:42</p>
      </div>
      {page === 1 ? (
        <>
          <p className="mt-3 font-sans text-[11px] font-bold tracking-wide text-[#0b4d8c]">BIOCHEMISTRY</p>
          {tableHead}
          <div className="mt-3 space-y-3">
            <F id="fact_1" className="block w-[calc(100%+12px)]">
              <LabRow name="Glycated Haemoglobin (HbA1c)" result="7.2" flag="H" unit="%" range="4.0 – 5.6" />
            </F>
            <F id="fact_2" className="block w-[calc(100%+12px)]">
              <LabRow name="Fasting Blood Sugar" result="142" flag="H" unit="mg/dL" range="70 – 99" />
            </F>
            <F id="fact_3" className="block w-[calc(100%+12px)]">
              <LabRow name="Serum Creatinine" result="0.9" unit="mg/dL" range="0.7 – 1.3" />
            </F>
            <F id="fact_4" className="block w-[calc(100%+12px)]">
              <LabRow name="Total Cholesterol" result="185" unit="mg/dL" range="< 200" />
            </F>
            <F id="fact_5" className="block w-[calc(100%+12px)]">
              <LabRow name="ALT (SGPT)" result="28" unit="U/L" range="7 – 56" />
            </F>
          </div>
          <p className="mt-5 font-sans text-[11px] font-bold tracking-wide text-[#0b4d8c]">HAEMATOLOGY — COMPLETE BLOOD COUNT</p>
          {tableHead}
          <LabRow name="Haemoglobin" result="14.2" unit="g/dL" range="13.0 – 17.0" />
          <LabRow name="Total WBC Count" result="7,400" unit="/µL" range="4,000 – 11,000" />
          <LabRow name="Platelet Count" result="2.6" unit="lakh/µL" range="1.5 – 4.1" />
          <LabRow name="RBC Count" result="4.9" unit="mill/µL" range="4.5 – 5.5" />
        </>
      ) : (
        <>
          <p className="mt-3 font-sans text-[11px] font-bold tracking-wide text-[#0b4d8c]">VITAMINS & LIPID SUB-FRACTIONS</p>
          {tableHead}
          <div className="mt-3">
            <F id="fact_6" className="block w-[calc(100%+12px)]">
              <LabRow name="Vitamin B12 (Cyanocobalamin)" result="412" unit="pg/mL" range="200 – 900" />
            </F>
          </div>
          <LabRow name="HDL Cholesterol" result="46" unit="mg/dL" range="> 40" />
          <LabRow name="LDL Cholesterol" result="112" unit="mg/dL" range="< 130" />
          <LabRow name="Triglycerides" result="138" unit="mg/dL" range="< 150" />
          <div className="mt-4 rounded border border-slate-300 p-2 text-[10.5px] text-slate-600">
            <p className="font-bold">Interpretation (HbA1c, ADA 2026):</p>
            <p>Non-diabetic &lt; 5.7% · Pre-diabetes 5.7 – 6.4% · Diabetes ≥ 6.5%</p>
          </div>
        </>
      )}
      <div className="mt-8 flex items-end justify-between font-sans text-[10px] text-slate-500">
        <div>
          <svg width="90" height="24" viewBox="0 0 90 24" aria-hidden>
            <path d="M2,18 C12,2 18,22 28,10 S44,4 50,16 S70,6 88,12" fill="none" stroke="#1e3a8a" strokeWidth="1.4" />
          </svg>
          <p className="font-semibold text-slate-700">Dr. S. Rao, MD (Pathology)</p>
        </div>
        <p>— Page {page} of 2 —</p>
      </div>
    </div>
  )
}

function FortisPage() {
  return (
    <div className="text-slate-800">
      <div className="flex items-start justify-between border-b-2 border-emerald-700 pb-3 font-sans">
        <div>
          <p className="text-[16px] font-black tracking-wide text-emerald-800">FORTIS HOSPITAL</p>
          <p className="text-[10px] text-slate-500">Bannerghatta Road, Bengaluru · OPD Prescription</p>
        </div>
        <div className="text-right text-[10.5px] leading-tight">
          <p className="font-bold text-slate-700">Dr. Ramesh Iyer</p>
          <p className="text-slate-500">MD (Medicine), DM (Endocrinology)</p>
          <p className="text-slate-500">Reg. No. KMC 45821</p>
        </div>
      </div>
      <div className="mt-3 flex justify-between font-sans text-[11px]">
        <p>
          Name: <Redacted /> <span className="ml-2 font-hand text-[18px] text-blue-900">42 / M</span>
        </p>
        <p>
          Date: <span className="font-hand text-[18px] text-blue-900">14/10/26</span>
        </p>
      </div>
      <div className="mt-2 font-hand text-[22px] leading-[1.35] text-blue-900">
        <p className="text-[38px] font-bold leading-none">℞</p>
        <div className="ml-6 mt-4 space-y-6">
          <div>
            <F id="fact_1">
              <span>1) Tab. Glycomet-GP 1</span>
            </F>
            <div className="mt-4 pl-8">
              <F id="fact_2">
                <span>1 — 0 — 0 &nbsp;before bkfst × 3 mo</span>
              </F>
            </div>
          </div>
          <div>
            <F id="fact_3">
              <span>2) Tab. Telma 40 &nbsp;0 — 0 — 1 after dinner</span>
            </F>
          </div>
          <p className="text-[19px] text-blue-900/80">· Diet control, walk 30 min daily</p>
          <div>
            <F id="fact_4">
              <span>Adv: Repeat HbA1c after 3 months</span>
            </F>
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <svg width="120" height="40" viewBox="0 0 120 40" aria-hidden>
            <path d="M4,30 C20,4 28,36 40,18 C48,6 56,34 66,20 C74,10 82,30 96,14 L116,10" fill="none" stroke="#1e3a8a" strokeWidth="1.8" />
          </svg>
        </div>
      </div>
      <p className="mt-2 border-t border-dashed border-slate-300 pt-2 text-center font-sans text-[9.5px] text-slate-400">
        Not valid for medico-legal purposes · Pharmacy copy
      </p>
    </div>
  )
}

function MaxPage({ page }: { page: number }) {
  return (
    <div className="font-serif text-[12px] leading-relaxed text-slate-800">
      <div className="border-b-2 border-[#7a1f3d] pb-3 text-center font-sans">
        <p className="text-[15px] font-black tracking-wide text-[#7a1f3d]">MAX SUPER SPECIALITY HOSPITAL</p>
        <p className="text-[10px] text-slate-500">Press Enclave Road, Saket, New Delhi – 110017</p>
        <p className="mt-1 text-[11px] font-bold tracking-[0.25em] text-slate-700">DISCHARGE SUMMARY</p>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 border-b border-slate-300 py-3 text-[11px]">
        <p>
          Patient: <Redacted />
        </p>
        <p>
          UHID: <Redacted w="w-16" />
        </p>
        <p>Admitted: 18/08/2026</p>
        <p>Discharged: 20/08/2026</p>
        <p>Consultant: Dr. Neha Kapoor</p>
        <p>Dept: Endocrinology</p>
      </div>
      {page === 1 ? (
        <div className="mt-3 space-y-4">
          <div>
            <p className="font-sans text-[10.5px] font-bold uppercase tracking-wide text-[#7a1f3d]">Final diagnosis</p>
            <div className="mt-2">
              <F id="fact_1">Type 2 Diabetes Mellitus — uncontrolled, with hyperglycaemia</F>
            </div>
          </div>
          <div>
            <p className="font-sans text-[10.5px] font-bold uppercase tracking-wide text-[#7a1f3d]">Investigations</p>
            <div className="mt-2 space-y-3">
              <F id="fact_2">HbA1c on admission: 7.6 %</F>
              <p>RBS at admission 286 mg/dL; urine ketones negative.</p>
            </div>
          </div>
          <div>
            <p className="font-sans text-[10.5px] font-bold uppercase tracking-wide text-[#7a1f3d]">Condition at discharge</p>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-3">
              <F id="fact_3">SpO₂ 98 % on room air</F>
              <F id="fact_4">BP 120/80 mmHg</F>
              <span>Pulse 78/min</span>
            </div>
          </div>
          <div>
            <p className="font-sans text-[10.5px] font-bold uppercase tracking-wide text-[#7a1f3d]">Discharge medications</p>
            <div className="mt-2">
              <F id="fact_5">Tab. Metformin 500mg — BD, after meals</F>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-3 text-[11.5px]">
          <p className="font-sans text-[10.5px] font-bold uppercase tracking-wide text-[#7a1f3d]">
            {page === 2 ? 'Hospital course' : 'Advice on discharge'}
          </p>
          {page === 2 ? (
            <p>
              Patient presented with polyuria and fatigue for 2 weeks. Managed with IV fluids and basal-bolus insulin, transitioned to
              oral agents. Glycaemic control achieved within 36 hours. Diabetes educator consulted.
            </p>
          ) : (
            <ul className="list-disc space-y-1 pl-5">
              <li>Low glycaemic index diet; avoid sugary beverages.</li>
              <li>Self-monitoring of blood glucose twice weekly.</li>
              <li>Follow up in Endocrinology OPD after 6 weeks with HbA1c.</li>
              <li>Return immediately if dizziness, vomiting or excessive thirst.</li>
            </ul>
          )}
        </div>
      )}
      <div className="mt-8 flex justify-between font-sans text-[10px] text-slate-500">
        <p>Dr. Neha Kapoor, DM (Endocrinology)</p>
        <p>— Page {page} of 3 —</p>
      </div>
    </div>
  )
}

const gridBg = {
  backgroundImage:
    'linear-gradient(rgb(14 165 233 / 0.07) 1px, transparent 1px), linear-gradient(90deg, rgb(14 165 233 / 0.07) 1px, transparent 1px)',
  backgroundSize: '24px 24px',
  backgroundAttachment: 'local',
}

const factPage: Record<string, Record<string, number>> = { apollo: { fact_6: 2 } }

export type BoundingBoxFact = {
  id: string
  label?: string
  page?: number
  bounding_box?: { ymin: number; xmin: number; ymax: number; xmax: number } | null
}

type Props = {
  doc: DocMeta
  activeFact: string | null
  nonce: number
  onSelectFact: (fact: string) => void
  boxes?: BoundingBoxFact[]
  imageUrl?: string
  isCustom?: boolean
}

export default function DocumentViewer({ doc, activeFact, nonce, onSelectFact, boxes, imageUrl, isCustom }: Props) {
  const t = useT()
  const [zoom, setZoom] = useState(1)
  const [page, setPage] = useState(1)

  useEffect(() => setPage(1), [doc.id])
  useEffect(() => {
    if (activeFact) {
      if (factPage[doc.id]?.[activeFact]) {
        setPage(factPage[doc.id][activeFact])
      } else if (boxes) {
        const found = boxes.find((b) => b.id === activeFact)
        if (found?.page) setPage(found.page)
      }
    }
  }, [activeFact, nonce, doc.id, boxes])

  const isDemoDoc = ['apollo', 'fortis', 'max'].includes(doc.id) && !isCustom

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-slate-100 shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-line bg-white px-3 py-2">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <ScanLine className="size-4 shrink-0 text-teal" aria-hidden />
          <span className="truncate font-mono text-xs text-body">{doc.file}</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="grid size-7 place-items-center rounded-md text-muted hover:bg-subtle disabled:opacity-30">
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-14 text-center font-mono text-xs text-body">
            {t('evidence.page')} {page}/{doc.pages || 1}
          </span>
          <button type="button" aria-label="Next page" disabled={page >= (doc.pages || 1)} onClick={() => setPage((p) => p + 1)} className="grid size-7 place-items-center rounded-md text-muted hover:bg-subtle disabled:opacity-30">
            <ChevronRight className="size-4" />
          </button>
          <span className="mx-1 h-5 w-px bg-line" />
          <button type="button" aria-label={t('evidence.zoomOut')} onClick={() => setZoom((z) => Math.max(0.7, +(z - 0.1).toFixed(1)))} className="grid size-7 place-items-center rounded-md text-muted hover:bg-subtle">
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center font-mono text-xs text-body">{Math.round(zoom * 100)}%</span>
          <button type="button" aria-label={t('evidence.zoomIn')} onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(1)))} className="grid size-7 place-items-center rounded-md text-muted hover:bg-subtle">
            <Plus className="size-4" />
          </button>
        </div>
      </div>
      <div className="relative flex-1 overflow-auto p-4 sm:p-8" style={gridBg}>
        <FactCtx.Provider value={{ active: activeFact, nonce, onSelect: onSelectFact }}>
          <div style={{ zoom }} className="mx-auto w-full min-w-[460px] max-w-[620px]">
            {isDemoDoc ? (
              <div className="paper -rotate-[0.6deg] rounded-sm p-6 sm:p-8">
                {doc.id === 'apollo' && <ApolloPage page={page} />}
                {doc.id === 'fortis' && <FortisPage />}
                {doc.id === 'max' && <MaxPage page={page} />}
              </div>
            ) : (
              <div className="relative min-h-[500px] overflow-hidden rounded-md border border-slate-300 bg-white shadow-xl">
                <img
                  src={imageUrl || apiUrl(`/api/documents/${doc.id}/pages/${page}`)}
                  alt={doc.file}
                  className="block h-auto w-full select-none"
                  loading="eager"
                  onLoad={(e) => {
                    e.currentTarget.style.display = 'block'
                  }}
                  onError={(e) => {
                    // Do not completely hide; keep height so bounding boxes and overlay remain aligned
                    console.warn(`Page image load failed for document: ${doc.id}`)
                  }}
                />
                {/* Visual Bounding Box Overlay Layer */}
                {boxes?.filter((b) => (b.page || 1) === page && b.bounding_box).map((b) => {
                  const bb = b.bounding_box!
                  const top = `${bb.ymin / 10}%`
                  const left = `${bb.xmin / 10}%`
                  const width = `${Math.max(4, (bb.xmax - bb.xmin) / 10)}%`
                  const height = `${Math.max(2.5, (bb.ymax - bb.ymin) / 10)}%`
                  const isActive = activeFact === b.id

                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => onSelectFact(b.id)}
                      style={{ top, left, width, height }}
                      className={`absolute cursor-pointer rounded transition-all ${
                        isActive
                          ? 'z-30 scale-[1.02] border-2 border-teal bg-teal/25 shadow-[0_0_15px_rgba(13,148,136,0.7)]'
                          : 'z-10 border border-cyan/60 bg-cyan/[0.08] hover:border-cyan hover:bg-cyan/25'
                      }`}
                      title={`${b.label || b.id} [${b.id}]`}
                    >
                      <span
                        className={`absolute -top-3.5 left-0 rounded px-1 font-mono text-[9px] font-bold ${
                          isActive ? 'bg-teal text-white shadow-sm' : 'bg-cyan/90 text-white'
                        }`}
                      >
                        [{b.id}]
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </FactCtx.Provider>
      </div>
    </div>
  )
}

