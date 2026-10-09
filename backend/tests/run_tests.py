import sys
import unittest
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.models.extraction import (
    BoundingBox,
    ExtractedObservation,
    ExtractedMedication,
    ExtractionResult
)
from backend.app.pipeline.rules_engine import (
    parse_ref_range,
    evaluate_observation,
    classify_organ_system,
    compute_dot_position,
    compute_trend
)
from backend.app.pipeline.polypharmacy import detect_polypharmacy_conflicts
from backend.app.pipeline.summarise import summarize_document, verify_grounding
from backend.app.pipeline.translate import translate_health_summary, lock_tokens, restore_tokens
from backend.app.core.safety_filter import audit_medical_safety

class TestCareLensPipeline(unittest.TestCase):

    def test_bounding_box_validation(self):
        box = BoundingBox(ymin=100, xmin=50, ymax=200, xmax=400)
        self.assertEqual(box.ymin, 100)
        self.assertEqual(box.xmax, 400)

    def test_parse_ref_range(self):
        self.assertEqual(parse_ref_range("4.0 - 5.6"), (4.0, 5.6))
        self.assertEqual(parse_ref_range("0.6 to 1.2 mg/dL"), (0.6, 1.2))
        self.assertEqual(parse_ref_range("< 200"), (0.0, 200.0))
        self.assertEqual(parse_ref_range("> 40"), (40.0, None))
        self.assertEqual(parse_ref_range(None), (None, None))

    def test_deterministic_rules_engine(self):
        obs_hba1c = ExtractedObservation(
            id="fact_1",
            name="HbA1c",
            loinc_code="4548-4",
            value="7.2 %",
            numeric_value=7.2,
            unit="%",
            ref_range="4.0 - 5.6",
            organ_system="endocrine",
            confidence=0.99,
            source_page=1,
            source_quote="HbA1c: 7.2 %",
            bounding_box=BoundingBox(ymin=100, xmin=50, ymax=120, xmax=200)
        )
        evaluated = evaluate_observation(obs_hba1c)
        self.assertIn(evaluated.computed_flag, ["high", "critical"])
        self.assertIsNotNone(evaluated.range_dot_percent)
        self.assertGreaterEqual(evaluated.range_dot_percent, 70.0)

        obs_creat = ExtractedObservation(
            id="fact_2",
            name="Serum Creatinine",
            loinc_code="2160-0",
            value="0.9 mg/dL",
            numeric_value=0.9,
            unit="mg/dL",
            ref_range="0.6 - 1.2",
            organ_system="renal",
            confidence=0.98,
            source_page=1,
            source_quote="Creatinine: 0.9",
            bounding_box=BoundingBox(ymin=150, xmin=50, ymax=170, xmax=200)
        )
        evaluated_creat = evaluate_observation(obs_creat)
        self.assertEqual(evaluated_creat.computed_flag, "normal")
        self.assertTrue(25.0 <= evaluated_creat.range_dot_percent <= 70.0)

    def test_polypharmacy_duplicate_salt(self):
        med1 = ExtractedMedication(
            id="med_1",
            brand_name="Glycomet 500",
            generic_name="Metformin",
            strength="500mg",
            confidence=0.99,
            source_page=1,
            source_quote="Glycomet 500",
            bounding_box=BoundingBox(ymin=300, xmin=50, ymax=320, xmax=200)
        )
        med2 = ExtractedMedication(
            id="med_2",
            brand_name="Cetapin 500",
            generic_name="Metformin",
            strength="500mg",
            confidence=0.98,
            source_page=2,
            source_quote="Cetapin 500",
            bounding_box=BoundingBox(ymin=300, xmin=50, ymax=320, xmax=200)
        )
        conflicts = detect_polypharmacy_conflicts([med1, med2])
        self.assertGreater(len(conflicts), 0)
        self.assertEqual(conflicts[0]["type"], "duplicate_salt")
        self.assertIn("Metformin", conflicts[0]["salt"])

    def test_grounded_summarizer(self):
        obs = ExtractedObservation(
            id="fact_1",
            name="HbA1c",
            loinc_code="4548-4",
            value="7.2 %",
            numeric_value=7.2,
            unit="%",
            ref_range="4.0 - 5.6",
            computed_flag="high",
            range_dot_percent=82.5,
            organ_system="endocrine",
            confidence=0.99,
            source_page=1,
            source_quote="HbA1c: 7.2 %",
            bounding_box=BoundingBox(ymin=100, xmin=50, ymax=120, xmax=200)
        )
        med = ExtractedMedication(
            id="med_1",
            brand_name="Glycomet-GP 1",
            generic_name="Glimepiride + Metformin",
            strength="1mg/500mg",
            frequency="1-0-0",
            timing="before_breakfast",
            confidence=0.99,
            source_page=1,
            source_quote="Glycomet-GP 1",
            bounding_box=BoundingBox(ymin=300, xmin=50, ymax=320, xmax=200)
        )
        result = ExtractionResult(
            doc_type="lab_report",
            document_date="2026-10-05",
            facility_name="Apollo Diagnostics",
            observations=[obs],
            medications=[med]
        )

        layman = summarize_document(result, mode="layman")
        self.assertEqual(layman["mode"], "layman")
        self.assertIn("[fact_1]", layman["summary_text"])
        self.assertIn("[med_1]", layman["summary_text"])
        self.assertTrue(layman["is_grounded"])
        self.assertEqual(layman["grounding_score"], 1.0)

        clinical = summarize_document(result, mode="clinical")
        self.assertEqual(clinical["mode"], "clinical")
        self.assertIn("SITUATION", clinical["summary_text"])
        self.assertIn("[fact_1]", clinical["summary_text"])

    def test_translation_token_locks(self):
        text = "Your HbA1c is 7.2% [fact_1] and Metformin dose is 500mg [med_1]."
        locked, tokens = lock_tokens(text)
        self.assertNotIn("[fact_1]", locked)
        self.assertNotIn("7.2%", locked)
        restored = restore_tokens(locked, tokens)
        self.assertEqual(restored, text)

        trans_te = translate_health_summary(text, "te")
        self.assertTrue(trans_te["verified"])
        self.assertIn("7.2%", trans_te["text"])
        self.assertIn("500mg", trans_te["text"])
        self.assertIn("[fact_1]", trans_te["text"])

        trans_hi = translate_health_summary(text, "hi")
        self.assertTrue(trans_hi["verified"])
        self.assertIn("7.2%", trans_hi["text"])

    def test_safety_audit_filter(self):
        safe_text = "Your test value is elevated [fact_1]. Please consult your healthcare provider to discuss."
        is_safe, violations = audit_medical_safety(safe_text)
        self.assertTrue(is_safe)
        self.assertEqual(len(violations), 0)

        unsafe_text = "You are diagnosed with severe diabetes and you must stop taking your pills."
        is_unsafe, violations = audit_medical_safety(unsafe_text)
        self.assertFalse(is_unsafe)
        self.assertGreaterEqual(len(violations), 2)

if __name__ == "__main__":
    unittest.main()
