import re
from typing import Tuple, List

# Patterns that indicate forbidden medical advice or diagnostic overreach
FORBIDDEN_DIAGNOSTIC_PATTERNS = [
    re.compile(r'\byou\s+(?:have|suffer\s+from|are\s+diagnosed\s+with)\s+[a-z]+', re.IGNORECASE),
    re.compile(r'\bwe\s+diagnose\s+you\s+with\b', re.IGNORECASE),
    re.compile(r'\bdefinitive\s+diagnosis\b', re.IGNORECASE),
]

FORBIDDEN_DOSING_PATTERNS = [
    re.compile(r'\b(?:stop|discontinue|cease)\s+(?:taking|using)\s+[a-z]+', re.IGNORECASE),
    re.compile(r'\b(?:increase|decrease|double|halve)\s+(?:your\s+)?dose\b', re.IGNORECASE),
    re.compile(r'\bchange\s+your\s+medication\b', re.IGNORECASE),
    re.compile(r'\btake\s+\d+\s+(?:pills|tablets|capsules)\s+instead\b', re.IGNORECASE),
]

REQUIRED_DISCLAIMER_KEYWORDS = ["not medical advice", "disclaimer", "consult your healthcare provider", "discuss with your doctor"]

def audit_medical_safety(text: str) -> Tuple[bool, List[str]]:
    """
    Audits generated text for safety compliance:
    1. Rejects autonomous medical diagnosis.
    2. Rejects autonomous dosing changes.
    3. Confirms presence of medical disclaimers.
    """
    violations = []

    for pattern in FORBIDDEN_DIAGNOSTIC_PATTERNS:
        match = pattern.search(text)
        if match:
            violations.append(f"Forbidden clinical diagnosis language detected: '{match.group(0)}'")

    for pattern in FORBIDDEN_DOSING_PATTERNS:
        match = pattern.search(text)
        if match:
            violations.append(f"Forbidden medication dosing adjustment advice detected: '{match.group(0)}'")

    text_lower = text.lower()
    has_disclaimer = any(kw in text_lower for kw in REQUIRED_DISCLAIMER_KEYWORDS)
    if not has_disclaimer:
        violations.append("Mandatory clinical disclaimer is missing from the output text.")

    is_compliant = len(violations) == 0
    return is_compliant, violations
