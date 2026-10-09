# ⚙️ ROLE: BACKEND ENGINEER & API ARCHITECT
## Member: [Name] — Backend Architecture, Database, REST API & ABDM Endpoints
## Track: Altrix Labs — AI-Powered Personal Health Copilot (HacXLerate 2026 Round 1)

---

> **Your Mission:** Build the high-performance, rock-solid FastAPI backend, SQLite/PostgreSQL database, background task orchestrator, and REST API for **CareLens**. You provide the stable, fully-documented endpoints that power the **Interactive 3D Anatomical Body Twin**, **Split-Screen Evidence Grounding Studio**, **Polypharmacy Collision Engine**, and **Mock ABHA Locker**. You ensure the system achieves 100% of the **25% Technical Architecture score**.

---

## 🏆 ALTRIX LABS 25% TECHNICAL ARCHITECTURE SCORECARD

| Scoring Rubric Item | Weight | How Your Backend Wins It |
|---|:---:|---|
| **Clean Data Pipeline & Layered Architecture** | **10%** | Decoupled FastAPI architecture with async background tasks, SHA-256 deduplication cache, and Pydantic V2 validation. |
| **Sensible Storage & Structured Relational Models** | **8%** | Relational SQLModel schemas linking documents, observations, medications, and conditions with bounding box geometry. |
| **ABDM-Ready Schema & FHIR R4 Export** | **7%** | Native mapping to National Resource Centre for EHR Standards (NRCeS) FHIR R4 Bundle specifications. |
| **ABDM / Mock ABHA Bonus Credit** | **+5%** | Dedicated `/api/abha` mock gateway generating digital health cards with QR codes and FHIR downloads. |

---

## 🗂️ REPOSITORY ARCHITECTURE YOU OWN

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI application, CORS, lifespan handler
│   ├── config.py                  # Pydantic BaseSettings (env, feature flags)
│   ├── database.py                # Async SQLite/PostgreSQL session manager
│   ├── api/
│   │   ├── __init__.py
│   │   ├── router.py              # Master API router
│   │   ├── documents.py           # Upload, list, preview, and delete documents
│   │   ├── extractions.py         # Get/patch facts with bounding-box geometry
│   │   ├── patients.py            # 3D organ status, timeline, grounded summaries
│   │   ├── polypharmacy.py        # Duplicate salt & drug interaction alerts
│   │   ├── abha.py                # Mock ABHA card, QR code & consent endpoints
│   │   ├── fhir.py                # NRCeS FHIR R4 bundle generation & export
│   │   └── health.py              # Health check endpoint for automated evaluators
│   ├── models/
│   │   ├── __init__.py
│   │   ├── database.py            # SQLModel ORM models
│   │   ├── schemas.py             # Pydantic request/response schemas
│   │   └── extraction.py          # Extraction JSON schema
│   ├── services/
│   │   ├── __init__.py
│   │   ├── document_service.py    # File validation, SHA-256 dedup, storage
│   │   ├── organ_service.py       # Aggregates lab tests into 6 organ systems
│   │   ├── timeline_service.py    # Chronological health journey compiler
│   │   └── abha_service.py        # Mock ABHA digital card & FHIR builder
│   ├── pipeline/
│   │   └── orchestrator.py        # Async task queue for document processing
│   └── middleware/
│       ├── __init__.py
│       ├── error_handler.py       # Global exception interceptor
│       └── pii_redactor.py        # Strips Aadhaar/phone numbers before AI inference
├── tests/
│   ├── test_api_documents.py
│   ├── test_api_organ_status.py
│   ├── test_api_polypharmacy.py
│   └── test_api_health.py
├── requirements.txt
├── Dockerfile
└── .env.example
```

---

## 🔧 KEY TECHNICAL SPECIFICATIONS

### 1. Database Schema (`models/database.py`)
Features explicit support for **3D Organ Twins** (`organ_system`), **Bounding Boxes** (`bounding_box_json`), and **ABDM Identifiers**:

```python
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import date, datetime
from uuid import uuid4, UUID

