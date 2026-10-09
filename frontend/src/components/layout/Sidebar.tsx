import { useState } from 'react'
import { NavLink } from 'react-router'
import { Activity, CreditCard, FileSearch, Languages, LayoutDashboard, Pill, ScanHeart, Settings, ShieldCheck, Upload, X } from 'lucide-react'
import { useT } from '../../i18n/I18nContext'
import Logo from './Logo'
import SettingsModal from '../SettingsModal'

const nav = [
  { to: '/', key: 'nav.overview', icon: LayoutDashboard, end: true },
  { to: '/body-twin', key: 'nav.bodyTwin', icon: ScanHeart },
  { group: 'nav.documents' },
  { to: '/upload', key: 'nav.upload', icon: Upload },
  { to: '/evidence', key: 'nav.evidence', icon: FileSearch },
  { group: '' },
  { to: '/medications', key: 'nav.medications', icon: Pill },
  { to: '/timeline', key: 'nav.timeline', icon: Activity },
  { to: '/abha', key: 'nav.abha', icon: CreditCard },
  { to: '/multilingual', key: 'nav.multilingual', icon: Languages },
] as const

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const t = useT()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <aside className="flex h-full w-60 flex-col border-r border-line bg-white">
        <div className="flex items-center justify-between px-5 pb-6 pt-5">
          <div className="flex items-center gap-2.5">
            <Logo />
            <div className="leading-tight">
              <p className="text-[17px] font-bold tracking-tight text-heading">CareLens</p>
              <p className="text-[11px] text-muted">{t('brand.by')}</p>
            </div>
          </div>
          {onClose && (
            <button type="button" onClick={onClose} aria-label={t('header.close')} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-subtle lg:hidden">
              <X className="size-4" />
            </button>
          )}
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
          {nav.map((item, i) =>
            'group' in item ? (
              item.group ? (
                <p key={i} className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                  {t(item.group)}
                </p>
              ) : (
                <div key={i} className="mx-3 my-3 h-px bg-line" />
              )
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item}
                onClick={onClose}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-teal-tint text-teal-hover' : 'text-body hover:bg-subtle hover:text-heading'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-teal" aria-hidden />}
                    <item.icon className={`size-[18px] ${isActive ? 'text-teal' : 'text-muted'}`} aria-hidden />
                    {t(item.key)}
                  </>
                )}
              </NavLink>
            ),
          )}
        </nav>
        <div className="p-3">
          <div className="rounded-xl border border-teal/15 bg-gradient-to-br from-teal-tint to-cyan-tint p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-hover">
              <ShieldCheck className="size-4" aria-hidden />
              {t('safety.title')}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-body">{t('safety.body')}</p>
          </div>

          {/* Settings button down left corner below Clinical safety */}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="mt-2.5 flex w-full items-center justify-between rounded-xl border border-line bg-subtle/60 px-3 py-2 text-xs font-medium text-body transition-all hover:border-teal/30 hover:bg-subtle hover:text-heading"
          >
            <div className="flex items-center gap-2">
              <Settings className="size-4 text-muted" />
              <span>Settings & System</span>
            </div>
            <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-mono text-muted ring-1 ring-line">
              v1.4
            </span>
          </button>
        </div>
      </aside>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
