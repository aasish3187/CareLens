# CareLens — AI-Powered Personal Health Copilot
## Comprehensive Project Documentation & Technical Submission
> **ByteXL · HacXLerate 2026 Hackathon · Altrix Labs Challenge**  
> **Track**: AI-Powered Personal Health Copilot  
> **Team**: NextGen Operators  

---

## 👥 NextGen Operators — Team Members

| Name | Role | Responsibilities |
| :--- | :--- | :--- |
| **Aasish Tammisetti** *(Team Lead)* | Lead Architect & Full-Stack Engineer | System Architecture, Dual-Pass AI Pipeline, Deployment & Integration |
| **G. Sai Sreemanth** | Backend & Healthcare Standards Engineer | FastAPI Engine, ABDM NRCeS FHIR R4 Bundle Export, Database Schema |
| **A. Sai Teja** | Computer Vision & Extraction Engineer | Multi-Engine OCR Consensus, Bounding Box Normalization, Image Deskew |
| **M. Prasanth** | Frontend & 3D Interactive UI Engineer | React 18 SPA, Three.js 3D Anatomical Twin, Responsive UX & Tailwind |
| **Sk. Iliyas** | Clinical Rules & NLP Localization Engineer | Deterministic Rules Engine, Polypharmacy Collision, Multilingual (TE/HI/TA) |

---

## 🌐 Live Submission Links

