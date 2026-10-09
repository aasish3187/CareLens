import type { Segment } from '../../data/types'
import FactChip from './FactChip'
import LockedToken from './LockedToken'

type Props = { segments: Segment[]; activeFact?: string | null; onSelect?: (fact: string) => void }

export default function Segments({ segments, activeFact, onSelect }: Props) {
  return (
    <>
      {segments.map((seg, i) => {
        if (typeof seg === 'string') return <span key={i}>{seg}</span>
        if (seg.fact && onSelect)
          return <FactChip key={i} token={seg.t} fact={seg.fact} active={activeFact === seg.fact} onSelect={onSelect} />
        return <LockedToken key={i}>{seg.t}</LockedToken>
      })}
    </>
  )
}
