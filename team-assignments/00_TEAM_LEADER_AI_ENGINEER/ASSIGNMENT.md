# 🧠 ROLE: TEAM LEADER & AI ARCHITECT
## Member: [Your Name] — AI Engineering, Multimodal Pipeline & Team Leadership
## Track: Altrix Labs — AI-Powered Personal Health Copilot (HacXLerate 2026 Round 1)

---

> **Your Mission:** Build the world-class AI engine for **CareLens** that secures 100% of the **35% AI Utilization score** and anchors the **10% Healthcare Impact** score. You implement the multimodal extraction pipeline with bounding-box pixel grounding, deterministic clinical rules engine, polypharmacy collision detector, grounded attribution summarizer, and multi-language translation guards. You also lead team integration and ensure our deployed demo wins the competition.

---

## 🏆 ALTRIX LABS 35% AI UTILIZATION SCORECARD

| Scoring Rubric Item | Weight | How Your Code Dominates It |
|---|:---:|---|
| **Extraction Accuracy (Medicines, Dosages, Test Values, Dates)** | **20%** | Dual-pass Multimodal VLM (Gemini 1.5) + PaddleOCR consensus with character reconciliation. Bounding-box detection `[ymin, xmin, ymax, xmax]` for every extracted fact. |
| **Grounded Health Summary & Explanations** | **15%** | Summarizer accepts ONLY structured facts with IDs; every claim cites `[fact_id]`; ungrounded facts rejected by post-filter; dual Layman vs. Clinical SBAR modes. |
| **Healthcare Safety & Guardrails (Impact)** | **10%** | Deterministic Python rules engine decides High/Low/Critical (NEVER the LLM); polypharmacy duplicate salt detector; non-diagnostic safety regex filter. |
| **Multi-Language Bonus Credit** | **+5%** | Telugu (తెలుగు), Hindi (हिन्दी), and Tamil (தமிழ்) with token-locked translation guard guaranteeing zero numerical drift. |

---

## 🗂️ REPOSITORY ARCHITECTURE YOU OWN

```
backend/
├── app/
│   ├── pipeline/
│   │   ├── __init__.py
│   │   ├── preprocess.py          # PDF→images, deskewing, SHA-256 caching
│   │   ├── classify.py            # Document classifier (Prescription, Lab, Discharge, Scan)
│   │   ├── extract_vlm.py         # Gemini 1.5 multimodal extraction with Bounding Boxes
│   │   ├── ocr_engine.py          # PaddleOCR character-level fallback & reconciliation
│   │   ├── reconcile.py           # Cross-checks VLM vs OCR, flags needs_review
│   │   ├── organ_mapper.py        # Maps tests to 6 anatomical organ systems
│   │   ├── rules_engine.py        # Code-driven ICMR/NABL reference range classifier
│   │   ├── polypharmacy.py        # Duplicate salt therapy & drug interaction detector
│   │   ├── summarise.py           # Grounded summary (Layman + Clinical SBAR modes)
│   │   └── translate.py           # Telugu, Hindi, Tamil translation with token locks
│   ├── prompts/
│   │   ├── classify_v1.txt
│   │   ├── extract_v1.txt
│   │   ├── summarize_layman_v1.txt
│   │   ├── summarize_clinical_v1.txt
│   │   └── translate_v1.txt
│   ├── core/
│   │   ├── config.py              # Environment settings, API keys, feature flags
│   │   ├── llm_adapter.py         # GeminiProvider & zero-latency MockProvider
│   │   └── safety_filter.py       # Rejects diagnostic claims ("you have diabetes")
│   └── models/
│       └── extraction.py          # Pydantic V2 schemas for extraction JSON
```

---

## 🔧 KEY TECHNICAL IMPLEMENTATIONS

### 1. Bounding-Box Extraction Schema (`models/extraction.py`)
Every extracted observation and medication includes its normalized pixel bounding box `[ymin, xmin, ymax, xmax]` (scale 0–1000) so the frontend Split Document View can highlight the exact text on the original scan:

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class BoundingBox(BaseModel):
    ymin: int = Field(..., ge=0, le=1000)
    xmin: int = Field(..., ge=0, le=1000)
    ymax: int = Field(..., ge=0, le=1000)
    xmax: int = Field(..., ge=0, le=1000)

class ExtractedObservation(BaseModel):
    id: str = Field(..., description="Unique fact ID, e.g. fact_1")
    name: str
    loinc_code: Optional[str] = None
    value: str
    numeric_value: Optional[float] = None
    unit: Optional[str] = None
    ref_range: Optional[str] = None
    printed_flag: Optional[Literal["H", "L", "critical", None]] = None
    organ_system: Literal["cardiovascular", "endocrine", "respiratory", "renal", "hepatic", "neurological"]
    confidence: float
    source_page: int
    source_quote: str
    bounding_box: BoundingBox

class ExtractedMedication(BaseModel):
    id: str = Field(..., description="Unique fact ID, e.g. med_1")
    brand_name: str
    generic_name: Optional[str] = None
    strength: Optional[str] = None
    form: Optional[str] = "tablet"
    dose: Optional[str] = "1 tab"
    frequency: Optional[str] = "1-0-0"
    timing: Optional[str] = "before_breakfast"
    duration: Optional[str] = "30 days"
    confidence: float
    source_page: int
    bounding_box: BoundingBox

