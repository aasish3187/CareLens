from typing import List, Dict, Any, Optional
from backend.app.models.extraction import ExtractedMedication

# Common Indian brand name to active salt mapping
COMMON_SALT_MAP = {
    "glycomet": "metformin",
    "cetapin": "metformin",
    "glucophage": "metformin",
    "obimet": "metformin",
    "amaryl": "glimepiride",
    "gemer": "glimepiride + metformin",
    "glycomet-gp": "glimepiride + metformin",
    "dolo": "paracetamol",
    "calpol": "paracetamol",
    "crocin": "paracetamol",
    "pacimol": "paracetamol",
    "augmentin": "amoxicillin + clavulanic acid",
    "moxikind-cv": "amoxicillin + clavulanic acid",
    "pan-d": "pantoprazole + domperidone",
    "pantocid-d": "pantoprazole + domperidone",
    "pantodac": "pantoprazole",
    "omez": "omeprazole",
    "telma": "telmisartan",
    "telmikind": "telmisartan",
    "atorva": "atorvastatin",
    "lipitor": "atorvastatin",
    "rosuvas": "rosuvastatin",
    "combiflam": "ibuprofen + paracetamol",
    "voveran": "diclofenac",
}

# Known high-risk clinical interactions
KNOWN_INTERACTIONS = [
    {
        "drug_a": "telmisartan",
        "drug_b": "spironolactone",
        "severity": "high",
        "title": "Severe Hyperkalemia Risk",
        "mechanism": "Combining an ARB with a potassium-sparing diuretic can dangerously elevate blood potassium levels."
    },
    {
        "drug_a": "ibuprofen",
        "drug_b": "diclofenac",
        "severity": "high",
        "title": "Dual NSAID Toxicity",
        "mechanism": "Taking multiple nonsteroidal anti-inflammatory drugs concurrently increases the risk of severe gastrointestinal bleeding and kidney impairment."
    },
    {
        "drug_a": "omeprazole",
        "drug_b": "clopidogrel",
        "severity": "moderate",
        "title": "Reduced Antiplatelet Efficacy",
        "mechanism": "Omeprazole inhibits CYP2C19, decreasing the conversion of clopidogrel to its active anti-clotting form."
    },
    {
        "drug_a": "metformin",
        "drug_b": "contrast",
        "severity": "high",
        "title": "Lactic Acidosis Risk",
        "mechanism": "Temporary withholding of metformin is recommended around intravenous radiocontrast procedures."
    }
]

def resolve_salt_composition(brand_name: str, generic_name: Optional[str] = None) -> str:
    """Extracts or infers active pharmacological salt composition."""
    if generic_name and generic_name.strip():
        return generic_name.strip().lower()
    
    brand_lower = brand_name.lower()
    for key, salt in COMMON_SALT_MAP.items():
        if key in brand_lower:
            return salt
            
    return brand_lower

def detect_polypharmacy_conflicts(medications: List[ExtractedMedication]) -> List[Dict[str, Any]]:
    """
    Scans a collection of active medications across current and past prescriptions
    to flag duplicate salt therapies and dangerous interactions.
    """
    conflicts = []
    if len(medications) < 2:
        return conflicts

    resolved_meds = []
    for med in medications:
        salt = resolve_salt_composition(med.brand_name, med.generic_name)
        resolved_meds.append({
            "id": med.id,
            "brand": med.brand_name,
            "salt": salt,
            "strength": med.strength or "",
            "page": med.source_page
        })

    # 1. Detect Duplicate Salt Therapy
    seen_salts: Dict[str, List[dict]] = {}
    for item in resolved_meds:
        # Normalize composite salts (e.g. "glimepiride + metformin")
        individual_salts = [s.strip() for s in item["salt"].split("+")]
        for single_salt in individual_salts:
            if single_salt not in seen_salts:
                seen_salts[single_salt] = []
            seen_salts[single_salt].append(item)

    for salt_name, items in seen_salts.items():
        if len(items) > 1:
            # Check if brands are different
            unique_brands = list({it["brand"] for it in items})
            if len(unique_brands) > 1:
                conflicts.append({
                    "type": "duplicate_salt",
                    "severity": "high",
                    "salt": salt_name.capitalize(),
                    "brands_involved": unique_brands,
                    "medication_ids": [it["id"] for it in items],
                    "title": f"Duplicate Salt Therapy: {salt_name.capitalize()}",
                    "description": (
                        f"Multiple prescribed brands ({', '.join(unique_brands)}) both contain the active ingredient "
                        f"'{salt_name.capitalize()}'. This may lead to accidental double-dosing or toxicity."
                    ),
                    "action_recommendation": "Confirm with your doctor before taking both medications simultaneously."
                })

    # 2. Detect Known Drug-Drug Interactions
    n = len(resolved_meds)
    for i in range(n):
        for j in range(i + 1, n):
            salt_i = resolved_meds[i]["salt"]
            salt_j = resolved_meds[j]["salt"]
            brand_i = resolved_meds[i]["brand"]
            brand_j = resolved_meds[j]["brand"]

            for interaction in KNOWN_INTERACTIONS:
                drug_a = interaction["drug_a"]
                drug_b = interaction["drug_b"]
                
                if (drug_a in salt_i and drug_b in salt_j) or (drug_a in salt_j and drug_b in salt_i):
                    conflicts.append({
                        "type": "drug_interaction",
                        "severity": interaction["severity"],
                        "title": interaction["title"],
                        "brands_involved": [brand_i, brand_j],
                        "medication_ids": [resolved_meds[i]["id"], resolved_meds[j]["id"]],
                        "description": (
                            f"Potential interaction between {brand_i} ({salt_i}) and {brand_j} ({salt_j}): "
                            f"{interaction['mechanism']}"
                        ),
                        "action_recommendation": "Discuss timing and dosage separation with your treating physician."
                    })

    return conflicts
