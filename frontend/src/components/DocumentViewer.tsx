import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight, Minus, Plus, ScanLine, Search, Sparkles, ZoomIn, Eye } from 'lucide-react'
import type { DocMeta } from '../data/documents'
import { useT } from '../i18n/I18nContext'
import { apiUrl } from '../config/api'
import { playScanBeamSound, playGlassClickSound } from '../utils/soundEffects'

type FactCtxValue = { active: string | null; nonce: number; onSelect: (fact: string) => void }
const FactCtx = createContext<FactCtxValue>({ active: null, nonce: 0, onSelect: () => {} })

type HoverFactCtxValue = {
  hoveredFact: string | null
  setHoveredFact: (text: string | null) => void
}
const HoverFactCtx = createContext<HoverFactCtxValue>({ hoveredFact: null, setHoveredFact: () => {} })

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
  const { setHoveredFact } = useContext(HoverFactCtx)
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
            <div onMouseEnter={() => setHoveredFact('HbA1c: 7.2% [High] — Glycated Haemoglobin')} onMouseLeave={() => setHoveredFact(null)}>
              <F id="fact_1" className="block w-[calc(100%+12px)]">
                <LabRow name="Glycated Haemoglobin (HbA1c)" result="7.2" flag="H" unit="%" range="4.0 – 5.6" />
              </F>
            </div>
            <div onMouseEnter={() => setHoveredFact('Fasting Blood Sugar: 142 mg/dL [High]')} onMouseLeave={() => setHoveredFact(null)}>
              <F id="fact_2" className="block w-[calc(100%+12px)]">
                <LabRow name="Fasting Blood Sugar" result="142" flag="H" unit="mg/dL" range="70 – 99" />
              </F>
            </div>
            <div onMouseEnter={() => setHoveredFact('Serum Creatinine: 0.9 mg/dL [Normal]')} onMouseLeave={() => setHoveredFact(null)}>
              <F id="fact_3" className="block w-[calc(100%+12px)]">
                <LabRow name="Serum Creatinine" result="0.9" unit="mg/dL" range="0.7 – 1.3" />
              </F>
            </div>
            <div onMouseEnter={() => setHoveredFact('Total Cholesterol: 185 mg/dL [Optimal]')} onMouseLeave={() => setHoveredFact(null)}>
              <F id="fact_4" className="block w-[calc(100%+12px)]">
                <LabRow name="Total Cholesterol" result="185" unit="mg/dL" range="< 200" />
              </F>
            </div>
            <div onMouseEnter={() => setHoveredFact('ALT (SGPT): 28 U/L [Normal]')} onMouseLeave={() => setHoveredFact(null)}>
              <F id="fact_5" className="block w-[calc(100%+12px)]">
                <LabRow name="ALT (SGPT)" result="28" unit="U/L" range="7 – 56" />
              </F>
            </div>
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
            <div onMouseEnter={() => setHoveredFact('Vitamin B12: 412 pg/mL [Normal]')} onMouseLeave={() => setHoveredFact(null)}>
              <F id="fact_6" className="block w-[calc(100%+12px)]">
                <LabRow name="Vitamin B12 (Cyanocobalamin)" result="412" unit="pg/mL" range="200 – 900" />
              </F>
            </div>
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
  const { setHoveredFact } = useContext(HoverFactCtx)
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
      <div
        className="mt-2 font-hand text-[22px] leading-[1.35] text-blue-900"
        onMouseEnter={() => setHoveredFact('Cursive Doctor Prescription · 2.5x Lens Active')}
      >
        <p className="text-[38px] font-bold leading-none">℞</p>
        <div className="ml-6 mt-4 space-y-6">
          <div
            onMouseEnter={(e) => {
              e.stopPropagation()
              setHoveredFact('Tab. Glycomet-GP 1 (Glimepiride 1mg + Metformin 500mg)')
            }}
            onMouseLeave={() => setHoveredFact(null)}
          >
            <F id="fact_1">
              <span>1) Tab. Glycomet-GP 1</span>
            </F>
            <div
              className="mt-4 pl-8"
              onMouseEnter={(e) => {
                e.stopPropagation()
                setHoveredFact('1 — 0 — 0 before breakfast × 3 months')
              }}
              onMouseLeave={() => setHoveredFact(null)}
            >
              <F id="fact_2">
                <span>1 — 0 — 0 &nbsp;before bkfst × 3 mo</span>
              </F>
            </div>
          </div>
          <div
            onMouseEnter={(e) => {
              e.stopPropagation()
              setHoveredFact('Tab. Telma 40 (Telmisartan 40mg) · 0 — 0 — 1 after dinner')
            }}
            onMouseLeave={() => setHoveredFact(null)}
          >
            <F id="fact_3">
              <span>2) Tab. Telma 40 &nbsp;0 — 0 — 1 after dinner</span>
            </F>
          </div>
          <p className="text-[19px] text-blue-900/80">· Diet control, walk 30 min daily</p>
          <div
            onMouseEnter={(e) => {
              e.stopPropagation()
              setHoveredFact('Advice: Repeat HbA1c lab test after 3 months')
            }}
            onMouseLeave={() => setHoveredFact(null)}
          >
            <F id="fact_4">
              <span>Adv: Repeat HbA1c after 3 months</span>
            </F>
          </div>
        </div>
        <div
          className="mt-8 flex justify-end"
          onMouseEnter={(e) => {
            e.stopPropagation()
            setHoveredFact('Dr. Ramesh Iyer, DM (Endocrinology) — Validated Signature')
          }}
          onMouseLeave={() => setHoveredFact(null)}
        >
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
  const { setHoveredFact } = useContext(HoverFactCtx)
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
            <div
              className="mt-2"
              onMouseEnter={() => setHoveredFact('Diagnosis: Type 2 Diabetes Mellitus — uncontrolled with hyperglycaemia')}
              onMouseLeave={() => setHoveredFact(null)}
            >
              <F id="fact_1">Type 2 Diabetes Mellitus — uncontrolled, with hyperglycaemia</F>
            </div>
          </div>
          <div>
            <p className="font-sans text-[10.5px] font-bold uppercase tracking-wide text-[#7a1f3d]">Investigations</p>
            <div
              className="mt-2 space-y-3"
              onMouseEnter={() => setHoveredFact('HbA1c on admission: 7.6% (Uncontrolled Glycaemia)')}
              onMouseLeave={() => setHoveredFact(null)}
            >
              <F id="fact_2">HbA1c on admission: 7.6 %</F>
              <p>RBS at admission 286 mg/dL; urine ketones negative.</p>
            </div>
          </div>
          <div>
            <p className="font-sans text-[10.5px] font-bold uppercase tracking-wide text-[#7a1f3d]">Condition at discharge</p>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-3">
              <div
                onMouseEnter={() => setHoveredFact('Condition at discharge: SpO₂ 98% on room air')}
                onMouseLeave={() => setHoveredFact(null)}
              >
                <F id="fact_3">SpO₂ 98 % on room air</F>
              </div>
              <div
                onMouseEnter={() => setHoveredFact('Condition at discharge: BP 120/80 mmHg · Pulse 78/min')}
                onMouseLeave={() => setHoveredFact(null)}
              >
                <F id="fact_4">BP 120/80 mmHg</F>
              </div>
              <span>Pulse 78/min</span>
            </div>
          </div>
          <div>
            <p className="font-sans text-[10.5px] font-bold uppercase tracking-wide text-[#7a1f3d]">Discharge medications</p>
            <div
              className="mt-2"
              onMouseEnter={() => setHoveredFact('Discharge Rx: Tab. Metformin 500mg — BD after meals')}
              onMouseLeave={() => setHoveredFact(null)}
            >
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
  const [loupeActive, setLoupeActive] = useState(true)
  const [scannerActive, setScannerActive] = useState(false)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
  const [hoveredFact, setHoveredFact] = useState<string | null>(null)
  const paperRef = useRef<HTMLDivElement>(null)

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

  // Play subtle focus tick when locking onto a handwriting fact
  useEffect(() => {
    if (hoveredFact) {
      playGlassClickSound()
    }
  }, [hoveredFact])

  const triggerLaserScan = () => {
    setScannerActive(true)
    playScanBeamSound()
    setTimeout(() => {
      setScannerActive(false)
    }, 2400)
  }

  const isDemoDoc = ['apollo', 'fortis', 'max'].includes(doc.id) && !isCustom

  return (
    <HoverFactCtx.Provider value={{ hoveredFact, setHoveredFact }}>
      <div className="liquid-glass flex h-full flex-col overflow-hidden rounded-2xl border border-white/80 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/70 bg-white/75 backdrop-blur-md px-3 py-2">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <ScanLine className="size-4 shrink-0 text-teal" aria-hidden />
            <span className="truncate font-mono text-xs text-body">{doc.file}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* 2.5x Loupe Toggle */}
            <button
              type="button"
              onClick={() => setLoupeActive(!loupeActive)}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                loupeActive
                  ? 'bg-teal text-white shadow-xs ring-1 ring-teal'
                  : 'bg-slate-100 text-slate-600 hover:text-heading hover:bg-slate-200'
              }`}
              title="Toggle 2.5x Doctor Handwriting Magnifying Loupe"
            >
              <Search className="size-3.5" />
              <span>2.5x Loupe</span>
            </button>

            {/* Laser Scan Trigger */}
            <button
              type="button"
              disabled={scannerActive}
              onClick={triggerLaserScan}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                scannerActive
                  ? 'bg-cyan-600 text-white animate-pulse'
                  : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200'
              }`}
              title="Sweep Cyan Optical Laser Beam"
            >
              <ScanLine className="size-3.5" />
              <span>{scannerActive ? 'Scanning…' : 'Laser Scan'}</span>
            </button>

            <span className="mx-1 h-5 w-px bg-line" />

            <button
              type="button"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="grid size-7 place-items-center rounded-md text-muted hover:bg-subtle disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="min-w-14 text-center font-mono text-xs text-body">
              {t('evidence.page')} {page}/{doc.pages || 1}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={page >= (doc.pages || 1)}
              onClick={() => setPage((p) => p + 1)}
              className="grid size-7 place-items-center rounded-md text-muted hover:bg-subtle disabled:opacity-30"
            >
              <ChevronRight className="size-4" />
            </button>
            <span className="mx-1 h-5 w-px bg-line" />
            <button
              type="button"
              aria-label={t('evidence.zoomOut')}
              onClick={() => setZoom((z) => Math.max(0.7, +(z - 0.1).toFixed(1)))}
              className="grid size-7 place-items-center rounded-md text-muted hover:bg-subtle"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-10 text-center font-mono text-xs text-body">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              aria-label={t('evidence.zoomIn')}
              onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(1)))}
              className="grid size-7 place-items-center rounded-md text-muted hover:bg-subtle"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-auto p-4 sm:p-8" style={gridBg}>
          <FactCtx.Provider value={{ active: activeFact, nonce, onSelect: onSelectFact }}>
            <div style={{ zoom }} className="mx-auto w-full min-w-[460px] max-w-[620px]">
              <div
                ref={paperRef}
                onMouseMove={(e) => {
                  if (!paperRef.current) return
                  const rect = paperRef.current.getBoundingClientRect()
                  setMousePos({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  })
                }}
                onMouseLeave={() => {
                  setMousePos(null)
                  setHoveredFact(null)
                }}
                className="relative"
              >
                {/* Laser Scan Beam Animation Overlay */}
                {scannerActive && (
                  <motion.div
                    initial={{ top: '0%' }}
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 2.2, ease: 'easeInOut' }}
                    className="pointer-events-none absolute left-0 right-0 z-40 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee,0_0_30px_#0d9488]"
                  >
                    <div className="absolute -top-5 left-4 rounded bg-cyan-950/90 px-2 py-0.5 font-mono text-[9px] font-bold text-cyan-300 border border-cyan-500/60 shadow-md backdrop-blur-sm">
                      CYAN LASER SCANNER · 2400 DPI
                    </div>
                  </motion.div>
                )}

                {/* Main Visible Document Paper / Image */}
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
                      onError={() => {
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
                          onMouseEnter={() => setHoveredFact(`${b.label || b.id} [Verified Fact]`)}
                          onMouseLeave={() => setHoveredFact(null)}
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

                {/* 2.5x Circular Magnifying Loupe on Cursor */}
                {loupeActive && mousePos && (
                  <div
                    style={{ left: mousePos.x, top: mousePos.y }}
                    className="pointer-events-none absolute z-50 size-44 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-teal bg-white shadow-[0_0_30px_rgba(13,148,136,0.6),0_15px_35px_rgba(0,0,0,0.6)] overflow-hidden"
                  >
                    {/* Magnified Cloned Document Content Scaled 2.5x */}
                    <div
                      style={{
                        position: 'absolute',
                        width: paperRef.current?.offsetWidth || 560,
                        left: -mousePos.x * 2.5 + 88,
                        top: -mousePos.y * 2.5 + 88,
                        transform: 'scale(2.5)',
                        transformOrigin: '0 0',
                      }}
                      className="select-none pointer-events-none"
                    >
                      {isDemoDoc ? (
                        <div className="paper -rotate-[0.6deg] rounded-sm p-6 sm:p-8">
                          {doc.id === 'apollo' && <ApolloPage page={page} />}
                          {doc.id === 'fortis' && <FortisPage />}
                          {doc.id === 'max' && <MaxPage page={page} />}
                        </div>
                      ) : (
                        <img
                          src={imageUrl || apiUrl(`/api/documents/${doc.id}/pages/${page}`)}
                          alt=""
                          className="block h-auto w-full select-none"
                        />
                      )}
                    </div>

                    {/* Crosshair & Reticle Optics */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="h-full w-px bg-teal/40" />
                      <div className="absolute w-full h-px bg-teal/40" />
                      <div className="size-10 rounded-full border border-teal/50" />
                      <div className="size-24 rounded-full border border-teal/20 border-dashed" />
                    </div>

                    {/* Lens Top Badge */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 rounded bg-slate-950/90 px-2 py-0.5 font-mono text-[8.5px] font-bold text-teal border border-teal/40 shadow-sm whitespace-nowrap">
                      2.5x OPTICAL CROP
                    </div>
                  </div>
                )}

                {/* Floating Decoded Handwriting / Fact Pill */}
                {loupeActive && mousePos && hoveredFact && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ left: mousePos.x, top: mousePos.y + 102 }}
                    className="pointer-events-none absolute z-50 -translate-x-1/2 rounded-xl bg-slate-950/95 px-3 py-1.5 font-mono text-xs font-semibold text-teal-300 border border-teal/60 shadow-2xl backdrop-blur-md whitespace-nowrap flex items-center gap-2"
                  >
                    <Sparkles className="size-3.5 text-teal shrink-0 animate-pulse" />
                    <span>Decoded OCR: <strong className="text-white">{hoveredFact}</strong></span>
                  </motion.div>
                )}
              </div>
            </div>
          </FactCtx.Provider>
        </div>
      </div>
    </HoverFactCtx.Provider>
  )
}

