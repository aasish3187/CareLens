import unittest
import sys
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import init_db

class TestCareLensBackendAPI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = TestClient(app)

    def test_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["app"], "CareLens")
        self.assertTrue(data["features"]["abdm_fhir_r4"])

    def test_document_upload_and_extraction(self):
        # Create a mock PDF file upload
        fake_pdf = b"%PDF-1.4 Mock Indian Lab Report Apollo Diagnostics HbA1c 7.2% Creatinine 0.9"
        files = {"file": ("apollo_report.pdf", fake_pdf, "application/pdf")}

        response = self.client.post("/api/documents", files=files)
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertIn("document_id", data)
        self.assertEqual(data["status"], "ready")
        self.assertGreater(data["extracted_observations"], 0)

        doc_id = data["document_id"]

        # Test duplicate upload SHA-256 caching
        dup_response = self.client.post("/api/documents", files=files)
        self.assertEqual(dup_response.status_code, 201)
        dup_data = dup_response.json()
        self.assertTrue(dup_data["cached"])
        self.assertEqual(dup_data["document_id"], doc_id)

        # Test GET /api/documents/{id}/analysis (Layman mode)
        analysis_resp = self.client.get(f"/api/documents/{doc_id}/analysis?mode=layman&lang=en")
        self.assertEqual(analysis_resp.status_code, 200)
        analysis = analysis_resp.json()
        self.assertIn("summary", analysis)
        self.assertIn("observations", analysis)
        self.assertIn("medications", analysis)
        self.assertTrue(analysis["summary"]["is_grounded"])
        self.assertIn("[fact_1]", analysis["summary"]["summary_text"])

        # Test GET /api/documents/{id}/analysis (Clinical SBAR mode)
        clinical_resp = self.client.get(f"/api/documents/{doc_id}/analysis?mode=clinical&lang=en")
        self.assertEqual(clinical_resp.status_code, 200)
        clinical = clinical_resp.json()
        self.assertEqual(clinical["summary"]["format"], "SBAR")
        self.assertIn("SITUATION", clinical["summary"]["summary_text"])

        # Test Telugu translation query
        te_resp = self.client.get(f"/api/documents/{doc_id}/analysis?mode=layman&lang=te")
        self.assertEqual(te_resp.status_code, 200)
        te_data = te_resp.json()
        self.assertEqual(te_data["summary"]["lang"], "te")
        self.assertIn("7.2", te_data["summary"]["summary_text"])

        # Test NRCeS FHIR R4 Bundle Export
        fhir_resp = self.client.get(f"/api/fhir/export/{doc_id}")
        self.assertEqual(fhir_resp.status_code, 200)
        bundle = fhir_resp.json()
        self.assertEqual(bundle["resourceType"], "Bundle")
        self.assertEqual(bundle["type"], "document")
        self.assertGreater(len(bundle["entry"]), 0)

    def test_patients_organ_status_and_polypharmacy(self):
        # List documents to get person_id
        docs_resp = self.client.get("/api/documents")
        self.assertEqual(docs_resp.status_code, 200)
        docs = docs_resp.json()
        self.assertGreater(len(docs), 0)
        person_id = docs[0]["person_id"]

        # Test 3D Body Twin Organ Status
        organ_resp = self.client.get(f"/api/patients/{person_id}/organ-status")
        self.assertEqual(organ_resp.status_code, 200)
        organs = organ_resp.json()["organ_systems"]
        self.assertIn("endocrine", organs)
        self.assertIn("cardiovascular", organs)
        self.assertIn("renal", organs)
        self.assertIn("respiratory", organs)
        self.assertIn("hepatic", organs)
        self.assertIn("neurological", organs)

        # Test Polypharmacy Collision Check
        poly_resp = self.client.get(f"/api/patients/{person_id}/polypharmacy")
        self.assertEqual(poly_resp.status_code, 200)
        poly = poly_resp.json()
        self.assertIn("conflicts", poly)

        # Test Patient Timeline
        timeline_resp = self.client.get(f"/api/patients/{person_id}/timeline")
        self.assertEqual(timeline_resp.status_code, 200)
        timeline = timeline_resp.json()
        self.assertGreater(len(timeline["timeline"]), 0)

        # Test Mock ABHA Card Generation & Base64 QR Code
        abha_resp = self.client.get(f"/api/abha/{person_id}/card")
        self.assertEqual(abha_resp.status_code, 200)
        card = abha_resp.json()
        self.assertIn("91-2345-6789-0123", card["abha_number"])
        self.assertTrue(card["qr_code_base64"].startswith("data:image/png;base64,"))
        self.assertEqual(card["consent_status"], "Active")

if __name__ == "__main__":
    unittest.main()
