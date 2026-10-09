import unittest
import sys
import time
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.data_loaders.drug_normaliser import normaliser
from backend.app.pipeline.organ_mapper import organ_mapper
from backend.app.fhir.bundle_builder import bundle_builder
from backend.app.fhir.mock_abha import mock_abha_gateway

class TestDataAndFHIRArchitecture(unittest.TestCase):

    def test_indian_drug_normaliser_fuzzy_and_latency(self):
        """Test RapidFuzz matching <15ms and salt composition accuracy."""
        queries = [
            ("Glycomet GP1", "Glimepiride", "Metformin"),
            ("Augmentin625", "Amoxicillin", "Clavulanic Acid"),
            ("Pan D", "Pantoprazole", "Domperidone"),
            ("Telma H", "Telmisartan", "Hydrochlorothiazide"),
            ("Atorva-10", "Atorvastatin", None),
            ("Dolo 650", "Paracetamol", None)
        ]

        for query, salt1, salt2 in queries:
            start = time.perf_counter()
            res = normaliser.normalise(query)
            elapsed_ms = (time.perf_counter() - start) * 1000.0

            self.assertTrue(res["matched"], f"Failed to match query: {query}")
            self.assertGreaterEqual(res["match_score"], 70.0)
            self.assertLess(elapsed_ms, 15.0, f"Query {query} took {elapsed_ms}ms, exceeded 15ms limit")

            active_salts_str = " ".join(res["active_salts"])
            self.assertIn(salt1, active_salts_str)
            if salt2:
                self.assertIn(salt2, active_salts_str)

    def test_organ_mapper_clci_and_loinc(self):
        """Test deterministic mapping of tests to 6 anatomical systems for 3D Body Twin."""
        # Test by LOINC codes
        self.assertEqual(organ_mapper.classify(loinc_code="4548-4"), "endocrine")
        self.assertEqual(organ_mapper.classify(loinc_code="2160-0"), "renal")
        self.assertEqual(organ_mapper.classify(loinc_code="2093-3"), "cardiovascular")
        self.assertEqual(organ_mapper.classify(loinc_code="1742-6"), "hepatic")
        self.assertEqual(organ_mapper.classify(loinc_code="6690-2"), "respiratory")
        self.assertEqual(organ_mapper.classify(loinc_code="2132-9"), "neurological")

        # Test by test name keywords
        self.assertEqual(organ_mapper.classify(test_name="Fasting Blood Glucose"), "endocrine")
        self.assertEqual(organ_mapper.classify(test_name="Blood Urea Nitrogen"), "renal")
        self.assertEqual(organ_mapper.classify(test_name="Total Lipid Cholesterol"), "cardiovascular")
        self.assertEqual(organ_mapper.classify(test_name="SGPT / Liver Enzyme"), "hepatic")
        self.assertEqual(organ_mapper.classify(test_name="SpO2 Blood Oxygen Level"), "respiratory")
        self.assertEqual(organ_mapper.classify(test_name="Brain Vitamin B12"), "neurological")

    def test_organ_health_status_aggregation(self):
        """Test 3D Twin organ status aggregation."""
        sample_obs = [
            {"name": "HbA1c", "loinc_code": "4548-4", "value": "7.2", "unit": "%", "flag": "elevated", "organ_system": "endocrine"},
            {"name": "Creatinine", "loinc_code": "2160-0", "value": "0.9", "unit": "mg/dL", "flag": "normal", "organ_system": "renal"},
            {"name": "Cholesterol", "loinc_code": "2093-3", "value": "240", "unit": "mg/dL", "flag": "critical", "organ_system": "cardiovascular"}
        ]
        status = organ_mapper.aggregate_health_status(sample_obs)
        self.assertIn("endocrine", status)
        self.assertEqual(status["endocrine"]["status"], "elevated")
        self.assertEqual(status["cardiovascular"]["status"], "critical")
        self.assertEqual(status["renal"]["status"], "normal")
        self.assertEqual(status["respiratory"]["status"], "normal")

    def test_abdm_fhir_r4_bundle_builder(self):
        """Test NRCeS ABDM FHIR R4 Document Bundle generation."""
        patient_info = {
            "id": "11111111-2222-3333-4444-555555555555",
            "display_name": "Arjun Verma",
            "dob": "1982-08-14",
            "sex": "male",
            "abha_number": "91-2345-6789-0123 (MOCK)",
            "abha_address": "arjun.verma@abdm"
        }
        observations = [
            {"name": "HbA1c", "loinc_code": "4548-4", "value_text": "7.2 %", "numeric_value": 7.2, "unit": "%", "flag": "elevated", "ref_range": "4.0 - 5.6 %"}
        ]
        medications = [
            {"brand_name": "Glycomet-GP 1", "generic_name": "Glimepiride (1mg) + Metformin (500mg)", "frequency": "1-0-0", "timing": "before_breakfast"}
        ]

        # 1. DiagnosticReportRecord
        diag_bundle = bundle_builder.build_bundle(
            doc_type="lab_report",
            patient_info=patient_info,
            observations=observations
        )
        self.assertEqual(diag_bundle["resourceType"], "Bundle")
        self.assertEqual(diag_bundle["type"], "document")
        self.assertEqual(diag_bundle["entry"][0]["resource"]["resourceType"], "Composition")
        self.assertIn("DiagnosticReportRecord", diag_bundle["entry"][0]["resource"]["meta"]["profile"][0])
        self.assertEqual(diag_bundle["entry"][1]["resource"]["resourceType"], "Patient")

        # 2. PrescriptionRecord
        rx_bundle = bundle_builder.build_bundle(
            doc_type="prescription",
            patient_info=patient_info,
            medications=medications
        )
        self.assertIn("PrescriptionRecord", rx_bundle["entry"][0]["resource"]["meta"]["profile"][0])

    def test_mock_abha_credentials_and_qr(self):
        """Test Mock ABHA digital card, QR code generation, and consent artifact."""
        card = mock_abha_gateway.create_mock_abha_card(
            patient_id="pat-100",
            display_name="Arjun Verma",
            dob="1982-08-14",
            gender="M"
        )
        self.assertTrue(card["abha_number"].startswith("91-"))
        self.assertTrue(card["abha_number"].endswith("(MOCK)"))
        self.assertEqual(card["abha_address"], "arjun.verma@abdm")
        self.assertTrue(card["qr_code_base64"].startswith("data:image/png;base64,"))
        self.assertEqual(card["consent_status"], "Active")

        # Verify consent artifact
        consent = mock_abha_gateway.create_consent_artifact(card["abha_number"])
        self.assertTrue(consent["consent_id"].startswith("CONSENT-"))
        self.assertEqual(consent["status"], "GRANTED")
        self.assertEqual(consent["abha_number"], card["abha_number"])

if __name__ == "__main__":
    unittest.main()
