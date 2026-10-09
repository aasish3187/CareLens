# 🎨 ROLE: UI/UX DESIGNER & FIGMA ARCHITECT
## Member: [Name] — Lead Experience Designer & Design System Lead
## Track: Altrix Labs — AI-Powered Personal Health Copilot (HacXLerate 2026 Round 1)

---

> **Your Mission:** Design **CareLens** in **Figma** to be the undisputed most beautiful, intuitive, and production-ready healthcare application in the entire competition. Using the **"Altris-Clinical Light"** design language, you will craft the **Interactive 3D Human Anatomical Digital Twin**, **Split-Screen Evidence Grounding Studio**, **4-Zone Dot-Slider Range Indicators**, and **Layman vs. Clinical Terminology Lens**. You secure 100% of the **20% User Experience score** + the **5% Multi-language bonus**.

---

## 🏆 ALTRIX LABS 20% UX SCORECARD (+5% REGIONAL BONUS)

| Scoring Rubric Item | Weight | How Your Design Wins It |
|---|:---:|---|
| **Easy Upload & Ingestion Flow** | **6%** | Frictionless drag-and-drop dropzone with sample documents for 1-click judge testing, instant camera capture, and multi-page thumbnail previews. |
| **Readable Summaries & Clinical Explanations** | **8%** | Evidence-grounded cards citing `[fact_1]` chips; instant **Layman's Terms vs. Doctor's Clinical View** toggle; clean high-contrast typography. |
| **Interactive Health Timeline & Organ Twin** | **6%** | **Interactive 3D Human Body Scan** with pulsing organ hotspot pins; unified chronological health timeline connecting labs, prescriptions, and visits. |
| **Multi-Language Regional Experience** | **+5%** | Native font stacks and UI switchers for **English, Telugu (తెలుగు), Hindi (हिन्दी), and Tamil (தமிழ்)**. |

---

## 💎 DESIGN SYSTEM: "ALTRIS-CLINICAL LIGHT" (DEFAULT THEME)

The user experience defaults to a **Light Mode** that looks like modern, multi-million dollar clinical AI software (inspired by Altrix Labs, Linear, and modern health platforms):

```css
/* Background & Surfaces */
--bg-app:               #F8FAFC;  /* Pristine ultra-light slate background */
--bg-surface:           #FFFFFF;  /* Pure white cards with subtle shadow */
--bg-surface-elevated:  #FFFFFF;  /* Floating popovers, modals, dropdowns */
--bg-surface-subtle:    #F1F5F9;  /* Secondary pill containers, input fields */

/* Medical Brand Colors (Altrix Labs Clinical Teal & Cyan) */
--brand-teal-deep:      #0D9488;  /* Primary action buttons, active navigation */
--brand-teal-hover:     #0F766E;  /* Interactive hover state */
--brand-cyan-electric:  #0EA5E9;  /* Glowing pins, AI grounding progress bar */
--brand-teal-tint:      #F0FDFA;  /* Soft teal container backgrounds */
--brand-cyan-tint:      #F0F9FF;  /* Soft cyan highlight container */

/* Clinical 4-Zone Status Colors */
--status-low:           #3B82F6;  /* Blue - Below normal range */
--status-normal:        #10B981;  /* Emerald - Healthy normal range */
--status-elevated:      #F59E0B;  /* Amber - Borderline / Elevated */
--status-critical:      #EF4444;  /* Coral Red - Critical / Immediate Attention */

/* Typography & Strokes */
--text-heading:         #0F172A;  /* Deep high-contrast slate (Titles, Headers) */
--text-body:            #334155;  /* Slate 700 (Readable clinical text) */
--text-muted:           #64748B;  /* Slate 500 (Labels, timestamps, captions) */
--border-subtle:        #E2E8F0;  /* 1px divider and card border */
--border-focus:         #0D9488;  /* 2px focus ring */
```

### Typography System
- **Global Interface:** `Inter` or `Plus Jakarta Sans`
- **Numerical Lab Metrics & Codes:** `JetBrains Mono`
- **Telugu Regional Text:** `Noto Sans Telugu`
- **Hindi Regional Text:** `Noto Sans Devanagari`
- **Tamil Regional Text:** `Noto Sans Tamil`

---

## 🚀 THE GRAND-PRIZE MASTER FIGMA PROMPT
*(Copy and paste this prompt directly into Figma AI, Claude, or FigJam to generate the full app UI)*