class Person(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    display_name: str = "Arjun Verma"
    dob: Optional[date] = date(1982, 8, 14)
    sex: Optional[str] = "male"
    abha_number: Optional[str] = "91-2345-6789-0123"  # Official MOCK ABHA
    abha_address: Optional[str] = "arjun.verma@abdm"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Document(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    person_id: UUID = Field(foreign_key="person.id")
    doc_type: str = "lab_report"  # prescription | lab_report | discharge_summary | diagnostic_scan
    original_filename: str
    storage_path: str
    sha256: str
    doc_date: Optional[date] = None
    facility_name: Optional[str] = None
    clinician_name: Optional[str] = None
    status: str = Field(default="uploaded")  # uploaded | processing | ready | failed
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Observation(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    document_id: UUID = Field(foreign_key="document.id")
    person_id: UUID = Field(foreign_key="person.id")
    fact_id: str  # e.g. "fact_1" for citation pill linking
    name: str
    loinc_code: Optional[str] = None
    value_text: str
    numeric_value: Optional[float] = None
    unit: Optional[str] = None
    ref_range: Optional[str] = None
    flag: Optional[str] = "normal"  # normal | high | low | critical
    organ_system: str = "endocrine"  # cardiovascular | endocrine | respiratory | renal | hepatic | neurological
    confidence: float = 0.99
    source_page: int = 1
    bounding_box_json: Optional[str] = None  # e.g. "[520, 60, 548, 380]" (ymin, xmin, ymax, xmax)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Medication(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    document_id: UUID = Field(foreign_key="document.id")
    person_id: UUID = Field(foreign_key="person.id")
    fact_id: str
    brand_name: str
    generic_name: Optional[str] = None
    strength: Optional[str] = None
    frequency: Optional[str] = "1-0-0"
    timing: Optional[str] = "before_breakfast"
    duration: Optional[str] = "30 days"
    confidence: float = 0.98
    bounding_box_json: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

---

### 2. Core REST Endpoints

#### Organ Status Endpoint (Feeds Interactive 3D Body Twin):
```python
# GET /api/patients/{person_id}/organ-status
@router.get("/{person_id}/organ-status")
async def get_organ_status(person_id: UUID):
    """
    Returns aggregated health status across all 6 organ systems:
    {
      "endocrine": {
        "status": "elevated",
        "organ_name": "Pancreas & Blood Sugar",
        "primary_alert": "HbA1c 7.2% (Elevated)",
        "active_tests": 2,
        "latest_test_date": "2026-10-05"
      },
      "cardiovascular": {"status": "normal", "organ_name": "Heart & Vessels", "active_tests": 3},
      "respiratory": {"status": "normal", "organ_name": "Lungs & Respiratory", "active_tests": 1},
      "renal": {"status": "normal", "organ_name": "Kidneys", "active_tests": 2},
      "hepatic": {"status": "normal", "organ_name": "Liver", "active_tests": 3},
      "neurological": {"status": "normal", "organ_name": "Brain & Cognitive", "active_tests": 1}
    }
    """
```

#### Split Document & Grounded Analysis Endpoint:
```python
# GET /api/documents/{doc_id}/analysis?mode=layman|clinical&lang=en|te|hi|ta
@router.get("/{doc_id}/analysis")
async def get_document_analysis(doc_id: UUID, mode: str = "layman", lang: str = "en"):
    """
    Returns:
    1. Original document image URL with bounding-box overlays
    2. Grounded plain-language summary citing [fact_id] tags
    3. Extracted observations with 4-zone dot-slider gauge data
    4. Extracted medications with Indian brand->generic resolution
    5. Overall Grounding Confidence Score (e.g. 99.4%)
    """
```

#### Polypharmacy Collision Endpoint:
```python
# GET /api/patients/{person_id}/polypharmacy
@router.get("/{person_id}/polypharmacy")
async def check_polypharmacy_conflicts(person_id: UUID):
    """
    Detects cross-document duplicate salt therapies:
    e.g. "Warning: Glycomet-GP 1 (Prescription Oct 3) and Cetapin 500 (Prescription Sep 15)
    both contain Metformin. Potential accidental double dosing."
    """
```

#### ABDM & Mock ABHA Digital Health Card (Bonus Credit):
```python
# GET /api/abha/{person_id}/card
@router.get("/{person_id}/card")
async def get_mock_abha_card(person_id: UUID):
    """Returns official Mock ABHA credentials, QR code, and linked hospital facilities."""

# GET /api/fhir/export/{doc_id}
@router.get("/export/{doc_id}")
async def export_abdm_fhir_bundle(doc_id: UUID):
    """Generates official NRCeS ABDM-compliant FHIR R4 Bundle JSON."""
```

#### Health Check Endpoint (Probed by Evaluators):
```python
# GET /api/health
@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app": "CareLens",
        "version": "1.0.0",
        "demo_mode": settings.DEMO_MODE,
        "abdm_fhir_ready": True,
        "languages": ["en", "te", "hi", "ta"]
    }
```

---

## 📅 HOUR-BY-HOUR BACKEND SCHEDULE

| Hours | Task | Milestone |
|---|---|---|
| **Hour 0 – 2** | Initialize FastAPI project, CORS, async SQLite connection | Server runs on `http://localhost:8000/docs` |
| **Hour 2 – 4** | Build secure file upload, SHA-256 deduplication cache, storage | Uploads accept PDF/JPG with zero duplicate leaks |
| **Hour 4 – 6** | Implement SQLModel database models & CRUD operations | Tables initialized with demo seed data |
| **Hour 6 – 8** | Connect pipeline orchestrator with AI extraction service | `POST /api/documents` triggers AI extraction in background |
| **Hour 8 – 10** | **V1 CLOUD DEPLOYMENT** with Frontend | Live public URL running on Render/Railway |
| **Hour 10 – 13** | Implement `/organ-status` and `/analysis` endpoints | Body Twin and Split View fully connected |
| **Hour 13 – 16** | Build `/polypharmacy` collision checker & Layman/Clinical toggles | Duplicate salt detector active |
| **Hour 16 – 18** | Implement ABDM Mock ABHA endpoints & NRCeS FHIR export | Valid FHIR R4 bundle exportable |
| **Hour 18 – 20** | Health check hardening, rate limiting, and integration testing | 100% of API unit tests passing |
| **Hour 20 – 22** | Cloud database backup dump & demo walkthrough assist | 0 errors during live judge presentation |

---

## 🧰 TOOLS, PACKAGES & FRAMEWORKS YOU USE
Refer to [`SHARED_RESOURCES.md`](file:///c:/Users/aasis/OneDrive%20-%20Vignan%20University/Desktop/HacXLerate%202026/team-assignments/SHARED_RESOURCES.md) for full configurations:
- **Web Framework:** `fastapi`, `uvicorn[standard]`
- **Validation & Schemas:** `pydantic>=2.7.0`, `pydantic-settings`
- **Database & Async ORM:** `sqlmodel`, `aiosqlite`
- **File Ingestion & Cryptography:** `python-multipart`, `aiofiles`, `hashlib` (SHA-256)
- **PII Masking:** Python `re` for client-side Aadhaar & phone regex sanitization
- **QR Code Engine:** `qrcode[pil]` with base64 PNG export for Mock ABHA cards
- **Testing:** `pytest`, `pytest-asyncio`, `httpx` (async test client)

