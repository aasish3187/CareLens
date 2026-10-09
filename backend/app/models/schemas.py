import datetime as dt
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from uuid import UUID


# --- Person Schemas ---
class PersonBase(BaseModel):
    display_name: str = "Arjun Verma"
    dob: Optional[dt.date] = dt.date(1982, 8, 14)
    sex: Optional[str] = "male"
    blood_group: Optional[str] = "B+"
    abha_number: Optional[str] = "91-2345-6789-0123 (MOCK)"
    abha_address: Optional[str] = "arjun.verma@abdm"
    phone: Optional[str] = "+91 98765 43210"
    email: Optional[str] = "arjun.verma@example.com"


class PersonCreate(PersonBase):
    pass


class PersonRead(PersonBase):
    id: UUID
    created_at: dt.datetime
    model_config = ConfigDict(from_attributes=True)


# --- Observation Schemas ---
class ObservationBase(BaseModel):
    fact_id: str
    name: str
    loinc_code: Optional[str] = None
    value_text: str = ""
    numeric_value: Optional[float] = None
    value_num: Optional[float] = None
    unit: Optional[str] = None
    ref_range: Optional[str] = None
    ref_low: Optional[float] = None
    ref_high: Optional[float] = None
    ref_text: Optional[str] = None
    flag: Optional[str] = "normal"  # normal | high | low | critical
    organ_system: str = "endocrine"  # cardiovascular | endocrine | respiratory | renal | hepatic | neurological
    confidence: float = 0.99
    source_page: int = 1
    bounding_box_json: Optional[str] = None  # [ymin, xmin, ymax, xmax]


class ObservationRead(ObservationBase):
    id: UUID
    document_id: UUID
    person_id: UUID
    created_at: dt.datetime
    model_config = ConfigDict(from_attributes=True)


# --- Medication Schemas ---
class MedicationBase(BaseModel):
    fact_id: str
    brand_name: str
    generic_name: Optional[str] = None
    strength: Optional[str] = None
    form: Optional[str] = "tablet"
    dosage: Optional[str] = None
    frequency: Optional[str] = "1-0-0"
    timing: Optional[str] = "before_breakfast"
    duration: Optional[str] = "30 days"
    instructions: Optional[str] = None
    confidence: float = 0.98
    bounding_box_json: Optional[str] = None


class MedicationRead(MedicationBase):
    id: UUID
    document_id: UUID
    person_id: UUID
    created_at: dt.datetime
    model_config = ConfigDict(from_attributes=True)


# --- Condition Schemas ---
class ConditionBase(BaseModel):
    fact_id: str
    code: Optional[str] = None
    clinical_status: str = "active"
    verification_status: str = "confirmed"
    name: str
    category: Optional[str] = "problem-list-item"
    severity: Optional[str] = "moderate"
    organ_system: Optional[str] = "endocrine"
    onset_date: Optional[dt.date] = None
    confidence: float = 0.98
    bounding_box_json: Optional[str] = None


class ConditionRead(ConditionBase):
    id: UUID
    document_id: UUID
    person_id: UUID
    created_at: dt.datetime
    model_config = ConfigDict(from_attributes=True)


# --- Document Schemas ---
class DocumentBase(BaseModel):
    doc_type: Optional[str] = "lab_report"
    original_filename: str
    file_type: str = "application/pdf"
    file_size_bytes: int = 0
    doc_date: Optional[dt.date] = None
    facility_name: Optional[str] = None
    clinician_name: Optional[str] = None
    facility: Optional[str] = None
    clinician: Optional[str] = None


class DocumentCreate(DocumentBase):
    person_id: UUID


class DocumentRead(DocumentBase):
    id: UUID
    person_id: UUID
    sha256: str
    status: str
    summary_layman: Optional[str] = None
    summary_clinical: Optional[str] = None
    grounding_score: Optional[float] = 0.994
    created_at: dt.datetime
    processed_at: Optional[dt.datetime] = None
    model_config = ConfigDict(from_attributes=True)


# --- Citation & Bounding Box ---
class CitationItem(BaseModel):
    fact_id: str
    text: str
    entity_type: str  # observation | medication | condition
    bounding_box: Optional[List[int]] = None  # [ymin, xmin, ymax, xmax]
    page: int = 1


