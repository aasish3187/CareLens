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
      {/* Bio-Digital Nebula & Constellation Layer */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        {/* Nebula Cloud 1: Deep Luminous Bio-Teal & Emerald (Top-Left Cosmic Core) */}
        <div className="absolute -top-[14rem] left-[8%] h-[720px] w-[720px] rounded-full bg-gradient-to-br from-teal/16 via-emerald/10 to-transparent blur-[140px]" />

        {/* Nebula Cloud 2: Electric Cyan & Sky Blue (Top-Right Planetary Light) */}
        <div className="absolute top-[2rem] right-[0%] h-[680px] w-[680px] rounded-full bg-gradient-to-bl from-cyan/15 via-sky/10 to-transparent blur-[150px]" />

        {/* Nebula Cloud 3: Celestial Bio-Indigo & Violet Accent (Rich Cosmic Dimension) */}
        <div className="absolute top-[16rem] left-[32%] h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-indigo-500/10 via-purple-500/6 to-teal/10 blur-[160px]" />

        {/* Nebula Cloud 4: Deep Teal Atmospheric Foundation (Bottom Core) */}
        <div className="absolute bottom-[-10rem] left-[20%] h-[750px] w-[750px] rounded-full bg-gradient-to-t from-teal/12 via-cyan/8 to-transparent blur-[160px]" />

        {/* Organic Nebula Constellation Matrix (Dual-frequency glowing particles with radial mask) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(13, 148, 136, 0.45) 1px, transparent 1px), radial-gradient(circle, rgba(14, 165, 233, 0.4) 1.5px, transparent 1.5px)`,
            backgroundSize: '36px 36px, 72px 72px',
            backgroundPosition: '0 0, 18px 18px',
            maskImage: 'radial-gradient(ellipse 90% 80% at 50% 25%, black 25%, rgba(0,0,0,0.6) 65%, transparent 95%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 25%, black 25%, rgba(0,0,0,0.6) 65%, transparent 95%)',
          }}
        />

        {/* Floating Ambient Bio-Luminescent Stars & Constellation Nodes */}
        <svg className="absolute inset-0 size-full opacity-70" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle constellation trajectory lines */}
          <path d="M 280 90 L 360 140 L 490 110" stroke="rgba(13, 148, 136, 0.22)" strokeWidth="1" strokeDasharray="3 3" fill="none" />
          <path d="M 1120 70 L 1240 120 L 1380 95" stroke="rgba(14, 165, 233, 0.24)" strokeWidth="1" strokeDasharray="3 3" fill="none" />
          <path d="M 780 180 L 880 230" stroke="rgba(99, 102, 241, 0.20)" strokeWidth="1" strokeDasharray="3 3" fill="none" />

          {/* Luminous constellation anchor stars */}
          <circle cx="280" cy="90" r="2.5" fill="#0D9488" opacity="0.65" />
          <circle cx="360" cy="140" r="1.8" fill="#14B8A6" opacity="0.8" />
          <circle cx="490" cy="110" r="2.5" fill="#0EA5E9" opacity="0.85" />
          <circle cx="1120" cy="70" r="2.2" fill="#0EA5E9" opacity="0.75" />
          <circle cx="1240" cy="120" r="2.8" fill="#38BDF8" opacity="0.9" />
          <circle cx="1380" cy="95" r="2" fill="#0D9488" opacity="0.7" />
          <circle cx="780" cy="180" r="2.2" fill="#6366F1" opacity="0.75" />
          <circle cx="880" cy="230" r="2.5" fill="#0EA5E9" opacity="0.8" />
          <circle cx="620" cy="310" r="1.5" fill="#0D9488" opacity="0.55" />
          <circle cx="980" cy="380" r="1.8" fill="#14B8A6" opacity="0.65" />
        </svg>

        {/* Global Smooth Vignette for Content Framing */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_0%,transparent_50%,rgba(241,245,249,0.4)_100%)]" />
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
