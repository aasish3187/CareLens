# CareLens — AI-Powered Personal Health Copilot (Frontend Prototype Plan)

## Goal
A polished, fully navigable, front-end-only prototype of CareLens (Altrix Labs) in the existing React 19 + Vite + Tailwind v4 scaffold. All data is realistic mock data for patient **Arjun Verma, 42M**. It should impress judges on first load (body twin), show the Upload → Extract → Evidence → Timeline flow working end to end, and support full English / Telugu / Hindi / Tamil switching.

## Confirmed decisions
- **Structure:** One app with sidebar routing (react-router, `createBrowserRouter`, layout route).
- **i18n:** Full UI chrome and clinical summaries translated into EN / TE / HI / TA. Numbers, units, and drug names are never translated (marked as "locked tokens").
- **Body twin:** Custom layered SVG (translucent silhouette, organ shapes, glow filters, animated scan line, pulsing hotspot pins). No 3D library.
- **Upload:** Drag-and-drop, file picker, or one-click demo file → simulated multi-stage extraction (~3–4s) → redirects to Evidence Studio with demo data.

## Dependencies to add
`react-router`, `lucide-react` (icons), `motion` (panel transitions and pin animations), `qrcode.react` (ABHA QR). Load the `make/react-router` and `make/motion-context` skills before using them.

## Design system ("Altris-Clinical Light"), in `src/index.css`
- Google Fonts `@import` first: Inter, JetBrains Mono, Noto Sans Telugu, Noto Sans Devanagari, Noto Sans Tamil. Then `@import 'tailwindcss';`.
- `@theme` tokens: bg-app #F8FAFC, surface #FFF, surface-subtle #F1F5F9, teal #0D9488 / hover #0F766E / tint #F0FDFA, cyan #0EA5E9 / tint #F0F9FF, status low #3B82F6, normal #10B981, elevated #F59E0B, critical #EF4444, heading #0F172A, body #334155, muted #64748B, border #E2E8F0. `--font-sans` and `--font-mono` are set here too.
- Font stack switches with `html[lang]`: `te` adds Noto Sans Telugu, `hi` adds Devanagari, `ta` adds Tamil.
- Cards: white, 16px radius, 1px #E2E8F0 border, soft layered shadow. Focus ring: 2px teal.
- Keyframes: pin pulse, scan line sweep, fact-box highlight pulse, shimmer for extraction progress. Respect `prefers-reduced-motion`.

## File layout
```
src/
  main.tsx                 RouterProvider + I18nProvider
  App.tsx                  default export: router definition
  index.css
  i18n/
    I18nContext.tsx        provider, useT(), lang persisted to localStorage, sets <html lang>
    strings.ts             { en, te, hi, ta } dictionaries (chrome + summaries)
  data/
    patient.ts             patient profile, ABHA info
    organs.ts              6 organ systems: status, metrics, history, meds, SVG pin coords
    labs.ts                lab observations with 4-zone ranges
    documents.ts           3 demo documents, facts with bounding boxes (percent coords)
    timeline.ts            events grouped by month
    medications.ts
    fhir.ts                buildFhirBundle() -> JSON object
  components/
    layout/AppShell.tsx  Sidebar.tsx  Header.tsx
    ui/Card.tsx  StatusPill.tsx  SafetyBadge.tsx  FactChip.tsx  LockedToken.tsx
    DotRangeSlider.tsx     4-zone dot gauge with floating pin
    GroundingBar.tsx       confidence bar ("99.4% Verified")
    BodyTwin.tsx           layered SVG + hotspots
    OrganPanel.tsx         right diagnostic panel
    DocumentViewer.tsx     mock scanned report + bounding boxes, zoom/page controls
    LanguageSwitcher.tsx
  pages/
    Overview.tsx  BodyTwinPage.tsx  Upload.tsx  EvidenceStudio.tsx
    Medications.tsx  Timeline.tsx  AbhaCard.tsx  Multilingual.tsx  NotFound.tsx
```

## App shell
- **Sidebar (240px, white):** "CareLens" logo mark and "by Altrix Labs". Nav: Overview, Body Twin, Documents (Upload / Evidence), Medications, Timeline, ABHA Card, Multilingual. The active item gets a teal tint with a left accent. A footer card says "Clinical safety: Deterministic rules, not LLM guesses." Below `lg` it collapses into a slide-over drawer opened by a hamburger button.
- **Header:** Search input (visual only, filters nothing beyond a placeholder), language dropdown with native labels (English, తెలుగు, हिन्दी, தமிழ்), "ABHA Synced (Mock)" badge, and a "+ Upload Document" primary button that links to `/upload`.
- **Medical safety badges** appear in relevant cards: "Evidence-grounded", "PII Redacted", "Not a diagnosis — consult your doctor".

## Routes and screens
1. **`/` Overview (dashboard):** A greeting and patient card, with 4 KPI tiles (Health score, Abnormal findings 1, Active meds 2, Documents 3). Below that is the body twin on the left plus the organ panel, so judges see the hook immediately. It also shows a recent timeline preview (3 items) and an ABHA mini card.
2. **`/body-twin`:** A full-size twin (center) with a 420px organ panel on the right.
   - SVG layers: grid backdrop, translucent body silhouette with gradient stroke, organ paths (brain, lungs, heart, liver, pancreas, kidneys), cyan glow filter, vertical scan line loop, and pins colored by status with a pulse ring.
   - Pins are `<button>` elements with aria-labels and keyboard focus. Hover shows a tooltip. Clicking selects the organ and highlights its shape.
   - Organ list chips under the twin offer an alternate selection.
   - Panel (animated swap with motion): organ name and system, status pill, primary metric in mono, GroundingBar, DotRangeSlider, historical tests (mini sparkline from inline SVG), active meds, and a source document link to the Evidence Studio.
   - Default selection: Pancreas (HbA1c 7.2%, Elevated).
   - Data per the spec: Brain normal; Heart BP 120/80 and cholesterol 185; Lungs SpO2 98%; Liver ALT 28 U/L; Kidneys creatinine 0.9; Pancreas HbA1c 7.2% and FBS 142 (elevated).
