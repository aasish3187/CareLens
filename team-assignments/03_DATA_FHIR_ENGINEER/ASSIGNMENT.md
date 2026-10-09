# 🏥 ROLE: DATA & FHIR/ABDM ENGINEER
## Member: [Name] — Clinical Data Pipelines, Indian Drug Normalization & ABDM/FHIR R4
## Track: Altrix Labs — AI-Powered Personal Health Copilot (HacXLerate 2026 Round 1)

---

> **Your Mission:** Build the India-specific clinical data foundation and ABDM-compliant interoperability layer for **CareLens**. You own the 300,000+ Indian brand-to-generic medicine normalization, Common Lab Codes for India (CLCI) to LOINC mapping, deterministic organ-system classification for the **Interactive 3D Body Twin**, and the **NRCeS FHIR R4 Bundle generator with Mock ABHA locker**. This secures the **25% Technical Architecture score** + the **5% ABDM Bonus Credit**.

---

## 🏆 ALTRIX LABS 25% ARCHITECTURE SCORECARD (+5% ABDM BONUS)

| Scoring Rubric Item | Weight | How Your Data Layer Wins It |
|---|:---:|---|
| **India-Specific Data Pipeline & Medicine Mapping** | **10%** | RapidFuzz fuzzy matcher indexing 300,000+ commercial Indian medicine brands to their generic active salts and meal instructions. |
| **CLCI to LOINC Standardized Lab Mapping** | **8%** | Mapping Indian diagnostic test names to official LOINC codes and ICMR/NABL reference boundaries. |
| **NRCeS FHIR R4 Bundle Specifications** | **7%** | Constructing valid FHIR R4 Document Bundles for Prescription, Diagnostic, and Discharge records conforming to National Resource Centre for EHR Standards. |
| **Ayushman Bharat / Mock ABHA Bonus Credit** | **+5%** | Complete Mock ABHA ID generator (`91-XXXX-XXXX-XXXX (MOCK)`), ABHA address (`name@abdm`), and scannable QR code. |

---

## 🗂️ REPOSITORY ARCHITECTURE YOU OWN

```
backend/
├── app/
│   ├── pipeline/
│   │   ├── normalise.py          # Brand→generic, LOINC, ICD-10 matching
│   │   └── organ_mapper.py       # Deterministic LOINC→Organ System classifier
│   ├── fhir/
│   │   ├── __init__.py
│   │   ├── bundle_builder.py     # ABDM FHIR R4 Document Bundle builder
│   │   ├── prescription.py       # ABDM PrescriptionRecord profile
│   │   ├── diagnostic.py         # ABDM DiagnosticReportRecord profile
│   │   ├── discharge.py          # ABDM DischargeSummaryRecord profile
│   │   ├── validator.py          # Schema validation against NRCeS IG
│   │   └── mock_abha.py          # Mock ABHA creation, QR generator & consent flow
│   └── data_loaders/
│       ├── drug_normaliser.py    # RapidFuzz brand→generic matcher (300k drugs)
│       └── loinc_mapper.py       # Test name→LOINC + ref range loader
├── data/
│   ├── indian_medicines.csv      # 300,000+ Indian medicines with salt compositions
│   ├── loinc_clci.csv            # Common Lab Codes for India (NRCeS)
│   ├── ref_ranges.json           # Seeded reference ranges & 4-zone dot slider thresholds
│   ├── organ_system_map.json     # Maps LOINC & test names to 6 anatomical systems
│   └── mock_abha_registry.json   # Mock Indian citizens & facility links
├── fixtures/
│   ├── synthetic/
│   │   ├── patient_arjun_cbc.json
│   │   ├── patient_arjun_prescription.json
│   │   └── patient_arjun_discharge.json
│   └── gold_labels/              # Gold-standard JSON for evaluation harness
└── tests/
    ├── test_drug_normaliser.py
    ├── test_loinc_mapper.py
    ├── test_organ_mapper.py
    └── test_fhir_bundles.py
```

---

## 🔧 KEY TECHNICAL IMPLEMENTATIONS

