export type Medication = {
  id: string
  brand: string
  composition: { name: string; strength: string }[]
  dose: string
  timingKey: string
  purposeKey: string
  prescriber: string
  facility: string
  since: string
  docId: string
  fact: string
  organ: string
}

export const medications: Medication[] = [
  {
    id: 'glycomet',
    brand: 'Glycomet-GP 1',
    composition: [
      { name: 'Glimepiride', strength: '1mg' },
      { name: 'Metformin', strength: '500mg' },
    ],
    dose: '1-0-0',
    timingKey: 'timing.beforeBreakfast',
    purposeKey: 'purpose.diabetes',
    prescriber: 'Dr. Ramesh Iyer',
    facility: 'Fortis Hospital',
    since: '14 Oct 2026',
    docId: 'fortis',
    fact: 'fact_1',
    organ: 'pancreas',
  },
  {
    id: 'telma',
    brand: 'Telma 40',
    composition: [{ name: 'Telmisartan', strength: '40mg' }],
    dose: '0-0-1',
    timingKey: 'timing.afterDinner',
    purposeKey: 'purpose.bp',
    prescriber: 'Dr. Ramesh Iyer',
    facility: 'Fortis Hospital',
    since: '14 Oct 2026',
    docId: 'fortis',
    fact: 'fact_3',
    organ: 'heart',
  },
]
