import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

NRCES_PROFILE_BASE = "https://nrces.in/ndhm/fhir/r4/StructureDefinition"

PROFILE_MAP = {
    "prescription": f"{NRCES_PROFILE_BASE}/PrescriptionRecord",
    "prescription_record": f"{NRCES_PROFILE_BASE}/PrescriptionRecord",
    "lab_report": f"{NRCES_PROFILE_BASE}/DiagnosticReportRecord",
    "diagnostic_report": f"{NRCES_PROFILE_BASE}/DiagnosticReportRecord",
    "discharge_summary": f"{NRCES_PROFILE_BASE}/DischargeSummaryRecord"
}

LOINC_DOCTYPE_MAP = {
    "prescription": ("57833-6", "Prescription for medication"),
    "prescription_record": ("57833-6", "Prescription for medication"),
    "lab_report": ("11502-2", "Laboratory report"),
    "diagnostic_report": ("11502-2", "Laboratory report"),
    "discharge_summary": ("28655-9", "Physician Discharge summary")
}

class ABDMFHIRBundleBuilder:
    """
    Standardized ABDM FHIR R4 Document Bundle generator.
    Conforms strictly to National Resource Centre for EHR Standards (NRCeS) profiles:
    - PrescriptionRecord
    - DiagnosticReportRecord
    - DischargeSummaryRecord
    """

    @classmethod
    def build_bundle(
        cls,
        doc_type: str,
        patient_info: Dict[str, Any],
        observations: Optional[List[Dict[str, Any]]] = None,
        medications: Optional[List[Dict[str, Any]]] = None,
        conditions: Optional[List[Dict[str, Any]]] = None,
        facility_name: str = "Apollo Diagnostics, Hyderabad",
        clinician_name: str = "Dr. K. S. Rao, MD",
        doc_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Builds a complete, valid NRCeS ABDM FHIR R4 Document Bundle.
        """
        norm_doc_type = doc_type.lower().replace(" ", "_")
        if norm_doc_type not in PROFILE_MAP:
            norm_doc_type = "lab_report"

        bundle_id = str(uuid.uuid4())
        composition_id = str(uuid.uuid4())
        patient_id = str(patient_info.get("id") or uuid.uuid4())
        practitioner_id = str(uuid.uuid4())
        organization_id = str(uuid.uuid4())

        now_iso = datetime.now(timezone.utc).isoformat()
        record_date = doc_date or now_iso[:10]

        loinc_code, loinc_display = LOINC_DOCTYPE_MAP.get(norm_doc_type, ("11502-2", "Laboratory report"))
        profile_url = PROFILE_MAP[norm_doc_type]

        entries: List[Dict[str, Any]] = []
        section_entries: List[Dict[str, str]] = []

        # 1. Patient Resource
        patient_resource = {
            "resourceType": "Patient",
            "id": patient_id,
            "meta": {
                "profile": [f"{NRCES_PROFILE_BASE}/Patient"]
            },
            "identifier": [
                {
                    "type": {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                                "code": "MR",
                                "display": "Medical record number"
                            }
                        ]
                    },
                    "system": "https://healthid.ndhm.gov.in",
                    "value": patient_info.get("abha_number", "91-2345-6789-0123 (MOCK)")
                }
            ],
            "name": [
                {
                    "use": "official",
                    "text": patient_info.get("display_name", "Arjun Verma")
                }
            ],
            "gender": patient_info.get("sex", "male").lower(),
            "birthDate": str(patient_info.get("dob", "1982-08-14"))
        }

        # 2. Practitioner Resource
        practitioner_resource = {
            "resourceType": "Practitioner",
            "id": practitioner_id,
            "meta": {
                "profile": [f"{NRCES_PROFILE_BASE}/Practitioner"]
            },
            "identifier": [
                {
                    "system": "https://doctor.ndhm.gov.in",
                    "value": f"MOCK-REG-{patient_id[:8]}"
                }
            ],
            "name": [
                {
                    "text": clinician_name
                }
            ]
        }

        # 3. Organization Resource
        organization_resource = {
            "resourceType": "Organization",
            "id": organization_id,
            "meta": {
                "profile": [f"{NRCES_PROFILE_BASE}/Organization"]
            },
            "identifier": [
                {
                    "system": "https://facility.ndhm.gov.in",
                    "value": f"IN-FACILITY-{patient_id[:6]}"
                }
            ],
            "name": facility_name
        }

        # 4. Clinical Payload Resources
        # Diagnostic Observations
        if observations:
            diag_report_id = str(uuid.uuid4())
            obs_refs = []

            for obs in observations:
                obs_id = str(obs.get("id") or uuid.uuid4())
                obs_refs.append({"reference": f"urn:uuid:{obs_id}"})
                section_entries.append({"reference": f"urn:uuid:{obs_id}"})

                val_num = obs.get("numeric_value")
                val_text = obs.get("value_text") or obs.get("value") or ""
                unit = obs.get("unit") or ""

                flag = obs.get("flag", "normal").lower()
                interpretation_code = "N"
                if flag in ("high", "elevated"):
                    interpretation_code = "H"
                elif flag in ("critical", "panic"):
                    interpretation_code = "HH"
                elif flag in ("low",):
                    interpretation_code = "L"

                obs_resource = {
                    "resourceType": "Observation",
                    "id": obs_id,
                    "meta": {
                        "profile": [f"{NRCES_PROFILE_BASE}/Observation"]
                    },
                    "status": "final",
                    "code": {
                        "coding": [
                            {
                                "system": "http://loinc.org",
                                "code": obs.get("loinc_code") or "4548-4",
                                "display": obs.get("name", "Diagnostic Observation")
                            }
                        ],
                        "text": obs.get("name", "Diagnostic Observation")
                    },
                    "subject": {
                        "reference": f"urn:uuid:{patient_id}"
                    },
                    "effectiveDateTime": record_date,
                    "interpretation": [
                        {
                            "coding": [
                                {
                                    "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                                    "code": interpretation_code,
                                    "display": flag.title()
                                }
                            ]
                        }
                    ],
                    "referenceRange": [
                        {
                            "text": obs.get("ref_range") or "Refer to standard ICMR/NABL reference limits"
                        }
                    ]
                }

                if val_num is not None:
                    obs_resource["valueQuantity"] = {
                        "value": float(val_num),
                        "unit": unit,
                        "system": "http://unitsofmeasure.org",
                        "code": unit
                    }
                else:
                    obs_resource["valueString"] = str(val_text)

                entries.append({
                    "fullUrl": f"urn:uuid:{obs_id}",
                    "resource": obs_resource
                })

            diag_report_resource = {
                "resourceType": "DiagnosticReport",
                "id": diag_report_id,
                "meta": {
                    "profile": [f"{NRCES_PROFILE_BASE}/DiagnosticReportLab"]
                },
                "status": "final",
                "code": {
                    "coding": [
                        {
                            "system": "http://loinc.org",
                            "code": loinc_code,
                            "display": loinc_display
                        }
                    ],
                    "text": loinc_display
                },
                "subject": {
                    "reference": f"urn:uuid:{patient_id}"
                },
                "performer": [
                    {
                        "reference": f"urn:uuid:{practitioner_id}",
                        "display": clinician_name
                    }
                ],
                "result": obs_refs
            }
            entries.append({
                "fullUrl": f"urn:uuid:{diag_report_id}",
                "resource": diag_report_resource
            })
            section_entries.append({"reference": f"urn:uuid:{diag_report_id}"})

        # Prescription MedicationRequests
        if medications:
            for med in medications:
                med_id = str(med.get("id") or uuid.uuid4())
                section_entries.append({"reference": f"urn:uuid:{med_id}"})

                brand = med.get("brand_name", "Medication")
                generic = med.get("generic_name", brand)
                freq = med.get("frequency", "1-0-0")
                timing = med.get("timing", "after_food")
                duration = med.get("duration", "30 days")

                med_resource = {
                    "resourceType": "MedicationRequest",
                    "id": med_id,
                    "meta": {
                        "profile": [f"{NRCES_PROFILE_BASE}/MedicationRequest"]
                    },
                    "status": "active",
                    "intent": "order",
                    "medicationCodeableConcept": {
                        "text": f"{brand} ({generic})",
                        "coding": [
                            {
                                "system": "https://projecteka.github.io/kyc/generic_medicine",
                                "code": brand,
                                "display": generic
                            }
                        ]
                    },
                    "subject": {
                        "reference": f"urn:uuid:{patient_id}"
                    },
                    "dosageInstruction": [
                        {
                            "text": f"Frequency: {freq}, Timing: {timing}, Duration: {duration}",
                            "timing": {
                                "code": {
                                    "text": timing
                                }
                            }
                        }
                    ]
                }
                entries.append({
                    "fullUrl": f"urn:uuid:{med_id}",
                    "resource": med_resource
                })

        # Discharge Conditions
        if conditions:
            for cond in conditions:
                cond_id = str(cond.get("id") or uuid.uuid4())
                section_entries.append({"reference": f"urn:uuid:{cond_id}"})
                icd = cond.get("icd10") or "R69"
                text = cond.get("text", "Clinical Condition")

                cond_resource = {
                    "resourceType": "Condition",
                    "id": cond_id,
                    "meta": {
                        "profile": [f"{NRCES_PROFILE_BASE}/Condition"]
                    },
                    "clinicalStatus": {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                                "code": "active"
                            }
                        ]
                    },
                    "code": {
                        "coding": [
                            {
                                "system": "http://hl7.org/fhir/sid/icd-10",
                                "code": icd,
                                "display": text
                            }
                        ],
                        "text": text
                    },
                    "subject": {
                        "reference": f"urn:uuid:{patient_id}"
                    }
                }
                entries.append({
                    "fullUrl": f"urn:uuid:{cond_id}",
                    "resource": cond_resource
                })

        # 5. Composition Resource (Placed first per FHIR Document Bundle spec)
        composition_resource = {
            "resourceType": "Composition",
            "id": composition_id,
            "meta": {
                "profile": [profile_url]
            },
            "status": "final",
            "type": {
                "coding": [
                    {
                        "system": "http://loinc.org",
                        "code": loinc_code,
                        "display": loinc_display
                    }
                ],
                "text": loinc_display
            },
            "subject": {
                "reference": f"urn:uuid:{patient_id}",
                "display": patient_info.get("display_name", "Arjun Verma")
            },
            "date": now_iso,
            "author": [
                {
                    "reference": f"urn:uuid:{practitioner_id}",
                    "display": clinician_name
                }
            ],
            "title": f"CareLens ABDM {loinc_display}",
            "custodian": {
                "reference": f"urn:uuid:{organization_id}",
                "display": facility_name
            },
            "section": [
                {
                    "title": "Clinical Summary Section",
                    "code": {
                        "coding": [
                            {
                                "system": "http://loinc.org",
                                "code": loinc_code,
                                "display": loinc_display
                            }
                        ]
                    },
                    "entry": section_entries
                }
            ]
        }

        # Build bundle entries in strict FHIR order: Composition, Patient, Practitioner, Organization, clinical resources
        final_entries = [
            {"fullUrl": f"urn:uuid:{composition_id}", "resource": composition_resource},
            {"fullUrl": f"urn:uuid:{patient_id}", "resource": patient_resource},
            {"fullUrl": f"urn:uuid:{practitioner_id}", "resource": practitioner_resource},
            {"fullUrl": f"urn:uuid:{organization_id}", "resource": organization_resource}
        ] + entries

        return {
            "resourceType": "Bundle",
            "id": bundle_id,
            "meta": {
                "versionId": "1",
                "lastUpdated": now_iso,
                "profile": [f"{NRCES_PROFILE_BASE}/DocumentBundle"]
            },
            "identifier": {
                "system": "https://healthid.ndhm.gov.in",
                "value": bundle_id
            },
            "type": "document",
            "timestamp": now_iso,
            "entry": final_entries
        }

bundle_builder = ABDMFHIRBundleBuilder()
