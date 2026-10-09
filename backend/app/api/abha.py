import io
import base64
import json
from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session
import qrcode

from backend.app.database import get_session
from backend.app.models.database import Person

router = APIRouter(prefix="/abha", tags=["abha"])

@router.get("/{person_id}/card")
async def get_mock_abha_card(person_id: UUID, session: Session = Depends(get_session)):
    """
    Generates official Ayushman Bharat Digital Mission (ABDM) Mock Card credentials
    with a base64 encoded scannable QR code.
    """
    person = session.get(Person, person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Patient profile not found.")

    # Generate QR Code Payload
    qr_data = {
        "hidn": person.abha_number or "91-2345-6789-0123",
        "hid": person.abha_address or "arjun.verma@abdm",
        "name": person.display_name,
        "gender": person.sex.upper() if person.sex else "M",
        "dob": str(person.dob) if person.dob else "1982-08-14",
        "state_name": "Telangana",
        "dist_name": "Hyderabad",
        "type": "MOCK_ABHA_PROFILE",
        "consent_manager": "Active"
    }

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=6,
        border=2,
    )
    qr.add_data(json.dumps(qr_data))
    qr.make(fit=True)

    img = qr.make_image(fill_color="#0F766E", back_color="white")
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    qr_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

    return {
        "title": "AYUSHMAN BHARAT DIGITAL MISSION (ABDM)",
        "badge": "MOCK PROFILE",
        "abha_number": person.abha_number or "91-2345-6789-0123",
        "abha_address": person.abha_address or "arjun.verma@abdm",
        "name": person.display_name,
        "gender": person.sex or "male",
        "dob": str(person.dob) if person.dob else "1982-08-14",
        "qr_code_base64": f"data:image/png;base64,{qr_base64}",
        "linked_facilities": [
            {"name": "Apollo Hospitals, Hyderabad", "hip_id": "APOLLO_HYD_01", "status": "Linked"},
            {"name": "Max Super Speciality Hospital", "hip_id": "MAX_DELHI_02", "status": "Linked"}
        ],
        "consent_status": "Active"
    }
