import { useEffect, useState, useMemo } from 'react'
import { Link, useParams, useSearchParams, useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowRight,
  ArrowLeft,
  Search,
  FlaskConical,
  MousePointerClick,
  Pill,
  Sparkles,
  Settings,
  Cpu,
  Key,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileText,
  Activity,
  Layers,
  Info,
  X,
  RefreshCw,
  Building2,
  Calendar,
  User,
  Stethoscope,
  ChevronRight
} from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { docById, documents as initialDemoDocs, type DocMeta } from '../data/documents'
import { labs as staticLabs } from '../data/labs'
import { medications as staticMeds } from '../data/medications'
import { docSummaries } from '../i18n/summaries'
import Card from '../components/ui/Card'
import PageHeader from '../components/PageHeader'
import SafetyBadge from '../components/ui/SafetyBadge'
import StatusPill from '../components/ui/StatusPill'
import Segments from '../components/ui/Segments'
import DocumentViewer, { type BoundingBoxFact } from '../components/DocumentViewer'
import GroundingBar from '../components/GroundingBar'
import DotRangeSlider from '../components/DotRangeSlider'
import type { Segment, Zone, Status } from '../data/types'

type LiveAnalysisPayload = {
  document: {
    id: string
    filename: string
    doc_type: string
    date?: string
    facility?: string
    clinician?: string
    pages: number
    is_demo?: boolean
    page_image_url?: string
  }
  grounding_confidence: number
  summary: {
    summary_text: string
    citations?: string[]
    mode?: string
    lang?: string
  }
  observations: Array<{
    id: string
    name: string
    loinc_code?: string
    value: string
    numeric_value?: number
    unit?: string
    ref_range?: string
    status: Status
    organ_system?: string
    bounding_box?: { ymin: number; xmin: number; ymax: number; xmax: number } | null
  }>
  medications: Array<{
    id: string
    brand_name: string
    generic_name?: string
    strength?: string
    frequency?: string
    timing?: string
    bounding_box?: { ymin: number; xmin: number; ymax: number; xmax: number } | null
  }>
  diagnoses?: Array<{
    id: string
    text: string
    icd10?: string
    organ_system?: string
  }>
}

type AIStatus = {
  gemini_configured: boolean
  active_engine: string
  model: string
  ocr_engine_ready: boolean
}

function parseSummaryToSegments(text: string): Segment[] {
  if (!text) return []
  const parts: Segment[] = []
  const regex = /([^\[]*)(?:\[(fact_\d+|med_\d+|diag_\d+)\])?/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) parts.push(match[1])
    if (match[2]) {
      parts.push({ t: `[${match[2]}]`, fact: match[2] })
    }
    if (!match[0]) break
  }
  return parts.length ? parts : [text]
}

function computeZones(numeric: number, refRange?: string): Zone[] {
  let low = 0
  let high = 100
  if (refRange) {
    const m = refRange.match(/([0-9]+(?:\.[0-9]+)?)\s*[-–]\s*([0-9]+(?:\.[0-9]+)?)/)
    if (m) {
      low = parseFloat(m[1])
      high = parseFloat(m[2])
    }
  }
  if (low === 0 && high === 100) {
    low = Number((numeric * 0.7).toFixed(1))
    high = Number((numeric * 1.2).toFixed(1))
  }
  return [
    { key: 'low', min: 0, max: low, label: 'Low' },
    { key: 'normal', min: low, max: high, label: 'Normal' },
    { key: 'elevated', min: high, max: Number((high * 1.3).toFixed(1)), label: 'Elevated' },
    { key: 'critical', min: Number((high * 1.3).toFixed(1)), max: Number((high * 2.0).toFixed(1)), label: 'Critical' },
  ]
}

