import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import Sidebar from './Sidebar'
import Header from './Header'
import NebulaBackground from './NebulaBackground'

export default function AppShell() {
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('carelens_sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })
  const { pathname } = useLocation()

  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
  }, [pathname])

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('carelens_sidebar_collapsed', String(next))
      } catch {}
      return next
    })
  }

  return (
    <div className="relative min-h-screen bg-app overflow-x-hidden selection:bg-teal selection:text-white">
      {/* Living Bio-Digital Nebula & Constellation Layer with Interactive Cursor Gravity */}
      <NebulaBackground />

      <div
        className={`fixed inset-y-0 left-0 z-40 hidden lg:block transition-[width] duration-300 ease-in-out ${
          collapsed ? 'w-[72px]' : 'w-60'
        }`}
      >
        <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
      </div>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 shadow-2xl lg:hidden"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            >
              <Sidebar onClose={() => setOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <div
        className={`relative z-10 min-w-0 overflow-x-hidden transition-[padding-left] duration-300 ease-in-out ${
          collapsed ? 'lg:pl-[72px]' : 'lg:pl-60'
        }`}
      >
        <Header onMenu={() => setOpen(true)} collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
        <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
