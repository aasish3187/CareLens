# GEMINI.md — standing rules for the coding agent

## Mission
Build "Health Copilot": upload prescriptions/lab/discharge/diagnostic documents → extract meds, dosages, test values, diagnoses, dates → grounded plain-language summaries (English + Telugu/Hindi) → unified profile & timeline → ABDM-style FHIR export with mock ABHA. Read docs 01–04 in /docs before coding.

## Priorities (strict)
1. The mandatory flow (upload → extraction → summary → timeline) must work **deployed** before anything else. Automated evaluation checks this first.
2. Correctness and safety over features. 3. Then Tier 1, then Tier 2 behind feature flags.

## Hard rules
- Never provide diagnosis, triage, or dosing advice. Abnormal flags are computed by code (rules engine), not the LLM.
- LLM summaries must be grounded: input = structured facts with IDs; output cites fact_ids; reject output containing facts not in input.
- Never silently guess unreadable values; return null + warning + needs_review.
- Synthetic data only. No real patient data, no real Aadhaar/ABHA. Mock ABHA labelled "MOCK".
- Redact PII before sending text/images to third-party LLMs when feasible; never log raw documents or API keys; secrets only via env vars.
- Temperature 0 and JSON-schema constrained output for extraction. Version every prompt. Cache by file sha256.
- Every feature ships with a test; run `make test` and `make e2e` before merging. Keep README "How to test" current.
- Don't copy other teams' or repos' code; use libraries/APIs and cite datasets + licenses in README.
- Prefer simple, working solutions over complexity; keep stable documented endpoints (an automated evaluator may probe them).
- UX: mobile-first, large type, dark mode, i18n via JSON files (en/te/hi), Telugu/Devanagari fonts, accessible contrast.

## Workflow
Plan → implement in small PRs per workstream (pipeline, data, FHIR, frontend, eval, deploy) → test → update docs. Write a short design note in docs/ for non-trivial decisions. Surface blockers early instead of guessing medical facts.
