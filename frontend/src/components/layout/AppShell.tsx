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
      {/* Ambient Frosted Slate & Teal Mesh Glows (Silky, grain-free ambient depth) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        {/* Soft Teal Ambient Orb Top Left */}
        <div className="absolute -top-[12rem] left-[10%] h-[680px] w-[680px] rounded-full bg-gradient-to-br from-teal/12 to-emerald/6 blur-[140px]" />
        {/* Subtle Cyan Light Glow Top Right */}
        <div className="absolute top-[4rem] right-[2%] h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-cyan/10 to-sky/5 blur-[150px]" />
        {/* Soft Teal Depth Bottom Center */}
        <div className="absolute bottom-[2rem] left-[25%] h-[650px] w-[650px] rounded-full bg-teal/8 blur-[160px]" />
        {/* Smooth Organic Radial Vignette for Depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(13,148,136,0.06),transparent_70%)]" />
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
