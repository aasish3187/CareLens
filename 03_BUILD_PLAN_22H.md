# 03 — BUILD PLAN (22 build hours) + AGENT TASK BREAKDOWN

## Repo layout
```
health-copilot/
├─ AGENTS.md  (copy as GEMINI.md)  README.md  docs/ (architecture.md, diagram.png, slides.pdf, eval_report.md)
├─ frontend/ (Next.js PWA)  app/(upload, profile, timeline, document/[id], review, ask, settings)  components/  lib/i18n/{en,te,hi}.json
├─ backend/  app/{main.py, api/, core/, pipeline/{preprocess,classify,extract_vlm,ocr,reconcile,normalise,rules,summarise,translate,fhir}.py, models/, prompts/}
│            data/{loinc_clci.csv, indian_medicines.csv, ref_ranges.json, interactions_demo.json, icd10_small.csv}
├─ eval/  generator/ (synthetic reports: HTML→PDF/PNG + noise + phone-photo augment, gold JSON)  run_eval.py  metrics.py
├─ fixtures/ (synthetic docs, ABDM example bundles)   infra/ (docker-compose, render.yaml, vercel.json)   tests/
```

## Hour-by-hour
| Hours | Goal | Output / exit criteria |
|---|---|---|
| 0–2 | (rulebook: lock problem) read challenge, split roles, create repo, env, accounts/API keys | repo + CI + deploy skeleton hello-world live |
| 2–4 | Walking skeleton: upload → store → Gemini schema extraction → raw JSON shown | one real sample document extracted end-to-end |
| 4–7 | Persist facts (observation/medication/condition/encounter), profile + timeline UI, English summary (grounded) | **Tier 0 working locally** |
| 7–10 | Deploy backend+frontend, seed 3 synthetic patients, README, **SUBMIT v1** | public link works on a phone; GitHub accessible |
| 10–13 | Validation/reconcile stage, rules engine flags, review/confirm screen, trends | flags are code-driven; low-confidence shown |
| 13–16 | Normalisation (brand→generic, LOINC), FHIR bundle export + validation, mock ABHA + consent | exported bundle passes validator |
| 16–19 | Telugu/Hindi UI + summaries with translation guard, TTS read-aloud, family profiles | language switch live |
| 19–21 | Evidence highlight, duplicate/interaction warnings, ask-my-records, visit-prep PDF, .ics | stretch features behind feature flags |
| 21–22 | Freeze; run eval harness; record demo; finalise README/slides; verify links; **final submit** | checklist in §Submission |

## Parallel agent tasks (Antigravity Agent Manager) — assign one agent per workstream, each owns separate folders to avoid merge conflicts
1. **Backend-Pipeline agent:** `backend/app/pipeline/*`, prompts, schema validation, retries, caching by file sha256.
2. **Data/Normalisation agent:** build `data/*.csv|json` from open datasets (Indian medicines, CLCI→LOINC, ref ranges), fuzzy matchers + unit tests.
3. **FHIR/ABDM agent:** fhir builders per profile, validator in CI, mock ABHA/consent endpoints, example fixtures from NRCeS IG.
4. **Frontend agent:** PWA screens, i18n, charts, timeline, review UI, accessibility (large text, contrast, dark mode).
5. **Eval/QA agent:** synthetic generator, gold labels, metrics (per-field precision/recall/F1, numeric exact-match, unit accuracy, date accuracy, medication-frequency accuracy), regression tests, Playwright e2e of the mandatory flow.
6. **Deploy/Docs agent:** Dockerfiles, env management, deploy, README, diagram, slide deck.
Each agent must produce a short `docs/<workstream>.md` and tests. Merge to `main` only when `make test && make e2e` pass.

## Evaluation harness (this is how you win "AI Utilization 35%")
- Generate ~30–50 synthetic docs: CBC, LFT, KFT, lipid, HbA1c, thyroid, urine routine; 10 printed prescriptions (English), 5 Telugu/Hindi bilingual, 5 handwriting-style (handwriting fonts + noise + rotation + shadow), 3 discharge summaries. Different lab layouts so you do not overfit to one template.
- Metrics: field-level F1 for {medicine name, strength, frequency, duration, test name, value, unit, ref range, diagnosis, date}; flag agreement with gold; FHIR validity rate; translation number-preservation rate; hallucination rate (summary facts not in structured store = 0 target).
- Publish a table in README + one slide: "model A alone vs hybrid (VLM + OCR cross-check + validators)". Show the delta.
- Also run on a few real-looking public sample reports you are allowed to use (no real PHI).

## Risk register
| Risk | Mitigation |
|---|---|
| API rate limits / latency | cache by sha256, async job + progress UI, small page images, fallback model |
| Handwriting accuracy | VLM first, OCR cross-check, mandatory review screen, never silently trust |
| Free-tier cold start during auto-eval | keep-alive ping, minimal startup, health endpoint |
| Scope creep | feature flags; Tier 0 submitted by hour 10 |
| Auto-evaluator probes specific functions | keep stable, documented endpoints; seed demo data; README "How to test" with sample files |
| Medical misstatement | rules engine owns flags; safety filter; disclaimers |

## Submission checklist (from rulebook §35, tailored)
- [ ] Deployed link opens on mobile, no login wall (or demo credentials in README) 
- [ ] GitHub repo public/accessible, README with stack, architecture diagram, setup, "how to test", sample files
- [ ] Project title, summary, description filled on the byteXL platform; challenge-specific fields done
- [ ] All mandatory features work from the deployed URL (upload→extract→summary→timeline)
- [ ] Demo video/slides linked in README
- [ ] Resubmitted latest version and verified it on the platform before the deadline
