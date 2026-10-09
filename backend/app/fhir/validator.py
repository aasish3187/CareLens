"""
CareLens NRCeS FHIR R4 Bundle Validator
Validates ABDM Document Bundles against National Resource Centre for EHR Standards (NRCeS) rules.
"""

from typing import Dict, List, Any, Tuple


class FHIRBundleValidator:
    REQUIRED_ROOT_FIELDS = ["resourceType", "id", "meta", "type", "timestamp", "entry"]

    def validate_bundle(self, bundle: Dict[str, Any]) -> Tuple[bool, List[str]]:
        errors = []

        # 1. Check Root Elements
        for field in self.REQUIRED_ROOT_FIELDS:
            if field not in bundle:
                errors.append(f"Missing required root field: '{field}'")

        if bundle.get("resourceType") != "Bundle":
            errors.append(f"resourceType must be 'Bundle', got '{bundle.get('resourceType')}'")

        if bundle.get("type") != "document":
            errors.append(f"Bundle type must be 'document', got '{bundle.get('type')}'")

        # 2. Check Meta Profile
        meta = bundle.get("meta", {})
        profiles = meta.get("profile", [])
        if not profiles:
            errors.append("Bundle meta.profile must contain at least one NRCeS profile URI.")

        # 3. Check Entries
        entries = bundle.get("entry", [])
        if not entries:
            errors.append("Bundle contains no entries.")
            return False, errors

        # First entry must be Composition in a FHIR document bundle
        first_res = entries[0].get("resource", {})
        if first_res.get("resourceType") != "Composition":
            errors.append(f"First entry in a document bundle MUST be Composition, found '{first_res.get('resourceType')}'.")

        # Verify Patient existence
        has_patient = False
        has_practitioner = False
        has_org = False

        for idx, entry in enumerate(entries):
            res = entry.get("resource")
            if not res:
                errors.append(f"Entry {idx} is missing 'resource' object.")
                continue

            r_type = res.get("resourceType")
            if not r_type:
                errors.append(f"Entry {idx} is missing 'resourceType'.")

            if r_type == "Patient":
                has_patient = True
                # Check ABHA identifier
                identifiers = res.get("identifier", [])
                has_abha = any(
                    "healthid.ndhm.gov.in" in id_obj.get("system", "")
                    or "ABHA" in str(id_obj.get("type", {}))
                    for id_obj in identifiers
                )
                if not has_abha:
                    errors.append("Patient resource lacks an ABHA identifier.")

            elif r_type == "Practitioner":
                has_practitioner = True

            elif r_type == "Organization":
                has_org = True

        if not has_patient:
            errors.append("Bundle does not contain a Patient resource.")

        is_valid = len(errors) == 0
        return is_valid, errors


# Global singleton
fhir_validator = FHIRBundleValidator()
