import json
import time
from pathlib import Path
from typing import Optional, Dict, Any, List
from rapidfuzz import process, fuzz

DEFAULT_DATA_PATH = Path(__file__).resolve().parent.parent.parent.parent / "data" / "indian_medicines.json"

class IndianDrugNormaliser:
    """
    High-performance Indian commercial medicine normalizer using RapidFuzz.
    Matches trade brands (e.g. 'Glycomet-GP 1', 'Augmentin 625', 'Pan-D', 'Telma-H')
    to active pharmacological salt compositions and food-timing rules in <15ms.
    """

    def __init__(self, dataset_path: Optional[str] = None):
        self.data_path = Path(dataset_path) if dataset_path else DEFAULT_DATA_PATH
        self.drugs: Dict[str, Dict[str, Any]] = {}
        self.brand_index: List[str] = []
        self._load_dataset()

    def _load_dataset(self) -> None:
        """Loads medicines database from JSON or fallback internal dictionary."""
        if self.data_path.exists():
            with open(self.data_path, "r", encoding="utf-8") as f:
                self.drugs = json.load(f)
        else:
            self.drugs = {
                "GLYCOMET-GP 1": {
                    "brand_name": "Glycomet-GP 1",
                    "generic_name": "Glimepiride (1mg) + Metformin (500mg)",
                    "active_salts": ["Glimepiride", "Metformin"],
                    "timing_instruction": "Take before breakfast or first main meal",
                    "food_relation": "before_meal",
                    "category": "Anti-diabetic"
                },
                "AUGMENTIN 625": {
                    "brand_name": "Augmentin 625",
                    "generic_name": "Amoxicillin (500mg) + Clavulanic Acid (125mg)",
                    "active_salts": ["Amoxicillin", "Clavulanic Acid"],
                    "timing_instruction": "Take at start of meal to optimize absorption",
                    "food_relation": "start_of_meal",
                    "category": "Antibiotic"
                },
                "PAN-D": {
                    "brand_name": "Pan-D",
                    "generic_name": "Pantoprazole (40mg) + Domperidone (30mg)",
                    "active_salts": ["Pantoprazole", "Domperidone"],
                    "timing_instruction": "Take 30-60 minutes before breakfast on empty stomach",
                    "food_relation": "empty_stomach",
                    "category": "Antacid"
                },
                "TELMA-H": {
                    "brand_name": "Telma-H",
                    "generic_name": "Telmisartan (40mg) + Hydrochlorothiazide (12.5mg)",
                    "active_salts": ["Telmisartan", "Hydrochlorothiazide"],
                    "timing_instruction": "Take in the morning with water",
                    "food_relation": "morning",
                    "category": "Antihypertensive"
                }
            }

        # Build lookup indices
        self.brand_index = list(self.drugs.keys())
        self._exact_map: Dict[str, str] = {}
        import re
        for k in self.drugs.keys():
            # e.g. "PAN D"
            tokenized = " ".join(re.sub(r'[^A-Z0-9\s]', ' ', k).split())
            self._exact_map[tokenized] = k
            # e.g. "PAND"
            stripped = re.sub(r'[^A-Z0-9]', '', k)
            self._exact_map[stripped] = k

    def normalise(self, brand_raw: str, score_cutoff: float = 70.0) -> Dict[str, Any]:
        """
        Normalizes raw brand name string into active salt composition and food timing.
        Executes in <15ms via RapidFuzz token-sort ratio algorithm.
        """
        start_time = time.perf_counter()
        if not brand_raw:
            return {
                "matched": False,
                "match_score": 0,
                "generic_name": None,
                "active_salts": [],
                "timing_instruction": None,
                "execution_ms": 0.0
            }

        import re
        brand_clean = brand_raw.strip().upper()

        # 0. Clean common dosage prefixes and suffixes: "SYP.", "TAB.", etc.
        cleaned_str = re.sub(r'^(?:SYP\.?|SYRUP|TAB\.?|TABLET|CAP\.?|CAPSULE|INJ\.?|INJECTION|DROPS?|SUSP\.?|SUSPENSION)\s+', '', brand_clean)
        # Remove volume / ratio strings like (100/5), 250/5ML, etc.
        cleaned_str = re.sub(r'\(?\b\d+/\d+(?:ML)?\)?', '', cleaned_str).strip()

        # Common OCR corrections on handwritten Indian trade names
        typo_fixes = [
            (r'\bPCALPOL\b', 'CALPOL'),
            (r'\bLEVOLN\b', 'LEVOLIN'),
            (r'\bMEFTAL\s*P\b', 'MEFTAL-P'),
            (r'\bDELCN\b', 'DELCON'),
            (r'\bDOLO\s*650\b', 'DOLO 650'),
            (r'\bDOL0\b', 'DOLO'),
        ]
        for pat, rep in typo_fixes:
            cleaned_str = re.sub(pat, rep, cleaned_str)
        cleaned_str = cleaned_str.strip() or brand_clean

        tokenized = " ".join(re.sub(r'[^A-Z0-9\s]', ' ', cleaned_str).split())
        stripped = re.sub(r'[^A-Z0-9]', '', cleaned_str)
        raw_tokenized = " ".join(re.sub(r'[^A-Z0-9\s]', ' ', brand_clean).split())
        raw_stripped = re.sub(r'[^A-Z0-9]', '', brand_clean)

        # 1. Exact match (O(1)) directly or through punctuation-normalized maps
        matched_key = None
        for candidate in [cleaned_str, tokenized, stripped, brand_clean, raw_tokenized, raw_stripped]:
            if candidate in self.drugs:
                matched_key = candidate
                break
            elif candidate in self._exact_map:
                matched_key = self._exact_map[candidate]
                break

        if matched_key:
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            res = dict(self.drugs[matched_key])
            res.update({
                "matched": True,
                "match_score": 100.0,
                "execution_ms": round(elapsed_ms, 2)
            })
            return res

        # 2. RapidFuzz token-sort ratio fuzzy matching against brand keys
        match = process.extractOne(
            tokenized,
            self.brand_index,
            scorer=fuzz.token_sort_ratio,
            score_cutoff=score_cutoff
        )

        if not match:
            # Try partial ratio
            match = process.extractOne(
                tokenized,
                self.brand_index,
                scorer=fuzz.partial_ratio,
                score_cutoff=75.0
            )

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        if match:
            matched_k, score, _ = match
            res = dict(self.drugs[matched_k])
            res.update({
                "matched": True,
                "match_score": round(float(score), 1),
                "execution_ms": round(elapsed_ms, 2)
            })
            return res

        # 3. Fallback when below cutoff
        return {
            "matched": False,
            "match_score": 0.0,
            "brand_name": brand_raw,
            "generic_name": brand_raw,
            "active_salts": [],
            "timing_instruction": "Take as prescribed by physician",
            "food_relation": "as_prescribed",
            "execution_ms": round(elapsed_ms, 2)
        }

# Global singleton instance for high-throughput reuse
normaliser = IndianDrugNormaliser()
