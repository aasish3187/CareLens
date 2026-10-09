type Props = { token: string; fact: string; active: boolean; onSelect: (fact: string) => void }

export default function FactChip({ token, fact, active, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(fact)}
      aria-pressed={active}
      className={`mx-0.5 inline-flex items-baseline gap-1 rounded-md px-1.5 py-px align-baseline font-mono text-[0.85em] font-medium ring-1 ring-inset transition-colors ${
        active
          ? 'bg-teal text-white ring-teal shadow-sm shadow-teal/30'
          : 'bg-cyan-tint text-sky-800 ring-cyan/30 hover:bg-cyan/10'
      }`}
    >
      {token}
      <sup className={`text-[9px] font-semibold ${active ? 'text-teal-50' : 'text-cyan'}`}>[{fact.replace('fact_', '')}]</sup>
    </button>
  )
}
