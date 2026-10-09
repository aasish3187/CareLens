import type { Status } from './types'

export type Organ = {
  id: string
  system: string
  status: Status
  labId: string
  extra?: { label: string; value: string; unit: string; status: Status }[]
  confidence: number
  history: { date: string; value: number }[]
  meds: string[]
  docId: string
  fact: string
  pin: { x: number; y: number }
}

export const organs: Organ[] = [
  {
    id: 'brain',
    system: 'system.nervous',
    status: 'normal',
    labId: 'b12',
    confidence: 98.7,
    history: [
      { date: 'Apr', value: 365 },
      { date: 'Aug', value: 390 },
      { date: 'Oct', value: 412 },
    ],
    meds: [],
    docId: 'apollo',
    fact: 'fact_6',
    pin: { x: 150, y: 46 },
  },
  {
    id: 'lungs',
    system: 'system.respiratory',
    status: 'normal',
    labId: 'spo2',
    confidence: 99.1,
    history: [
      { date: 'Jun', value: 97 },
      { date: 'Aug', value: 98 },
      { date: 'Oct', value: 98 },
    ],
    meds: [],
    docId: 'max',
    fact: 'fact_3',
    pin: { x: 125, y: 182 },
  },
  {
    id: 'heart',
    system: 'system.cardio',
    status: 'normal',
    labId: 'bp',
    extra: [{ label: 'Total Cholesterol', value: '185', unit: 'mg/dL', status: 'normal' }],
    confidence: 99.2,
    history: [
      { date: 'Jun', value: 134 },
      { date: 'Aug', value: 126 },
      { date: 'Oct', value: 120 },
    ],
    meds: ['telma'],
    docId: 'max',
    fact: 'fact_4',
    pin: { x: 160, y: 188 },
  },
  {
    id: 'liver',
    system: 'system.hepatic',
    status: 'normal',
    labId: 'alt',
    confidence: 99.0,
    history: [
      { date: 'Apr', value: 34 },
      { date: 'Aug', value: 31 },
      { date: 'Oct', value: 28 },
    ],
    meds: [],
    docId: 'apollo',
    fact: 'fact_5',
    pin: { x: 124, y: 236 },
  },
  {
    id: 'pancreas',
    system: 'system.endocrine',
    status: 'elevated',
    labId: 'hba1c',
    extra: [{ label: 'Fasting Blood Sugar', value: '142', unit: 'mg/dL', status: 'elevated' }],
    confidence: 99.4,
    history: [
      { date: 'Apr', value: 7.9 },
      { date: 'Aug', value: 7.6 },
      { date: 'Oct', value: 7.2 },
    ],
    meds: ['glycomet'],
    docId: 'apollo',
    fact: 'fact_1',
    pin: { x: 170, y: 259 },
  },
  {
    id: 'kidneys',
    system: 'system.renal',
    status: 'normal',
    labId: 'creatinine',
    confidence: 99.3,
    history: [
      { date: 'Apr', value: 0.9 },
      { date: 'Aug', value: 1.0 },
      { date: 'Oct', value: 0.9 },
    ],
    meds: [],
    docId: 'apollo',
    fact: 'fact_3',
    pin: { x: 181, y: 286 },
  },
  {
    id: 'knee',
    system: 'system.musculoskeletal',
    status: 'normal',
    labId: 'joint_mobility',
    confidence: 99.0,
    history: [
      { date: 'Apr', value: 100 },
      { date: 'Aug', value: 100 },
      { date: 'Oct', value: 100 },
    ],
    meds: [],
    docId: 'apollo',
    fact: 'fact_6',
    pin: { x: 180, y: 440 },
  },
]

export const organById = (id: string) => organs.find((o) => o.id === id) ?? organs[4]
