import json
from pathlib import Path
from typing import Optional, Dict, Any, List

MAP_PATH = Path(__file__).resolve().parent.parent.parent.parent / "data" / "organ_system_map.json"

class OrganMapper:
    """
    Deterministic clinical classifier mapping Common Lab Codes for India (CLCI)
    and LOINC diagnostic codes to the 6 anatomical organ systems for the 3D Body Twin.
    """

    ORGAN_SYSTEMS = [
        "cardiovascular",
        "endocrine",
        "respiratory",
        "renal",
        "hepatic",
        "neurological"
    ]

    ORGAN_METADATA = {
        "cardiovascular": {
            "name": "Cardiovascular System",
            "anatomical_region": "Heart & Circulatory Vessels",
            "three_d_mesh_node": "heart_cardiovascular_mesh",
            "color_theme": "#E11D48"
        },
        "endocrine": {
            "name": "Endocrine & Metabolic",
            "anatomical_region": "Pancreas, Thyroid & Glands",
            "three_d_mesh_node": "pancreas_endocrine_mesh",
            "color_theme": "#8B5CF6"
        },
        "respiratory": {
            "name": "Respiratory System",
            "anatomical_region": "Lungs & Tracheobronchial Tree",
            "three_d_mesh_node": "lungs_respiratory_mesh",
            "color_theme": "#06B6D4"
        },
        "renal": {
            "name": "Renal System",
            "anatomical_region": "Kidneys & Urinary Tract",
            "three_d_mesh_node": "kidneys_renal_mesh",
            "color_theme": "#F59E0B"
        },
        "hepatic": {
            "name": "Hepatic System",
            "anatomical_region": "Liver & Biliary Tree",
            "three_d_mesh_node": "liver_hepatic_mesh",
            "color_theme": "#10B981"
        },
        "neurological": {
            "name": "Neurological & Cognitive",
            "anatomical_region": "Brain & Central Nervous System",
            "three_d_mesh_node": "brain_cns_mesh",
            "color_theme": "#6366F1"
        }
    }

    def __init__(self, map_file: Optional[Path] = None):
        self.map_file = map_file or MAP_PATH
        self.map_data = self._load_map()

    def _load_map(self) -> Dict[str, Any]:
        if self.map_file.exists():
            with open(self.map_file, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def classify(self, loinc_code: Optional[str] = None, test_name: Optional[str] = None) -> str:
        """
        Deterministically returns one of the 6 organ systems:
        'cardiovascular', 'endocrine', 'respiratory', 'renal', 'hepatic', 'neurological'.
        """
        # 1. Exact LOINC code lookup
        if loinc_code:
            loinc_clean = loinc_code.strip()
            for system_key, data in self.map_data.items():
                if loinc_clean in data.get("loinc_codes", []):
                    return system_key

        # 2. Text keyword matching
        if test_name:
            name_lower = test_name.lower().strip()
            for system_key, data in self.map_data.items():
                for kw in data.get("keywords", []):
                    if kw in name_lower:
                        return system_key

        # Default fallback
        return "endocrine"

    def get_organ_info(self, organ_system: str) -> Dict[str, Any]:
        """Returns visual styling and 3D mesh identifiers for a given organ system."""
        key = organ_system.lower()
        base = self.ORGAN_METADATA.get(key, {
            "name": key.title(),
            "anatomical_region": key.title(),
            "three_d_mesh_node": f"{key}_mesh",
            "color_theme": "#6B7280"
        })
        clci_info = self.map_data.get(key, {})
        return {
            "system_key": key,
            **base,
            "display_name": clci_info.get("display_name", base["name"]),
            "loinc_codes": clci_info.get("loinc_codes", [])
        }

    def aggregate_health_status(self, observations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Aggregates raw observation list into 3D Body Twin organ status payload:
        Status prioritized as critical > elevated > low > normal.
        """
        aggregated: Dict[str, Any] = {}
        for organ_key in self.ORGAN_SYSTEMS:
            meta = self.get_organ_info(organ_key)
            aggregated[organ_key] = {
                "system_key": organ_key,
                "display_name": meta["display_name"],
                "status": "normal",
                "active_tests": 0,
                "primary_alert": None,
                "latest_date": None,
                "three_d_node": meta["three_d_mesh_node"],
                "color_theme": meta["color_theme"],
                "tests": []
            }

        severity_rank = {"critical": 3, "high": 2, "elevated": 2, "low": 2, "normal": 1}

        for obs in observations:
            name = obs.get("name", "Unknown Test")
            loinc = obs.get("loinc_code")
            organ = obs.get("organ_system") or self.classify(loinc_code=loinc, test_name=name)
            flag = (obs.get("flag") or "normal").lower()

            if organ in aggregated:
                target = aggregated[organ]
                target["active_tests"] += 1
                target["tests"].append({
                    "name": name,
                    "value": obs.get("value_text") or obs.get("value"),
                    "flag": flag,
                    "unit": obs.get("unit")
                })

                # Check if this test is more severe than current status
                current_sev = severity_rank.get(target["status"], 1)
                test_sev = severity_rank.get(flag, 1)
                if test_sev > current_sev:
                    target["status"] = "critical" if flag == "critical" else "elevated"
                    target["primary_alert"] = f"{name}: {obs.get('value_text') or obs.get('value')} {obs.get('unit') or ''} ({flag.upper()})"

        return aggregated

# Global instance
organ_mapper = OrganMapper()