# --- Grounded Analysis Response ---
class DocumentAnalysisResponse(BaseModel):
    document_id: UUID
    person_id: UUID
    original_filename: str
    doc_type: str
    doc_date: Optional[dt.date] = None
    facility: Optional[str] = None
    clinician: Optional[str] = None
    status: str
    mode: str = "layman"  # layman | clinical
    lang: str = "en"  # en | te | hi | ta
    summary: str
    grounding_score: float = 0.994
    preview_url: Optional[str] = None
    citations: List[CitationItem] = []
    observations: List[ObservationRead] = []
    medications: List[MedicationRead] = []
    conditions: List[ConditionRead] = []


# --- Organ Status Schemas (for 3D Anatomical Body Twin) ---
class OrganSystemMetric(BaseModel):
    status: str = "normal"  # normal | elevated | critical | unknown
    organ_name: str = "Organ System"
    primary_alert: Optional[str] = None
    alert: Optional[str] = None
    active_tests: int = 0
    latest_test_date: Optional[str] = None
    confidence: float = 0.98
    warnings: int = 0
    highlight_color: str = "#10B981"  # Emerald green, amber (#F59E0B), red (#EF4444)
    tests: List[ObservationRead] = []


class OrganStatusResponse(BaseModel):
    person_id: UUID
    last_updated: dt.datetime
    overall_health_score: int = 92  # 0-100 score
    organ_systems: Dict[str, OrganSystemMetric]


# --- Polypharmacy Collision Schemas ---
class PrescriptionReference(BaseModel):
    medication_id: UUID
    document_id: UUID
    brand_name: str
    strength: Optional[str] = None
    frequency: Optional[str] = None
    prescribed_date: Optional[dt.date] = None
    facility_name: Optional[str] = None


class DuplicateSaltAlert(BaseModel):
    salt_name: str
    severity: str = "HIGH"  # HIGH | MODERATE | LOW
    description: str
    prescriptions: List[PrescriptionReference]
    clinical_risk: str
    recommendation: str


class DrugInteractionAlert(BaseModel):
    interaction_pair: List[str]
    severity: str = "MODERATE"
    mechanism: str
    clinical_risk: str
    recommendation: str


class PolypharmacyResponse(BaseModel):
    person_id: UUID
    total_active_medications: int
    has_conflicts: bool
    duplicate_salts_count: int
    interactions_count: int
    duplicate_salts: List[DuplicateSaltAlert] = []
    drug_interactions: List[DrugInteractionAlert] = []
    clinical_summary: str


# --- Timeline Schemas ---
class TimelineEvent(BaseModel):
    id: UUID
    date: Optional[dt.date] = None
    doc_id: UUID
    doc_type: str
    title: str
    facility: Optional[str] = None
    clinician: Optional[str] = None
    summary: str
    key_findings: List[str] = []
    organ_systems_affected: List[str] = []
    status: str = "ready"


class TimelineResponse(BaseModel):
    person_id: UUID
    events: List[TimelineEvent]


# --- Mock ABHA Card Schemas ---
class LinkedFacility(BaseModel):
    hip_id: str
    hip_name: str
    records_count: int
    last_synced: str


class AbhaCardResponse(BaseModel):
    person_id: UUID
    abha_number: str
    abha_address: str
    full_name: str
    dob: Optional[dt.date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = "B+"
    qr_code_base64: str  # Base64 PNG data URL generated via qrcode[pil]
    qr_code_svg: str  # Fallback vector SVG
    status: str = "VERIFIED_MOCK"
    linked_facilities: List[LinkedFacility] = []


# --- Health & Eval Probes ---
class HealthResponse(BaseModel):
    status: str = "healthy"
    app: str = "CareLens"
    app_name: str = "CareLens"
    version: str = "1.0.0"
    database: str = "connected"
    storage: str = "writeable"
    timestamp: dt.datetime
    demo_mode: bool = True
    abdm_fhir_ready: bool = True
    languages: List[str] = ["en", "te", "hi", "ta"]
