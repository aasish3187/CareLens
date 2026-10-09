export type Status = 'low' | 'normal' | 'elevated' | 'critical'

export type Zone = { key: Status; min: number; max: number; label?: string }

export type Segment = string | { t: string; fact?: string }
