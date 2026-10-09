import { Link } from 'react-router'
import { SearchX } from 'lucide-react'
import { useT } from '../i18n/I18nContext'

export default function NotFound() {
  const t = useT()
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-teal-tint text-teal">
        <SearchX className="size-8" aria-hidden />
      </span>
      <h1 className="mt-5 text-2xl font-bold text-heading">{t('notfound.title')}</h1>
      <p className="mt-1 text-muted">{t('notfound.body')}</p>
      <Link to="/" className="mt-6 inline-flex h-10 items-center rounded-lg bg-teal px-4 text-sm font-semibold text-white hover:bg-teal-hover">
        {t('notfound.back')}
      </Link>
    </div>
  )
}
