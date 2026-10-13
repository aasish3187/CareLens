import { useState } from 'react'
import { NavLink } from 'react-router'
import { Activity, ChevronLeft, ChevronRight, CreditCard, FileSearch, Languages, LayoutDashboard, Pill, ScanHeart, Settings, ShieldCheck, Upload, X } from 'lucide-react'
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

export default function Sidebar({
  onClose,
  collapsed = false,
  onToggleCollapse,
}: {
  onClose?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}) {
  const t = useT()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <aside
        className={`flex h-full flex-col border-r border-line bg-white/92 backdrop-blur-md transition-all duration-300 overflow-hidden ${
          collapsed ? 'w-[72px]' : 'w-60'
        }`}
      >
        {/* Sidebar Header */}
        {collapsed ? (
          <div className="flex items-center justify-center gap-1.5 px-2 py-3.5 border-b border-line/50">
            <div className="shrink-0 transition-transform hover:scale-105">
              <Logo />
            </div>
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Expand sidebar"
                title="Expand sidebar"
                className="grid size-6 place-items-center rounded-md border border-line bg-subtle/80 text-muted hover:border-teal/50 hover:bg-white hover:text-teal transition-all shadow-2xs focus:outline-none"
              >
                <ChevronRight className="size-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between px-4 pb-3 pt-3.5 border-b border-line/50">
            <div className="flex items-center gap-2.5">
              <Logo />
              <div className="leading-tight">
                <p className="text-[17px] font-bold tracking-tight text-heading">CareLens</p>
                <p className="text-[11px] text-muted">{t('brand.by')}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                  className="hidden lg:grid size-7 place-items-center rounded-lg border border-line bg-subtle/80 text-muted hover:border-teal/50 hover:bg-white hover:text-teal transition-all shadow-2xs focus:outline-none"
                >
                  <ChevronLeft className="size-4" />
                </button>
              )}
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t('header.close')}
                  className="grid size-7 place-items-center rounded-lg text-muted hover:bg-subtle lg:hidden"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Items (No scrollbar, scrollbar-width none) */}
        <nav className={`flex-1 space-y-0.5 overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${collapsed ? 'px-2 py-2' : 'px-3 py-2'}`}>
          {nav.map((item, i) =>
            'group' in item ? (
              item.group ? (
                collapsed ? (
                  <div key={i} className="my-2 mx-auto h-px w-6 bg-line" />
                ) : (
                  <p key={i} className="px-3 pb-0.5 pt-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {t(item.group)}
                  </p>
                )
              ) : (
                <div key={i} className={`my-1.5 bg-line ${collapsed ? 'mx-auto h-px w-6' : 'mx-3 h-px'}`} />
              )
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex items-center rounded-xl text-sm font-medium transition-all ${
                    collapsed
                      ? 'justify-center py-2 px-0'
                      : 'gap-3 px-3 py-1.5'
                  } ${
                    isActive
                      ? 'bg-teal-tint text-teal-hover shadow-2xs font-semibold'
                      : 'text-body hover:bg-subtle hover:text-heading'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span
                        className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-teal shadow-xs shadow-teal/30"
                        aria-hidden
                      />
                    )}
                    <item.icon
                      className={`size-[18px] shrink-0 transition-transform group-hover:scale-105 ${
                        isActive ? 'text-teal' : 'text-muted group-hover:text-heading'
                      }`}
                      aria-hidden
                    />
                    {!collapsed && <span>{t(item.key)}</span>}

                    {/* Floating Glass Tooltip when collapsed */}
                    {collapsed && (
                      <span className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-lg bg-slate-900/90 px-2.5 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                        {t(item.key)}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ),
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className={`p-2.5 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          {collapsed ? (
            <>
              {/* Compact Clinical Safety Icon */}
              <div
                className="group relative grid size-10 place-items-center rounded-xl border border-teal/20 bg-gradient-to-br from-teal-tint to-cyan-tint text-teal-hover shadow-2xs cursor-help"
                title={`${t('safety.title')}: ${t('safety.body')}`}
              >
                <ShieldCheck className="size-5 text-teal" aria-hidden />
                <span className="pointer-events-none absolute left-full ml-3 z-50 w-52 rounded-lg bg-slate-900/95 p-2 text-xs font-normal text-slate-200 shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="font-semibold text-teal-300 block mb-0.5">{t('safety.title')}</span>
                  {t('safety.body')}
                </span>
              </div>

              {/* Compact Settings Button */}
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="group relative grid size-10 place-items-center rounded-xl border border-line bg-subtle/80 text-muted hover:border-teal/40 hover:bg-white hover:text-heading transition-all shadow-2xs"
                title="Settings & System v1.4"
                aria-label="Settings & System"
              >
                <Settings className="size-5 text-muted group-hover:text-heading transition-colors" />
                <span className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-lg bg-slate-900/90 px-2.5 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                  Settings & System v1.4
                </span>
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </aside>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