3. **`/upload`:**
   - A dashed teal dropzone with hover and drag states, a "Browse files" button (hidden input that accepts pdf/jpg/png), and a "Capture with camera" button (input `capture="environment"`).
   - Three demo file cards: Apollo_CBC_Report.pdf, Fortis_Handwritten_Prescription.jpg, Max_Discharge_Summary.pdf.
   - A PII redaction notice.
   - After selection, a thumbnail and file row appear, followed by a staged pipeline with a progress bar: Deskew & enhance → PII redaction → OCR + VLM extraction → Drug normalization → Rules engine → Grounding check. Each stage ticks off.
   - On completion, it navigates to `/evidence/:docId`. Real uploads map to the Apollo demo doc.
   - Invalid file types show an inline error.
4. **`/evidence/:docId?` Evidence Studio:** A 50/50 split, stacked on mobile.
   - **Left:** DocumentViewer renders a realistic HTML/CSS "scanned" report: paper texture, slight rotation, hospital header, table rows, and handwriting font for the prescription doc. Absolutely positioned bounding boxes are labeled `[fact_n]`. Zoom −/+ and page indicator controls are included.
   - **Right:**
     - Segmented toggle: Layman | Clinical.
     - Grounded summary paragraph built from segments, with clickable FactChips. Clicking a chip sets `activeFact`, which scrolls/zooms to and pulse-highlights the matching box. Clicking a box highlights the chip.
     - Extracted Medicines card: Glycomet-GP 1 → Glimepiride 1mg + Metformin 500mg, Before Breakfast.
     - Extracted Labs cards: HbA1c 7.2% Elevated, Creatinine 0.9 Normal, each with a DotRangeSlider.
     - Grounding bar, and a doc switcher tabs row for the 3 demo docs.
   - The default docId is apollo.
5. **`/medications`:** Active medication cards (brand → generic composition, dose, timing chips, prescriber, source fact). Includes a polypharmacy check card: "No duplicate therapies detected" (emerald).
6. **`/timeline`:** A vertical connected timeline grouped by month (Oct 2026, Sep 2026, Aug 2026). Node icons are by type (lab, Rx, discharge, visit), with status pills and trend badges (e.g. "HbA1c decreased by 0.4% from last test"). Filter chips (All / Labs / Prescriptions / Discharge).
7. **`/abha`:**
   - Government-style card with a CSS/SVG guilloche pattern and holographic gradient sheen. Header reads "AYUSHMAN BHARAT DIGITAL MISSION (ABDM) — MOCK PROFILE". Shows Arjun Verma 42M, ABHA 91-2345-6789-0123 (MOCK), arjun.verma@abdm, a QR (qrcode.react encoding a mock FHIR URL), and linked facilities (Apollo Hyderabad, Max Healthcare).
   - "Export NRCeS FHIR R4 Bundle (JSON)" downloads `buildFhirBundle()` as a Blob. A collapsible JSON preview is included.
   - A prominent "MOCK — not a real ABHA" disclaimer.
8. **`/multilingual`:** Four side-by-side cards (EN / TE / HI / TA) rendering the same clinical summary, with locked tokens (7.2%, 500mg, Metformin) styled as mono pills. A "Numbers & drug names preserved" verification badge. "Read aloud" buttons use `window.speechSynthesis` with the matching lang code (te-IN, hi-IN, ta-IN, en-IN). If no voice is available, they show a toast.

## Key components
- **DotRangeSlider:** Props are `{ value, unit, zones: [{key:'low'|'normal'|'elevated'|'critical', min, max}] }`. It renders around 28 dots colored per zone and dims dots outside the active zone. A floating pin sits above the computed position (piecewise-linear per zone so each zone gets equal visual width), and zone labels and ranges appear beneath. It animates the pin in on mount. HbA1c zones: <4.0, 4.0–5.6, 5.7–6.4, ≥6.5. Display status comes from the data's deterministic `status` field.
  - Note: the spec labels 7.2 "Elevated" but places it in the ≥6.5 zone. We keep the zones as specified. The pin lands in the 4th zone, and the status pill reads "Elevated" per the clinical spec. A small note explains that ≥6.5% is the diabetes range.
- **FactChip / LockedToken:** Small mono pills. FactChip is a button with active state.
- **i18n:** `t(key)` returns a string. Summaries are stored as segment arrays `[text | {fact:'fact_1', token:'7.2%'}]` per language, so chips and locked tokens render identically in every language. A missing key falls back to English.

## Accessibility and responsiveness
- All interactive elements are real buttons or links with focus rings, and pins have aria-labels.
- Layout breakpoints: below `lg`, the sidebar becomes a drawer, the twin panel stacks below the twin, and the Evidence split stacks.
- Color is never the sole indicator: status pills always include a text label.

## Verification
- `pnpm build` once after implementation to catch type and syntax errors. Don't start the dev server; it is already running.
- Manual click-through in the preview:
  - Switch language on each page.
  - Select each organ pin.
  - Run the upload demo flow through to the Evidence Studio.
  - Check that fact chip ↔ bounding box linkage works.
  - Download the FHIR bundle.
  - Filter the timeline.
  - Check narrow widths.

## Out of scope
A real backend, OCR or AI, real ABHA integration, authentication, persistence beyond the language preference, and real search.