### 1. 300,000+ Indian Medicine Normalization (`data_loaders/drug_normaliser.py`)
Indian doctors prescribe trade brand names rather than generic salts. You resolve this with high-performance fuzzy matching:

```python
from rapidfuzz import process, fuzz

class IndianDrugNormaliser:
    """
    Resolves trade brands to active pharmacological salt compositions:
    - 'Glycomet-GP 1' -> 'Glimepiride (1mg) + Metformin (500mg)'
    - 'Augmentin 625' -> 'Amoxicillin (500mg) + Clavulanic Acid (125mg)'
    - 'Pan-D' -> 'Pantoprazole (40mg) + Domperidone (30mg)'
    """
    def __init__(self, dataset_path: str = "data/indian_medicines.csv"):
        self.drugs = self._load_dataset(dataset_path)
        self.brand_index = list(self.drugs.keys())

    def normalise(self, brand_raw: str) -> dict:
        brand_clean = brand_raw.strip().upper()
        # 1. Exact match
        if brand_clean in self.drugs:
            return {"match_score": 100, **self.drugs[brand_clean]}
        # 2. Token-sort fuzzy match
        match = process.extractOne(brand_clean, self.brand_index, scorer=fuzz.token_sort_ratio, score_cutoff=75)
        if match:
            matched_name, score, _ = match
            return {"match_score": score, **self.drugs[matched_name]}
        return {"match_score": 0, "generic_name": None}
```

---

### 2. Organ System Classification Data (`organ_system_map.json`)
Powers the frontend's **Interactive 3D Anatomical Body Twin** by categorizing every test into one of the 6 systems:

```json
{
  "cardiovascular": {
    "display_name": "Cardiovascular (Heart & Vessels)",
    "loinc_codes": ["13457-7", "2093-3", "2085-9", "2571-8"],
    "keywords": ["cholesterol", "lipid", "triglyceride", "hdl", "ldl", "blood pressure", "ecg", "troponin", "hypertension"]
  },
  "endocrine": {
    "display_name": "Endocrine & Metabolic",
    "loinc_codes": ["4548-4", "2345-7", "1558-6", "3016-3"],
    "keywords": ["hba1c", "glucose", "sugar", "tsh", "t3", "t4", "thyroid", "insulin", "diabetes"]
  },
  "respiratory": {
    "display_name": "Respiratory System (Lungs)",
    "loinc_codes": ["59408-5", "1988-5"],
    "keywords": ["spo2", "oxygen", "chest x-ray", "pulmonary", "asthma", "bronchitis", "fev1"]
  },
  "renal": {
    "display_name": "Renal System (Kidneys)",
    "loinc_codes": ["2160-0", "3094-0", "33914-3", "2823-3"],
    "keywords": ["creatinine", "bun", "urea", "egfr", "uric acid", "potassium", "urine routine"]
  },
  "hepatic": {
    "display_name": "Hepatic System (Liver)",
    "loinc_codes": ["1742-6", "1920-8", "1751-7", "1975-2"],
    "keywords": ["sgpt", "alt", "sgot", "ast", "bilirubin", "alkaline phosphatase", "albumin", "liver"]
  },
  "neurological": {
    "display_name": "Neurological & Cognitive (Brain)",
    "loinc_codes": ["2132-9", "2157-6"],
    "keywords": ["vitamin b12", "electrolytes", "mri brain", "ct head", "neuropathy", "headache"]
  }
}
```

---

### 3. Seeded Reference Ranges & Dot-Slider Thresholds (`ref_ranges.json`)
Supplies the exact numerical boundaries for the **Visual 4-Zone Dot-Slider Range Indicators**:

