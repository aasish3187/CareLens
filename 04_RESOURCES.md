# 04 — RESOURCES (links found via web search on 2026-10-09; items marked (verify) are from memory — open and confirm before relying on them)

## A. Competition / problem context (provided files)
- Problem brief: "AI-Powered Personal Health Copilot" (Altrix Labs) — AI-Powered_Personal_Health_Copilot.txt
- HacXLerate 2026 Round 1 rulebook — HacXLerate_2026_Round_1_RuleBook.pdf
- Research paper: "How people use Copilot for Health", Microsoft AI, arXiv:2604.15331 — https://arxiv.org/abs/2604.15331 (verify URL form)
- Altrix Labs: https://www.altrixlabs.ai/

## B. ABDM / ABHA / FHIR (India)
- FHIR Implementation Guide for ABDM (NRCeS) — profiles list: https://nrces.in/preview/ndhm/fhir/r4/profiles.html  (stable: https://www.nrces.in/ndhm/fhir/r4/profiles.html)
- PrescriptionRecord profile: https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-PrescriptionRecord.html
- IG table of contents (all profiles incl. DiagnosticReportLab/Imaging, DischargeSummaryRecord, HealthDocumentRecord, Immunization, Encounter, Condition…): https://nrces.in/preview/ndhm/fhir/r4/toc.html
- Common Lab Codes for India (CLCI — India-curated LOINC subset, 1,473 tests, CSV): https://www.nrces.in/download/files/pdf/CommonLabCodesForIndia_ReleaseNotes_20260629.pdf and brochure https://www.nrces.in/download/files/pdf/nrces_CLCI_ebrochure.pdf (download the CSV from the NRCeS downloads page)
- ABDM Sandbox docs: https://sandbox.abdm.gov.in/docs (verify) ; PHR app docs https://sandbox.abdm.gov.in/docs/phr_app
- Official ABDM wrapper with a **mock gateway** (HIP/HIU flows, good for "future work" + reference): https://github.com/NHA-ABDM/ABDM-wrapper
- ABDM milestone overview (M1 ABHA, M2 HIP sharing, M3 HIU fetching; V3 APIs; sandbox exit steps): https://nirmitee.io/blog/abdm-integration-milestones-m1-m2-m3-m4-multi-software-guide/ and https://www.2basetechnologies.com/blog/abha-indias-step-to-digitalizing-the-healthcare-ecosystem
- HL7 FHIR R4 spec: https://hl7.org/fhir/R4/ (verify) ; Python `fhir.resources` on PyPI (verify) ; HL7 FHIR validator / HAPI FHIR (verify)

## C. OCR / document AI (open-source + APIs)
- Survey of open-source OCR models in 2026 (PaddleOCR-VL-1.6, MinerU2.5, GLM-OCR rank top on OmniDocBench): https://blog.roboflow.com/best-open-source-ocr-models/
- Self-hosting comparison (PaddleOCR-VL, DeepSeek-OCR, dots.ocr, GOT-OCR): https://www.spheron.network/blog/best-open-source-ocr-vlm-self-host-gpu-cloud-2026/
- Developer guide benchmarking 12 OCR tools incl. handwriting (EasyOCR, PaddleOCR, olmOCR, Qwen2.5-VL class): https://unstract.com/blog/best-opensource-ocr-tools/
- KDnuggets top-7 open OCR models (olmOCR, PaddleOCR-VL, Granite Vision…): https://www.kdnuggets.com/top-7-open-source-ocr-models
- **Sarvam Vision 2.1** — Indic OCR + Indic handwritten recognition + structured extraction: https://www.sarvam.ai/blogs/sarvam-vision-2-1
- **Sarvam Indic OCR benchmark dataset** (use for testing Telugu/Hindi OCR): https://huggingface.co/datasets/sarvamai/indic-ocr-bench
- Docling (IBM, document parsing) (verify), Surya OCR (verify), PaddleOCR GitHub: https://github.com/PaddlePaddle/PaddleOCR (verify)

