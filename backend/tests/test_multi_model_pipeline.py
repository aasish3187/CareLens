import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from backend.app.main import app
from backend.app.database import engine
from backend.app.models.database import Person, Document, Observation, Medication
from backend.app.pipeline.extract_vlm import parse_gemini_response, _clean_json_str, _normalize_date_str

client = TestClient(app)

def test_clean_json_and_normalize_date():
    raw_markdown = '```json\n{"doc_type": "prescription", "document_date": "20-09-2022"}\n```'
    cleaned = _clean_json_str(raw_markdown)
    assert '{"doc_type": "prescription"' in cleaned
    assert _normalize_date_str("20-09-2022") == "2022-09-20"
    assert _normalize_date_str("2026-10-09") == "2026-10-09"

def test_parse_gemini_response_flexible_keys():
    flexible_rx = """{
        "patient_info": {
            "name": "ASHVIKA",
            "age": "4 yr",
            "gender": "Female",
            "date": "20-09-2022"
        },
        "doctor_notes": {
            "diagnosis": "URTI (Upper Respiratory Tract Infection)",
            "vital_signs_and_examination": [
                "RR - 22/min (Respiratory Rate)"
            ]
        },
        "medicines": [
            {
                "name": "Syp CALPOL (250/5)",
                "dosage": "4 mL",
                "frequency": "Q6H (Every 6 hours)",
                "duration": "3 days"
            },
            {
                "name": "Syp DELCON",
                "dosage": "3 mL",
                "frequency": "TDS (Three times a day)",
                "duration": "5 days"
            }
        ]
    }"""
    res = parse_gemini_response(flexible_rx)
    assert res.patient_name == "ASHVIKA"
    assert res.patient_age == 4
    assert res.patient_gender == "female"
    assert res.document_date == "2022-09-20"
    assert len(res.medications) == 2
    assert res.medications[0].brand_name == "Syp CALPOL (250/5)"
    assert res.medications[0].dose == "4 mL"
    assert len(res.diagnoses) == 1
    assert "URTI" in res.diagnoses[0].text
    assert len(res.observations) == 1
    assert "Vital" in res.observations[0].name

def test_patient_summary_endpoints():
    response = client.get("/api/patients/summary")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert "health_score" in data["kpis"]
    assert "organ_systems" in data
    assert "cardiovascular" in data["organ_systems"]
    assert "respiratory" in data["organ_systems"]
    assert "active_medications" in data
    assert "timeline" in data

def test_patient_medications_and_observations_endpoints():
    med_resp = client.get("/api/patients/medications")
    assert med_resp.status_code == 200
    assert isinstance(med_resp.json(), list)

    obs_resp = client.get("/api/patients/observations")
    assert obs_resp.status_code == 200
    assert isinstance(obs_resp.json(), list)

    tl_resp = client.get("/api/patients/timeline")
    assert tl_resp.status_code == 200
    assert isinstance(tl_resp.json(), list)
