import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { BadgeCheck, Lock, Square, Volume2 } from 'lucide-react'
import { languages, useI18n } from '../i18n/I18nContext'
import { dictionaries } from '../i18n/strings'
import { crossSummary, type Lang } from '../i18n/summaries'
import Card from '../components/ui/Card'
import PageHeader from '../components/PageHeader'
import Segments from '../components/ui/Segments'
import SafetyBadge from '../components/ui/SafetyBadge'

const tokens = crossSummary.en.filter((s): s is { t: string } => typeof s !== 'string').map((s) => s.t)
const plain = (lang: Lang) => crossSummary[lang].map((s) => (typeof s === 'string' ? s : s.t)).join('')

export default function Multilingual() {
  const { t, lang } = useI18n()
  const [speaking, setSpeaking] = useState<Lang | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => () => window.speechSynthesis?.cancel(), [])
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(id)
  }, [toast])

  const speak = (code: Lang, speech: string) => {
    const synth = window.speechSynthesis
    if (speaking === code) {
      synth?.cancel()
      setSpeaking(null)
      return
    }
    const voices = synth?.getVoices() ?? []
    const prefix = speech.split('-')[0]
    const voice = voices.find((v) => v.lang === speech) ?? voices.find((v) => v.lang.toLowerCase().startsWith(prefix))
    if (!synth || !voice) {
      setToast(dictionaries[code]['ml.noVoice'] ?? t('ml.noVoice'))
      return
    }
    synth.cancel()
    const u = new SpeechSynthesisUtterance(plain(code))
    u.lang = speech
    u.voice = voice
    u.onend = () => setSpeaking(null)
    u.onerror = () => setSpeaking(null)
    setSpeaking(code)
    synth.speak(u)
  }

  return (
    <div>
      <PageHeader
        title={t('ml.title')}
        subtitle={t('ml.subtitle')}
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <BadgeCheck className="size-4" aria-hidden />
            {t('ml.preserved')}
          </span>
        }
      />

      <Card className="mb-6 flex flex-wrap items-center gap-3 p-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
          <Lock className="size-3.5" aria-hidden />
          {t('ml.locked')}
        </span>
        {tokens.map((tok) => (
          <span key={tok} className="rounded-md bg-teal-tint px-2 py-0.5 font-mono text-sm font-medium text-teal-hover ring-1 ring-inset ring-teal/25">
            {tok}
          </span>
        ))}
        <span className="ml-auto font-mono text-xs text-muted">
          {tokens.length}/{tokens.length} × 4 ✓
        </span>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        {languages.map((l) => {
          const isCurrent = l.code === lang
          return (
            <Card key={l.code} className={`flex flex-col p-5 ${isCurrent ? 'ring-2 ring-teal' : ''}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-lg bg-subtle font-mono text-xs font-bold uppercase text-heading">{l.code}</span>
                  <div className="leading-tight">
                    <p className="font-semibold text-heading" lang={l.code}>
                      {l.native}
                    </p>
                    <p className="text-xs text-muted">{l.english}</p>
                  </div>
                </div>
                {isCurrent && <span className="rounded-full bg-teal px-2 py-0.5 text-[10px] font-bold uppercase text-white">{t('ml.current')}</span>}
              </div>
              <p
                lang={l.code}
                className="mt-4 flex-1 text-[15px] leading-[1.9] text-body"
                style={{
                  fontFamily:
                    l.code === 'te' ? "'Inter','Noto Sans Telugu',sans-serif" : l.code === 'hi' ? "'Inter','Noto Sans Devanagari',sans-serif" : l.code === 'ta' ? "'Inter','Noto Sans Tamil',sans-serif" : undefined,
                }}
              >
                <Segments segments={crossSummary[l.code]} />
              </p>
              <div className="mt-5 flex items-center justify-between gap-2 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => speak(l.code, l.speech)}
                  aria-pressed={speaking === l.code}
                  className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors ${
                    speaking === l.code ? 'bg-teal text-white' : 'border border-line bg-white text-heading hover:bg-subtle'
                  }`}
                >
                  {speaking === l.code ? <Square className="size-3.5" aria-hidden /> : <Volume2 className="size-4 text-teal" aria-hidden />}
                  {speaking === l.code ? dictionaries[l.code]['ml.stop'] ?? t('ml.stop') : dictionaries[l.code]['ml.readAloud'] ?? t('ml.readAloud')}
                </button>
                <span className="font-mono text-[11px] text-muted">{l.speech}</span>
              </div>
            </Card>
          )
        })}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <SafetyBadge kind="grounded" />
        <SafetyBadge kind="notDiagnosis" />
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-heading px-4 py-3 text-sm font-medium text-white shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
