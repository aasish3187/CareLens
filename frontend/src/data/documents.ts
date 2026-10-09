export type Fact = { id: string; label: string; value: string }

export type DocMeta = {
  id: 'apollo' | 'fortis' | 'max'
  file: string
  titleKey: string
  facility: string
  date: string
  kind: 'lab' | 'rx' | 'discharge'
  pages: number
  confidence: number
  facts: Fact[]
  labs: string[]
  meds: string[]
}

export const documents: DocMeta[] = [
  {
    id: 'apollo',
    file: 'Apollo_CBC_Report.pdf',
    titleKey: 'doc.apollo',
    facility: 'Apollo Diagnostics, Hyderabad',
    date: '12 Oct 2026',
    kind: 'lab',
    pages: 2,
    confidence: 99.4,
    facts: [
      { id: 'fact_1', label: 'HbA1c', value: '7.2 %' },
      { id: 'fact_2', label: 'Fasting Blood Sugar', value: '142 mg/dL' },
      { id: 'fact_3', label: 'Serum Creatinine', value: '0.9 mg/dL' },
      { id: 'fact_4', label: 'Total Cholesterol', value: '185 mg/dL' },
      { id: 'fact_5', label: 'ALT (SGPT)', value: '28 U/L' },
      { id: 'fact_6', label: 'Vitamin B12', value: '412 pg/mL' },
    ],
    labs: ['hba1c', 'creatinine', 'fbs'],
    meds: [],
  },
  {
    id: 'fortis',
    file: 'Fortis_Handwritten_Prescription.jpg',
    titleKey: 'doc.fortis',
    facility: 'Fortis Hospital, Bannerghatta Rd',
    date: '14 Oct 2026',
    kind: 'rx',
    pages: 1,
    confidence: 97.8,
    facts: [
      { id: 'fact_1', label: 'Glycomet-GP 1', value: 'Glimepiride 1mg + Metformin 500mg' },
      { id: 'fact_2', label: 'Dosage', value: '1-0-0 before breakfast' },
      { id: 'fact_3', label: 'Telma 40', value: 'Telmisartan 40mg, 0-0-1' },
      { id: 'fact_4', label: 'Review', value: 'HbA1c after 3 months' },
    ],
    labs: [],
    meds: ['glycomet', 'telma'],
  },
  {
    id: 'max',
    file: 'Max_Discharge_Summary.pdf',
    titleKey: 'doc.max',
    facility: 'Max Super Speciality Hospital, Saket',
    date: '20 Aug 2026',
    kind: 'discharge',
    pages: 3,
    confidence: 99.1,
    facts: [
      { id: 'fact_1', label: 'Diagnosis', value: 'Type 2 Diabetes Mellitus — uncontrolled' },
      { id: 'fact_2', label: 'HbA1c', value: '7.6 %' },
      { id: 'fact_3', label: 'SpO₂', value: '98 %' },
      { id: 'fact_4', label: 'Blood Pressure', value: '120/80 mmHg' },
      { id: 'fact_5', label: 'Discharge Rx', value: 'Metformin 500mg BD' },
    ],
    labs: ['spo2', 'bp'],
    meds: [],
  },
]

export const docById = (id?: string) => documents.find((d) => d.id === id) ?? documents[0]
