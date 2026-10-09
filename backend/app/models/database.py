from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import date, datetime, timezone
from uuid import uuid4, UUID
import json

class Person(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    display_name: str = Field(default="Arjun Verma")
    dob: Optional[date] = Field(default=date(1982, 8, 14))
    sex: Optional[str] = Field(default="male")
    abha_number: Optional[str] = Field(default="91-2345-6789-0123")  # Official MOCK ABHA
    abha_address: Optional[str] = Field(default="arjun.verma@abdm")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Document(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    person_id: UUID = Field(foreign_key="person.id")
    doc_type: str = Field(default="lab_report")  # prescription | lab_report | discharge_summary | diagnostic_scan
    original_filename: str
    storage_path: str
    sha256: str = Field(index=True)
    doc_date: Optional[date] = None
    facility_name: Optional[str] = None
    clinician_name: Optional[str] = None
    status: str = Field(default="uploaded")  # uploaded | processing | ready | failed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Observation(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    document_id: UUID = Field(foreign_key="document.id")
    person_id: UUID = Field(foreign_key="person.id")
    fact_id: str = Field(index=True)  # e.g. "fact_1" for citation linking
    name: str
    loinc_code: Optional[str] = None
    value_text: str
    numeric_value: Optional[float] = None
    unit: Optional[str] = None
    ref_range: Optional[str] = None
    flag: Optional[str] = Field(default="normal")  # normal | high | low | critical
    organ_system: str = Field(default="endocrine")  # cardiovascular | endocrine | respiratory | renal | hepatic | neurological
    confidence: float = Field(default=0.99)
    source_page: int = Field(default=1)
    bounding_box_json: Optional[str] = None  # JSON string of [ymin, xmin, ymax, xmax]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Medication(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    document_id: UUID = Field(foreign_key="document.id")
    person_id: UUID = Field(foreign_key="person.id")
    fact_id: str = Field(index=True)
    brand_name: str
    generic_name: Optional[str] = None
    strength: Optional[str] = None
    frequency: Optional[str] = Field(default="1-0-0")
    timing: Optional[str] = Field(default="before_breakfast")
    duration: Optional[str] = Field(default="30 days")
    confidence: float = Field(default=0.98)
    source_page: int = Field(default=1)
    bounding_box_json: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Condition(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    document_id: UUID = Field(foreign_key="document.id")
    person_id: UUID = Field(foreign_key="person.id")
    fact_id: str = Field(index=True)
    text: str
    icd10: Optional[str] = None
    organ_system: Optional[str] = None
    confidence: float = Field(default=0.96)
    bounding_box_json: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