```text
Prompt for Figma AI / UI Architect:
Create an award-winning, state-of-the-art medical web application UI in crisp LIGHT MODE called "CareLens - AI-Powered Personal Health Copilot" for Altrix Labs.

Aesthetic Rules:
Ultra-clean clinical light mode. Background #F8FAFC, Cards #FFFFFF with 16px corner radius, 1px subtle border in #E2E8F0, soft ambient drop shadows. Brand colors: Deep Clinical Teal (#0D9488) and Electric Medical Cyan (#0EA5E9). Typography: Plus Jakarta Sans for UI headings and JetBrains Mono for laboratory metrics.

Key Frames to Design in the Flow:

Frame 1: Executive Dashboard with Interactive 3D Human Anatomical Digital Twin (1440x900)
- Left Navigation (240px white): Logo "CareLens by Altrix Labs", navigation links (Overview, 3D Body Twin, Medical Documents, Active Medications, Timeline, ABHA Card).
- Center Stage: A sleek 3D semi-transparent human anatomical model with pulsing glowing circular hotspot pins on 6 organ systems: Brain (Neurological), Heart (Cardiovascular), Lungs (Respiratory), Liver (Hepatic), Kidneys (Renal), and Pancreas (Endocrine/Metabolic).
- Right Diagnostic Panel (420px): "Organ Health Breakdown" showing the selected organ (Endocrine System: HbA1c 7.2% Elevated). Includes an AI Grounding Confidence Bar (99.4% Verified) and a horizontal 4-Zone Dot-Slider Range Indicator (Low - Normal - Elevated - Critical) with an active glowing pointer at 7.2%.
- Header Controls: Search bar, Language Dropdown (English, Telugu, Hindi, Tamil), Mock ABHA Sync Badge, and "+ Upload Document" button.

Frame 2: Split-Screen Evidence Grounding Studio (1440x900)
- Left 50% Pane: Scanned patient lab report PDF with blue bounding-box highlights around numbers and pill tags [fact_1], [fact_2], [fact_3].
- Right 50% Pane: "Evidence-Grounded Clinical Analysis" with an interactive toggle switch: [Layman's Terms | Doctor's Clinical View].
- Grounded Summary Card: Explains abnormal findings with clickable [fact_1] chips that highlight the exact source bounding box on the left document.
- Extracted Medicines Card: Glycomet-GP 1 (Glimepiride 1mg + Metformin 500mg), meal timing: Before Breakfast.
- Extracted Lab Cards: HbA1c 7.2% (Elevated), Serum Creatinine 0.9 mg/dL (Normal).

Frame 3: Frictionless Document Upload Studio
- Drag & Drop Dropzone with dashed teal border, camera capture button, and 3 pre-loaded one-click demo files:
  1. Apollo_CBC_Report.pdf (Lab report with elevated WBC)
  2. Fortis_Handwritten_Prescription.jpg (Indian bilingual prescription)
  3. Max_Discharge_Summary.pdf (Hospital discharge record)
- Notice: "Client-side PII Redaction Active: Phone numbers and Aadhaar masked before analysis."

Frame 4: Unified Health Journey Timeline
- Vertical connected timeline with month nodes (October 2026, September 2026).
- Cards for Prescriptions, Lab Reports, and Hospital Discharge Summaries with status pills and trend badges (e.g. "HbA1c decreased by 0.4% from last test").

Frame 5: Ayushman Bharat (ABDM) Mock ABHA Digital Health Card
- Government-grade digital identity card with guilloche pattern:
  - Header: AYUSHMAN BHARAT DIGITAL MISSION (ABDM) — MOCK PROFILE
  - Cardholder: Arjun Verma, 42M
  - ABHA Number: 91-2345-6789-0123 (MOCK)
  - ABHA Address: arjun.verma@abdm
  - Scannable QR code linking to NRCeS FHIR R4 Bundle.
  - Linked Facilities: Apollo Hospitals Hyderabad, Max Healthcare.
  - Button: "📥 Export NRCeS FHIR R4 Bundle (JSON)".

Frame 6: Multilingual & Accessibility View
- Live localized cards showing identical clinical data rendered in Telugu (తెలుగు), Hindi (हिन्दी), and Tamil (தமிழ்), with a badge proving exact numbers (7.2%, 500mg) are mathematically preserved.
- Audio Copilot Icon: "🔊 Read aloud in patient's native language".
```

---

## 📱 SCREEN-BY-SCREEN UI SPECIFICATIONS

