from uuid import UUID
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select

from backend.app.database import get_session
from backend.app.models.database import Person, Document, Observation, Medication, Condition
from backend.app.models.extraction import ExtractedMedication, BoundingBox
from backend.app.pipeline.polypharmacy import detect_polypharmacy_conflicts

router = APIRouter(prefix="/patients", tags=["patients"])

@router.get("/")
@router.get("")
async def list_patients(session: Session = Depends(get_session)):
    """Lists all registered patients."""
    return session.exec(select(Person)).all()

@router.get("/current")
async def get_current_patient(session: Session = Depends(get_session)):
    """Returns the primary active patient profile."""
    person = session.exec(select(Person)).first()
    if not person:
        person = Person(display_name="Arjun Verma")
        session.add(person)
        session.commit()
        session.refresh(person)
    return person

@router.get("/summary")
async def get_patient_summary(session: Session = Depends(get_session)):
    """Returns aggregated live patient health profile and KPIs across all uploaded documents."""
    person = session.exec(select(Person)).first()
    if not person:
        person = Person(display_name="Arjun Verma")
        session.add(person)
        session.commit()
        session.refresh(person)

    docs = session.exec(select(Document).where(Document.person_id == person.id).order_by(Document.created_at.desc())).all()
    observations = session.exec(select(Observation).where(Observation.person_id == person.id).order_by(Observation.created_at.desc())).all()
    medications = session.exec(select(Medication).where(Medication.person_id == person.id).order_by(Medication.created_at.desc())).all()
    conditions = session.exec(select(Condition).where(Condition.person_id == person.id).order_by(Condition.created_at.desc())).all()

    abnormal_obs = [o for o in observations if o.flag in ["high", "low", "critical"]]
    abnormal_count = len(abnormal_obs)

    # Health score: 100 base, deduction for abnormal observations
    health_score = max(55, min(98, 100 - (abnormal_count * 7))) if observations else 94

    # 6 organ systems aggregation
    systems = {
        "cardiovascular": {"display_name": "Cardiovascular (Heart & Vessels)", "status": "normal", "confidence": 0.98, "active_tests": 0, "warnings": [], "latest_values": []},
        "endocrine": {"display_name": "Endocrine & Blood Sugar", "status": "normal", "confidence": 0.99, "active_tests": 0, "warnings": [], "latest_values": []},
        "respiratory": {"display_name": "Respiratory System (Lungs)", "status": "normal", "confidence": 0.96, "active_tests": 0, "warnings": [], "latest_values": []},
        "renal": {"display_name": "Renal System (Kidneys)", "status": "normal", "confidence": 0.98, "active_tests": 0, "warnings": [], "latest_values": []},
        "hepatic": {"display_name": "Hepatic System (Liver)", "status": "normal", "confidence": 0.97, "active_tests": 0, "warnings": [], "latest_values": []},
        "neurological": {"display_name": "Neurological (Brain & Vitals)", "status": "normal", "confidence": 0.96, "active_tests": 0, "warnings": [], "latest_values": []}
    }

    for obs in observations:
        sys_key = obs.organ_system if obs.organ_system in systems else "cardiovascular"
        systems[sys_key]["active_tests"] += 1
        if len(systems[sys_key]["latest_values"]) < 3:
            systems[sys_key]["latest_values"].append({
                "name": obs.name,
                "value": obs.value_text,
                "unit": obs.unit,
                "flag": obs.flag,
                "ref_range": obs.ref_range
            })
        if obs.flag in ["high", "critical", "low"]:
            if obs.flag == "critical" or systems[sys_key]["status"] != "critical":
                systems[sys_key]["status"] = "critical" if obs.flag == "critical" else "elevated"
            systems[sys_key]["warnings"].append(f"{obs.name}: {obs.value_text} ({obs.flag.upper()})")

    # Deduplicated medications
    seen_brands = set()
    unique_meds = []
    for m in medications:
        if m.brand_name.lower() not in seen_brands:
            seen_brands.add(m.brand_name.lower())
            unique_meds.append({
                "id": str(m.id),
                "fact_id": m.fact_id,
                "brand_name": m.brand_name,
                "generic_name": m.generic_name,
                "strength": m.strength,
                "frequency": m.frequency or "1-0-0",
                "timing": m.timing or "after_food",
                "duration": m.duration,
                "document_id": str(m.document_id) if m.document_id else None
            })

    # Recent timeline events
    timeline = []
    for d in docs:
        doc_obs = [o for o in observations if o.document_id == d.id]
        doc_meds = [m for m in medications if m.document_id == d.id]
        timeline.append({
            "id": str(d.id),
            "date": str(d.doc_date) if d.doc_date else "2026-10-05",
            "type": d.doc_type,
            "title": f"{d.doc_type.replace('_', ' ').title()} - {d.facility_name or 'Medical Record'}",
            "facility": d.facility_name,
            "clinician": d.clinician_name,
            "filename": d.original_filename,
            "observations_count": len(doc_obs),
            "medications_count": len(doc_meds),
            "status": d.status,
            "highlights": [o.name for o in doc_obs[:2]] + [m.brand_name for m in doc_meds[:2]]
        })

    return {
        "patient": {
            "id": str(person.id),
            "name": person.display_name,
            "abha_number": person.abha_number,
            "age": 42,
            "gender": "male"
        },
        "kpis": {
            "health_score": health_score,
            "total_documents": len(docs),
            "total_medications": len(unique_meds),
            "total_observations": len(observations),
            "abnormal_count": abnormal_count,
            "active_prescriptions": len([d for d in docs if d.doc_type == "prescription"])
        },
        "organ_systems": systems,
        "recent_documents": [
            {
                "id": str(d.id),
                "filename": d.original_filename,
                "doc_type": d.doc_type,
                "date": str(d.doc_date) if d.doc_date else "2026-10-05",
                "facility": d.facility_name,
                "clinician": d.clinician_name,
                "observations_count": len([o for o in observations if o.document_id == d.id]),
                "medications_count": len([m for m in medications if m.document_id == d.id])
            }
            for d in docs[:5]
        ],
        "active_medications": unique_meds,
        "recent_observations": [
            {
                "id": str(o.id),
                "fact_id": o.fact_id,
                "name": o.name,
                "value": o.value_text,
                "numeric_value": o.numeric_value,
                "unit": o.unit,
                "flag": o.flag,
                "ref_range": o.ref_range,
                "organ_system": o.organ_system
            }
            for o in observations[:15]
        ],
        "conditions": [
            {
                "id": str(c.id),
                "text": c.text,
                "icd10": c.icd10,
                "organ_system": c.organ_system
            }
            for c in conditions
        ],
        "timeline": timeline
    }