class ExtractionResult(BaseModel):
    doc_type: Literal["prescription", "lab_report", "discharge_summary", "diagnostic_scan"]
    document_date: Optional[str] = None
    facility_name: Optional[str] = None
    clinician_name: Optional[str] = None
    patient_name: Optional[str] = None
    observations: List[ExtractedObservation] = []
    medications: List[ExtractedMedication] = []
    diagnoses: List[dict] = []
    warnings: List[str] = []
    needs_review: bool = False
```

---

### 2. Deterministic Clinical Rules Engine (`rules_engine.py`)
> **HARD RULE:** Never let the LLM guess whether a test value is abnormal. The rules engine handles all clinical classification:
1. Parse the printed reference range directly from the report (e.g. `"4.0 - 5.6%"`).
2. If absent, fallback to seeded NABL/ICMR reference ranges in `data/ref_ranges.json`.
3. Compute the range dot position across 4 zones:
   - `0% - 25%`: Low
   - `25% - 70%`: Normal
   - `70% - 90%`: Elevated
   - `90% - 100%`: Critical
4. Assign deterministic status flags: `normal`, `high`, `low`, `critical`.

---

### 3. Polypharmacy & Drug Collision Engine (`polypharmacy.py`)
This gives CareLens massive clinical depth over competitors by checking multi-document history:
```python
def check_polypharmacy(active_medications: list[dict]) -> list[dict]:
    """
    Detects:
    1. Duplicate salt therapy: Patient was prescribed 'Glycomet 500' by Clinic A
       and 'Cetapin 500' by Clinic B (both are Metformin).
    2. Known drug-drug interactions: e.g. ACE inhibitor + Potassium sparing diuretic.
    Returns: Structured safety warnings citing the conflicting medications.
    """
```

---

### 4. Grounded Summary Generator (`summarise.py`)
Generates dual-mode summaries where every sentence is tied to fact IDs:
- **Layman Mode (`summarize_layman_v1.txt`):** 6th-grade conversational English explaining what tests mean, why values might be elevated, and reinforcing patient peace of mind.
- **Clinical Mode (`summarize_clinical_v1.txt`):** Standard medical SBAR (Situation, Background, Assessment, Recommendation) format designed for physician handoff.
- **Attribution Verifier:** Programmatically scans summary output:
  - If a medical claim is made without a citation like `[fact_1]`, reject.
  - If a cited `fact_id` does not exist in the extracted facts dictionary, reject.

---

### 5. Multi-Language Translation Guard (`translate.py`)
Supports **Telugu (`te`)**, **Hindi (`hi`)**, and **Tamil (`ta`)**:
```python
import re

def protect_and_translate(english_text: str, facts: dict, target_lang: str) -> dict:
    """
    1. Regex replaces: numbers (e.g. '7.2%'), drug names ('Metformin'), and fact citations ('[fact_1]')
       with immutable tokens: {{TOKEN_1}}, {{TOKEN_2}}.
    2. Sends tokenized string to translation model (IndicTrans2 / Gemini).
    3. Restores tokens precisely.
    4. Performs reverse back-translation verification. If numbers shifted, fall back safely to English.
    """
```

---

## 📅 HOUR-BY-HOUR LEAD SCHEDULE

| Hours | Task | Target Milestone |
|---|---|---|
| **Hour 0 – 2** | Initialize repo, `.env`, Discord/Slack, coordinate team prompts | Team instances booted, Git repo active |
| **Hour 2 – 4** | Build VLM extraction schema with Bounding Box coordinates | Single synthetic report extracted to complete JSON |
| **Hour 4 – 6** | Implement OCR character reconciliation & confidence scoring | Needs-review flags working on messy text |
| **Hour 6 – 8** | Connect pipeline to Backend API (`POST /api/documents`) | Extraction runs end-to-end via REST endpoint |
| **Hour 8 – 10** | **V1 CLOUD DEPLOYMENT CHECKPOINT** | Deployed application accessible online |
| **Hour 10 – 13** | Implement Deterministic Rules Engine + Polypharmacy checker | Abnormality computed & duplicate salts flagged |
| **Hour 13 – 16** | Build Grounded Attribution Summarizer (Layman + Clinical) | Hallucination rate = 0.0%, 100% cited facts |
| **Hour 16 – 18** | Multi-language translation guard (Telugu, Hindi, Tamil) | Number-safe regional summaries verified |
| **Hour 18 – 20** | Full integration testing with QA engineer's eval harness | Automated harness outputs **F1 > 95%** |
| **Hour 20 – 22** | Demo recording, 5-slide deck review, **FINAL SUBMISSION** | Submission uploaded with working public URLs |

---

## 🧰 TOOLS, MODELS & RESOURCES YOU USE
Refer to [`SHARED_RESOURCES.md`](file:///c:/Users/aasis/OneDrive%20-%20Vignan%20University/Desktop/HacXLerate%202026/team-assignments/SHARED_RESOURCES.md) for full setup guides:
- **Primary VLM:** `google-generativeai` (Gemini 1.5 Pro / Flash) with temperature = 0 and response_schema.
- **Medical Model Benchmark:** MedGemma 1.5 4B (`google/medgemma-1.5-4b-it`, arXiv:2507.05201).
- **OCR Character Fallback:** `paddleocr` + `paddlepaddle` for numerical cross-checking.
- **Indic Handwritten Support:** Sarvam Vision 2.1 & `sarvamai/indic-ocr-bench`.
- **Translation Engine:** AI4Bharat IndicTrans2 (`ai4bharat/indictrans2-indic-indic-1B`) & Sarvam Translate.
- **Document Rasterization:** `pypdf2`, `pdf2image`, `pillow`.

