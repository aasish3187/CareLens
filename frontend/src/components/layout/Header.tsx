import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Menu, Plus, RefreshCw, Search } from 'lucide-react'
import { useT } from '../../i18n/I18nContext'
import LanguageSwitcher from '../LanguageSwitcher'
import PatientProfileModal, { type PatientProfile } from '../PatientProfileModal'

export default function Header({ onMenu }: { onMenu: () => void }) {
  const t = useT()
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [patientName, setPatientName] = useState('Arjun Verma')

  useEffect(() => {
    const updateActivePatient = () => {
      try {
        const storedProfiles = localStorage.getItem('carelens_patient_profiles')
        const activeId = localStorage.getItem('carelens_active_patient_id') || 'p1'
        if (storedProfiles) {
          const profiles: PatientProfile[] = JSON.parse(storedProfiles)
          const active = profiles.find((p) => p.id === activeId)
          if (active?.name) {
            setPatientName(active.name)
          }
        }
      } catch {}
    }

    updateActivePatient()

    const handlePatientUpdate = (e: any) => {
      if (e.detail?.name) {
        setPatientName(e.detail.name)
      } else {
        updateActivePatient()
      }
    }

    window.addEventListener('carelens_patient_updated', handlePatientUpdate)
    return () => window.removeEventListener('carelens_patient_updated', handlePatientUpdate)
  }, [])

  const initials = patientName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AV'

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/85 px-4 backdrop-blur-md sm:px-6">
        <button type="button" onClick={onMenu} aria-label={t('header.menu')} className="grid size-9 place-items-center rounded-lg border border-line text-body lg:hidden">
          <Menu className="size-4" />
        </button>
        <label className="relative hidden max-w-md flex-1 md:block">
          <span className="sr-only">{t('header.search')}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            placeholder={t('header.search')}
            className="h-9 w-full rounded-lg border border-line bg-subtle/60 pl-9 pr-3 text-sm text-heading placeholder:text-muted focus:border-teal focus:bg-white focus:outline-none"
          />
        </label>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 xl:inline-flex">
            <RefreshCw className="size-3" aria-hidden />
            {t('header.abhaSynced')}
          </span>
          <LanguageSwitcher />
          <Link
            to="/upload"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal px-3 text-sm font-semibold text-white shadow-sm shadow-teal/20 transition-colors hover:bg-teal-hover sm:px-4"
          >
            <Plus className="size-4" aria-hidden />
            <span className="hidden sm:inline">{t('header.upload')}</span>
          </Link>

          {/* Interactive Patient Profile Avatar Button */}
          <button
            type="button"
            onClick={() => setProfileModalOpen(true)}
            className="group relative flex items-center gap-2 rounded-full p-0.5 transition-all hover:ring-2 hover:ring-teal/40 focus:outline-none focus:ring-2 focus:ring-teal"
            title={`${patientName} · Click to edit details or switch profile`}
            aria-label={`${patientName} Profile Settings`}
          >
            <div className="size-9 place-items-center rounded-full bg-gradient-to-br from-teal to-cyan text-xs font-bold text-white shadow-sm shadow-teal/20 transition-transform group-hover:scale-105 grid">
              {initials}
            </div>
          </button>
        </div>
      </header>

      {/* Patient Profile & Switcher Modal */}
      <PatientProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </>
  )
}
