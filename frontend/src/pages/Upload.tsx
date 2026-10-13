import { useEffect, useRef, useState, type DragEvent } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, Camera, Check, CloudUpload, EyeOff, FileImage, FileText, Loader2, Sparkles } from 'lucide-react'
import { useT } from '../i18n/I18nContext'
import { documents } from '../data/documents'
import Card from '../components/ui/Card'
import PageHeader from '../components/PageHeader'
import SafetyBadge from '../components/ui/SafetyBadge'

const stages = ['stage.deskew', 'stage.pii', 'stage.ocr', 'stage.drug', 'stage.rules', 'stage.grounding']
const STAGE_MS = 620
const ACCEPT = ['application/pdf', 'image/jpeg', 'image/png']

import { apiUrl } from '../config/api'
import { notifyPatientDataUpdated } from '../hooks/usePatientData'
import { playScanBeamSound, playSuccessChime } from '../utils/soundEffects'

type Job = { name: string; size: string; kind: 'pdf' | 'image'; docId: string; preview?: string; isDemo: boolean }

const fmtSize = (bytes: number) => (bytes > 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`)

// API base URL — uses configured backend if present, otherwise relative /api
const API_BASE = apiUrl('/api')

export default function Upload() {
  const t = useT()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const camRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [job, setJob] = useState<Job | null>(null)
  const [stage, setStage] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [apiDocId, setApiDocId] = useState<string | null>(null)

  // Animate pipeline stages for demo documents
  useEffect(() => {
    if (!job) return
    if (job.isDemo) {
      // Demo mode: animate stages then navigate
      if (stage >= stages.length) {
        playSuccessChime()
        const id = setTimeout(() => navigate(`/evidence/${job.docId}`), 900)
        return () => clearTimeout(id)
      }
      const id = setTimeout(() => setStage((s) => s + 1), STAGE_MS)
      return () => clearTimeout(id)
    }
  }, [job, stage, navigate])

  // For real uploads: navigate when API returns
  useEffect(() => {
    if (apiDocId && stage >= stages.length) {
      playSuccessChime()
      const id = setTimeout(() => navigate(`/evidence/live?doc=${apiDocId}`), 900)
      return () => clearTimeout(id)
    }
  }, [apiDocId, stage, navigate])

  useEffect(
    () => () => {
      if (job?.preview) URL.revokeObjectURL(job.preview)
    },
    [job],
  )

  const startDemo = (j: Job) => {
    setError(null)
    setStage(0)
    setJob(j)
    playScanBeamSound()
  }

  // Real file upload to backend API with automatic retry for 502/503/504
  const uploadToBackend = async (file: File, retryCount = 0): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(apiUrl('/api/documents/'), {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        // If server is cold-starting or deploying (502 / 503 / 504), automatically retry up to 2 times
        if ([502, 503, 504].includes(response.status) && retryCount < 2) {
          await new Promise((resolve) => setTimeout(resolve, 2500 * (retryCount + 1)))
          return uploadToBackend(file, retryCount + 1)
        }

        let errorDetail = [502, 503, 504].includes(response.status)
          ? 'Server is waking up. Please wait a few seconds and try again.'
          : `Server error ${response.status}`
        try {
          const contentType = response.headers.get('content-type') || ''
          if (contentType.includes('application/json')) {
            const err = await response.json()
            if (typeof err.detail === 'string') {
              errorDetail = err.detail
            } else if (Array.isArray(err.detail) && err.detail[0]?.msg) {
              errorDetail = err.detail[0].msg
            } else if (err.message) {
              errorDetail = err.message
            }
          } else {
            const text = await response.text()
            if (text && text.length < 150 && !text.includes('<!DOCTYPE') && !text.includes('<html')) {
              errorDetail = text.trim()
            }
          }
        } catch {
          // ignore
        }
        throw new Error(errorDetail)
      }

      const data = await response.json()
      return data.document_id
    } catch (err: unknown) {
      if (err instanceof TypeError && retryCount < 2) {
        await new Promise((resolve) => setTimeout(resolve, 2500))
        return uploadToBackend(file, retryCount + 1)
      }
      const message = err instanceof Error ? err.message : 'Upload connection failed'
      throw new Error(message)
    }
  }

  const handleFile = async (file?: File | null) => {
    if (!file) return
    const okExt = /\.(pdf|jpe?g|png)$/i.test(file.name)
    if (!ACCEPT.includes(file.type) && !okExt) {
      setError(t('upload.invalid'))
      return
    }

    const isImage = file.type.startsWith('image/')
    const jobData: Job = {
      name: file.name,
      size: fmtSize(file.size),
      kind: isImage ? 'image' : 'pdf',
      docId: '',
      preview: isImage ? URL.createObjectURL(file) : undefined,
      isDemo: false,
    }

    setError(null)
    setStage(0)
    setJob(jobData)
    setUploading(true)

    // Start pipeline animation
    let currentStage = 0
    const stageInterval = setInterval(() => {
      currentStage++
      setStage(currentStage)
      if (currentStage >= stages.length) {
        clearInterval(stageInterval)
      }
    }, STAGE_MS)

    try {
      const docId = await uploadToBackend(file)
      if (docId) {
        notifyPatientDataUpdated()
        setApiDocId(docId)
        // Ensure animation completes before navigating
        if (currentStage < stages.length) {
          // Wait for animation to finish
          const remaining = (stages.length - currentStage) * STAGE_MS + 900
          clearInterval(stageInterval)
          setStage(stages.length)
          setTimeout(() => {
            navigate(`/evidence/live?doc=${docId}`)
          }, 900)
        } else {
          navigate(`/evidence/live?doc=${docId}`)
        }
      }
    } catch (err: unknown) {
      clearInterval(stageInterval)
      const rawMsg = err instanceof Error ? err.message : 'Please check your file and try again.'
      const cleanMsg = rawMsg.replace(/^Upload failed:\s*/i, '').trim()
      setError(cleanMsg || 'Unable to process document. Please check the file format or try again.')
      setJob(null)
      setStage(0)
    } finally {
      setUploading(false)
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDrag(false)
    if (!job) handleFile(e.dataTransfer.files?.[0])
  }

  const progress = Math.min(100, (stage / stages.length) * 100)
  const done = stage >= stages.length

  return (
    <div>
      <PageHeader
        title={t('upload.title')}
        subtitle={t('upload.subtitle')}
        actions={
          <>
            <SafetyBadge kind="pii" />
            <SafetyBadge kind="grounded" />
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {!job ? (
              <motion.div key="drop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }}>
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDrag(true)
                  }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={onDrop}
                  className={`liquid-glass-lens group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all duration-300 ${
                    drag
                      ? 'scale-[1.01] border-teal bg-white/30 shadow-[0_24px_50px_-10px_rgba(13,148,136,0.3)] ring-4 ring-teal/20'
                      : 'border-teal/40 hover:border-teal hover:shadow-[0_20px_45px_-10px_rgba(13,148,136,0.18)]'
                  }`}
                >
                  {/* Illuminated Liquid Border Ambient Glow */}
                  <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-teal/20 via-cyan/20 to-teal/20 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100" />

                  <span
                    className={`relative z-10 grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-teal to-cyan text-white shadow-lg shadow-teal/25 transition-transform duration-300 ${
                      drag ? '-translate-y-1 scale-105' : 'group-hover:scale-105'
                    }`}
                  >
                    <CloudUpload className="size-8" aria-hidden />
                  </span>
                  <p className="relative z-10 mt-5 text-lg font-bold text-heading drop-shadow-2xs">{drag ? t('upload.dropActive') : t('upload.drop')}</p>
                  <p className="mt-1 text-sm text-muted">{t('upload.formats')}</p>
                  <div className="relative z-10 mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm mx-auto">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="btn-interactive inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-teal px-5 text-sm font-semibold text-white shadow-md shadow-teal/25 hover:bg-teal-hover hover:shadow-lg hover:shadow-teal/30 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <FileText className="size-4 text-white" aria-hidden />
                      <span>{t('upload.browse')}</span>
                    </button>
                    <span className="text-xs font-medium text-muted hidden sm:inline">{t('upload.or')}</span>
                    <button
                      type="button"
                      onClick={() => camRef.current?.click()}
                      className="btn-interactive inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-line bg-white/90 px-5 text-sm font-semibold text-heading shadow-xs hover:border-teal/50 hover:bg-white hover:text-teal active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Camera className="size-4 text-teal" aria-hidden />
                      <span>{t('upload.camera')}</span>
                    </button>
                  </div>
                  <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                  <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                  {error && (
                    <p role="alert" className="relative z-10 mt-5 inline-flex items-center gap-2 rounded-xl bg-red-50/90 px-3.5 py-2.5 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-200 backdrop-blur-md">
                      <AlertCircle className="size-4 shrink-0 text-red-600" aria-hidden />
                      <span>
                        <strong className="font-semibold">{t('upload.failed')}: </strong>
                        {error.replace(/^Upload failed:?\s*/i, '').trim() || t('upload.tryAgain')}
                      </span>
                    </p>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div key="job" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-subtle">
                      {job.preview ? (
                        <img src={job.preview} alt="" className="size-full object-cover" />
                      ) : job.kind === 'image' ? (
                        <FileImage className="size-6 text-cyan" aria-hidden />
                      ) : (
                        <FileText className="size-6 text-teal" aria-hidden />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-sm font-medium text-heading">{job.name}</p>
                      <p className="text-xs text-muted" aria-live="polite">
                        {job.size} · {done ? (job.isDemo ? t('upload.done') : '✅ Extraction complete') : `${t('upload.processing')}…`}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-semibold text-teal">{Math.round(progress)}%</span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-subtle">
                    <motion.div className="shimmer h-full rounded-full" animate={{ width: `${Math.max(4, progress)}%` }} transition={{ duration: 0.5 }} />
                  </div>

                  {/* High-Tech Laser Scanner Beam HUD */}
                  <div className="relative mt-5 overflow-hidden rounded-2xl border border-teal/40 bg-slate-950 p-4 shadow-2xl shadow-teal/10">
                    {/* HUD Header Bar */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 font-mono text-[11px]">
                      <div className="flex items-center gap-2 text-teal">
                        <span className="relative flex size-2">
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal opacity-75" />
                          <span className="relative inline-flex size-2 rounded-full bg-teal" />
                        </span>
                        <span className="font-bold tracking-wider">CYAN LASER TELEMETRY HUD</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400">
                        <span className="hidden sm:inline">RESOLUTION: 2400 DPI</span>
                        <span className="text-teal font-semibold">STAGE {Math.min(stage + 1, stages.length)}/6</span>
                      </div>
                    </div>

                    {/* Scanner Canvas */}
                    <div className="relative mx-auto mt-3 h-48 w-full rounded-xl border border-slate-800 bg-slate-900/90 p-4 overflow-hidden">
                      {/* Grid Background */}
                      <div
                        className="pointer-events-none absolute inset-0 opacity-25"
                        style={{
                          backgroundImage: 'linear-gradient(rgba(13,148,136,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,0.3) 1px, transparent 1px)',
                          backgroundSize: '20px 20px',
                        }}
                      />

                      {/* Document Preview or Medical Prescription Simulation */}
                      {job.preview ? (
                        <div className="relative h-full w-full flex items-center justify-center">
                          <img src={job.preview} alt="" className="max-h-full max-w-full rounded object-contain opacity-75 contrast-125" />
                        </div>
                      ) : (
                        <div className="relative h-full space-y-2.5 font-mono text-xs opacity-60 text-slate-300">
                          <div className="flex items-center justify-between border-b border-slate-700/60 pb-1 text-[10px] text-teal/90">
                            <span>APOLLO / FORTIS CLINICAL TELEMETRY</span>
                            <span>MOCK PATIENT UHID: 488219</span>
                          </div>
                          <div className="h-2 w-48 rounded bg-slate-700/70" />
                          <div className="h-2 w-36 rounded bg-slate-700/50" />
                          <div className="h-2 w-56 rounded bg-slate-700/60" />
                          <div className="h-2 w-40 rounded bg-slate-700/40" />
                          <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-500">
                            <span>RX: GLYCOMET-GP 1</span>
                            <span>·</span>
                            <span>HBA1C: 7.2%</span>
                          </div>
                        </div>
                      )}

                      {/* Moving Laser Beam with Glow */}
                      <motion.div
                        className="pointer-events-none absolute left-0 right-0 z-20 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee,0_0_30px_#0d9488]"
                        animate={{ top: ['5%', '92%', '5%'] }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                      >
                        <div className="absolute -top-5 left-4 rounded bg-cyan-950/90 px-1.5 py-0.5 font-mono text-[9px] font-bold text-cyan-300 border border-cyan-500/50 shadow-sm backdrop-blur-md">
                          LASER SCAN BEAM: 532nm
                        </div>
                      </motion.div>

                      {/* Holographic Live OCR Detection Boxes Popping Up */}
                      {stage >= 1 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute top-4 left-6 z-10 rounded border border-emerald-400 bg-emerald-950/80 px-2 py-1 font-mono text-[10px] font-bold text-emerald-300 shadow-md backdrop-blur-sm"
                        >
                          [PII REDACTED] Aadhaar / Phone Protected
                        </motion.div>
                      )}
                      {stage >= 2 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute top-16 right-6 z-10 rounded border border-teal bg-teal-950/90 px-2 py-1 font-mono text-[10px] font-bold text-teal shadow-md backdrop-blur-sm"
                        >
                          [OCR 99.4%] HbA1c: 7.2% (Flag: High)
                        </motion.div>
                      )}
                      {stage >= 3 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute bottom-12 left-10 z-10 rounded border border-cyan-400 bg-cyan-950/90 px-2 py-1 font-mono text-[10px] font-bold text-cyan-300 shadow-md backdrop-blur-sm"
                        >
                          [RX DETECTED] Tab. Glycomet-GP 1 (1-0-0)
                        </motion.div>
                      )}
                      {stage >= 4 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute bottom-4 right-10 z-10 rounded border border-purple-400 bg-purple-950/90 px-2 py-1 font-mono text-[10px] font-bold text-purple-300 shadow-md backdrop-blur-sm"
                        >
                          [RULES ENGINE] Endocrine & Renal Mapped
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wider text-muted">{t('upload.pipeline')}</p>
                  <ol className="grid gap-2.5 sm:grid-cols-2">
                    {stages.map((s, i) => {
                      const state = i < stage ? 'done' : i === stage ? 'active' : 'pending'
                      return (
                        <li
                          key={s}
                          className={`liquid-glass-pill flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-all ${
                            state === 'done'
                              ? 'border-emerald-300/80 bg-emerald-50/70 text-heading shadow-xs'
                              : state === 'active'
                                ? 'border-teal/70 bg-teal-tint/90 text-heading shadow-md shadow-teal/15 ring-2 ring-teal/20 scale-[1.01]'
                                : 'border-white/80 bg-white/50 text-muted'
                          }`}
                        >
                          <span
                            className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${
                              state === 'done' ? 'bg-st-normal text-white' : state === 'active' ? 'bg-teal text-white' : 'bg-subtle text-muted'
                            }`}
                          >
                            {state === 'done' ? (
                              <Check className="size-3.5" />
                            ) : state === 'active' ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              i + 1
                            )}
                          </span>
                          {t(s)}
                        </li>
                      )
                    })}
                  </ol>
                  {!job.isDemo && done && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl bg-emerald-50/90 p-3.5 text-center text-sm font-medium text-emerald-800 ring-1 ring-emerald-300 backdrop-blur-md">
                      ✅ Your document has been analyzed by Gemini AI. Redirecting to results...
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="liquid-glass flex items-start gap-3 rounded-2xl border border-cyan/30 bg-cyan-tint/60 p-4 shadow-xs backdrop-blur-md">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/90 text-cyan ring-1 ring-cyan/20 shadow-xs">
              <EyeOff className="size-4" aria-hidden />
            </span>
            <p className="text-sm leading-relaxed text-body">{t('upload.pii')}</p>
          </div>
        </div>

        <Card className="h-fit p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-teal" aria-hidden />
            <h2 className="font-semibold text-heading">{t('upload.demo')}</h2>
          </div>
          <p className="mt-1 text-sm text-muted">{t('upload.demoHint')}</p>
          <ul className="mt-4 space-y-2.5">
            {documents.map((d) => {
              const isImg = d.file.endsWith('.jpg')
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    disabled={!!job}
                    onClick={() => startDemo({ name: d.file, size: isImg ? '1.8 MB' : '420 KB', kind: isImg ? 'image' : 'pdf', docId: d.id, isDemo: true })}
                    className="liquid-glass-lens group relative flex w-full items-center gap-3 rounded-xl border border-white/80 p-3 text-left transition-all overflow-hidden hover:border-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="relative z-10 flex w-full items-center gap-3">
                      <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${isImg ? 'bg-cyan-tint/80 text-cyan' : 'bg-teal-tint/80 text-teal'} transition-transform duration-300 group-hover:scale-105`}>
                        {isImg ? <FileImage className="size-5" aria-hidden /> : <FileText className="size-5" aria-hidden />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-mono text-[13px] font-semibold text-heading drop-shadow-2xs">{d.file}</span>
                        <span className="block text-xs text-muted transition-colors group-hover:text-body">
                          {t(d.titleKey)} · {d.date}
                        </span>
                      </span>
                      <CloudUpload className="size-4 text-muted transition-colors group-hover:text-teal" aria-hidden />
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>
    </div>
  )
}
