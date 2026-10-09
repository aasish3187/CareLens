import type { Status } from './types'

export type EventType = 'lab' | 'rx' | 'discharge' | 'visit'

export type TimelineEvent = {
  id: string
  date: string
  type: EventType
  titleKey: string
  detail: string
  facility: string
  status?: Status
  trendKey?: string
  trendDir?: 'down' | 'up'
  docId?: string
}

export const timeline: { monthKey: string; events: TimelineEvent[] }[] = [
  {
    monthKey: 'month.oct',
    events: [
      {
        id: 'e1',
        date: '14 Oct',
        type: 'rx',
        titleKey: 'ev.rxFortis',
        detail: 'Glycomet-GP 1 · Telma 40',
        facility: 'Fortis Hospital · Dr. Ramesh Iyer',
        docId: 'fortis',
      },
      {
        id: 'e2',
        date: '12 Oct',
        type: 'lab',
        titleKey: 'ev.hba1c',
        detail: 'HbA1c 7.2% · FBS 142 mg/dL · Creatinine 0.9 mg/dL',
        facility: 'Apollo Diagnostics, Hyderabad',
        status: 'elevated',
        trendKey: 'trend.hba1cDown',
        trendDir: 'down',
        docId: 'apollo',
      },
      {
        id: 'e3',
        date: '05 Oct',
        type: 'visit',
        titleKey: 'ev.endo',
        detail: 'Endocrinology · 20 min',
        facility: 'Apollo Hospitals, Jubilee Hills',
      },
    ],
  },
  {
    monthKey: 'month.sep',
    events: [
      {
        id: 'e4',
        date: '10 Sep',
        type: 'lab',
        titleKey: 'ev.lipid',
        detail: 'Total Cholesterol 185 mg/dL · ALT 28 U/L',
        facility: 'Apollo Diagnostics, Hyderabad',
        status: 'normal',
        trendKey: 'trend.cholDown',
        trendDir: 'down',
      },
      {
        id: 'e5',
        date: '02 Sep',
        type: 'visit',
        titleKey: 'ev.followup',
        detail: 'BP 124/82 mmHg',
        facility: 'Max Healthcare, Saket',
      },
    ],
  },
  {
    monthKey: 'month.aug',
    events: [
      {
        id: 'e6',
        date: '20 Aug',
        type: 'discharge',
        titleKey: 'ev.discharge',
        detail: 'T2DM — uncontrolled · 2 days',
        facility: 'Max Healthcare, Saket',
        docId: 'max',
      },
      {
        id: 'e7',
        date: '18 Aug',
        type: 'lab',
        titleKey: 'ev.hba1c',
        detail: 'HbA1c 7.6% · SpO₂ 98%',
        facility: 'Max Healthcare Lab',
        status: 'elevated',
      },
    ],
  },
]
