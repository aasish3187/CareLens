from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class BoundingBox(BaseModel):
    """Normalized bounding box coordinates (0 to 1000 scale)."""
    ymin: int = Field(..., ge=0, le=1000, description="Top edge coordinate")
    xmin: int = Field(..., ge=0, le=1000, description="Left edge coordinate")
    ymax: int = Field(..., ge=0, le=1000, description="Bottom edge coordinate")
    xmax: int = Field(..., ge=0, le=1000, description="Right edge coordinate")

class ExtractedObservation(BaseModel):
    id: str = Field(..., description="Unique fact citation ID, e.g. fact_1")
    name: str = Field(..., description="Name of diagnostic test, e.g. HbA1c")
    loinc_code: Optional[str] = Field(None, description="Standardized LOINC code, e.g. 4548-4")
    value: str = Field(..., description="Raw extracted string value")
    numeric_value: Optional[float] = Field(None, description="Parsed numeric value if scalar")
    unit: Optional[str] = Field(None, description="Measurement unit, e.g. mg/dL, %")
    ref_range: Optional[str] = Field(None, description="Printed reference range from document")
    printed_flag: Optional[Literal["H", "L", "critical", None]] = Field(None, description="Printed abnormality flag on report")
    computed_flag: Optional[Literal["normal", "high", "low", "critical", "unknown"]] = Field("unknown", description="Computed by deterministic rules engine")
    range_dot_percent: Optional[float] = Field(None, ge=0.0, le=100.0, description="0-100% position on Low-Normal-Elevated-Critical dot slider")
    organ_system: Literal["cardiovascular", "endocrine", "respiratory", "renal", "hepatic", "neurological"] = Field(
        ..., description="Anatomical system mapped for 3D body twin"
    )
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model extraction confidence score")
    source_page: int = Field(1, ge=1, description="Page index in original PDF/image")
    source_quote: str = Field(..., description="Exact verbatim text snippet from document")
    bounding_box: BoundingBox = Field(..., description="Pixel bounding box for split-screen zoom")

class ExtractedMedication(BaseModel):
    id: str = Field(..., description="Unique fact ID, e.g. med_1")
    brand_name: str = Field(..., description="Commercial brand name printed on prescription")
    generic_name: Optional[str] = Field(None, description="Resolved active pharmacological salt composition")
    strength: Optional[str] = Field(None, description="Dosage strength, e.g. 500mg, 1mg/500mg")
    form: Optional[str] = Field("tablet", description="Dosage form: tablet, capsule, syrup, injection")
    dose: Optional[str] = Field("1 tab", description="Prescribed dose quantity")
    frequency: Optional[str] = Field("1-0-0", description="Indian dosage frequency code: OD, BD, TDS, 1-0-1")
    timing: Optional[str] = Field("before_food", description="Meal timing: before_food, after_food, bedtime")
    duration: Optional[str] = Field(None, description="Duration of therapy, e.g. 30 days")
    instructions: Optional[str] = Field(None, description="Special instructions from clinician")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model confidence score")
    source_page: int = Field(1, ge=1)
    source_quote: str = Field(...)
    bounding_box: BoundingBox

class ExtractedDiagnosis(BaseModel):
    id: str = Field(..., description="Unique condition ID, e.g. diag_1")
    text: str = Field(..., description="Clinical impression or diagnosis text")
    icd10_hint: Optional[str] = Field(None, description="Suggested ICD-10 classification")
    organ_system: Optional[str] = Field(None, description="Target organ system")
    confidence: float = Field(..., ge=0.0, le=1.0)
    source_page: int = Field(1, ge=1)
    source_quote: str = Field(...)
    bounding_box: Optional[BoundingBox] = None

class ExtractionResult(BaseModel):
    doc_type: Literal["prescription", "lab_report", "discharge_summary", "diagnostic_scan"]
    document_date: Optional[str] = None
    facility_name: Optional[str] = None
    clinician_name: Optional[str] = None
    patient_name: Optional[str] = None
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    observations: List[ExtractedObservation] = []
    medications: List[ExtractedMedication] = []
    diagnoses: List[ExtractedDiagnosis] = []
    warnings: List[str] = []
    needs_review: bool = False
    grounding_confidence: float = Field(0.99, ge=0.0, le=1.0)
