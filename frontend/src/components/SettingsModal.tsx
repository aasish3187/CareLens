import { useState, useEffect } from 'react'
import {
  X,
  Settings,
  Languages,
  ShieldAlert,
  Cpu,
  Database,
  CheckCircle2,
  Moon,
  Sun,
  Lock,
  RefreshCw,
  FileCheck,
  Activity,
  AlertTriangle,
} from 'lucide-react'
import { useI18n, languages, type Lang } from '../i18n/I18nContext'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: Props) {
  const { lang, setLang } = useI18n()

  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'privacy' | 'storage'>('general')
  const [ocrEngine, setOcrEngine] = useState<string>(() => {
    return localStorage.getItem('carelens_setting_ocr_engine') || 'multi_model'
  })
  const [redactPii, setRedactPii] = useState<boolean>(() => {
    return localStorage.getItem('carelens_setting_redact_pii') !== 'false'
  })
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('carelens_setting_theme') === 'dark'
  })
  const [strictValidation, setStrictValidation] = useState<boolean>(() => {
    return localStorage.getItem('carelens_setting_strict_rules') !== 'false'
  })
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(() => {
    const val = localStorage.getItem('carelens_setting_confidence')
    return val ? parseFloat(val) : 0.85
  })
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [backendStatus, setBackendStatus] = useState<'idle' | 'checking' | 'online' | 'offline'>('idle')

  useEffect(() => {
    if (isOpen) {
      checkBackendHealth()
    }
  }, [isOpen])

  const checkBackendHealth = async () => {
    setBackendStatus('checking')
    try {
      const res = await fetch('/api/health')
      if (res.ok) {
        setBackendStatus('online')
      } else {
        setBackendStatus('offline')
      }
    } catch {
      setBackendStatus('offline')
    }
  }

  const handleSave = () => {
    localStorage.setItem('carelens_setting_ocr_engine', ocrEngine)
    localStorage.setItem('carelens_setting_redact_pii', String(redactPii))
    localStorage.setItem('carelens_setting_theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('carelens_setting_strict_rules', String(strictValidation))
    localStorage.setItem('carelens_setting_confidence', String(confidenceThreshold))

    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    window.dispatchEvent(
      new CustomEvent('carelens_settings_updated', {
        detail: { ocrEngine, redactPii, darkMode, strictValidation, confidenceThreshold },
      }),
    )

    setSavedMessage('Settings successfully saved and applied!')
    setTimeout(() => setSavedMessage(null), 2500)
  }

  const handleResetDemoData = () => {
    if (confirm('Reset demo data and patient profiles back to system defaults?')) {
      localStorage.removeItem('carelens_patient_profiles')
      localStorage.removeItem('carelens_active_patient_id')
      window.dispatchEvent(new CustomEvent('carelens_patient_updated', { detail: null }))
      setSavedMessage('Default demo profiles and documents restored!')
      setTimeout(() => setSavedMessage(null), 2500)
    }
  }

  const handleClearCache = () => {
    const keysToRemove = Object.keys(localStorage).filter(
      (k) => k.startsWith('carelens_cache_') || k.startsWith('carelens_upload_'),
    )
    keysToRemove.forEach((k) => localStorage.removeItem(k))
    setSavedMessage(`Cleared ${keysToRemove.length} cached document analysis records.`)
    setTimeout(() => setSavedMessage(null), 2500)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line bg-gradient-to-r from-teal-tint via-white to-cyan-tint px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-teal text-white shadow-md shadow-teal/30">
              <Settings className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-heading">CareLens System Settings</h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    backendStatus === 'online'
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                      : backendStatus === 'checking'
                        ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                        : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                  }`}
                >
                  <Activity className="size-2.5" />
                  {backendStatus === 'online'
                    ? 'Backend Online'
                    : backendStatus === 'checking'
                      ? 'Checking API...'
                      : 'Backend Local'}
                </span>
              </div>
              <p className="text-xs text-muted">Configure AI pipelines, clinical safety rules, and preferences</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-heading"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-line bg-subtle/50 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
              activeTab === 'general'
                ? 'border-teal text-teal'
                : 'border-transparent text-muted hover:text-heading'
            }`}
          >
            <Languages className="size-4" />
            General & Language
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
              activeTab === 'ai'
                ? 'border-teal text-teal'
                : 'border-transparent text-muted hover:text-heading'
            }`}
          >
            <Cpu className="size-4" />
            AI & OCR Pipeline
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
              activeTab === 'privacy'
                ? 'border-teal text-teal'
                : 'border-transparent text-muted hover:text-heading'
            }`}
          >
            <Lock className="size-4" />
            Privacy & Compliance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
              activeTab === 'storage'
                ? 'border-teal text-teal'
                : 'border-transparent text-muted hover:text-heading'
            }`}
          >
            <Database className="size-4" />
            Cache & Demo Data
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {savedMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200 animate-in fade-in">
              <CheckCircle2 className="size-4 text-emerald-600" />
              {savedMessage}
            </div>
          )}

          {/* TAB: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                  Preferred Language (Grounding & Summaries)
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {languages.map((l) => {
                    const isSelected = lang === l.code
                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => setLang(l.code)}
                        className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                          isSelected
                            ? 'border-teal bg-teal-tint/50 text-teal shadow-sm ring-1 ring-teal'
                            : 'border-line bg-white text-heading hover:bg-subtle'
                        }`}
                      >
                        <span className="text-sm font-bold">{l.native}</span>
                        <span className="text-[11px] text-muted">{l.english}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-line pt-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                  Display Appearance
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDarkMode(false)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                      !darkMode
                        ? 'border-teal bg-teal-tint/40 text-heading ring-1 ring-teal'
                        : 'border-line bg-white text-muted hover:bg-subtle'
                    }`}
                  >
                    <div className="grid size-9 place-items-center rounded-lg bg-white shadow-sm ring-1 ring-line text-amber-500">
                      <Sun className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-heading">Medical Clean Light</p>
                      <p className="text-[10px] text-muted">Optimal daytime clinical legibility</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDarkMode(true)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                      darkMode
                        ? 'border-teal bg-teal-tint/40 text-heading ring-1 ring-teal'
                        : 'border-line bg-white text-muted hover:bg-subtle'
                    }`}
                  >
                    <div className="grid size-9 place-items-center rounded-lg bg-slate-900 shadow-sm ring-1 ring-slate-800 text-teal-300">
                      <Moon className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-heading">Deep Hologram Dark</p>
                      <p className="text-[10px] text-muted">High contrast anatomical dark mode</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: AI & OCR PIPELINE */}
          {activeTab === 'ai' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                  Document Extraction Architecture
                </label>
                <div className="space-y-2.5">
                  {[
                    {
                      id: 'multi_model',
                      title: 'Multi-Model Ensembled Pipeline (Recommended)',
                      desc: 'Consensus voting across Qwen2.5-VL, MiniCPM-V, and DocTR with temperature 0.0.',
                      badge: 'Production Default',
                    },
                    {
                      id: 'fast_ocr',
                      title: 'Fast Local OCR (Tesseract / EasyOCR)',
                      desc: 'Lightweight offline OCR without external vision model calls.',
                      badge: 'Offline Mode',
                    },
                    {
                      id: 'cloud_vlm',
                      title: 'Cloud Medical VLM (Gemini 2.5 Flash / Claude 3.5)',
                      desc: 'High-acuity prescription handwriting parser with zero hallucination enforcement.',
                      badge: 'Cloud Enhanced',
                    },
                  ].map((engine) => {
                    const isSelected = ocrEngine === engine.id
                    return (
                      <div
                        key={engine.id}
                        onClick={() => setOcrEngine(engine.id)}
                        className={`flex cursor-pointer items-start justify-between rounded-xl border p-3.5 transition-all ${
                          isSelected
                            ? 'border-teal bg-teal-tint/40 ring-1 ring-teal'
                            : 'border-line bg-white hover:bg-subtle'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="ocrEngine"
                              checked={isSelected}
                              onChange={() => setOcrEngine(engine.id)}
                              className="size-3.5 text-teal focus:ring-teal"
                            />
                            <p className="text-xs font-bold text-heading">{engine.title}</p>
                          </div>
                          <p className="text-[11px] leading-relaxed text-muted pl-5">{engine.desc}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                          {engine.badge}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-line pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-heading">Fact Extraction Confidence Cutoff</p>
                    <p className="text-[11px] text-muted">Reject facts with model certainty below this score</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-teal">
                    {Math.round(confidenceThreshold * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="0.95"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-full accent-teal cursor-pointer"
                />
              </div>

              <div className="rounded-xl border border-teal/20 bg-teal-tint/30 p-3.5 flex items-start gap-3">
                <FileCheck className="size-4 text-teal mt-0.5 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-teal-hover">ABDM FHIR R4 Validation Active</p>
                  <p className="text-body text-[11px] mt-0.5">
                    Extracted facts are validated against standard Indian health ranges and LOINC/SNOMED-CT codes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PRIVACY & COMPLIANCE */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-line bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-heading">Client-Side PII De-identification</p>
                    <p className="text-[11px] text-muted">
                      Redact patient names, phone numbers, and addresses before sending images/text to cloud LLMs
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={redactPii}
                    onChange={(e) => setRedactPii(e.target.checked)}
                    className="size-4 rounded border-line text-teal focus:ring-teal"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-line bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-heading">Deterministic Safety Gate</p>
                    <p className="text-[11px] text-muted">
                      Abnormal health flags computed strictly by code rules, NEVER hallucinated by LLM
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={strictValidation}
                    onChange={(e) => setStrictValidation(e.target.checked)}
                    className="size-4 rounded border-line text-teal focus:ring-teal"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 flex items-start gap-3">
                <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-amber-900">Synthetic Data & Privacy Sandbox</p>
                  <p className="text-amber-800 text-[11px] mt-1 leading-relaxed">
                    CareLens operates exclusively on synthetic patient data. Real Aadhaar or national identity numbers
                    are never logged or transmitted. All ABHA credentials carry the MOCK prefix.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: STORAGE & CACHE */}
          {activeTab === 'storage' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-line bg-white p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-heading">Document Extraction Cache</p>
                  <p className="text-[11px] text-muted">
                    Clear locally cached OCR JSON results and sha256 document hashes
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-heading hover:bg-subtle"
                >
                  Clear Cache
                </button>
              </div>

              <div className="rounded-xl border border-line bg-white p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-heading">Reset Demo Patient Profiles</p>
                  <p className="text-[11px] text-muted">
                    Re-seed Arjun Verma, Meera Verma, and Ramesh Verma demo profiles
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetDemoData}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                >
                  Reset Defaults
                </button>
              </div>

              <div className="rounded-xl border border-line bg-subtle/50 p-4 space-y-2 text-xs">
                <p className="font-bold text-heading">System Diagnostics</p>
                <div className="font-mono text-[11px] text-muted space-y-1">
                  <p>Build Version: CareLens v1.4.2 (Production)</p>
                  <p>FHIR R4 Schema: 4.0.1 compliant</p>
                  <p>ABDM Gateway: Sandbox Mock v2</p>
                  <p>3D Anatomy Engine: Three.js WebGL (ACESFilmic)</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line bg-subtle/50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line bg-white px-4 py-2 text-xs font-semibold text-heading hover:bg-subtle"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-teal px-5 py-2 text-xs font-bold text-white shadow-sm shadow-teal/30 hover:bg-teal-hover"
          >
            Save & Apply Settings
          </button>
        </div>
      </div>
    </div>
  )
}
