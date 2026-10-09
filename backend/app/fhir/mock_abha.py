import io
import base64
import json
import random
import re
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
import qrcode
from PIL import Image

class MockABHAGateway:
    """
    Mock Ayushman Bharat Digital Mission (ABDM) ABHA identity & consent manager.
    Generates official NRCeS-compliant Mock ABHA credentials, scannable QR codes,
    and consent artifacts with zero real patient PII leakage.
    """

    DEFAULT_PREFIX = "91"

    @classmethod
    def generate_mock_abha_number(cls) -> str:
        """
        Generates 14-digit Indian ABHA ID in official hyphenated format:
        e.g. '91-4582-9310-7462 (MOCK)'
        """
        part1 = cls.DEFAULT_PREFIX
        part2 = f"{random.randint(1000, 9999)}"
        part3 = f"{random.randint(1000, 9999)}"
        part4 = f"{random.randint(1000, 9999)}"
        return f"{part1}-{part2}-{part3}-{part4} (MOCK)"

    @classmethod
    def generate_mock_abha_address(cls, full_name: str) -> str:
        """
        Generates official ABHA address: e.g. 'arjun.verma@abdm'
        """
        clean = re.sub(r'[^a-zA-Z0-9\s]', '', full_name).lower()
        slug = ".".join(clean.split())
        return f"{slug}@abdm"

    @classmethod
    def generate_qr_code_base64(cls, payload: Dict[str, Any]) -> str:
        """
        Generates scannable QR code PNG embedding ABDM health identity payload
        and returns base64 data URI: 'data:image/png;base64,...'
        """
        qr_text = json.dumps(payload, separators=(',', ':'))
        qr = qrcode.QRCode(
            version=2,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=8,
            border=2,
        )
        qr.add_data(qr_text)
        qr.make(fit=True)

        img = qr.make_image(fill_color="#1E293B", back_color="#FFFFFF")
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{b64_str}"

    @classmethod
    def create_mock_abha_card(
        cls,
        patient_id: str,
        display_name: str = "Arjun Verma",
        dob: str = "1982-08-14",
        gender: str = "M",
        mobile: str = "98XXXXXX10",
        abha_number: Optional[str] = None,
        abha_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Builds digital ABHA health card credentials with verified QR code.
        """
        abha_no = abha_number or "91-2345-6789-0123 (MOCK)"
        if not abha_no.endswith("(MOCK)"):
            abha_no = f"{abha_no} (MOCK)"

        abha_addr = abha_address or cls.generate_mock_abha_address(display_name)

        qr_payload = {
            "hid": abha_no,
            "hid_addr": abha_addr,
            "name": display_name,
            "dob": dob,
            "gender": gender,
            "mobile": mobile,
            "issuer": "National Health Authority (MOCK)",
            "verification_status": "VERIFIED_MOCK",
            "fhir_url": f"/api/fhir/export/{patient_id}"
        }

        qr_base64 = cls.generate_qr_code_base64(qr_payload)

        return {
            "abha_number": abha_no,
            "abha_address": abha_addr,
            "patient_name": display_name,
            "dob": dob,
            "gender": gender,
            "mobile_masked": mobile,
            "kyc_status": "VERIFIED (MOCK)",
            "consent_status": "Active",
            "linked_programs": ["PM-JAY", "ABDM-M3"],
            "qr_code_base64": qr_base64,
            "qr_payload": qr_payload,
            "disclaimer": "SYNTHETIC MOCK ABHA FOR HACKATHON DEMONSTRATION ONLY. NOT A REAL AADHAAR/ABHA."
        }

    @classmethod
    def create_consent_artifact(
        cls,
        abha_number: str,
        hiu_name: str = "CareLens Personal Health Copilot",
        hip_name: str = "Apollo Diagnostics",
        purpose: str = "CAREMGT"
    ) -> Dict[str, Any]:
        """
        Generates ABDM Consent Artifact (M3 milestone compliant).
        """
        now = datetime.now(timezone.utc)
        return {
            "consent_id": f"CONSENT-{random.randint(100000, 999999)}",
            "status": "GRANTED",
            "abha_number": abha_number,
            "purpose": {
                "code": purpose,
                "text": "Care Management and Clinical Continuity"
            },
            "hiu": {
                "id": "IN3610001385",
                "name": hiu_name
            },
            "hip": {
                "id": "IN3610002941",
                "name": hip_name
            },
            "hiTypes": ["DiagnosticReport", "Prescription", "DischargeSummary"],
            "permission": {
                "accessMode": "VIEW",
                "dateRange": {
                    "from": (now - timedelta(days=365)).isoformat(),
                    "to": (now + timedelta(days=365)).isoformat()
                },
                "dataEraseAt": (now + timedelta(days=730)).isoformat()
            },
            "signature": f"SHA256withRSA:MOCK_SIG_{random.randint(1000000, 9999999)}"
        }

mock_abha_gateway = MockABHAGateway()
