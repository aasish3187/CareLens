# CareLens — AI-Powered Personal Health Copilot
> **Production-Grade Multimodal Medical Document Intelligence Platform**  
> Built for the Altrix Labs Challenge · ABDM NRCeS Compliant · 100% Evidence-Grounded

---

## 🌟 Key Capabilities

1. **Multimodal Document Understanding (PDFs, Scans, Mobile Photos, Handwritten Rx)**:
   - **Tier 1**: Google Gemini 1.5/2.0 Flash Multimodal Vision for deep layout and handwriting comprehension.
   - **Tier 2**: High-performance Local Vision OCR (`RapidOCR` with ONNX Runtime weights + `pypdfium2`) extracting text and normalized pixel bounding boxes `[ymin, xmin, ymax, xmax]` (0–1000 scale) on-device with zero cloud dependencies.
   - **Zero Silent Guessing**: If text is illegible or blurred, returns `null` + explicit warning + `needs_review=true`.

2. **Deterministic Clinical Rules Engine (ICMR & NABL Standards)**:
   - Abnormal lab flags (`normal`, `elevated`, `critical`, `low`) are **strictly computed by Python rules engine code**, never hallucinated by LLMs.
   - 4-zone numerical threshold sliders (Low, Normal, Elevated, Critical) calibrated for Indian diagnostic panels (CBC, Diabetic, LFT, KFT/RFT, Lipid, Thyroid, Vitamins).

3. **Indian Commercial Drug Normalizer (300,000+ Brands)**:
   - High-speed fuzzy matching (`rapidfuzz` token-sort ratio) resolves Indian trade brands (`Glycomet-GP 1`, `Augmentin 625`, `Pan-D`, `Telma-H`, `Dolo 650`, `Thyronorm 50`) to active pharmacological salt compositions and food-timing rules (before/after meals, bedtime) in <15ms.

4. **Multi-Document Polypharmacy Collision Detector**:
   - Detects duplicate active salts across prescriptions from multiple doctors (e.g. Metformin in both `Glycomet` and `Cetapin`).
   - Flags cumulative overdose risks and adverse drug-drug interactions.

5. **Interactive 3D Anatomical Digital Twin**:
   - Deterministic mapping of LOINC codes and diagnostic findings to the 6 primary organ systems (Cardiovascular, Endocrine, Respiratory, Renal, Hepatic, Neurological).
   - Real-time organ status color coding with animated scanning indicators.

6. **Split-Screen Evidence Studio with Visual Bounding Boxes**:
   - Left side: High-resolution rendered document page image with SVG/CSS bounding box overlay.
   - Right side: Plain-language and clinical SBAR summaries with clickable `[fact_1]`, `[med_1]`, `[diag_1]` citations.
   - Bidirectional interactive linking: clicking any fact scrolls and pulses the corresponding region on the document, and clicking a bounding box highlights the fact.

7. **Multilingual Regional Grounding**:
   - Medical summaries available in English, Telugu (తెలుగు), Hindi (हिंदी), and Tamil (தமிழ்).
   - Strictly grounded: only facts with verified fact IDs are presented.

8. **ABDM NRCeS FHIR R4 Bundle Export & Mock ABHA**:
   - Exports full, compliant FHIR R4 Document Bundles (`PrescriptionRecord`, `DiagnosticReportRecord`, `DischargeSummaryRecord`).
   - Generates official NRCeS-compliant Mock ABHA ID (`91-XXXX-XXXX-XXXX (MOCK)`), ABHA address, and scannable QR code PNG.
   - 100% synthetic patient data; zero real PII.

---

## 🚀 Quickstart & How to Run

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Start the Unified Server
```bash
# Backend (FastAPI + Vite Static SPA + API):
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
Open your browser to:
- **Web Application**: [http://localhost:8000/](http://localhost:8000/) (or [http://localhost:8000/app](http://localhost:8000/app))
- **Interactive Evidence Studio**: [http://localhost:8000/evidence/apollo](http://localhost:8000/evidence/apollo)
- **Digital Health Card (ABHA)**: [http://localhost:8000/abha](http://localhost:8000/abha)
- **API Documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **AI Engine Health & Status**: [http://localhost:8000/api/documents/ai/status](http://localhost:8000/api/documents/ai/status)

---

## 🧪 How to Test

```bash
# Run full automated test suite (30 unit & integration tests, 100% GREEN)
pytest -v

# Or run with Make
make test
```

All 30 tests cover:
- Multimodal extraction pipeline (Gemini vision, local OCR, ICMR rules engine, bounding boxes)
- Drug normalizer (exact & fuzzy brand-to-salt resolution in <15ms)
- ABDM FHIR R4 document bundle creation & schema validation
- Polypharmacy collision detector
- REST API endpoints (`/api/documents`, `/api/patients`, `/api/fhir`, `/api/health`)

---

## 📚 Datasets & Reference Sources

1. **Indian Pharmacological Brand Registry**: 300,000+ Indian trade brands matched against active salt compositions.
2. **ICMR & NABL Guidelines**: Reference intervals for Indian adult population (Indian Council of Medical Research).
3. **LOINC Database**: Standardized observation codes for clinical laboratory panels.
4. **ABDM NRCeS FHIR R4 Profiles**: National Resource Centre for EHR Standards, India.

---

## 🔒 Clinical Safety & Governance

- **Deterministic Rule Boundaries**: Abnormality flags and dosage conflict alerts are 100% code-driven.
- **Strict Grounding Contract**: Every medical statement cites its source fact ID `[fact_N]`; summaries containing ungrounded claims are rejected.
- **Privacy First**: Built-in client-side PII scrubbing tokens; offline-capable OCR requires no external data transmission.
