import pytest
from backend.app.models.extraction import (
    BoundingBox,
    ExtractedObservation,
    ExtractedMedication,
    ExtractedDiagnosis,
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

def test_bounding_box_validation():
    box = BoundingBox(ymin=100, xmin=50, ymax=200, xmax=400)
    assert box.ymin == 100
    assert box.xmax == 400

    # Test out of bounds constraint
    with pytest.raises(Exception):
        BoundingBox(ymin=-10, xmin=0, ymax=1000, xmax=500)

def test_parse_ref_range():
    assert parse_ref_range("4.0 - 5.6") == (4.0, 5.6)
    assert parse_ref_range("0.6 to 1.2 mg/dL") == (0.6, 1.2)
    assert parse_ref_range("< 200") == (0.0, 200.0)
    assert parse_ref_range("> 40") == (40.0, None)
    assert parse_ref_range(None) == (None, None)

def test_deterministic_rules_engine():
    # Test HbA1c 7.2% -> High/Critical
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
    assert evaluated.computed_flag in ["high", "critical"]
    assert evaluated.range_dot_percent is not None
    assert evaluated.range_dot_percent >= 70.0  # Above normal 25-70% zone

    # Test Creatinine 0.9 mg/dL -> Normal
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
    assert evaluated_creat.computed_flag == "normal"
    assert 25.0 <= evaluated_creat.range_dot_percent <= 70.0

def test_polypharmacy_duplicate_salt_detection():
    # Patient takes Glycomet (Metformin) and Cetapin (Metformin)
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
    assert len(conflicts) > 0
    assert any(c["type"] == "duplicate_salt" for c in conflicts)
    assert "Metformin" in conflicts[0]["salt"]

def test_grounded_summarizer_layman_and_clinical():
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

    # 1. Layman Mode
    layman = summarize_document(result, mode="layman")
    assert layman["mode"] == "layman"
    assert "[fact_1]" in layman["summary_text"]
    assert "[med_1]" in layman["summary_text"]
    assert layman["is_grounded"] is True
    assert layman["grounding_score"] == 1.0

    # 2. Clinical SBAR Mode
    clinical = summarize_document(result, mode="clinical")
    assert clinical["mode"] == "clinical"
    assert "SITUATION" in clinical["summary_text"]
    assert "ASSESSMENT" in clinical["summary_text"]
    assert "[fact_1]" in clinical["summary_text"]

def test_translation_token_lock_and_invariance():
    text = "Your HbA1c is 7.2% [fact_1] and Metformin dose is 500mg [med_1]."
    
    # Test token lock and restore
    locked, tokens = lock_tokens(text)
    assert "[fact_1]" not in locked
    assert "7.2%" not in locked
    
    restored = restore_tokens(locked, tokens)
    assert restored == text

    # Test Telugu translation preserves clinical numbers
    trans_te = translate_health_summary(text, "te")
    assert trans_te["verified"] is True
    assert "7.2%" in trans_te["text"]
    assert "500mg" in trans_te["text"]
    assert "[fact_1]" in trans_te["text"]

    # Test Hindi translation preserves clinical numbers
    trans_hi = translate_health_summary(text, "hi")
    assert trans_hi["verified"] is True
    assert "7.2%" in trans_hi["text"]
    assert "500mg" in trans_hi["text"]

def test_safety_audit_filter():
    safe_text = "Your test value is elevated [fact_1]. Please consult your healthcare provider to discuss."
    is_safe, violations = audit_medical_safety(safe_text)
    assert is_safe is True
    assert len(violations) == 0

    unsafe_text = "You are diagnosed with severe diabetes and you must stop taking your pills."
    is_unsafe, violations = audit_medical_safety(unsafe_text)
    assert is_unsafe is False
    assert len(violations) >= 2
