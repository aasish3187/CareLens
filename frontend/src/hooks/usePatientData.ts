import { useState, useEffect, useCallback } from 'react'
import { apiUrl } from '../config/api'

export interface PatientInfo {
  id: string
  name: string
  abha_number: string
  age: number
  gender: string
}

export interface PatientKPIs {
  health_score: number
  score_note?: string
  total_documents: number
  docs_note?: string
  total_medications: number
  meds_note?: string
  total_observations: number
  abnormal_count: number
  abnormal_note?: string
  active_prescriptions: number
}

export interface OrganSystemStatus {
  display_name: string
  status: 'normal' | 'elevated' | 'critical'
  confidence: number
  active_tests: number
  warnings: string[]
  latest_values: Array<{
    name: string
    value: string
    unit?: string
    flag?: string
    ref_range?: string
  }>
}

export interface LiveMedication {
  id: string
  fact_id: string
  brand_name: string
  generic_name?: string
  strength?: string
  frequency?: string
  timing?: string
  duration?: string
  document_id?: string
}

export interface LiveObservation {
  id: string
  fact_id: string
  name: string
  value: string
  numeric_value?: number
  unit?: string
  flag?: string
  ref_range?: string
  organ_system: string
}

export interface LiveDocumentItem {
  id: string
  filename: string
  doc_type: string
  date: string
  facility?: string
  clinician?: string
  observations_count: number
  medications_count: number
}

export interface LiveTimelineEvent {
  id: string
  date: string
  type: string
  title: string
  facility?: string
  clinician?: string
  filename?: string
  observations_count: number
  medications_count: number
  status: string
  highlights?: string[]
}

export interface PatientSummaryData {
  patient: PatientInfo
  kpis: PatientKPIs
  organ_systems: Record<string, OrganSystemStatus>
  recent_documents: LiveDocumentItem[]
  active_medications: LiveMedication[]
  recent_observations: LiveObservation[]
  conditions: Array<{ id: string; text: string; icd10?: string; organ_system?: string }>
  timeline: LiveTimelineEvent[]
}

const defaultSummary: PatientSummaryData = {
  patient: {
    id: 'default',
    name: 'Arjun Verma',
    abha_number: '91-2345-6789-0123',
    age: 42,
    gender: 'male',
  },
  kpis: {
    health_score: 92,
    total_documents: 3,
    total_medications: 4,
    total_observations: 14,
    abnormal_count: 1,
    active_prescriptions: 2,
  },
  organ_systems: {
    cardiovascular: { display_name: 'Cardiovascular (Heart & Vessels)', status: 'normal', confidence: 0.98, active_tests: 4, warnings: [], latest_values: [] },
    endocrine: { display_name: 'Endocrine & Blood Sugar', status: 'elevated', confidence: 0.99, active_tests: 3, warnings: ['HbA1c: 7.2 % (HIGH)'], latest_values: [] },
    respiratory: { display_name: 'Respiratory System (Lungs)', status: 'normal', confidence: 0.96, active_tests: 2, warnings: [], latest_values: [] },
    renal: { display_name: 'Renal System (Kidneys)', status: 'normal', confidence: 0.98, active_tests: 3, warnings: [], latest_values: [] },
    hepatic: { display_name: 'Hepatic System (Liver)', status: 'normal', confidence: 0.97, active_tests: 2, warnings: [], latest_values: [] },
    neurological: { display_name: 'Neurological (Brain & Vitals)', status: 'normal', confidence: 0.96, active_tests: 1, warnings: [], latest_values: [] },
  },
  recent_documents: [],
  active_medications: [],
  recent_observations: [],
  conditions: [],
  timeline: [],
}

export function usePatientData() {
  const [data, setData] = useState<PatientSummaryData>(defaultSummary)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/api/patients/summary'), { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setData((prev) => ({
          ...prev,
          ...json,
          organ_systems: { ...prev.organ_systems, ...(json.organ_systems || {}) },
          kpis: { ...prev.kpis, ...(json.kpis || {}) },
        }))
        setError(null)
      }
    } catch (err: any) {
      console.warn('Live patient data fetch warning:', err)
      setError(err?.message || 'Failed to fetch live patient summary')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    // Poll every 5 seconds for live document updates
    const interval = setInterval(fetchData, 5000)
    const handleFocus = () => fetchData()
    const handleUpdate = () => fetchData()

    window.addEventListener('focus', handleFocus)
    window.addEventListener('patient-data-updated', handleUpdate)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('patient-data-updated', handleUpdate)
    }
  }, [fetchData])

  return { data, loading, error, refresh: fetchData }
}

export function notifyPatientDataUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('patient-data-updated'))
  }
}
