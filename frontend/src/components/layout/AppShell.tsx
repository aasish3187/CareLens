import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppShell() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="relative min-h-screen bg-app overflow-x-hidden selection:bg-teal selection:text-white">
      {/* Ambient Frosted Slate & Teal Mesh Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        {/* Soft Teal Ambient Orb Top Left */}
        <div className="absolute -top-[10rem] left-[14%] h-[620px] w-[620px] rounded-full bg-teal/10 blur-[130px]" />
        {/* Subtle Cyan Light Glow Top Right */}
        <div className="absolute top-[6rem] right-[5%] h-[520px] w-[520px] rounded-full bg-cyan/8 blur-[140px]" />
        {/* Soft Emerald/Teal Depth Bottom Center */}
        <div className="absolute bottom-[4rem] left-[28%] h-[580px] w-[580px] rounded-full bg-teal/6 blur-[150px]" />
        {/* Subtle Frosted Medical Dot Matrix Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.25]" />
      </div>

      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <Sidebar />
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
      <div className="relative z-10 lg:pl-60 min-w-0 overflow-x-hidden">
        <Header onMenu={() => setOpen(true)} />
        <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
