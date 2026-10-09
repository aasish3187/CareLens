import type { HTMLAttributes } from 'react'

export default function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`card transition-colors duration-200 hover:border-teal ${className}`} {...props} />
}