@router.get("/medications")
async def get_patient_medications(session: Session = Depends(get_session)):
    """Returns all extracted medications across all patient records."""
    summary = await get_patient_summary(session)
    return summary["active_medications"]

@router.get("/observations")
async def get_patient_observations(session: Session = Depends(get_session)):
    """Returns all extracted observations across all patient records."""
    summary = await get_patient_summary(session)
    return summary["recent_observations"]

@router.get("/timeline")
async def get_unified_timeline(session: Session = Depends(get_session)):
    """Returns the unified timeline across all documents."""
    summary = await get_patient_summary(session)
    return summary["timeline"]

@router.get("/{person_id}/organ-status")
async def get_organ_status(person_id: UUID, session: Session = Depends(get_session)):
    """
    Returns aggregated health status across the 6 anatomical organ systems for the 3D Body Twin:
    - Cardiovascular (Heart & Vessels)
    - Endocrine (Pancreas & Blood Sugar)
    - Respiratory (Lungs)
    - Renal (Kidneys)
    - Hepatic (Liver)
    - Neurological (Brain & Cognitive)
    """
    person = session.get(Person, person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Patient profile not found.")

    observations = session.exec(select(Observation).where(Observation.person_id == person_id)).all()

    systems = {
        "cardiovascular": {"display_name": "Cardiovascular (Heart)", "status": "normal", "confidence": 0.98, "active_tests": 0, "warnings": []},
        "endocrine": {"display_name": "Endocrine & Blood Sugar", "status": "normal", "confidence": 0.99, "active_tests": 0, "warnings": []},
        "respiratory": {"display_name": "Respiratory System (Lungs)", "status": "normal", "confidence": 0.96, "active_tests": 0, "warnings": []},
        "renal": {"display_name": "Renal System (Kidneys)", "status": "normal", "confidence": 0.98, "active_tests": 0, "warnings": []},
        "hepatic": {"display_name": "Hepatic System (Liver)", "status": "normal", "confidence": 0.97, "active_tests": 0, "warnings": []},
        "neurological": {"display_name": "Neurological (Brain)", "status": "normal", "confidence": 0.96, "active_tests": 0, "warnings": []}
    }

    for obs in observations:
        sys_key = obs.organ_system if obs.organ_system in systems else "cardiovascular"
        systems[sys_key]["active_tests"] += 1

        if obs.flag in ["high", "critical"]:
            systems[sys_key]["status"] = "elevated" if obs.flag == "high" else "critical"
            systems[sys_key]["warnings"].append(f"{obs.name}: {obs.value_text} ({obs.flag.upper()})")

    return {
        "patient": {
            "id": person.id,
            "name": person.display_name,
            "abha_number": person.abha_number
        },
        "organ_systems": systems
    }

@router.get("/{person_id}/polypharmacy")
async def get_polypharmacy_conflicts(person_id: UUID, session: Session = Depends(get_session)):
    """
    Scans all active prescriptions for the patient to detect:
    1. Duplicate salt therapy (e.g. Metformin in two different trade brands).
    2. High-risk drug interactions.
    """
    person = session.get(Person, person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Patient profile not found.")

    med_records = session.exec(select(Medication).where(Medication.person_id == person_id)).all()

    med_models = []
    for m in med_records:
        med_models.append(ExtractedMedication(
            id=m.fact_id,
            brand_name=m.brand_name,
            generic_name=m.generic_name,
            strength=m.strength,
            frequency=m.frequency,
            timing=m.timing,
            confidence=m.confidence,
            source_page=m.source_page,
            source_quote=m.brand_name,
            bounding_box=BoundingBox(ymin=100, xmin=50, ymax=120, xmax=200)
        ))

    conflicts = detect_polypharmacy_conflicts(med_models)

    return {
        "patient_id": person_id,
        "total_active_medications": len(med_records),
        "conflicts_detected": len(conflicts),
        "conflicts": conflicts
    }

@router.get("/{person_id}/timeline")
async def get_patient_timeline(person_id: UUID, session: Session = Depends(get_session)):
    """
    Returns unified chronological health journey linking prescriptions,
    lab tests, and hospital visits.
    """
    person = session.get(Person, person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Patient profile not found.")

    docs = session.exec(select(Document).where(Document.person_id == person_id).order_by(Document.created_at.desc())).all()

    timeline_items = []
    for d in docs:
        obs_count = session.exec(select(Observation).where(Observation.document_id == d.id)).all()
        med_count = session.exec(select(Medication).where(Medication.document_id == d.id)).all()

        timeline_items.append({
            "document_id": d.id,
            "filename": d.original_filename,
            "doc_type": d.doc_type,
            "date": d.doc_date,
            "facility": d.facility_name,
            "clinician": d.clinician_name,
            "extracted_observations_count": len(obs_count),
            "extracted_medications_count": len(med_count),
            "status": d.status
        })

    return {
        "patient": {
            "id": person.id,
            "name": person.display_name,
            "abha_number": person.abha_number
        },
        "timeline": timeline_items
    }
