import { useEffect, useState } from 'react'

interface Props {
  value: number | string
  duration?: number
  suffix?: string
  className?: string
}

export default function AnimatedCounter({ value, duration = 1200, suffix = '', className = '' }: Props) {
  // If the value is not purely numeric (e.g. "120/80"), display it directly
  const numericVal = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]+/g, ''))
  const isNumeric = !isNaN(numericVal) && !String(value).includes('/')

  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isNumeric) return

    let startTimestamp: number | null = null
    const startVal = 0
    const endVal = numericVal

    let animId: number

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)

      // Smooth ease-out cubic curve
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(startVal + (endVal - startVal) * easeProgress)

      setCount(current)

      if (progress < 1) {
        animId = requestAnimationFrame(step)
      } else {
        setCount(endVal)
      }
    }

    animId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animId)
  }, [numericVal, duration, isNumeric])

  if (!isNumeric) {
    return <span className={className}>{value}</span>
  }

  return (
    <span className={className}>
      {count}
      {suffix}
    </span>
  )
}