```json
{
  "4548-4": {
    "name": "HbA1c (Glycated Hemoglobin)",
    "unit": "%",
    "organ_system": "endocrine",
    "zones": {
      "low": {"min": 0.0, "max": 3.9},
      "normal": {"min": 4.0, "max": 5.6},
      "elevated": {"min": 5.7, "max": 6.4},
      "critical": {"min": 6.5, "max": 15.0}
    },
    "interpretation": {
      "normal": "Normal glycemic regulation over previous 90 days.",
      "elevated": "Prediabetic range. Lifestyle and dietary intervention indicated.",
      "critical": "Diabetic range. Clinical pharmacotherapy required."
    }
  },
  "2160-0": {
    "name": "Serum Creatinine",
    "unit": "mg/dL",
    "organ_system": "renal",
    "zones": {
      "low": {"min": 0.0, "max": 0.5},
      "normal": {"min": 0.6, "max": 1.2},
      "elevated": {"min": 1.3, "max": 2.0},
      "critical": {"min": 2.1, "max": 10.0}
    }
  }
}
```

---

### 4. Official NRCeS ABDM FHIR R4 Bundle Builder (`fhir/bundle_builder.py`)
Generates standardized NRCeS-compliant FHIR R4 Bundles of type `document`:

```python
def build_abdm_fhir_bundle(doc_type: str, patient: dict, facts: list[dict]) -> dict:
    """
    Constructs a valid ABDM FHIR R4 Bundle conforming to NRCeS profiles:
    https://nrces.in/ndhm/fhir/r4/StructureDefinition/PrescriptionRecord
    https://nrces.in/ndhm/fhir/r4/StructureDefinition/DiagnosticReportRecord
    """
    # Generates valid Composition, Patient (with Mock ABHA), Practitioner,
    # Organization, and Observation / MedicationRequest resource entries.
```

---

### 5. Mock ABHA Digital Health Card Generator (`fhir/mock_abha.py`)
Generates an official-looking Mock ABHA credential with an embedded base64 QR code:
- **Mock ABHA ID:** `91-2345-6789-0123 (MOCK)`
- **ABHA Address:** `arjun.verma@abdm`
- **QR Code Content:** Embedded JSON with patient ID, facility links, and FHIR export URI.

---

## 📅 HOUR-BY-HOUR DATA & FHIR SCHEDULE

| Hours | Task | Milestone |
|---|---|---|
| **Hour 0 – 4** | Ingest & index 300,000+ Indian medicines dataset | RapidFuzz fuzzy search working (<20ms response) |
| **Hour 4 – 8** | Map Common Lab Codes for India (CLCI) to LOINC | `data/loinc_clci.csv` + `organ_system_map.json` ready |
| **Hour 8 – 10** | Seed reference ranges with 4-zone dot slider thresholds | `data/ref_ranges.json` populated with top 30 lab tests |
| **Hour 10 – 14** | Build ABDM FHIR R4 Bundle builder (NRCeS profiles) | Valid JSON exportable for Prescriptions & Lab Reports |
| **Hour 14 – 16** | Build Mock ABHA generator + QR code service | `GET /api/abha/card` returning scannable credentials |
| **Hour 16 – 18** | Create synthetic Indian patient evaluation dataset | 10 realistic PDF test records with gold-standard JSON |
| **Hour 18 – 20** | Run FHIR validator against generated bundles | FHIR validation passes 100% of test cases |
| **Hour 20 – 22** | Final demo verification & architecture slide contribution | Architecture & ABDM data flow ready for presentation |

---

## 🧰 TOOLS, DATASETS & STANDARDS YOU USE
Refer to [`SHARED_RESOURCES.md`](file:///c:/Users/aasis/OneDrive%20-%20Vignan%20University/Desktop/HacXLerate%202026/team-assignments/SHARED_RESOURCES.md) for full dataset references:
- **Fuzzy Brand Matcher:** `rapidfuzz` (C++ Levenshtein & token-sort ratio)
- **Indian Drug Intelligence:** Kaggle Indian Medicines (195k) + GitHub JuniorAlive (300k+) + Eka Care MCP reference
- **Standard Lab Vocabulary:** Common Lab Codes for India (CLCI, 1,473 tests, NRCeS)
- **ABDM FHIR R4 SDK:** `fhir.resources>=7.1.0` (HL7 FHIR R4 Pydantic schema models)
- **Implementation Profiles:** NRCeS NDHM FHIR R4 Profiles (Prescription, DiagnosticReport, DischargeSummary)
- **QR Code Engine:** `qrcode[pil]` with base64 PNG export

