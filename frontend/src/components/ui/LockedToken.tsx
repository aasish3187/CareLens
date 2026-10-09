import { Lock } from 'lucide-react'

export default function LockedToken({ children }: { children: string }) {
  return (
    <span className="mx-0.5 inline-flex items-center gap-1 rounded-md bg-teal-tint px-1.5 py-px align-baseline font-mono text-[0.85em] font-medium text-teal-hover ring-1 ring-inset ring-teal/25">
      <Lock className="size-2.5 opacity-60" aria-hidden />
      {children}
    </span>
  )
}
