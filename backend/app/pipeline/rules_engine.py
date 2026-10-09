import json
import re
from pathlib import Path
from typing import Optional, Tuple, Dict, Any, List
from backend.app.models.extraction import ExtractedObservation

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
REF_RANGES_FILE = BASE_DIR / "data" / "ref_ranges.json"
ORGAN_MAP_FILE = BASE_DIR / "data" / "organ_system_map.json"

def _load_json_data(file_path: Path) -> dict:
    if file_path.exists():
        try:
            return json.loads(file_path.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}

REF_RANGES: Dict[str, Any] = _load_json_data(REF_RANGES_FILE)
ORGAN_SYSTEMS: Dict[str, Any] = _load_json_data(ORGAN_MAP_FILE)

def parse_ref_range(ref_str: Optional[str]) -> Tuple[Optional[float], Optional[float]]:
    """
    Parses various human-readable reference range formats:
    - "4.0 - 5.6" -> (4.0, 5.6)
    - "0.6 to 1.2" -> (0.6, 1.2)
    - "< 200" -> (0.0, 200.0)
    - "> 40" -> (40.0, None)
    - "12 - 16.5 g/dL" -> (12.0, 16.5)
    """
    if not ref_str:
        return None, None
    
    clean_str = ref_str.strip().lower()
    
    # Check "< X" or "<= X"
    less_match = re.search(r'(?:<|<=|less than)\s*([0-9]+(?:\.[0-9]+)?)', clean_str)
    if less_match:
        return 0.0, float(less_match.group(1))
    
    # Check "> X" or ">= X"
    greater_match = re.search(r'(?:>|>=|greater than)\s*([0-9]+(?:\.[0-9]+)?)', clean_str)
    if greater_match:
        return float(greater_match.group(1)), None

    # Check "X - Y" or "X to Y"
    range_match = re.search(r'([0-9]+(?:\.[0-9]+)?)\s*(?:-|to)\s*([0-9]+(?:\.[0-9]+)?)', clean_str)
    if range_match:
        return float(range_match.group(1)), float(range_match.group(2))
    
    return None, None

def classify_organ_system(test_name: str, loinc_code: Optional[str] = None) -> str:
    """Classifies a test into one of the 6 anatomical systems for the 3D Body Twin."""
    if loinc_code and loinc_code in REF_RANGES:
        return REF_RANGES[loinc_code].get("organ_system", "general")
    
    test_lower = test_name.lower()
    for system_key, system_data in ORGAN_SYSTEMS.items():
        if loinc_code and loinc_code in system_data.get("loinc_codes", []):
            return system_key
        for kw in system_data.get("keywords", []):
            if kw in test_lower:
                return system_key
                
    return "cardiovascular"  # Default fallback

def compute_dot_position(value: float, low: float, high: float, zones: Optional[dict] = None) -> float:
    """
    Computes visual position across 4 zones (0% to 100%):
    - 0% - 25%: Low
    - 25% - 70%: Normal
    - 70% - 90%: Elevated
    - 90% - 100%: Critical
    """
    if zones:
        elevated_max = zones.get("elevated", {}).get("max", high * 1.25)
        critical_max = zones.get("critical", {}).get("max", high * 2.0)
    else:
        elevated_max = high * 1.25
        critical_max = high * 2.0

    if value < low:
        # Scale in low zone [0, 25%]
        ratio = max(0.0, value / max(low, 0.001))
        return round(ratio * 25.0, 1)
    elif value <= high:
        # Scale in normal zone [25%, 70%]
        span = max(high - low, 0.001)
        ratio = (value - low) / span
        return round(25.0 + (ratio * 45.0), 1)
    elif value <= elevated_max:
        # Scale in elevated zone [70%, 90%]
        span = max(elevated_max - high, 0.001)
        ratio = (value - high) / span
        return round(70.0 + (ratio * 20.0), 1)
    else:
        # Scale in critical zone [90%, 100%]
        span = max(critical_max - elevated_max, 0.001)
        ratio = min(1.0, (value - elevated_max) / span)
        return round(90.0 + (ratio * 10.0), 1)

def evaluate_observation(obs: ExtractedObservation) -> ExtractedObservation:
    """
    Deterministic rules engine evaluator.
    Computes:
    - computed_flag: "normal" | "high" | "low" | "critical"
    - range_dot_percent: 0.0 to 100.0
    - organ_system: mapped correctly
    """
    # 1. Ensure organ system is assigned
    if not obs.organ_system:
        obs.organ_system = classify_organ_system(obs.name, obs.loinc_code)

    # 2. Extract numeric value
    val = obs.numeric_value
    if val is None:
        try:
            num_clean = re.search(r'([0-9]+(?:\.[0-9]+)?)', obs.value)
            if num_clean:
                val = float(num_clean.group(1))
                obs.numeric_value = val
        except Exception:
            val = None

    if val is None:
        obs.computed_flag = "unknown"
        return obs

    # 3. Determine reference boundaries
    low, high = parse_ref_range(obs.ref_range)
    zones = None

    # Fallback to seeded database if ref range not printed or unparseable
    if (low is None or high is None) and obs.loinc_code and obs.loinc_code in REF_RANGES:
        meta = REF_RANGES[obs.loinc_code]
        zones = meta.get("zones", {})
        normal_zone = zones.get("normal", {})
        low = normal_zone.get("min", low)
        high = normal_zone.get("max", high)
        if not obs.ref_range:
            obs.ref_range = f"{low} - {high} {obs.unit or ''}".strip()

    if low is None and high is None:
        obs.computed_flag = "unknown"
        obs.range_dot_percent = 50.0
        return obs

    low_val = low if low is not None else 0.0
    high_val = high if high is not None else low_val * 2.0

    # 4. Deterministic Clinical Abnormality Flag
    if val < low_val:
        obs.computed_flag = "low"
    elif val > high_val:
        # Check critical threshold (e.g. 25% above high or critical zone)
        if zones and "critical" in zones and val >= zones["critical"].get("min", high_val * 1.25):
            obs.computed_flag = "critical"
        elif val >= high_val * 1.3:
            obs.computed_flag = "critical"
        else:
            obs.computed_flag = "high"
    else:
        obs.computed_flag = "normal"

    # 5. Compute dot-slider position
    obs.range_dot_percent = compute_dot_position(val, low_val, high_val, zones)
    return obs

def compute_trend(current_obs: ExtractedObservation, past_observations: List[ExtractedObservation]) -> Dict[str, Any]:
    """
    Computes longitudinal clinical trajectory for the same diagnostic test.
    """
    matches = [p for p in past_observations if (p.loinc_code and p.loinc_code == current_obs.loinc_code) or (p.name.lower() == current_obs.name.lower())]
    if not matches or current_obs.numeric_value is None:
        return {"has_trend": False, "delta": None, "direction": "stable"}
    
    # Get most recent prior reading
    prior = matches[0]
    if prior.numeric_value is None:
        return {"has_trend": False, "delta": None, "direction": "stable"}

    delta = round(current_obs.numeric_value - prior.numeric_value, 2)
    percent_change = round((delta / max(prior.numeric_value, 0.001)) * 100.0, 1)

    if delta > 0.05:
        direction = "increased"
    elif delta < -0.05:
        direction = "decreased"
    else:
        direction = "stable"

    return {
        "has_trend": True,
        "delta": delta,
        "percent_change": percent_change,
        "direction": direction,
        "prior_value": prior.numeric_value,
        "prior_date": getattr(prior, "date", None),
        "summary": f"{direction.capitalize()} by {abs(delta)} ({abs(percent_change)}%) compared to previous reading."
    }