| Resource | URL |
| :--- | :--- |
| **Live Deployed Web Application** | [https://carelens-production.up.railway.app](https://carelens-production.up.railway.app) |
| **Interactive Evidence Studio** | [https://carelens-production.up.railway.app/evidence/apollo](https://carelens-production.up.railway.app/evidence/apollo) |
| **3D Anatomical Digital Twin** | [https://carelens-production.up.railway.app/body-twin](https://carelens-production.up.railway.app/body-twin) |
| **Mock ABHA Health Card** | [https://carelens-production.up.railway.app/abha](https://carelens-production.up.railway.app/abha) |
| **Interactive Swagger API Documentation** | [https://carelens-production.up.railway.app/docs](https://carelens-production.up.railway.app/docs) |
| **System Diagnostic Health Endpoint** | [https://carelens-production.up.railway.app/api/health](https://carelens-production.up.railway.app/api/health) |
| **Official GitHub Repository** | [https://github.com/aasish3187/CareLens](https://github.com/aasish3187/CareLens) |

---

## 1. Executive Summary & Problem Statement

### The Healthcare Fragmentation Crisis
In India and globally, healthcare records are severely fragmented across printed lab reports, handwritten prescriptions, hospital discharge summaries, and diagnostic imaging scans. Patients face critical barriers:
1. **Unreadable Handwriting & Clinical Jargon**: Doctor prescriptions are frequently illegible or packed with technical abbreviations, leading to medication misunderstandings and duplicate drug consumption.
2. **Disconnected Records**: Patients carry physical paper files from clinic to clinic; longitudinal trends (such as climbing HbA1c or declining eGFR) go unnoticed until conditions become acute.
3. **Black-Box AI Risks**: Generic LLMs hallucinate medical advice, misinterpret lab reference ranges, or suggest unvalidated dosing changes.

### The CareLens Solution
**CareLens** is an enterprise-grade Personal Health Copilot engineered by **NextGen Operators**. CareLens ingests raw medical documents (PDFs, mobile camera photos, scans), performs on-device PII redaction, runs a dual-pass multimodal extraction pipeline, validates all findings through a deterministic clinical rules engine, and grounds every insight visually with coordinates and fact-citations. It unites the patient’s longitudinal history into a single interactive 3D anatomical twin, polypharmacy collision shield, and exportable ABDM FHIR R4 health record.

---

## 2. Core Pillars & Innovative Capabilities

### 🔬 Pillar 1: Multimodal Vision & OCR Consensus Engine
- **Pass 1 — Google Gemini 1.5 Flash VLM**: High-resolution image understanding directly analyzing handwriting, printed tables, clinician signatures, and document metadata at temperature `0.0`.
- **Pass 2 — Groq LLaMA 3.2 Vision & Dual Verifier**: Ultra-fast secondary pass validating extracted clinical values, units, and dosage timings at 500+ tokens/sec.
- **Local Fallback — RapidOCR & ONNX Runtime**: Embedded OCR engine executing locally on-CPU via `rapidocr-onnxruntime` + `pypdfium2` whenever cloud networks are unavailable.
- **Normalized Bounding Boxes**: All extracted entities are mapped to `[ymin, xmin, ymax, xmax]` coordinates scaled to 0–1000 for responsive pixel-perfect highlighting.

### 🛡️ Pillar 2: Deterministic Clinical Rules Engine (Zero-Hallucination)
- **Hard Rule**: AI/LLMs **never decide if a lab value is abnormal**.
- Clinical flags (`normal`, `low`, `high`, `critical`) are calculated exclusively by deterministic Python code against standardized **ICMR** (Indian Council of Medical Research) and **NABL** reference intervals.
- The LLM only receives structured facts with unique IDs (`[fact_id]`) and produces plain-language translations that cite their exact evidence source.

### 💊 Pillar 3: Indian Drug Normalizer & Polypharmacy Collision Shield
- Matches commercial Indian brand names (e.g., *Augmentin 625*, *Glycomet-GP 1*, *Pan-D*, *Telma-H*) to their underlying active salts using RapidFuzz in **<15ms**.
- Detects dangerous **duplicate salt collisions** (e.g., taking Dolo-650 and Combiflam simultaneously resulting in Paracetamol hepatotoxicity).
- Flags high-risk drug-drug interactions (e.g., Metformin + contrast dye, ACE-inhibitors + Potassium-sparing diuretics).

### 🧬 Pillar 4: 3D Anatomical Digital Twin
- Interactive Three.js WebGL 3D human body model.
- Automatically maps lab tests and diagnostic impressions to 6 physiological organ systems:
  - **Cardiovascular** (Lipids, Blood Pressure, Troponin, ECG)
  - **Endocrine & Metabolic** (HbA1c, Fasting Glucose, TSH, Free T4)
  - **Hematologic** (Hemoglobin, Platelets, WBC, ESR)
  - **Renal** (Creatinine, Urea, eGFR, Uric Acid)
  - **Hepatic** (SGPT/ALT, SGOT/AST, Bilirubin, Alkaline Phosphatase)
  - **Neurological & Vitals** (SpO2, Pulse, Electrolytes)
- Glowing visual heatmaps and camera orbit focus instantly reveal organs requiring attention.

### 🇮🇳 Pillar 5: Ayushman Bharat Digital Mission (ABDM) & Mock ABHA
- Generates **HL7 FHIR R4 Document Bundles** complying with India's **NRCeS** (National Resource Centre for EHR Standards) profiles.
- Generates a **Mock 14-digit ABHA Health ID** (`91-XXXX-XXXX-XXXX`) with a downloadable digital health card and verifiable QR code.
- Enables instant one-click FHIR JSON download for interoperability with government PHR apps.

### 🌐 Pillar 6: Multilingual Accessibility
- Full user interface and AI health explanations available in:
  - **English**
  - **Telugu (తెలుగు)**
  - **Hindi (हिन्दी)**
  - **Tamil (தமிழ்)**
- Uses proprietary clinical token-locking to ensure drug generic names and exact dosage units remain medically intact while surrounding explanations are seamlessly translated.

---

## 3. High-Level Technical Architecture

```mermaid
flowchart TD
    User([Patient / Clinician]) -->|Upload PDF, JPG, PNG| Frontend[React 18 + Vite SPA\nTailwind CSS + Three.js]
    
    subgraph Client-Side Security
        Frontend --> PII[On-Device PII Redaction\nMasks Phone, Aadhaar, Names]
    end

    PII -->|Multipart POST /api/documents/| Backend[FastAPI High-Performance Engine\nPython 3.11 + SQLModel]

    subgraph Ingestion & Deduplication
        Backend --> Hash[SHA-256 Checksum Engine\nInstant Cache Retrieval]
    end

    subgraph Multi-Engine Extraction Pipeline
        Hash --> Router{Document Route}
        Router -->|Visual Scan| Gemini[Google Gemini 1.5 Flash VLM\nTemp 0.0 JSON-Schema]
        Router -->|Fast Verify| Groq[Groq LLaMA 3.2 Vision\nDual-Pass Normalizer]
        Router -->|Offline / Fallback| RapidOCR[Local RapidOCR + ONNX\npypdfium2 PDF Parser]
    end

    subgraph Clinical Safety & Intelligence
        Gemini & Groq & RapidOCR --> Norm[RapidFuzz Indian Drug Normalizer\nBrand-to-Salt Mapping <15ms]
        Norm --> Rules[Deterministic Rules Engine\nICMR / NABL Reference Intervals]
        Rules --> Summarizer[Evidence-Grounded Summarizer\nMandatory [fact_id] Citation Filter]
        Summarizer --> Translator[Token-Locked Translator\nTelugu, Hindi, Tamil, English]
    end

    subgraph Storage & Standards
        Rules --> DB[(SQLite / PostgreSQL\nStructured Clinical Store)]
        Rules --> FHIR[NRCeS ABDM FHIR R4 Engine\nDocumentReference + Observations]
        Rules --> ABHA[Mock ABHA Digital Card Generator\n14-Digit ID + NRCeS QR Code]
    end

    DB --> API[REST API Endpoints\n/api/patients, /api/documents, /api/fhir]
    API --> Frontend
```

### Architectural Flow Explanation
1. **Intake & Privacy**: The user uploads any medical record. Client-side inspection redacts sensitive identifiers.
2. **Deduplication**: The backend computes a SHA-256 hash. If the document was previously processed, extracted entities are served instantly from cache.
3. **AI Vision Consensus**: Google Gemini VLM extracts structured data with normalized bounding box coordinates. Groq Dual-Pass verifies entities; RapidOCR provides offline resilience.
4. **Deterministic Analysis**: The clinical rules engine evaluates numeric values against ICMR reference ranges. Normal, elevated, and critical markers are computed with code.
5. **Grounded Translation**: Plain-language summaries cite their fact IDs. Translations to Telugu, Hindi, and Tamil lock clinical terms to prevent translation distortion.
6. **Standardization**: All records are structured into FHIR R4 resources and linked to the patient's Mock ABHA ID.

---

## 4. Visual Walkthrough & System Screenshots

### 4.1 Executive Health Dashboard & Dynamic KPIs
The command center displays the patient’s real-time computed Health Score, active flagged conditions, verified documents, and medication safety warnings.

![CareLens Dashboard](images/01_dashboard.png)

*Key Highlights:*
- Dynamically recalculating Health Score based on proportional biomarker severity.
- Hover-activated emerald teal brand borders across all cards.
- Quick summary badges indicating grounded facts and PII redaction status.

---

### 4.2 Interactive 3D Anatomical Digital Twin
Three.js WebGL visualization mapping clinical test results onto a 3D anatomical human model.

![3D Anatomical Digital Twin](images/02_body_twin_3d.png)

*Key Highlights:*
- Real-time organ status indicators (Cardiovascular, Endocrine, Renal, Hepatic, Hematologic).
- Interactive 360° camera orbit with smooth organ focus upon selection.
- Detailed organ diagnostic drawer showing specific flagged biomarkers and linked medications.

---

### 4.3 Evidence Studio — Grounded Dual-Pane Inspection
The core trust-engine of CareLens. Allows patients and doctors to verify every AI-extracted metric directly on top of the original physical document scan.

![Evidence Studio](images/03_evidence_studio.png)

*Key Highlights:*
- Synchronized split-screen: original scan on left, structured clinical facts on right.
- Normalized visual bounding boxes highlight the exact words and numbers extracted.
- Hovering over a fact highlights its visual source on the scan; clicking a bounding box scrolls to the fact.
- Toggle between Patient Layman Explanation and Clinical Detailed View.

---

### 4.4 Medication Safety & Polypharmacy Collision Shield
An intelligent pharmacovigilance dashboard tailored specifically for the Indian pharmaceutical market.

![Medications and Polypharmacy](images/04_medications_polypharmacy.png)

*Key Highlights:*
- RapidFuzz matching of Indian brand names to active chemical salts.
- Automatic detection of duplicate salt intake across multiple prescriptions.
- Visual warning badges for adverse drug-drug interactions.

---

### 4.5 NRCeS-Compliant Mock ABHA Digital Health Card
Ayushman Bharat Digital Mission (ABDM) integration featuring a digital health identity card.

![Mock ABHA Health Card](images/05_mock_abha_card.png)

*Key Highlights:*
- 14-digit standardized Mock ABHA ID format: `91-2345-6789-0123`.
- Dynamic, scannable NRCeS-compliant QR code encoding patient demographic information.
- One-click export of complete **HL7 FHIR R4 Document Bundle JSON**.

---

### 4.6 Complete System Architecture
The end-to-end data pipeline connecting ingestion, multi-model AI, deterministic safety rules, storage, and standards export.

![CareLens System Architecture](images/architecture.png)

---

## 5. Clinical Safety, Ethics & Governance

To guarantee patient safety, CareLens adheres to strict algorithmic guardrails:

1. **No Unsupervised Diagnosis or Dosing Advice**:
   - CareLens **never** recommends starting, stopping, or altering prescription medication dosages.
   - It explains *what* a lab test measures and *what* normal vs abnormal values signify, accompanied by mandatory medical disclaimers.
2. **Deterministic Rules Over LLM Intuition**:
   - Abnormal flags (`low`, `normal`, `high`, `critical`) are computed using pure mathematical logic against verified ICMR & NABL reference ranges.
3. **Mandatory Fact-Citation Grounding**:
   - Summaries cite `[fact_id]`. An automated validator rejects any statement that asserts facts absent from the extraction input.
4. **Resilient Non-Guessing Policy**:
   - If an image is blurry or handwriting cannot be verified with confidence, CareLens returns `null` with a `needs_review: true` warning. It never hallucinates values.
5. **Privacy First (Synthetic Only)**:
   - Evaluated exclusively with synthetic patient records. No real patient data or real Aadhaar numbers are ever utilized or stored.

---

## 6. Automated Testing & Verification Suite

CareLens ships with a comprehensive automated test harness:

```bash
python test_all.py
```

### Verified Test Suite (15/15 Passing):
- `test_bounding_box_validation`: Confirms all bounding boxes conform to 0–1000 coordinate bounds.
- `test_deterministic_rules_engine`: Verifies ICMR/NABL reference range comparison and flag accuracy.
- `test_grounded_summarizer`: Tests that summarizer outputs strictly cite fact IDs and discard ungrounded text.
- `test_parse_ref_range`: Tests parsing of complex range expressions (e.g., `4.5 - 11.0`, `< 200`, `> 60`).
- `test_polypharmacy_duplicate_salt`: Validates duplicate salt collision detection in multi-prescription regimens.
- `test_safety_audit_filter`: Asserts that triage and dosing suggestions are blocked by safety filters.
- `test_translation_token_locks`: Validates that clinical drug terms are preserved during regional translations.
- `test_abdm_fhir_r4_bundle_builder`: Validates NRCeS ABDM FHIR R4 JSON schema compliance.
- `test_indian_drug_normaliser_fuzzy_and_latency`: Verifies RapidFuzz brand-to-salt resolution latency is `< 15ms`.
- `test_mock_abha_credentials_and_qr`: Tests 14-digit ABHA generation and QR code rasterization.
- `test_organ_health_status_aggregation`: Verifies 3D body twin organ risk level calculations.
- `test_organ_mapper_clci_and_loinc`: Tests deterministic mapping of LOINC codes to 6 anatomical organ systems.
- `test_document_upload_and_extraction`: Tests live upload and extraction endpoint.
- `test_health_check`: Tests `/api/health` system diagnostic endpoint.
- `test_patients_organ_status_and_polypharmacy`: Tests aggregate patient endpoints.

---

## 7. Technology Stack Summary

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend SPA** | React 18, Vite 6, TypeScript, Tailwind CSS, Lucide Icons, Motion (Framer Motion) |
| **3D Graphics** | Three.js, WebGL, OrbitControls |
| **Backend API** | Python 3.11, FastAPI, Uvicorn, SQLModel, Pydantic v2 |
| **AI Vision & LLMs** | Google Gemini 1.5 Flash (Google GenAI SDK), Groq Cloud LLaMA 3.2 Vision, OpenRouter |
| **Local OCR** | RapidOCR, ONNX Runtime, pypdfium2, Pillow, OpenCV Headless |
| **Clinical Intelligence** | RapidFuzz, ICMR/NABL Clinical Rules Engine, PyPDF2 |
| **Health Standards** | HL7 FHIR R4, ABDM NRCeS Profiles, LOINC, ICD-10 |
| **Infrastructure & CI/CD**| Docker (Multi-platform), Railway Cloud, GitHub Actions CI/CD |

---

## 8. Conclusion & Submission Sign-Off

**CareLens** by **NextGen Operators** successfully fulfills all objectives set forth in the **Altrix Labs Challenge**:
- Turns fragmented, complex medical records into intuitive, grounded, actionable insights.
- Introduces world-class innovation with the **3D Anatomical Digital Twin**, **Split-Screen Evidence Studio**, and **Indian Polypharmacy Collision Shield**.
- Fully respects regulatory and clinical governance through **ABDM FHIR R4 interoperability**, **deterministic safety guardrails**, and **regional multilingual accessibility**.

**Submitted by Team NextGen Operators**:
- **Aasish Tammisetti** (Team Lead)
- **G. Sai Sreemanth**
- **A. Sai Teja**
- **M. Prasanth**
- **Sk. Iliyas**
