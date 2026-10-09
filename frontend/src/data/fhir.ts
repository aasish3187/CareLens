import { patient } from './patient'
import { labs } from './labs'
import { medications } from './medications'

const loinc: Record<string, { code: string; display: string }> = {
  hba1c: { code: '4548-4', display: 'Hemoglobin A1c/Hemoglobin.total in Blood' },
  fbs: { code: '1558-6', display: 'Fasting glucose [Mass/volume] in Serum or Plasma' },
  creatinine: { code: '2160-0', display: 'Creatinine [Mass/volume] in Serum or Plasma' },
  cholesterol: { code: '2093-3', display: 'Cholesterol [Mass/volume] in Serum or Plasma' },
  alt: { code: '1742-6', display: 'Alanine aminotransferase [Enzymatic activity/volume] in Serum or Plasma' },
}

export function buildFhirBundle() {
  const patientRef = 'urn:uuid:patient-arjun-verma'
  const observations = Object.keys(loinc).map((id) => {
    const lab = labs[id]
    return {
      fullUrl: `urn:uuid:obs-${id}`,
      resource: {
        resourceType: 'Observation',
        id: `obs-${id}`,
        meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Observation'] },
        status: 'final',
        code: { coding: [{ system: 'http://loinc.org', ...loinc[id] }], text: lab.name },
        subject: { reference: patientRef },
        effectiveDateTime: '2026-10-12T09:30:00+05:30',
        valueQuantity: { value: lab.value, unit: lab.unit, system: 'http://unitsofmeasure.org' },
        interpretation: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                code: lab.status === 'normal' ? 'N' : 'H',
              },
            ],
          },
        ],
      },
    }
  })
  const meds = medications.map((m) => ({
    fullUrl: `urn:uuid:medreq-${m.id}`,
    resource: {
      resourceType: 'MedicationRequest',
      id: `medreq-${m.id}`,
      meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/MedicationRequest'] },
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: {
        text: `${m.brand} (${m.composition.map((c) => `${c.name} ${c.strength}`).join(' + ')})`,
      },
      subject: { reference: patientRef },
      authoredOn: '2026-10-14',
      requester: { display: m.prescriber },
      dosageInstruction: [{ text: m.dose }],
    },
  }))
  return {
    resourceType: 'Bundle',
    id: 'carelens-mock-bundle-001',
    meta: {
      lastUpdated: '2026-10-15T10:00:00+05:30',
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle'],
      security: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ActReason', code: 'HTEST', display: 'MOCK — test data' }],
    },
    identifier: { system: 'https://carelens.altrixlabs.example/bundle', value: 'MOCK-001' },
    type: 'document',
    timestamp: '2026-10-15T10:00:00+05:30',
    entry: [
      {
        fullUrl: patientRef,
        resource: {
          resourceType: 'Patient',
          id: 'patient-arjun-verma',
          meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient'] },
          identifier: [
            {
              type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'MR', display: 'ABHA Number' }] },
              system: 'https://healthid.ndhm.gov.in',
              value: `${patient.abhaNumber} (MOCK)`,
            },
          ],
          name: [{ text: patient.name }],
          gender: 'male',
          birthDate: '1984-03-14',
        },
      },
      ...observations,
      ...meds,
    ],
  }
}
