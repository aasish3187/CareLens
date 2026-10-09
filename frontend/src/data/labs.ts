import type { Status, Zone } from './types'

export type Lab = {
  id: string
  name: string
  value: number
  display: string
  unit: string
  status: Status
  zones: Zone[]
  docId: string
  fact: string
}

export const labs: Record<string, Lab> = {
  hba1c: {
    id: 'hba1c',
    name: 'HbA1c',
    value: 7.2,
    display: '7.2',
    unit: '%',
    status: 'elevated',
    zones: [
      { key: 'low', min: 3, max: 4, label: '<4.0' },
      { key: 'normal', min: 4, max: 5.7, label: '4.0–5.6' },
      { key: 'elevated', min: 5.7, max: 6.5, label: '5.7–6.4' },
      { key: 'critical', min: 6.5, max: 10, label: '≥6.5' },
    ],
    docId: 'apollo',
    fact: 'fact_1',
  },
  fbs: {
    id: 'fbs',
    name: 'Fasting Blood Sugar',
    value: 142,
    display: '142',
    unit: 'mg/dL',
    status: 'elevated',
    zones: [
      { key: 'low', min: 40, max: 70, label: '<70' },
      { key: 'normal', min: 70, max: 100, label: '70–99' },
      { key: 'elevated', min: 100, max: 126, label: '100–125' },
      { key: 'critical', min: 126, max: 250, label: '≥126' },
    ],
    docId: 'apollo',
    fact: 'fact_2',
  },
  creatinine: {
    id: 'creatinine',
    name: 'Serum Creatinine',
    value: 0.9,
    display: '0.9',
    unit: 'mg/dL',
    status: 'normal',
    zones: [
      { key: 'low', min: 0.3, max: 0.7, label: '<0.7' },
      { key: 'normal', min: 0.7, max: 1.3, label: '0.7–1.3' },
      { key: 'elevated', min: 1.3, max: 2, label: '1.3–2.0' },
      { key: 'critical', min: 2, max: 5, label: '>2.0' },
    ],
    docId: 'apollo',
    fact: 'fact_3',
  },
  cholesterol: {
    id: 'cholesterol',
    name: 'Total Cholesterol',
    value: 185,
    display: '185',
    unit: 'mg/dL',
    status: 'normal',
    zones: [
      { key: 'low', min: 80, max: 125, label: '<125' },
      { key: 'normal', min: 125, max: 200, label: '125–199' },
      { key: 'elevated', min: 200, max: 240, label: '200–239' },
      { key: 'critical', min: 240, max: 320, label: '≥240' },
    ],
    docId: 'apollo',
    fact: 'fact_4',
  },
  alt: {
    id: 'alt',
    name: 'ALT (SGPT)',
    value: 28,
    display: '28',
    unit: 'U/L',
    status: 'normal',
    zones: [
      { key: 'low', min: 0, max: 7, label: '<7' },
      { key: 'normal', min: 7, max: 56, label: '7–56' },
      { key: 'elevated', min: 56, max: 120, label: '56–120' },
      { key: 'critical', min: 120, max: 300, label: '>120' },
    ],
    docId: 'apollo',
    fact: 'fact_5',
  },
  b12: {
    id: 'b12',
    name: 'Vitamin B12',
    value: 412,
    display: '412',
    unit: 'pg/mL',
    status: 'normal',
    zones: [
      { key: 'critical', min: 50, max: 150, label: '<150' },
      { key: 'low', min: 150, max: 200, label: '150–199' },
      { key: 'normal', min: 200, max: 900, label: '200–900' },
      { key: 'elevated', min: 900, max: 1500, label: '>900' },
    ],
    docId: 'apollo',
    fact: 'fact_6',
  },
  spo2: {
    id: 'spo2',
    name: 'SpO₂',
    value: 98,
    display: '98',
    unit: '%',
    status: 'normal',
    zones: [
      { key: 'critical', min: 80, max: 90, label: '<90' },
      { key: 'low', min: 90, max: 95, label: '90–94' },
      { key: 'normal', min: 95, max: 100.01, label: '95–100' },
    ],
    docId: 'max',
    fact: 'fact_3',
  },
  bp: {
    id: 'bp',
    name: 'Systolic BP',
    value: 120,
    display: '120/80',
    unit: 'mmHg',
    status: 'normal',
    zones: [
      { key: 'low', min: 70, max: 90, label: '<90' },
      { key: 'normal', min: 90, max: 130, label: '90–129' },
      { key: 'elevated', min: 130, max: 140, label: '130–139' },
      { key: 'critical', min: 140, max: 190, label: '≥140' },
    ],
    docId: 'max',
    fact: 'fact_4',
  },
  joint_mobility: {
    id: 'joint_mobility',
    name: 'Joint Mobility & Reflexes',
    value: 100,
    display: '100',
    unit: '%',
    status: 'normal',
    zones: [
      { key: 'critical', min: 0, max: 50, label: '<50%' },
      { key: 'low', min: 50, max: 75, label: '50–74%' },
      { key: 'normal', min: 75, max: 100, label: '75–100%' },
    ],
    docId: 'apollo',
    fact: 'fact_6',
  },
}