## D. Medical AI models
- **MedGemma 1.5 4B** (explicitly supports extracting structured values/units from lab reports + EHR/FHIR understanding): HF `google/medgemma-1.5-4b-it` (needs accepting terms) ; docs https://developers.google.com/health-ai-developer-foundations/medgemma ; repo https://github.com/google-health/medgemma ; tech report arXiv:2507.05201
- Practitioner caution on using MedGemma for blood reports (split extraction from interpretation; deterministic decoding): https://discuss.huggingface.co/t/medgemma-1-5-4b-useful/175445 → this directly supports our "extract with models, flag with code, explain from facts" design.
- MedSigLIP encoder `google/medsiglip-448` (optional, imaging)

## E. Indian drug & lab data
- Eka Care MCP server — Indian branded drug search (500k+ brands→composition) + ICMR/RSSDI treatment protocols (needs Eka API credentials; open-source code): https://github.com/eka-care/eka_mcp_server ; docs http://developer.eka.care/api-reference/eka_mcp/medications/search
- Eka Care IndianDrugMCQA (brand→generic eval, MIT): https://huggingface.co/datasets/ekacare/indian_drug_mcqa
- Indian medicine datasets (brand, composition, manufacturer; some with side-effects/interactions): https://github.com/junioralive/Indian-Medicine-Dataset ; Kaggle "Indian Medicine Data" (195k rows, salt_composition, side_effects, drug_interactions) https://baselight.app/u/kaggle/dataset/mohneesh7_indian_medicine_data ; PharmaVision example app https://github.com/coderarham/PharmaVision. **Check each license before bundling data; if unclear, load at runtime from a user-provided CSV and document it.**
- Reference ranges: prefer the lab's printed range; fallback seeded table you author from standard references (cite sources in README). LOINC/CLCI for codes.
- Interactions: build a small curated demo table; label as demo. (NLM RxNav interaction API availability has changed — verify before depending on it.)

## F. Indic language & speech
- IndicTrans2 (AI4Bharat, all 22 scheduled languages incl. Telugu/Hindi): https://huggingface.co/ai4bharat/indictrans2-indic-indic-1B ; repo https://github.com/AI4Bharat/IndicTrans2 ; ONNX int8 quantised copies for CPU: https://huggingface.co/remiai3/TRANSLATION_MODELS
- Sarvam-Translate (open weights, Gemma3-4B based, 22 languages, long-form structure preserving): https://website.sarvam.ai/blogs/sarvam-translate
- Bhashini (government translation/ASR/TTS APIs, IndicTrans2-backed): register at the Bhashini developer portal (verify URL https://bhashini.gov.in)
- Sarvam APIs for TTS/ASR (verify current offering) ; browser Web Speech API for quick TTS fallback; Noto Sans Telugu/Devanagari fonts.

## G. Research reading (for slides + safety framing)
- Microsoft AI, "How people use Copilot for Health" (uploaded) — usage patterns: lab-result explanation demand, caregiver queries, after-hours use.
- Referenced inside it: Bean et al. 2026 (Nature Medicine) on reliability of LLMs as medical assistants for the public; Ramaswamy et al. 2026 on triage failures — justify "no triage/diagnosis".
- Singhal et al. 2023 "Large language models encode clinical knowledge" (Nature); Nori et al. 2023 "Capabilities of GPT-4 on medical challenge problems".
- MedGemma Technical Report arXiv:2507.05201.
- Search terms for more: "clinical information extraction LLM lab report JSON", "hallucination mitigation medical summarisation grounded citations", "FHIR LLM mapping", "OCR handwritten prescription dataset", "patient-friendly lab result explanation readability".

## H. GitHub search queries to run (to study prior art, not to copy — rulebook penalises copying)
- `prescription OCR FHIR`, `lab report extraction LLM`, `health record timeline FHIR`, `ABDM FHIR bundle`, `medical report explainer`, `Indian prescription handwritten dataset`.
