import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { dictionaries, en, type StringKey } from './strings'
import type { Lang } from './summaries'

export const languages: { code: Lang; native: string; english: string; speech: string }[] = [
  { code: 'en', native: 'English', english: 'English', speech: 'en-IN' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu', speech: 'te-IN' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi', speech: 'hi-IN' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil', speech: 'ta-IN' },
]

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: StringKey | string) => string }

const I18nContext = createContext<Ctx | null>(null)
const STORAGE_KEY = 'carelens.lang'

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && languages.some((l) => l.code === saved)) return saved as Lang
  } catch {
    /* storage unavailable */
  }
  return 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* storage unavailable */
    }
  }, [lang])

  const t = useCallback(
    (key: string) => dictionaries[lang][key as StringKey] ?? en[key as StringKey] ?? key,
    [lang],
  )
  const value = useMemo(() => ({ lang, setLang: setLangState, t }), [lang, t])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}

export const useT = () => useI18n().t
