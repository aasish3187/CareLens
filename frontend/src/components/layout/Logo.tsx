export default function Logo() {
  return (
    <svg viewBox="0 0 32 32" className="size-9" aria-hidden>
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0D9488" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#logoGrad)" />
      <circle cx="16" cy="16" r="7.5" fill="none" stroke="white" strokeWidth="2.2" />
      <circle cx="16" cy="16" r="2.6" fill="white" />
      <path d="M21.5 21.5 L25 25" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}