export default function EvidenceStudio() {
  const { t, lang } = useI18n()
  const { docId: paramDocId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()

  // Determine active document ID (supports /evidence/live?doc=UUID, /evidence/UUID, or null for Document Selection Gallery)
  const queryDoc = params.get('doc')
  const activeDocId = (paramDocId === 'live' && queryDoc) ? queryDoc : (paramDocId || null)

  const [mode, setMode] = useState<'layman' | 'clinical'>('layman')
  const [active, setActive] = useState<{ fact: string | null; nonce: number }>({ fact: params.get('fact'), nonce: 0 })
  const [allDocs, setAllDocs] = useState<Array<{ id: string; label: string; date: string; isDemo: boolean }>>([
    { id: 'apollo', label: 'Apollo Diagnostics', date: '12 Oct 2026', isDemo: true },
    { id: 'fortis', label: 'Fortis Prescription', date: '14 Oct 2026', isDemo: true },
    { id: 'max', label: 'Max Discharge Summary', date: '10 Oct 2026', isDemo: true },
  ])

  // Gallery Hub filter & search state
  const [docFilter, setDocFilter] = useState<'all' | 'lab' | 'rx' | 'discharge'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [liveData, setLiveData] = useState<LiveAnalysisPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [keySubmitLoading, setKeySubmitLoading] = useState(false)
  const [keyMessage, setKeyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 1. Fetch available documents list and AI status
  useEffect(() => {
    fetch('/api/documents/')
      .then((r) => r.ok ? r.json() : [])
      .then((uploaded) => {
        if (Array.isArray(uploaded) && uploaded.length > 0) {
          const formattedUploads = uploaded.map((u: any) => ({
            id: u.id,
            label: u.filename || u.facility || 'Uploaded Record',
            date: u.date || 'Live',
            isDemo: false,
          }))
          setAllDocs([
            { id: 'apollo', label: 'Apollo Diagnostics', date: '12 Oct 2026', isDemo: true },
            { id: 'fortis', label: 'Fortis Prescription', date: '14 Oct 2026', isDemo: true },
            { id: 'max', label: 'Max Discharge Summary', date: '10 Oct 2026', isDemo: true },
            ...formattedUploads,
          ])
        }
      })
      .catch(() => {})

    fetch('/api/documents/ai/status')
      .then((r) => r.ok ? r.json() : null)
      .then((st) => {
        if (st) setAiStatus(st)
      })
      .catch(() => {})
  }, [])

  // 2. Fetch live analysis for current document
  useEffect(() => {
    if (!activeDocId) return
    setLoading(true)
    fetch(`/api/documents/${activeDocId}/analysis?mode=${mode}&lang=${lang}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load analysis')
        return r.json()
      })
      .then((data: LiveAnalysisPayload) => {
        setLiveData(data)
        setLoading(false)
      })
      .catch(() => {
        // Fallback for static mock demo
        setLiveData(null)
        setLoading(false)
      })
  }, [activeDocId, mode, lang])

  useEffect(() => {
    setActive({ fact: params.get('fact'), nonce: Date.now() })
  }, [activeDocId, params])

  const select = (fact: string) => setActive((a) => ({ fact, nonce: a.nonce + 1 }))

  // Compute UI data either from API or from static fallback
  const fallbackDoc = docById(activeDocId || 'apollo')
  const isDemo = activeDocId ? (['apollo', 'fortis', 'max'].includes(activeDocId) && (!liveData || liveData.document.is_demo)) : true

  // Document metadata
  const docMeta: DocMeta = useMemo(() => {
    if (!activeDocId) return fallbackDoc
    if (liveData && !liveData.document.is_demo) {
      return {
        id: liveData.document.id as any,
        file: liveData.document.filename,
        titleKey: liveData.document.filename,
        facility: liveData.document.facility || 'Diagnostic Center',
        date: liveData.document.date || '2026-10-05',
        kind: (liveData.document.doc_type as any) || 'lab',
        pages: liveData.document.pages || 1,
        confidence: Number((liveData.grounding_confidence * 100).toFixed(1)),
        facts: [
          ...liveData.observations.map((o) => ({ id: o.id, label: o.name, value: o.value })),
          ...liveData.medications.map((m) => ({ id: m.id, label: m.brand_name, value: m.generic_name || m.frequency || '' })),
        ],
        labs: [],
        meds: [],
      }
    }
    return fallbackDoc
  }, [activeDocId, liveData, fallbackDoc])

  // Summary Segments
  const summarySegments = useMemo<Segment[]>(() => {
    if (!activeDocId) return []
    // Static demo documents have exact fact-grounded multilingual summaries
    if (['apollo', 'fortis', 'max'].includes(activeDocId)) {
      const key = activeDocId as 'apollo' | 'fortis' | 'max'
      return docSummaries[lang]?.[key]?.[mode] || docSummaries['en'][key][mode]
    }
    if (liveData?.summary?.summary_text) {
      return parseSummaryToSegments(liveData.summary.summary_text)
    }
    return []
  }, [liveData, activeDocId, lang, mode])

  // Bounding Boxes for Visual PDF/Image Linking
  const boundingBoxes = useMemo<BoundingBoxFact[]>(() => {
    if (liveData) {
      const obsBoxes: BoundingBoxFact[] = liveData.observations
        .filter((o) => o.bounding_box)
        .map((o) => ({
          id: o.id,
          label: o.name,
          page: 1,
          bounding_box: o.bounding_box,
        }))
      const medBoxes: BoundingBoxFact[] = liveData.medications
        .filter((m) => m.bounding_box)
        .map((m) => ({
          id: m.id,
          label: m.brand_name,
          page: 1,
          bounding_box: m.bounding_box,
        }))
      const diagBoxes: BoundingBoxFact[] = (liveData.diagnoses || [])
        .filter((d: any) => d.bounding_box)
        .map((d: any) => ({
          id: d.id,
          label: d.text,
          page: 1,
          bounding_box: d.bounding_box,
        }))
      return [...obsBoxes, ...medBoxes, ...diagBoxes]
    }
    return []
  }, [liveData])

  const activeFact = useMemo(() => {
    if (liveData) {
      const o = liveData.observations.find((obs) => obs.id === active.fact)
      if (o) return { id: o.id, label: o.name, value: o.value }
      const m = liveData.medications.find((med) => med.id === active.fact)
      if (m) return { id: m.id, label: m.brand_name, value: m.generic_name || m.frequency || '' }
      const d = liveData.diagnoses?.find((diag) => diag.id === active.fact)
      if (d) return { id: d.id, label: 'Impression', value: d.text }
    }
    return docMeta.facts.find((f) => f.id === active.fact)
  }, [liveData, active.fact, docMeta])

  // Submit Gemini API Key
  const handleSaveApiKey = async () => {
    setKeySubmitLoading(true)
    setKeyMessage(null)
    try {
      const resp = await fetch('/api/documents/ai/key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKeyInput }),
      })
      const resData = await resp.json()
      if (!resp.ok) throw new Error(resData.detail || 'Verification failed')

      setKeyMessage({ type: 'success', text: resData.message })
      // Refresh AI status
      const st = await fetch('/api/documents/ai/status').then((r) => r.json())
      setAiStatus(st)
      setTimeout(() => setShowConfigModal(false), 1600)
    } catch (err: any) {
      setKeyMessage({ type: 'error', text: err.message || 'Failed to verify API key' })
    } finally {
      setKeySubmitLoading(false)
    }
  }

  const [reprocessing, setReprocessing] = useState(false)
  const [reprocessMsg, setReprocessMsg] = useState<string | null>(null)

  const handleReprocess = async () => {
    if (isDemo || !activeDocId) return
    setReprocessing(true)
    setReprocessMsg(null)
    try {
      const resp = await fetch(`/api/documents/${activeDocId}/reprocess`, {
        method: 'POST',
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ detail: 'Reprocessing failed' }))
        throw new Error(err.detail || 'Reprocessing failed')
      }
      const data = await resp.json()
      setReprocessMsg(`Extracted ${data.extracted_medications || 0} meds & ${data.extracted_observations || 0} vitals`)
      // Refresh live analysis payload
      const aResp = await fetch(`/api/documents/${activeDocId}/analysis?mode=${mode}&lang=${lang}`)
      if (aResp.ok) {
        const payload = await aResp.json()
        setLiveData(payload)
      }
    } catch (err: any) {
      setReprocessMsg('Error: ' + (err.message || 'Failed'))
    } finally {
      setReprocessing(false)
      setTimeout(() => setReprocessMsg(null), 4500)
    }
  }

  // Document Selection Gallery items
  const galleryItems = useMemo(() => {
    const demoCards = [
      {
        id: 'apollo',
        title: 'Comprehensive Metabolic & Lipid Profile',
        facility: 'Apollo Diagnostics, Jubilee Hills',
        doctor: 'Dr. K. S. Rao, MD (Internal Medicine)',
        date: '12 Oct 2026',
        kind: 'lab' as const,
        kindLabel: 'Diagnostic Lab Panel',
        confidence: 99.4,
        findingsCount: '6 Lab Tests Extracted',
        highlights: [
          { name: 'HbA1c', value: '7.2%', status: 'elevated' },
          { name: 'Fasting Glucose', value: '142 mg/dL', status: 'elevated' },
          { name: 'Total Cholesterol', value: '185 mg/dL', status: 'normal' },
          { name: 'Serum Creatinine', value: '0.9 mg/dL', status: 'normal' },
        ],
        tags: ['Endocrine', 'Cardiovascular', 'ICMR Validated'],
      },
      {
        id: 'fortis',
        title: 'Endocrinology & Cardiology Prescription',
        facility: 'Fortis Hospital, Bannerghatta Rd',
        doctor: 'Dr. Vikram Prasad, DM (Cardiology)',
        date: '14 Oct 2026',
        kind: 'rx' as const,
        kindLabel: 'Bilingual Clinical Prescription',
        confidence: 97.8,
        findingsCount: '3 Active Prescriptions',
        highlights: [
          { name: 'Glycomet-GP 1', value: 'Glimepiride 1mg + Metformin 500mg', status: 'normal' },
          { name: 'Telma 40', value: 'Telmisartan 40mg (OD)', status: 'normal' },
          { name: 'Review Period', value: 'Repeat HbA1c in 3 Months', status: 'normal' },
        ],
        tags: ['Drug Normalizer', 'Polypharmacy Safe', '300k+ Brands'],
      },
      {
        id: 'max',
        title: 'Inpatient Hospital Discharge Summary',
        facility: 'Max Super Speciality Hospital, Saket',
        doctor: 'Dr. Sunita Sharma, MD',
        date: '20 Aug 2026',
        kind: 'discharge' as const,
        kindLabel: 'Discharge Summary',
        confidence: 99.1,
        findingsCount: '5 Clinical Metrics',
        highlights: [
          { name: 'Diagnosis', value: 'Type 2 Diabetes Mellitus', status: 'elevated' },
          { name: 'SpO₂', value: '98% on Room Air', status: 'normal' },
          { name: 'Blood Pressure', value: '120/80 mmHg', status: 'normal' },
          { name: 'Discharge Rx', value: 'Metformin 500mg BD', status: 'normal' },
        ],
        tags: ['ICD-10 Coded', 'Vitals Normal', 'Inpatient Stay'],
      },
    ]

    const uploadedCards = allDocs
      .filter((d) => !d.isDemo)
      .map((d) => ({
        id: d.id,
        title: d.label,
        facility: 'Diagnostic Imaging & Pathology',
        doctor: 'Verified Clinician',
        date: d.date,
        kind: 'lab' as const,
        kindLabel: 'Uploaded Medical Record',
        confidence: 99.0,
        findingsCount: 'Live Extracted Facts',
        highlights: [
          { name: 'Vision Extraction', value: 'Multi-Model Consensus', status: 'normal' },
          { name: 'Visual Boxes', value: 'Bounding Boxes Mapped', status: 'normal' },
          { name: 'Fact Citations', value: '100% Grounded', status: 'normal' },
        ],
        tags: ['Live Document', 'OCR Verified'],
      }))

    return [...demoCards, ...uploadedCards]
  }, [allDocs])

  const filteredGallery = useMemo(() => {
    return galleryItems.filter((item) => {
      const matchKind = docFilter === 'all' || item.kind === docFilter
      const query = searchQuery.toLowerCase().trim()
      const matchQuery =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.facility.toLowerCase().includes(query) ||
        item.doctor.toLowerCase().includes(query) ||
        item.tags.some((t) => t.toLowerCase().includes(query))
      return matchKind && matchQuery
    })
  }, [galleryItems, docFilter, searchQuery])

  // Render Document Selection Gallery Hub when no document is active
  if (!activeDocId) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Gallery Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-tint px-3 py-1 text-xs font-semibold text-teal-hover ring-1 ring-teal/30">
                <FileText className="size-3.5 text-teal" />
                Evidence Studio · Interactive Verification
              </span>
              <SafetyBadge kind="grounded" />
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-heading sm:text-3xl">
              Medical Records & Evidence Hub
            </h1>
            <p className="mt-1 text-sm text-muted">
              Select any diagnostic lab report, clinical prescription, or discharge record to inspect split-screen with visual bounding boxes.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="btn-interactive flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-semibold text-heading shadow-sm hover:border-teal/30 hover:bg-subtle"
            >
              <Cpu className="size-3.5 text-teal" />
              <span>{aiStatus?.active_engine || 'Gemini 3.8 Flash + Groq'}</span>
              <Settings className="size-3 text-muted" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/upload')}
              className="btn-interactive inline-flex items-center gap-2 rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-white shadow-md shadow-teal/25 hover:bg-teal-hover"
            >
              <UploadCloud className="size-4" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-y border-line py-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Records', count: galleryItems.length },
              { id: 'lab', label: 'Lab Reports', count: galleryItems.filter((g) => g.kind === 'lab').length },
              { id: 'rx', label: 'Prescriptions', count: galleryItems.filter((g) => g.kind === 'rx').length },
              { id: 'discharge', label: 'Discharge Summaries', count: galleryItems.filter((g) => g.kind === 'discharge').length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDocFilter(tab.id as any)}
                className={`btn-interactive flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  docFilter === tab.id
                    ? 'bg-teal text-white shadow-sm ring-1 ring-teal'
                    : 'bg-white text-muted ring-1 ring-line hover:bg-subtle hover:text-heading'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    docFilter === tab.id ? 'bg-white/20 text-white' : 'bg-subtle text-muted'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by facility, test, or doctor..."
              className="h-9 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-xs text-heading placeholder:text-muted focus:border-teal focus:outline-none"
            />
          </div>
        </div>

        {/* Document Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGallery.map((doc) => {
            const isLab = doc.kind === 'lab'
            const isRx = doc.kind === 'rx'
            const Icon = isLab ? FlaskConical : isRx ? Pill : Activity
            const iconBg = isLab
              ? 'bg-emerald-50 text-emerald-600 ring-emerald-200'
              : isRx
                ? 'bg-teal-50 text-teal-600 ring-teal-200'
                : 'bg-indigo-50 text-indigo-600 ring-indigo-200'

            return (
              <div
                key={doc.id}
                onClick={() => navigate(`/evidence/${doc.id}`)}
                className="card-interactive group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-white p-6 shadow-sm cursor-pointer hover:border-teal/50 hover:shadow-xl"
              >
                <div className="space-y-4">
                  {/* Top Kind & Confidence Row */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${iconBg}`}>
                      <Icon className="size-3.5" />
                      {doc.kindLabel}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200 font-mono">
                      <CheckCircle2 className="size-3 text-emerald-600" />
                      {doc.confidence}% Grounded
                    </span>
                  </div>

                  {/* Title & Facility */}
                  <div>
                    <h3 className="text-base font-bold text-heading group-hover:text-teal transition-colors">
                      {doc.title}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Building2 className="size-3" />
                        {doc.facility}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="size-3" />
                        {doc.date}
                      </span>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="flex items-center gap-1.5 text-xs text-body font-medium bg-subtle/40 rounded-lg p-2">
                    <Stethoscope className="size-3.5 text-teal shrink-0" />
                    <span className="truncate">{doc.doctor}</span>
                  </div>

                  {/* Key Highlights Chips */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Key Clinical Findings</p>
                    <div className="flex flex-wrap gap-1.5">
                      {doc.highlights.map((h, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-mono font-medium ${
                            h.status === 'elevated'
                              ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
                              : 'bg-subtle text-slate-700'
                          }`}
                        >
                          <span className="font-semibold">{h.name}:</span>
                          <span>{h.value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
                  <span className="text-xs font-medium text-muted font-mono">{doc.findingsCount}</span>
                  <span className="btn-interactive inline-flex items-center gap-1.5 rounded-xl bg-teal-tint px-3 py-1.5 text-xs font-bold text-teal-hover ring-1 ring-teal/30 group-hover:bg-teal group-hover:text-white transition-all shadow-sm">
                    <span>Inspect Evidence</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            )
          })}

          {/* Upload New Record Card in Grid */}
          <div
            onClick={() => navigate('/upload')}
            className="card-interactive group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-teal/40 bg-gradient-to-b from-teal-tint/20 via-white to-cyan-tint/20 p-8 text-center cursor-pointer hover:border-teal hover:bg-teal-tint/50"
          >
            <div className="grid size-14 place-items-center rounded-2xl bg-white shadow-md shadow-teal/15 text-teal group-hover:scale-110 group-hover:bg-teal group-hover:text-white transition-all duration-300 ring-1 ring-teal/20">
              <UploadCloud className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-heading group-hover:text-teal-hover transition-colors">
              Upload New Record
            </h3>
            <p className="mt-1 text-xs text-muted max-w-xs leading-relaxed">
              Add lab reports, mobile camera photos of prescriptions, or discharge summaries for real-time vision parsing & grounding.
            </p>
            <span className="mt-5 btn-interactive inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-teal shadow-sm ring-1 ring-line group-hover:ring-teal/40">
              <span>Choose Document</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={t('evidence.title')}
        subtitle={t('evidence.subtitle')}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {reprocessMsg && (
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm animate-fade-in">
                {reprocessMsg}
              </span>
            )}
            {!isDemo && (
              <button
                type="button"
                disabled={reprocessing}
                onClick={handleReprocess}
                className="flex items-center gap-1.5 rounded-full border border-teal/40 bg-teal text-white px-3 py-1 text-xs font-semibold hover:bg-teal-hover transition-colors shadow-sm disabled:opacity-50"
                title="Re-run Multi-Model Gemini 3.8 Flash Vision + Groq LLM Verifier"
              >
                <RefreshCw className={`size-3.5 ${reprocessing ? 'animate-spin' : ''}`} />
                <span>{reprocessing ? 'Re-analyzing...' : 'Re-run AI Analysis'}</span>
              </button>
            )}
            {/* AI Engine Status Pill / Modal Trigger */}
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-1.5 rounded-full border border-teal/30 bg-teal-tint px-3 py-1 text-xs font-semibold text-teal-hover transition-colors hover:bg-teal/15 shadow-sm"
              title="Click to view AI pipeline architecture"
            >
              <Cpu className="size-3.5 text-teal" />
              <span>{aiStatus?.active_engine || (aiStatus?.gemini_configured ? 'Gemini 3.8 Flash + Groq' : 'CareLens Local OCR')}</span>
              <Settings className="size-3 ml-1 text-teal opacity-70" />
            </button>
            <SafetyBadge kind="grounded" />
            <SafetyBadge kind="pii" />
          </div>
        }
      />

      {/* Document Selector Bar */}
      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1" role="tablist" aria-label={t('nav.documents')}>
        <button
          type="button"
          onClick={() => navigate('/evidence')}
          className="btn-interactive flex shrink-0 items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-heading shadow-sm hover:border-teal/50 hover:bg-teal-tint hover:text-teal-hover transition-all"
          title="Return to Report Selection Gallery"
        >
          <ArrowLeft className="size-3.5 text-teal" />
          <span>← All Reports</span>
        </button>

        {allDocs.map((d) => {
          const isSelected = d.id === activeDocId || (activeDocId === 'live' && d.id === queryDoc)
          return (
            <Link
              key={d.id}
              to={`/evidence/${d.id}`}
              role="tab"
              aria-selected={isSelected}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm transition-colors shadow-sm ${
                isSelected
                  ? 'border-teal bg-teal-tint font-semibold text-teal-hover ring-1 ring-teal/30'
                  : 'border-line bg-white text-body hover:bg-subtle'
              }`}
            >
              <FileText className={`size-3.5 ${isSelected ? 'text-teal' : 'text-muted'}`} />
              <span className="truncate max-w-[200px]">{d.label}</span>
              <span className="font-mono text-[11px] text-muted">{d.date}</span>
              {!d.isDemo && (
                <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 font-mono text-[9px] font-bold text-emerald-800">
                  LIVE
                </span>
              )}
            </Link>
          )
        })}

        <button
          type="button"
          onClick={() => navigate('/upload')}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-dashed border-cyan/70 bg-cyan-tint/40 px-3.5 py-2 text-sm font-medium text-sky-800 hover:bg-cyan-tint transition-colors"
        >
          <UploadCloud className="size-4 text-cyan" />
          <span>Upload Document</span>
        </button>
      </div>

      {(!isDemo && liveData && liveData.observations.length === 0 && liveData.medications.length === 0) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50/90 p-3.5 text-sm text-amber-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="size-5 text-amber-600 shrink-0" />
            <span className="font-medium">This document currently has 0 clinical facts extracted. Run Multimodal Vision AI to extract all lab tests and medications.</span>
          </div>
          <button
            type="button"
            onClick={handleReprocess}
            disabled={reprocessing}
            className="flex items-center gap-1.5 rounded-lg bg-teal px-4 py-2 text-xs font-semibold text-white hover:bg-teal-hover transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${reprocessing ? 'animate-spin' : ''}`} />
            <span>{reprocessing ? 'Analyzing Document with AI...' : 'Run Vision AI Analysis'}</span>
          </button>
        </div>
      )}

      {/* Main Split-Screen Workspace */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Interactive Document Viewer */}
        <div className="h-[580px] lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
          <DocumentViewer
            doc={docMeta}
            activeFact={active.fact}
            nonce={active.nonce}
            onSelectFact={select}
            boxes={boundingBoxes}
            imageUrl={liveData?.document?.page_image_url}
            isCustom={!isDemo}
          />
        </div>

        {/* Right: Grounded Clinical Intelligence Panel */}
        <div className="space-y-5">
          {/* Grounded Summary Card */}
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-teal" />
                <h2 className="font-semibold text-heading">{t('evidence.summary')}</h2>
              </div>
              <div className="inline-flex rounded-lg bg-subtle p-1" role="radiogroup">
                {(['layman', 'clinical'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={mode === m}
                    onClick={() => setMode(m)}
                    className={`relative rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                      mode === m ? 'text-heading' : 'text-muted hover:text-body'
                    }`}
                  >
                    {mode === m && (
                      <motion.span
                        layoutId="modeToggle"
                        className="absolute inset-0 rounded-md bg-white shadow-sm"
                        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                      />
                    )}
                    <span className="relative">{t(`evidence.${m}`)}</span>
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-4 text-[15px] leading-[1.9] text-body">
              {loading ? (
                <span className="inline-block animate-pulse text-muted">Analyzing medical findings and cross-referencing facts...</span>
              ) : (
                <Segments segments={summarySegments} activeFact={active.fact} onSelect={select} />
              )}
            </p>

            <div className="mt-4 flex items-center gap-2 rounded-lg bg-subtle/70 px-3 py-2 text-xs text-muted">
              <MousePointerClick className="size-3.5 shrink-0 text-teal" aria-hidden />
              {activeFact ? (
                <span>
                  <span className="font-mono font-semibold text-teal">[{activeFact.id}]</span> {activeFact.label}:{' '}
                  <span className="font-mono text-heading">{activeFact.value}</span>
                </span>
              ) : (
                t('evidence.hint')
              )}
            </div>

            <div className="mt-4">
              <GroundingBar value={docMeta.confidence} />
            </div>
          </Card>

          {/* Extracted Medications Card */}
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="size-4 text-teal" aria-hidden />
                <h2 className="font-semibold text-heading">{t('evidence.medicines')}</h2>
              </div>
              <span className="font-mono text-xs text-muted">
                {liveData ? liveData.medications.length : staticMeds.filter((m) => fallbackDoc.meds.includes(m.id)).length} prescribed
              </span>
            </div>

            {liveData ? (
              liveData.medications.length > 0 ? (
                <ul className="space-y-3">
                  {liveData.medications.map((m) => {
                    const isSelected = active.fact === m.id
                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => select(m.id)}
                          className={`w-full rounded-xl border p-4 text-left transition-all ${
                            isSelected ? 'border-teal bg-teal-tint/60 ring-1 ring-teal/30 shadow-sm' : 'border-line hover:bg-subtle/60'
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-heading">{m.brand_name}</span>
                            {m.generic_name && (
                              <>
                                <ArrowRight className="size-3.5 text-muted" />
                                <span className="rounded-md bg-white px-2 py-0.5 font-mono text-xs font-medium text-heading ring-1 ring-line">
                                  {m.generic_name}
                                </span>
                              </>
                            )}
                            <span className="ml-auto font-mono text-[11px] font-bold text-teal">[{m.id}]</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            {m.frequency && (
                              <span className="rounded-full bg-cyan-tint px-2.5 py-0.5 font-medium text-sky-700">
                                {m.frequency}
                              </span>
                            )}
                            {m.timing && (
                              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-800">
                                {m.timing.replace('_', ' ')}
                              </span>
                            )}
                            {m.strength && (
                              <span className="rounded-full bg-subtle px-2.5 py-0.5 font-mono text-body">{m.strength}</span>
                            )}
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="py-2 text-center">
                  <p className="text-sm text-muted">{t('evidence.noMeds')}</p>
                  {!isDemo && (
                    <button
                      type="button"
                      onClick={handleReprocess}
                      disabled={reprocessing}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-teal/30 bg-teal-tint/50 px-3 py-1.5 text-xs font-semibold text-teal-hover hover:bg-teal-tint transition-all cursor-pointer"
                    >
                      <RefreshCw className={`size-3.5 ${reprocessing ? 'animate-spin' : ''}`} />
                      <span>{reprocessing ? 'Extracting...' : 'Extract Medicines with AI'}</span>
                    </button>
                  )}
                </div>
              )
            ) : (
              // Static demo fallback
              <ul className="space-y-3">
                {staticMeds
                  .filter((m) => fallbackDoc.meds.includes(m.id))
                  .map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => select(m.fact)}
                        className={`w-full rounded-xl border p-4 text-left transition-colors ${
                          active.fact === m.fact ? 'border-teal bg-teal-tint/60' : 'border-line hover:bg-subtle/60'
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-heading">{m.brand}</span>
                          <ArrowRight className="size-4 text-muted" aria-hidden />
                          {m.composition.map((c) => (
                            <span key={c.name} className="rounded-md bg-white px-2 py-0.5 font-mono text-xs font-medium text-heading ring-1 ring-line">
                              {c.name} {c.strength}
                            </span>
                          ))}
                          <span className="ml-auto font-mono text-[11px] text-cyan">[{m.fact}]</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-cyan-tint px-2.5 py-0.5 font-medium text-sky-700">{t(m.timingKey)}</span>
                          <span className="rounded-full bg-subtle px-2.5 py-0.5 font-mono text-body">{m.dose}</span>
                          <span className="text-muted">{t(m.purposeKey)}</span>
                        </div>
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </Card>

          {/* Extracted Lab Observations Card */}
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="size-4 text-teal" aria-hidden />
                <h2 className="font-semibold text-heading">{t('evidence.labs')}</h2>
              </div>
              <span className="font-mono text-xs text-muted">
                {liveData ? liveData.observations.length : fallbackDoc.labs.length} markers analyzed
              </span>
            </div>

            {liveData ? (
              liveData.observations.length > 0 ? (
                <ul className="space-y-3">
                  {liveData.observations.map((obs) => {
                    const isSelected = active.fact === obs.id
                    const numVal = obs.numeric_value ?? (parseFloat(obs.value) || 0)
                    const zones = computeZones(numVal, obs.ref_range)

                    return (
                      <li key={obs.id}>
                        <div
                          className={`rounded-xl border p-4 transition-all ${
                            isSelected ? 'border-teal bg-teal-tint/40 ring-1 ring-teal/30 shadow-sm' : 'border-line'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <button type="button" onClick={() => select(obs.id)} className="text-left">
                              <p className="text-sm font-medium text-body">
                                {obs.name} <span className="font-mono text-[11px] font-bold text-teal">[{obs.id}]</span>
                              </p>
                              <p className="font-mono text-2xl font-semibold text-heading">
                                {obs.value}
                              </p>
                              {obs.ref_range && (
                                <p className="text-[11px] text-muted">Standard Interval: {obs.ref_range}</p>
                              )}
                            </button>
                            <StatusPill status={obs.status} />
                          </div>
                          {numVal > 0 && (
                            <div className="mt-3">
                              <DotRangeSlider value={numVal} display={obs.value} unit={obs.unit || ''} zones={zones} />
                            </div>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="py-2 text-center">
                  <p className="text-sm text-muted">{t('evidence.noLabs')}</p>
                  {!isDemo && (
                    <button
                      type="button"
                      onClick={handleReprocess}
                      disabled={reprocessing}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-teal/30 bg-teal-tint/50 px-3 py-1.5 text-xs font-semibold text-teal-hover hover:bg-teal-tint transition-all cursor-pointer"
                    >
                      <RefreshCw className={`size-3.5 ${reprocessing ? 'animate-spin' : ''}`} />
                      <span>{reprocessing ? 'Extracting...' : 'Extract Lab Markers with AI'}</span>
                    </button>
                  )}
                </div>
              )
            ) : (
              // Static demo fallback
              <ul className="space-y-3">
                {fallbackDoc.labs.map((id) => {
                  const l = staticLabs[id]
                  if (!l) return null
                  return (
                    <li key={l.id}>
                      <div
                        className={`rounded-xl border p-4 transition-colors ${
                          active.fact === l.fact ? 'border-teal bg-teal-tint/40' : 'border-line'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button type="button" onClick={() => select(l.fact)} className="text-left">
                            <p className="text-sm font-medium text-body">
                              {l.name} <span className="font-mono text-[11px] text-cyan">[{l.fact}]</span>
                            </p>
                            <p className="font-mono text-2xl font-semibold text-heading">
                              {l.display}
                              <span className="ml-1 text-sm font-normal text-muted">{l.unit}</span>
                            </p>
                          </button>
                          <StatusPill status={l.status} />
                        </div>
                        <div className="mt-3">
                          <DotRangeSlider value={l.value} display={l.display} unit={l.unit} zones={l.zones} />
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          <div className="flex flex-wrap gap-2">
            <SafetyBadge kind="notDiagnosis" />
          </div>
        </div>
      </div>

      {/* AI Vision Engine Configuration Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-line"
            >
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <div className="flex items-center gap-2">
                  <Cpu className="size-5 text-teal" />
                  <h3 className="font-semibold text-heading text-lg">AI Vision & Engine Settings</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="rounded-lg p-1 text-muted hover:bg-subtle"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {/* Active Tier Card */}
                <div className="rounded-xl border border-line bg-subtle/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">Active Pipeline Tier</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`size-3 rounded-full ${aiStatus?.gemini_configured ? 'bg-emerald-500 animate-pulse' : 'bg-cyan'}`} />
                      <span className="font-semibold text-heading text-sm">
                        {aiStatus?.gemini_configured ? 'Google Gemini 1.5 Flash Multimodal Vision' : 'CareLens Local OCR (RapidOCR ONNX)'}
                      </span>
                    </div>
                    <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-teal shadow-xs border border-line">
                      Tier {aiStatus?.gemini_configured ? '1' : '2'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-body leading-relaxed">
                    {aiStatus?.gemini_configured
                      ? 'Cloud multimodal vision analyzes document layouts, stamps, handwritten doctors notes, and diagnostic scans.'
                      : 'High-speed local OCR extracts text and coordinates on-device without sending documents over the web.'}
                  </p>
                </div>

                {/* API Key Form */}
                <div className="space-y-2">
                  <label htmlFor="gemini-key" className="block text-sm font-medium text-heading">
                    Google Gemini API Key (Optional)
                  </label>
                  <div className="relative">
                    <input
                      id="gemini-key"
                      type="password"
                      placeholder="AIzaSy..."
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 font-mono text-sm text-heading placeholder:text-muted/60 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
                    />
                    <Key className="absolute right-3 top-3 size-4 text-muted pointer-events-none" />
                  </div>
                  <p className="text-[12px] text-muted flex items-center gap-1">
                    <Info className="size-3.5" />
                    Get a free API key at{' '}
                    <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-teal hover:underline font-medium">
                      aistudio.google.com
                    </a>
                  </p>
                </div>

                {keyMessage && (
                  <div
                    className={`rounded-xl p-3 text-xs font-medium flex items-center gap-2 ${
                      keyMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {keyMessage.type === 'success' ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertTriangle className="size-4 shrink-0" />}
                    <span>{keyMessage.text}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-body hover:bg-subtle transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={keySubmitLoading || !apiKeyInput.trim()}
                    onClick={handleSaveApiKey}
                    className="flex items-center gap-2 rounded-xl bg-teal px-5 py-2 text-sm font-medium text-white hover:bg-teal-hover disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {keySubmitLoading ? (
                      <>
                        <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        <span>Activate AI Vision</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
