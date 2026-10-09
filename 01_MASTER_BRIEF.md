# 01 — MASTER BRIEF: "Health Copilot" for HacXLerate 2026 Round 1 (Altrix Labs challenge)

> Give this whole folder to the coding agent. Read 01 → 02 → 03 → 04. AGENTS.md holds the standing rules.

## 1. Competition context (facts from the rulebook + brief)
- 24-hour on-campus hackathon. First 2 h = problem select/lock (already decided: Altrix Labs "AI-Powered Personal Health Copilot"). Remaining ~22 h = build, deploy, submit.
- Submission = **deployed working link + GitHub repo (README, stack) + project info + challenge-specific items**. Inaccessible/invalid links can disqualify.
- Evaluation is **automated first** (checks the mandatory functionalities work), **then human**. Fail the auto check and humans never see the project. => Mandatory scope must work end-to-end, deployed, BEFORE any advanced feature.
- Can resubmit until the deadline; latest valid submission counts. Submit a working v1 early (target: hour ~10), then improve.
- AI tools allowed, but the team must understand and explain everything built.
- Evaluation rubric (100): AI Utilization 35 | Technical Architecture 25 | User Experience 20 | Healthcare Impact 10 | Presentation & Demo 10. Bonus (~5–10 pts, inside UX/Architecture): regional-language support (incl. bilingual/handwritten OCR) and ABDM/ABHA readiness (FHIR-style records + mock ABHA link/import).
- Deliverables: working prototype (upload → extraction → summary → timeline), architecture diagram (pipeline, OCR/AI, storage, ABDM-ready schema), short demo or few slides.

## 2. Mandatory functional scope (build these first — the auto-evaluator will probe them)
1. **Upload** prescriptions, lab reports, discharge summaries, diagnostic reports (PDF/JPG/PNG, phone photos).
2. **Extraction**: medicines, dosages (strength, frequency, duration, route), test values (name, value, unit, reference range, flag), diagnoses, dates, doctor/facility.
3. **Plain-language summary** per document, including what abnormal values mean.
4. **Unified health profile + timeline** across all documents.
5. Deployed URL, GitHub repo, README, architecture diagram, demo.

## 3. Product vision: "A health record you can trust, not just read"
Most entries will be "upload → LLM → paragraph". We differentiate on **trust, India-fit and longitudinal intelligence**:

| # | Differentiator | Why judges care |
|---|---|---|
| D1 | **Hybrid extraction with a Trust Layer**: VLM structured extraction + OCR text cross-check + schema/unit/range validation; every field gets `confidence`, `source_page`, optional `bbox`, and a `needs_review` flag. User confirms low-confidence fields in a review screen. | AI Utilization (accuracy), Healthcare Impact (no misleading data) |
| D2 | **Evidence-linked explanations**: every sentence in the summary cites fact IDs; click a value and see the original document region. LLM may only explain facts that exist in the structured store (grounded generation). | Safety, anti-hallucination |
| D3 | **Deterministic clinical-rules engine** for flags (high/low/critical, trend) — the LLM never decides abnormality; it only explains what code flagged. Prefers the lab's own printed reference range; fallback to a seeded table. | Medical correctness |
| D4 | **India-native normalisation**: Indian brand → generic salt composition (open Indian-medicine datasets), lab test → LOINC via Common Lab Codes for India (CLCI), diagnoses → ICD-10/SNOMED where available. Duplicate-therapy detection (two brands, same salt). | Technical depth, real-world fit |
| D5 | **ABDM-native data model**: internal store maps 1:1 to FHIR R4 resources; export valid bundles using ABDM profiles (PrescriptionRecord, DiagnosticReportRecord, DischargeSummaryRecord, HealthDocumentRecord) + mock ABHA link/import with a consent artefact. | Architecture + bonus |
| D6 | **Telugu/Hindi** UI + summaries with a **translation guard**: drug names, numbers, units are locked via placeholders and verified after translation (round-trip check). Read-aloud (TTS). | UX bonus; accessibility |
| D7 | **Longitudinal intelligence**: per-analyte trend charts (e.g., HbA1c, creatinine), "what changed since last visit", medication timeline, adherence schedule (.ics export). | UX, "unified profile" |
| D8 | **Caregiver / family profiles**: switch between self, parent, child. (Microsoft AI's Copilot-for-Health study found ~1 in 7 personal symptom/condition conversations are on behalf of someone else.) | Evidence-backed design |
| D9 | **Built-in evaluation harness**: synthetic report generator + gold labels → field-level precision/recall/F1 shown in README/slides. | Proves "accuracy of OCR and extraction" with numbers |
| D10 | **Safety by design**: no diagnosis/dosing advice, red-flag escalation text ("seek care urgently" for critical values), disclaimers, privacy (PII redaction before cloud LLM calls, consent log, audit log). | Healthcare Impact (10%) |

Evidence from the uploaded paper (arXiv 2604.15331, Microsoft AI, "How people use Copilot for Health") to cite in slides:
- Plain-language explanations of lab/imaging results are a top-3 cluster (12.8%) within symptom/health-concern queries.
- Personal-health use skews mobile and evening/night → **mobile-first PWA**, readable at night (dark mode), large type.
- ~1 in 7 symptom/condition queries concern a dependent → **family profiles**.
- Medical paperwork + navigation are unmet needs → "visit-prep sheet" and (stretch) document checklist.
- Cited elsewhere in the paper: LLM chatbots can mis-triage and users aided by LLMs do not always do better → **do not triage or diagnose; stay grounded and conservative**.

## 4. Scope tiers (strict priority order)
- **Tier 0 (must, deployed by hour ~10):** upload, extraction, summary (English), timeline, profile, README, deployed link. Submit v1.
- **Tier 1 (hours 10–16):** validation + rules-engine flags, review/confirm screen, trend charts, FHIR export + mock ABHA, Telugu (and Hindi) summaries + UI, eval harness numbers.
- **Tier 2 (hours 16–21):** evidence highlighting (bbox), duplicate-therapy/interaction warnings, grounded "ask my records" chat, family profiles, visit-prep PDF, voice read-aloud, .ics medicine reminders.
- **Freeze at hour 21:** bug-bash, seed demo data, record demo, final README, final submit with verified links.

## 5. Non-goals (do not build)
Diagnosis, treatment/dose recommendations, symptom triage, real Aadhaar/ABHA integration (mock only), real patient data (synthetic only), custom model training.

## 6. Demo story (3 minutes)
1. Phone-photo of a bilingual (Telugu/English) handwritten-style prescription → extracted meds with confidence badges → user fixes one low-confidence field.
2. Upload CBC + HbA1c + lipid report → flagged values with plain explanation in English, switch to Telugu with read-aloud.
3. Timeline + HbA1c trend across 3 reports; "what changed since last visit".
4. Click a value → highlights source region (evidence-linked).
5. "Export to ABDM (FHIR)" → show bundle validates; mock ABHA link + consent.
6. Show eval table: field-level F1 on 30 synthetic docs. Close with safety design.
