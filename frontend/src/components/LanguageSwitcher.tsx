import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Languages } from 'lucide-react'
import { languages, useI18n } from '../i18n/I18nContext'

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = languages.find((l) => l.code === lang)!

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('header.language')}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-medium text-heading transition-colors hover:bg-subtle"
      >
        <Languages className="size-4 text-teal" aria-hidden />
        <span className="hidden sm:inline">{current.native}</span>
        <span className="font-mono text-xs uppercase text-muted sm:hidden">{current.code}</span>
        <ChevronDown className="size-3.5 text-muted" aria-hidden />
      </button>
      {open && (
        <ul role="listbox" className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-line bg-white p-1 shadow-xl shadow-slate-900/10">
          {languages.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang}
                onClick={() => {
                  setLang(l.code)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  l.code === lang ? 'bg-teal-tint text-teal-hover' : 'text-body hover:bg-subtle'
                }`}
              >
                <span>
                  <span className="font-medium">{l.native}</span>
                  <span className="ml-2 text-xs text-muted">{l.english}</span>
                </span>
                {l.code === lang && <Check className="size-4" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
