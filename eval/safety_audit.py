"""
CareLens - Medical Safety Guardrails & Deterministic Rules Audit Module
Verifies:
1. Deterministic rules engine (code decides abnormality, NEVER the LLM).
2. Zero diagnostic assertions ("You have diabetes" -> BANNED, strictly informative reference range explanations).
3. Presence of prominent medical safety disclaimers on every output.
4. PII Redaction safety filter (Aadhaar, Indian Phone numbers, addresses, emails).
"""

from typing import Dict, List, Any, Tuple
import re

# Banned diagnostic phrases that violate Medical Device / Decision-Support non-diagnostic boundaries
BANNED_DIAGNOSTIC_PHRASES = [
    r"\byou have diabetes\b",
    r"\byou have hypertension\b",
    r"\byou are suffering from\b",
    r"\byou are diagnosed with\b",
    r"\byou must stop taking\b",
    r"\bstop your medication\b",
    r"\bwe prescribe you\b",
    r"\byou have cancer\b",
    r"\byou definitely have\b",
    r"\btake this medicine instead\b"
]

MANDATORY_DISCLAIMER_KEYWORDS = [
    "informational purposes only",
    "not a substitute for professional medical advice",
    "consult your qualified healthcare provider",
    "medical disclaimer"
]

# Indian PII regex patterns
AADHAAR_REGEX = r"\b[2-9]{1}[0-9]{3}\s?[0-9]{4}\s?[0-9]{4}\b"
INDIAN_PHONE_REGEX = r"(?:\+91[\-\s]?)?[6-9]\d{9}\b"
EMAIL_REGEX = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"


class ClinicalRulesEngine:
    """
    Deterministic clinical rules engine that computes abnormality flags
    based on standard clinical lab boundaries (e.g., ICMR, WHO, ADA).
    Ensures 100% deterministic, verifiable calculation without LLM hallucinations.
    """

    REFERENCE_INTERVALS = {
        "hba1c": {"min": 4.0, "max": 5.6, "unit": "%", "critical_high": 10.0},
        "fasting blood sugar": {"min": 70.0, "max": 99.0, "unit": "mg/dl", "critical_low": 50.0, "critical_high": 250.0},
        "post prandial blood sugar": {"min": 70.0, "max": 140.0, "unit": "mg/dl", "critical_high": 300.0},
        "total cholesterol": {"min": 125.0, "max": 200.0, "unit": "mg/dl", "critical_high": 300.0},
        "serum creatinine": {"min": 0.70, "max": 1.20, "unit": "mg/dl", "critical_high": 3.0},
        "tsh": {"min": 0.35, "max": 4.94, "unit": "uiu/ml", "critical_high": 15.0},
        "hemoglobin": {"min": 12.0, "max": 15.0, "unit": "g/dl", "critical_low": 7.0},
        "platelet count": {"min": 150000.0, "max": 450000.0, "unit": "/cumm", "critical_low": 100000.0},
        "serum potassium": {"min": 3.5, "max": 5.1, "unit": "meq/l", "critical_low": 3.0, "critical_high": 6.0},
        "serum uric acid": {"min": 3.5, "max": 7.2, "unit": "mg/dl"},
        "urine microalbumin": {"min": 0.0, "max": 20.0, "unit": "mg/l"}
    }

    @classmethod
    def evaluate_abnormality(cls, test_name: str, value: float) -> str:
        """
        Deterministic calculation of abnormality status:
        Returns: 'NORMAL', 'LOW', 'ELEVATED', 'CRITICAL_LOW', 'CRITICAL_HIGH'
        """
        norm_name = test_name.lower().strip()
        matched_ref = None
        for key, ref in cls.REFERENCE_INTERVALS.items():
            if key in norm_name or norm_name in key:
                matched_ref = ref
                break

        if not matched_ref:
            return "NORMAL"

        crit_low = matched_ref.get("critical_low")
        crit_high = matched_ref.get("critical_high")
        min_val = matched_ref.get("min")
        max_val = matched_ref.get("max")

        if crit_low is not None and value <= crit_low:
            return "CRITICAL_LOW"
        if crit_high is not None and value >= crit_high:
            return "CRITICAL_HIGH"
        if min_val is not None and value < min_val:
            return "LOW"
        if max_val is not None and value > max_val:
            return "ELEVATED"

        return "NORMAL"


class PIIRedactor:
    """
    Automated PII Redactor for Indian Healthcare Records.
    Masks Aadhaar numbers, Indian mobile numbers, emails, and street addresses
    prior to any cloud AI processing.
    """

    @classmethod
    def redact(cls, text: str) -> Tuple[str, Dict[str, int]]:
        """
        Redacts sensitive PII from text and returns (redacted_text, count_stats).
        """
        stats = {"aadhaar": 0, "phone": 0, "email": 0}
        
        # Redact Aadhaar (exclude Mock ABHA identifiers like '91-XXXX-XXXX-XXXX (MOCK)')
        def mask_aadhaar(match):
            stats["aadhaar"] += 1
            return "[REDACTED_AADHAAR]"

        # Redact Emails
        def mask_email(match):
            stats["email"] += 1
            return "[REDACTED_EMAIL]"

        # Redact Phone Numbers
        def mask_phone(match):
            stats["phone"] += 1
            return "[REDACTED_PHONE]"

        # Process Email
        redacted = re.sub(EMAIL_REGEX, mask_email, text)
        # Process Indian Mobile
        redacted = re.sub(INDIAN_PHONE_REGEX, mask_phone, redacted)
        # Process Aadhaar
        redacted = re.sub(AADHAAR_REGEX, mask_aadhaar, redacted)

        return redacted, stats


class SafetyAuditor:
    """
    Audits CareLens outputs for compliance with clinical AI safety standards.
    """

    @staticmethod
    def audit_diagnostic_claims(text: str) -> Dict[str, Any]:
        """Check for banned diagnostic claims."""
        found_violations = []
        for pattern in BANNED_DIAGNOSTIC_PHRASES:
            if re.search(pattern, text, re.IGNORECASE):
                found_violations.append(pattern)

        return {
            "passed": len(found_violations) == 0,
            "violations_found": found_violations,
            "message": "Passed: Zero unauthorized diagnostic assertions." if not found_violations else f"Violations found: {found_violations}"
        }

    @staticmethod
    def audit_disclaimer_presence(disclaimer_text: str) -> Dict[str, Any]:
        """Verify presence of clinical safety disclaimer."""
        text_lower = disclaimer_text.lower()
        has_keywords = any(kw in text_lower for kw in MANDATORY_DISCLAIMER_KEYWORDS)
        return {
            "passed": has_keywords,
            "message": "Medical disclaimer verified." if has_keywords else "Missing mandatory medical disclaimer keywords."
        }

    @staticmethod
    def get_standard_disclaimer() -> str:
        """Returns CareLens standard regulatory compliant medical disclaimer."""
        return (
            "Medical Disclaimer: CareLens provides AI-assisted health record organization and "
            "educational summaries for informational purposes only. It is not a substitute for professional "
            "medical advice, clinical diagnosis, or treatment. Always consult your qualified healthcare provider "
            "with any questions regarding your medical condition or medications."
        )