### Screen 1: Executive Dashboard with 3D Anatomical Twin
- **The Visual Hook for Judges:** When judges load the app, they immediately see the **Interactive 3D Anatomical Body Scan**.
- **Interactive Hotspot Pins:**
  - **Brain:** Status Emerald (Normal) • Cognitive & sleep markers.
  - **Heart:** Status Emerald (Normal) • BP 120/80 mmHg, Total Cholesterol 185 mg/dL.
  - **Lungs:** Status Emerald (Normal) • SpO2 98%, Clear chest X-ray.
  - **Liver:** Status Emerald (Normal) • SGPT/ALT 28 U/L.
  - **Kidneys:** Status Emerald (Normal) • Serum Creatinine 0.9 mg/dL.
  - **Pancreas/Blood:** Status Amber (Elevated) • HbA1c 7.2%, Fasting Blood Sugar 142 mg/dL.
- **Micro-Interaction:** Clicking any organ pin smoothly animates the right-side detail card to show that organ's specific historical tests, active medications, and dot-slider range gauge.

---

### Screen 2: Split-Screen Evidence Grounding Studio
- **Left Pane (50% width):** High-definition original document viewer with zoom/page controls. Bounding boxes (`[fact_1]`, `[fact_2]`) drawn directly over the text.
- **Right Pane (50% width):**
  - **Dual-Mode Switcher:**
    - `Layman's Mode`: *"Your blood sugar test (HbA1c) is 7.2% [fact_1], which is higher than the standard target. Your doctor prescribed Glycomet-GP 1 [fact_2] to help manage glucose."*
    - `Doctor's Clinical Mode`: *"HbA1c: 7.2% (LOINC: 4548-4) [fact_1], indicating suboptimal glycemic control. Rx: Glimepiride 1mg + Metformin 500mg OD before breakfast [fact_2]. Renal function preserved: Creatinine 0.9 mg/dL [fact_3]."*
  - **Click-to-Highlight Linkage:** Clicking any `[fact_id]` citation pill zooms and pulses the corresponding bounding box on the original document.

---

### Screen 3: Visual 4-Zone Dot-Slider Range Indicator
- For every lab observation, display an intuitive horizontal dot gauge:
```
Low              Normal               Elevated          Critical
● ● ● ● ● ●  │  ● ● ● ● ● ● ● ● ●  │  ● ● [7.2% 🔴] ● │  ● ● ● ● ●
(Below 4.0%)     (4.0% - 5.6%)         (5.7% - 6.4%)      (6.5%+)
```
- A floating animated pin displays the exact current reading with high contrast.

---

### Screen 4: ABDM Mock ABHA Digital Health Card
- Official Ayushman Bharat Digital Mission (ABDM) design specs.
- Holographic security pattern, ABHA Number: `91-2345-6789-0123 (MOCK)`, QR code, and linked hospital facilities.
- One-click button: `📥 Download NRCeS FHIR R4 Bundle`.

---

## ⏱️ DESIGNER TIMELINE (FIRST 4 HOURS IN FIGMA)

| Time Window | Objective | Deliverable in Figma |
|---|---|---|
| **Hour 0 – 1** | Setup "Altris-Clinical Light" design system | Color styles, typography, 4-zone dot slider component, citation pills. |
| **Hour 1 – 2** | Dashboard with 3D Anatomical Body Twin | Frame 1: Interactive body scan with pulsing organ hotspot pins. |
| **Hour 2 – 3** | Split-Screen Evidence Grounding Studio | Frame 2: Document viewer (left) + Grounded summary with citation links (right). |
| **Hour 3 – 4** | Timeline, Mock ABHA Card & Multilingual | Frame 4, 5, 6: Chronological timeline, ABDM digital card, and Telugu/Hindi/Tamil view. |

---

## 🧰 TOOLS, LIBRARIES & DESIGN RESOURCES YOU USE
Refer to [`SHARED_RESOURCES.md`](file:///c:/Users/aasis/OneDrive%20-%20Vignan%20University/Desktop/HacXLerate%202026/team-assignments/SHARED_RESOURCES.md) for full design guidelines:
- **Design Environment:** Figma / FigJam / Figma AI using Master Prompt.
- **Iconography:** `lucide-react` (Heart, Activity, Pill, ShieldCheck, FileText, ChevronRight, Volume2).
- **Typography:** Google Fonts (`Plus Jakarta Sans`, `JetBrains Mono`, `Noto Sans Telugu`, `Noto Sans Devanagari`, `Noto Sans Tamil`).
- **Anatomical Visualization:** Scalable SVG Vector Anatomical silhouette with CSS drop-shadow filters and pulse keyframes.
- **Micro-Interactions:** `framer-motion` / CSS transitions for smooth zoom to document bounding boxes.
- **Voice Narration:** Web Speech API (`window.speechSynthesis`) for the Audio Copilot feature.

