from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from backend.app.database import get_session
from backend.app.models.database import Observation, Medication, Condition
from backend.app.models.schemas import (
    ObservationRead,
    MedicationRead,
    ConditionRead,
)

router = APIRouter(prefix="/extractions", tags=["Extractions & Facts"])


@router.get("/documents/{doc_id}/observations", response_model=List[ObservationRead])
def get_document_observations(
    doc_id: UUID,
    session: Session = Depends(get_session),
):
    """Retrieve all extracted observations with coordinates for a given document."""
    res = session.exec(
        select(Observation).where(Observation.document_id == doc_id).order_by(Observation.created_at)
    )
    return res.all()


@router.get("/documents/{doc_id}/medications", response_model=List[MedicationRead])
def get_document_medications(
    doc_id: UUID,
    session: Session = Depends(get_session),
):
    """Retrieve all extracted medications for a given document."""
    res = session.exec(
        select(Medication).where(Medication.document_id == doc_id).order_by(Medication.created_at)
    )
    return res.all()


@router.patch("/observations/{id}", response_model=ObservationRead)
def update_observation_flag(
    id: UUID,
    flag: str,
    session: Session = Depends(get_session),
):
    """Physician/user override for observation status/flag."""
    obs = session.get(Observation, id)
    if not obs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Observation with ID '{id}' not found",
        )
    obs.flag = flag.lower()
    session.add(obs)
    session.commit()
    session.refresh(obs)
    return obs

