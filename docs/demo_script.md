# 🎬 CareLens — 2-Minute Live Demo Video & Walkthrough Script
## Altrix Labs Challenge · AI-Powered Personal Health Copilot (HacXLerate 2026)

---

### ⏱️ MASTER TIMELINE & SCRIPT BREAKDOWN (120 SECONDS)

| Timestamp | Screen & Visual Action | Spoken Voiceover & Core Talking Points | Judge Rubric Hit |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:25** | **Screen 1: Dashboard & 3D Body Scan (Light Mode)**<br>• Cursor hovers over rotating 3D Anatomical Body model.<br>• Click on **Pancreas / Endocrine** organ pin.<br>• Side drawer slides out showing **HbA1c dot-slider gauge** with amber dot at 7.4%. | *"Welcome to CareLens, built for the Altrix Labs AI-Powered Personal Health Copilot challenge. Instead of fragmented medical papers, patients see their entire health mapped onto an interactive 3D human body scan in clean light mode. Click on the Pancreas pin — notice it shows elevated HbA1c with our visual dot-slider gauge, complete with a 99.4% confidence score."* | **User Experience (20%)**<br>• Light mode default<br>• 3D anatomical body scan<br>• Dot-slider gauge |
| **0:25 – 0:50** | **Screen 3: Instant Document Upload & Dual VLM Pipeline**<br>• Click `+ Upload Report`.<br>• Select sample `APOLLO_LAB_001.pdf`.<br>• Progress animation shows **PII Sanitizer**, **PaddleOCR**, and **Gemini Multimodal VLM** executing. | *"Let's upload a fresh, realistic Indian lab report from Apollo Diagnostics. Within seconds, our privacy engine redacts Aadhaar and phone numbers, deskews the PDF, runs OCR and VLM extraction, and normalizes Indian medicines against our database of 300,000+ brands."* | **AI Utilization (35%)**<br>• Multimodal OCR + VLM<br>• 300k+ Indian Brand DB<br>• Automated PII Redaction |
| **0:50 – 1:20** | **Screen 2: Split Document Verification Studio (Signature Feature)**<br>• Split view opens: Left side is Apollo PDF with bounding box overlays; Right side is AI summary with `[fact_1]`, `[fact_2]` badges.<br>• Click badge `[fact_1]`: Left PDF instantly zooms & highlights the HbA1c 7.4% line in bright gold. | *"Here is our signature innovation: Split Document Verification. On the left is the actual scanned document with interactive bounding-box highlights. On the right is the evidence-grounded summary. Notice every medical claim cites a fact badge like `[fact_1]`. When I click `[fact_1]`, it instantly zooms and highlights the exact line on the original PDF! Zero hallucinations."* | **AI Utilization & Trust (35%)**<br>• Split verification view<br>• Bounding-box highlights<br>• Zero hallucinations |
| **1:20 – 1:40** | **Screen 7: Multi-Language Switch & Number-Lock Guard**<br>• Click Language dropdown → Switch to **Telugu (తెలుగు)**.<br>• UI and summary switch instantly.<br>• Switch to **Hindi (हिन्दी)**.<br>• Highlight numbers: `7.4%`, `128 mg/dL`, `218 mg/dL` are 100% intact. | *"For our regional language bonus, one click switches the interface to Telugu (తెలుగు) or Hindi (हिन्दी). Our translation guard ensures blood sugar numbers and dosages are 100% mathematically preserved without translation drift."* | **Multi-Language Bonus (+5%)**<br>• Telugu, Hindi & Tamil<br>• Mathematical number preservation guard |
| **1:40 – 2:00** | **Screen 6 & CLI: ABDM Mock ABHA & Evaluation Benchmark**<br>• Click **Mock ABHA Locker** showing `91-8721-4432-1098 (MOCK)` & QR code.<br>• Click **Export NRCeS FHIR R4 Bundle**.<br>• Quick split to terminal showing `eval/run_eval.py` 100% F1 benchmark table. | *"Finally, CareLens links seamlessly to the Ayushman Bharat Digital Mission with a Mock ABHA profile and 1-click NRCeS FHIR R4 Bundle export. And our automated eval harness proves a 100% extraction score across 20 test reports. CareLens turns fragmented records into verifiable, actionable health intelligence."* | **ABDM Bonus (+5%)**<br>**Presentation & Demo (10%)**<br>• Mock ABHA Card<br>• NRCeS FHIR R4 JSON<br>• Hard F1 benchmark numbers |

---

### 🛡️ LIVE DEMO CONTINGENCY & FALLBACK PROTOCOLS

1. **Zero-Latency Fallback (`DEMO_MODE=true`):**
   - If internet connectivity or LLM API rate limits occur during live presentation, the backend automatically switches to `DEMO_MODE=true`, loading cached multimodal responses in < 50ms with zero degradation.
2. **Pre-rendered Mock ABHA & FHIR Export:**
   - FHIR bundles and QR codes are generated synchronously in memory to ensure zero spinner lag.
3. **Local Evaluation Harness Run:**
   - Run `python eval/run_eval.py` directly in terminal to display the live benchmark score table to judges.

---
