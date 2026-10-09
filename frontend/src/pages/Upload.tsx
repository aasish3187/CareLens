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
  }

  // Real file upload to backend API
  const uploadToBackend = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(apiUrl('/api/documents/'), {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let errorDetail = `Server error ${response.status}`
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
            if (text && text.length < 150) errorDetail = text.trim()
          }
        } catch {
          // ignore
        }
        throw new Error(errorDetail)
      }

      const data = await response.json()
      return data.document_id
    } catch (err: unknown) {
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
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all ${
                    drag ? 'scale-[1.01] border-teal bg-teal-tint shadow-lg shadow-teal/10' : 'border-teal/40 bg-white hover:border-teal hover:bg-teal-tint/40'
                  }`}
                >
                  <span
                    className={`grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-teal to-cyan text-white shadow-lg shadow-teal/25 transition-transform ${
                      drag ? '-translate-y-1' : ''
                    }`}
                  >
                    <CloudUpload className="size-8" aria-hidden />
                  </span>
                  <p className="mt-5 text-lg font-semibold text-heading">{drag ? t('upload.dropActive') : t('upload.drop')}</p>
                  <p className="mt-1 text-sm text-muted">{t('upload.formats')}</p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal px-4 text-sm font-semibold text-white hover:bg-teal-hover"
                    >
                      <FileText className="size-4" aria-hidden />
                      {t('upload.browse')}
                    </button>
                    <span className="text-xs text-muted">{t('upload.or')}</span>
                    <button
                      type="button"
                      onClick={() => camRef.current?.click()}
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-heading hover:bg-subtle"
                    >
                      <Camera className="size-4 text-teal" aria-hidden />
                      {t('upload.camera')}
                    </button>
                  </div>
                  <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                  <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                  {error && (
                    <p role="alert" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-200">
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
                  <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wider text-muted">{t('upload.pipeline')}</p>
                  <ol className="grid gap-2 sm:grid-cols-2">
                    {stages.map((s, i) => {
                      const state = i < stage ? 'done' : i === stage ? 'active' : 'pending'
                      return (
                        <li
                          key={s}
                          className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                            state === 'done'
                              ? 'border-emerald-200 bg-emerald-50/60 text-heading'
                              : state === 'active'
                                ? 'border-teal/40 bg-teal-tint text-heading'
                                : 'border-line text-muted'
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
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-lg bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
                      ✅ Your document has been analyzed by Gemini AI. Redirecting to results...
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-start gap-3 rounded-2xl border border-cyan/20 bg-cyan-tint p-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-cyan ring-1 ring-cyan/20">
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
          <ul className="mt-4 space-y-2">
            {documents.map((d) => {
              const isImg = d.file.endsWith('.jpg')
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    disabled={!!job}
                    onClick={() => startDemo({ name: d.file, size: isImg ? '1.8 MB' : '420 KB', kind: isImg ? 'image' : 'pdf', docId: d.id, isDemo: true })}
                    className="btn-interactive group flex w-full items-center gap-3 rounded-xl border border-line p-3 text-left transition-all hover:border-teal/50 hover:bg-teal-tint/60 hover:shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${isImg ? 'bg-cyan-tint text-cyan' : 'bg-teal-tint text-teal'}`}>
                      {isImg ? <FileImage className="size-5" aria-hidden /> : <FileText className="size-5" aria-hidden />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-[13px] font-medium text-heading">{d.file}</span>
                      <span className="block text-xs text-muted">
                        {t(d.titleKey)} · {d.date}
                      </span>
                    </span>
                    <CloudUpload className="size-4 text-muted transition-colors group-hover:text-teal" aria-hidden />
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
