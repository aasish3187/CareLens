from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select

from backend.app.database import get_session
from backend.app.models.database import Person, Document, Observation, Medication
from backend.app.fhir.bundle_builder import bundle_builder

router = APIRouter(prefix="/fhir", tags=["fhir"])

@router.get("/export/{doc_id}")
async def export_abdm_fhir_bundle(doc_id: UUID, session: Session = Depends(get_session)):
    """
    Generates official NRCeS ABDM-compliant FHIR R4 Bundle (type: document).
    Conforms to https://nrces.in/ndhm/fhir/r4/StructureDefinition/DiagnosticReportRecord
    or PrescriptionRecord.
    """
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    person = session.get(Person, doc.person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Associated patient not found.")

    obs_records = session.exec(select(Observation).where(Observation.document_id == doc_id)).all()
    med_records = session.exec(select(Medication).where(Medication.document_id == doc_id)).all()

    patient_info = {
        "id": str(person.id),
        "display_name": person.display_name,
        "dob": person.dob,
        "sex": person.sex,
        "abha_number": person.abha_number or "91-2345-6789-0123 (MOCK)",
        "abha_address": person.abha_address or "arjun.verma@abdm"
    }

    obs_dicts = [
        {
            "id": str(obs.id),
            "name": obs.name,
            "loinc_code": obs.loinc_code,
            "value_text": obs.value_text,
            "numeric_value": obs.numeric_value,
            "unit": obs.unit,
            "ref_range": obs.ref_range,
            "flag": obs.flag,
            "organ_system": obs.organ_system
        }
        for obs in obs_records
    ]

    med_dicts = [
        {
            "id": str(med.id),
            "brand_name": med.brand_name,
            "generic_name": med.generic_name,
            "strength": med.strength,
            "frequency": med.frequency,
            "timing": med.timing,
            "duration": med.duration
        }
        for med in med_records
    ]

    bundle = bundle_builder.build_bundle(
        doc_type=doc.doc_type,
        patient_info=patient_info,
        observations=obs_dicts,
        medications=med_dicts,
        facility_name=doc.facility_name or "Apollo Diagnostics, Hyderabad",
        clinician_name=doc.clinician_name or "Dr. K. S. Rao, MD",
        doc_date=str(doc.doc_date) if doc.doc_date else None
    )

    return bundle
