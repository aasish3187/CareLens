export default function Sparkline({ data, color = '#0D9488' }: { data: { date: string; value: number }[]; color?: string }) {
  const w = 240
  const h = 56
  const pad = 8
  const vals = data.map((d) => d.value)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const span = max - min || 1
  const pts = data.map((d, i) => ({
    x: pad + (i * (w - pad * 2)) / Math.max(1, data.length - 1),
    y: 18 + (1 - (d.value - min) / span) * (h - 26),
    ...d,
  }))
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h + 14}`} className="w-full" role="img" aria-label={data.map((d) => `${d.date} ${d.value}`).join(', ')}>
      <defs>
        <linearGradient id={`spark-${color.slice(1)}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${pts[pts.length - 1].x},${h} L${pts[0].x},${h} Z`} fill={`url(#spark-${color.slice(1)})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={i === pts.length - 1 ? 4 : 3} fill="white" stroke={color} strokeWidth="2" />
          <text x={p.x} y={p.y - 8} textAnchor="middle" className="fill-heading font-mono" fontSize="10" fontWeight="600">
            {p.value}
          </text>
          <text x={p.x} y={h + 12} textAnchor="middle" className="fill-muted" fontSize="10">
            {p.date}
          </text>
        </g>
      ))}
    </svg>
  )
}
