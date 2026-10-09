import re
from typing import Dict, Any, List, Tuple
from backend.app.models.extraction import ExtractionResult, ExtractedObservation, ExtractedMedication

FACT_CITATION_REGEX = re.compile(r'\[(fact_\d+|med_\d+|diag_\d+)\]')

DISCLAIMER_TEXT = (
    "Disclaimer: This summary is generated for personal health information only. "
    "It does not provide clinical diagnoses, triage, or dosing changes. "
    "Please consult your healthcare provider to discuss these findings."
)

def verify_grounding(summary_text: str, valid_fact_ids: set) -> Tuple[bool, float, List[str]]:
    """
    Validates that every citation in the summary is grounded in the extracted fact IDs.
    Returns: (is_valid, grounding_score, warnings)
    """
    citations = FACT_CITATION_REGEX.findall(summary_text)
    if not citations:
        return False, 0.0, ["Summary contains zero fact citations. Potential ungrounded output."]
    
    invalid_citations = [c for c in citations if c not in valid_fact_ids]
    if invalid_citations:
        return False, 0.0, [f"Summary cited hallucinated fact IDs not in input: {invalid_citations}"]
    
    grounding_score = 1.0  # 100% verified citations
    return True, grounding_score, []

def generate_layman_summary(result: ExtractionResult) -> Dict[str, Any]:
    """Generates a 6th-grade patient-friendly explanation where every medical claim cites [fact_id]."""
    sentences = []
    valid_ids = set()

    # Document Header
    facility = result.facility_name or "your healthcare facility"
    date_str = result.document_date or "your recent visit"
    sentences.append(f"Here is a simple overview of your medical report from {facility} ({date_str}).")

    # Diagnoses
    if result.diagnoses:
        diag_parts = []
        for d in result.diagnoses:
            valid_ids.add(d.id)
            diag_parts.append(f"{d.text} [{d.id}]")
        sentences.append(f"Your record notes the following condition(s): {', '.join(diag_parts)}.")

    # Lab Observations
    if result.observations:
        sentences.append("Key Lab Findings:")
        for obs in result.observations:
            valid_ids.add(obs.id)
            status_text = ""
            if obs.computed_flag == "high":
                status_text = "which is above the standard healthy reference range"
            elif obs.computed_flag == "critical":
                status_text = "which is significantly higher than target limits and warrants clinical follow-up"
            elif obs.computed_flag == "low":
                status_text = "which is lower than the typical reference range"
            else:
                status_text = "which is within normal healthy limits"

            ref_note = f" (target range: {obs.ref_range})" if obs.ref_range else ""
            sentences.append(f"• Your {obs.name} test result is {obs.value}{ref_note} [{obs.id}], {status_text}.")

    # Medications
    if result.medications:
        sentences.append("Prescribed Medications:")
        for med in result.medications:
            valid_ids.add(med.id)
            timing_note = f", to be taken {med.timing.replace('_', ' ')}" if med.timing else ""
            generic_note = f" (active salt: {med.generic_name})" if med.generic_name else ""
            sentences.append(
                f"• {med.brand_name}{generic_note} [{med.id}] with dosage '{med.frequency}'{timing_note}."
            )

    sentences.append(DISCLAIMER_TEXT)
    full_text = "\n\n".join(sentences)
    is_valid, score, warnings = verify_grounding(full_text, valid_ids)

    return {
        "mode": "layman",
        "reading_level": "Grade 6",
        "summary_text": full_text,
        "cited_facts_count": len(valid_ids),
        "grounding_score": score,
        "is_grounded": is_valid,
        "disclaimer": DISCLAIMER_TEXT
    }

def generate_clinical_summary(result: ExtractionResult) -> Dict[str, Any]:
    """Generates a professional physician-level SBAR brief with LOINC codes and citations."""
    valid_ids = set()
    sbar = []

    # SITUATION
    patient_info = f"{result.patient_name or 'Patient'}"
    if result.patient_age:
        patient_info += f", {result.patient_age}yo"
    if result.patient_gender:
        patient_info += f" {result.patient_gender}"
    sbar.append(f"**SITUATION:** Clinical report review for {patient_info} ({result.facility_name or 'Outpatient Clinic'}, {result.document_date or 'Recent'}).")

    # BACKGROUND
    if result.diagnoses:
        dx_list = []
        for d in result.diagnoses:
            valid_ids.add(d.id)
            dx_list.append(f"{d.text} [{d.id}]")
        sbar.append(f"**BACKGROUND:** Recorded clinical indications: {', '.join(dx_list)}.")

    # ASSESSMENT
    if result.observations:
        obs_lines = ["**ASSESSMENT (Diagnostic Panel):**"]
        for obs in result.observations:
            valid_ids.add(obs.id)
            loinc_tag = f" [LOINC: {obs.loinc_code}]" if obs.loinc_code else ""
            obs_lines.append(
                f"- {obs.name}{loinc_tag}: {obs.value} (Ref: {obs.ref_range or 'N/A'}) -> Status: {obs.computed_flag.upper()} [{obs.id}]."
            )
        sbar.append("\n".join(obs_lines))

    # RECOMMENDATION & MEDICATIONS
    rx_lines = ["**RECOMMENDATIONS & PHARMACOTHERAPY:**"]
    if result.medications:
        for med in result.medications:
            valid_ids.add(med.id)
            rx_lines.append(
                f"- Rx: {med.brand_name} ({med.generic_name or 'Salt pending'}) {med.strength or ''} - Sig: {med.frequency} {med.timing or ''} [{med.id}]."
            )
    else:
        rx_lines.append("- No new pharmacotherapeutic orders recorded on this document.")
    rx_lines.append("- Correlate abnormal biomarkers with clinical symptoms and repeat panel as indicated.")
    sbar.append("\n".join(rx_lines))

    sbar.append(DISCLAIMER_TEXT)
    full_text = "\n\n".join(sbar)
    is_valid, score, warnings = verify_grounding(full_text, valid_ids)

    return {
        "mode": "clinical",
        "format": "SBAR",
        "summary_text": full_text,
        "cited_facts_count": len(valid_ids),
        "grounding_score": score,
        "is_grounded": is_valid,
        "disclaimer": DISCLAIMER_TEXT
    }

def summarize_document(result: ExtractionResult, mode: str = "layman") -> Dict[str, Any]:
    """Master entry point for generating grounded summaries."""
    if mode == "clinical":
        return generate_clinical_summary(result)
    return generate_layman_summary(result)
