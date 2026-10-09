"""
CareLens - Synthetic Medical Records & Gold Standard Benchmark Dataset Generator
Generates 25 high-fidelity synthetic Indian diagnostic lab reports, clinical prescriptions,
and discharge summaries paired with gold-standard structured ground truth labels for quantitative evaluation.
"""

import json
import os
import sys
from typing import List, Dict, Any

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


def generate_synthetic_dataset() -> List[Dict[str, Any]]:
    """
    Generates 25 high-fidelity synthetic Indian medical records covering diverse clinical specialties:
    Diabetology, Cardiology, Nephrology, Gastroenterology, Endocrinology, Hematology, Oncology,
    Pulmonology, Rheumatology, Urology, Orthopedics, Pediatrics, and Geriatrics.
    """
    dataset = [
        # 1. Apollo Diagnostics - Diabetes & Lipid Panel
        {
            "doc_id": "APOLLO_LAB_001",
            "provider_name": "Apollo Diagnostics, Jubilee Hills, Hyderabad",
            "document_type": "Diagnostic Report",
            "document_date": "2026-03-15",
            "patient_info": {"name": "Ramesh Kumar Sharma", "age": 52, "gender": "M", "mock_abha_id": "91-8721-4432-1098 (MOCK)"},
            "raw_text": (
                "APOLLO DIAGNOSTICS - CLINICAL BIOCHEMISTRY REPORT\n"
                "Patient: Ramesh Kumar Sharma | Age: 52 Y / M | Date: 15/03/2026\n"
                "Test Name                 Result      Units       Reference Interval\n"
                "HbA1c (Glycated Hb)       7.4         %           4.0 - 5.6\n"
                "Estimated Avg Glucose     166         mg/dL       70 - 126\n"
                "Fasting Blood Sugar (FBS) 128         mg/dL       70 - 99\n"
                "Post Prandial Sugar (PPBS)184         mg/dL       < 140\n"
                "Total Cholesterol         218         mg/dL       125 - 200\n"
                "Serum Triglycerides       192         mg/dL       < 150\n"
                "HDL Cholesterol           41          mg/dL       40 - 60\n"
                "LDL Cholesterol           138         mg/dL       < 100\n"
                "Serum Creatinine          1.05        mg/dL       0.70 - 1.20\n"
            ),
            "gold_standard": {
                "document_date": "2026-03-15",
                "organ_system": "Endocrine & Metabolic / Cardiovascular",
                "labs": [
                    {"test_name": "HbA1c", "value": 7.4, "unit": "%", "reference_range": "4.0 - 5.6", "flag": "ELEVATED", "loinc_code": "4548-4"},
                    {"test_name": "Estimated Average Glucose", "value": 166, "unit": "mg/dL", "reference_range": "70 - 126", "flag": "ELEVATED", "loinc_code": "27353-2"},
                    {"test_name": "Fasting Blood Sugar", "value": 128, "unit": "mg/dL", "reference_range": "70 - 99", "flag": "ELEVATED", "loinc_code": "1558-6"},
                    {"test_name": "Post Prandial Blood Sugar", "value": 184, "unit": "mg/dL", "reference_range": "< 140", "flag": "ELEVATED", "loinc_code": "1521-4"},
                    {"test_name": "Total Cholesterol", "value": 218, "unit": "mg/dL", "reference_range": "125 - 200", "flag": "ELEVATED", "loinc_code": "2093-3"},
                    {"test_name": "Serum Triglycerides", "value": 192, "unit": "mg/dL", "reference_range": "< 150", "flag": "ELEVATED", "loinc_code": "2571-8"},
                    {"test_name": "HDL Cholesterol", "value": 41, "unit": "mg/dL", "reference_range": "40 - 60", "flag": "NORMAL", "loinc_code": "2085-9"},
                    {"test_name": "LDL Cholesterol", "value": 138, "unit": "mg/dL", "reference_range": "< 100", "flag": "ELEVATED", "loinc_code": "13457-7"},
                    {"test_name": "Serum Creatinine", "value": 1.05, "unit": "mg/dL", "reference_range": "0.70 - 1.20", "flag": "NORMAL", "loinc_code": "2160-0"}
                ],
                "medications": [],
                "diagnoses": ["Type 2 Diabetes Mellitus", "Dyslipidemia"]
            },
            "grounded_summary": {
                "text_en": "Your HbA1c is 7.4% [fact_1], reflecting an estimated average glucose of 166 mg/dL [fact_2]. Fasting blood sugar is 128 mg/dL [fact_3] and postprandial sugar is 184 mg/dL [fact_4]. Total cholesterol is 218 mg/dL [fact_5] with LDL at 138 mg/dL [fact_6]. Creatinine is normal at 1.05 mg/dL [fact_7].",
                "text_te": "మీ HbA1c 7.4% [fact_1], సగటు గ్లూకోజ్ 166 mg/dL [fact_2]. పరగడుపున రక్తంలో చక్కెర 128 mg/dL [fact_3], తిన్న తర్వాత చక్కెర 184 mg/dL [fact_4]. కొలెస్ట్రాల్ 218 mg/dL [fact_5], LDL 138 mg/dL [fact_6]. క్రియాటినిన్ 1.05 mg/dL [fact_7].",
                "text_hi": "आपका HbA1c 7.4% [fact_1] है, जो 166 mg/dL [fact_2] औसत ग्लूकोज दर्शाता है। फास्टिंग शुगर 128 mg/dL [fact_3] और भोजन बाद 184 mg/dL [fact_4] है। कोलेस्ट्रॉल 218 mg/dL [fact_5] और LDL 138 mg/dL [fact_6] है। क्रिएटिनिन 1.05 mg/dL [fact_7] है।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "HbA1c 7.4 %"},
                    {"fact_id": "fact_2", "claim": "Estimated Average Glucose 166 mg/dL"},
                    {"fact_id": "fact_3", "claim": "Fasting blood sugar 128 mg/dL"},
                    {"fact_id": "fact_4", "claim": "Post Prandial sugar 184 mg/dL"},
                    {"fact_id": "fact_5", "claim": "Total cholesterol 218 mg/dL"},
                    {"fact_id": "fact_6", "claim": "LDL cholesterol 138 mg/dL"},
                    {"fact_id": "fact_7", "claim": "Serum creatinine 1.05 mg/dL"}
                ]
            }
        },

        # 2. Dr. Lal PathLabs - Thyroid & Hematology
        {
            "doc_id": "LAL_PATH_002",
            "provider_name": "Dr Lal PathLabs, Connaught Place, New Delhi",
            "document_type": "Diagnostic Report",
            "document_date": "2026-02-18",
            "patient_info": {"name": "Sunita Verma", "age": 38, "gender": "F", "mock_abha_id": "91-4412-9901-3321 (MOCK)"},
            "raw_text": (
                "DR LAL PATHLABS - LABORATORY REPORT\n"
                "Patient: Sunita Verma | Age: 38 / Female | Date: 18-02-2026\n"
                "TSH (Ultrasensitive)              6.85        uIU/mL      0.35 - 4.94\n"
                "Free T3                           2.9         pg/mL       1.71 - 3.71\n"
                "Free T4                           1.02        ng/dL       0.70 - 1.48\n"
                "Hemoglobin (Hb)                   10.8        g/dL        12.0 - 15.0\n"
                "Packed Cell Volume (PCV)          33.2        %           36.0 - 46.0\n"
                "Platelet Count                    245000      /cumm       150000 - 450000\n"
                "Total WBC (TLC)                   7200        /cumm       4000 - 11000\n"
            ),
            "gold_standard": {
                "document_date": "2026-02-18",
                "organ_system": "Endocrine / Thyroid & Hematology",
                "labs": [
                    {"test_name": "TSH", "value": 6.85, "unit": "uIU/mL", "reference_range": "0.35 - 4.94", "flag": "ELEVATED", "loinc_code": "3016-3"},
                    {"test_name": "Free T3", "value": 2.9, "unit": "pg/mL", "reference_range": "1.71 - 3.71", "flag": "NORMAL", "loinc_code": "3051-0"},
                    {"test_name": "Free T4", "value": 1.02, "unit": "ng/dL", "reference_range": "0.70 - 1.48", "flag": "NORMAL", "loinc_code": "3024-7"},
                    {"test_name": "Hemoglobin", "value": 10.8, "unit": "g/dL", "reference_range": "12.0 - 15.0", "flag": "LOW", "loinc_code": "718-7"},
                    {"test_name": "Packed Cell Volume", "value": 33.2, "unit": "%", "reference_range": "36.0 - 46.0", "flag": "LOW", "loinc_code": "20570-8"},
                    {"test_name": "Platelet Count", "value": 245000, "unit": "/cumm", "reference_range": "150000 - 450000", "flag": "NORMAL", "loinc_code": "777-3"},
                    {"test_name": "Total WBC Count", "value": 7200, "unit": "/cumm", "reference_range": "4000 - 11000", "flag": "NORMAL", "loinc_code": "6690-2"}
                ],
                "medications": [],
                "diagnoses": ["Subclinical Hypothyroidism", "Mild Anemia"]
            },
            "grounded_summary": {
                "text_en": "TSH is elevated at 6.85 uIU/mL [fact_1] with normal Free T3 (2.9 pg/mL) [fact_2] and Free T4 (1.02 ng/dL) [fact_3]. Hemoglobin is 10.8 g/dL [fact_4] with PCV at 33.2% [fact_5]. Platelet count (245000 /cumm) [fact_6] and WBC (7200 /cumm) [fact_7] are normal.",
                "text_te": "TSH 6.85 uIU/mL [fact_1], ఫ్రీ T3 (2.9 pg/mL) [fact_2], ఫ్రీ T4 (1.02 ng/dL) [fact_3]. హిమోగ్లోబిన్ 10.8 g/dL [fact_4], PCV 33.2% [fact_5]. ప్లేట్‌లెట్స్ (245000 /cumm) [fact_6], WBC (7200 /cumm) [fact_7].",
                "text_hi": "TSH 6.85 uIU/mL [fact_1] पर है, फ्री T3 (2.9 pg/mL) [fact_2] और फ्री T4 (1.02 ng/dL) [fact_3] सामान्य हैं। हीमोग्लोबिन 10.8 g/dL [fact_4] और PCV 33.2% [fact_5] है। प्लेटलेट (245000 /cumm) [fact_6] और WBC (7200 /cumm) [fact_7] सामान्य हैं।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "TSH 6.85 uIU/mL"},
                    {"fact_id": "fact_2", "claim": "Free T3 2.9 pg/mL"},
                    {"fact_id": "fact_3", "claim": "Free T4 1.02 ng/dL"},
                    {"fact_id": "fact_4", "claim": "Hemoglobin 10.8 g/dL"},
                    {"fact_id": "fact_5", "claim": "Packed Cell Volume 33.2 %"},
                    {"fact_id": "fact_6", "claim": "Platelet Count 245000 /cumm"},
                    {"fact_id": "fact_7", "claim": "Total WBC 7200 /cumm"}
                ]
            }
        },

        # 3. Metropolis Healthcare - Liver & Renal
        {
            "doc_id": "METROPOLIS_003",
            "provider_name": "Metropolis Healthcare, Mumbai",
            "document_type": "Diagnostic Report",
            "document_date": "2026-01-24",
            "patient_info": {"name": "Anil Deshmukh", "age": 47, "gender": "M", "mock_abha_id": "91-5521-1288-7740 (MOCK)"},
            "raw_text": (
                "METROPOLIS HEALTHCARE - BIOCHEMISTRY PROFILE\n"
                "Patient: Anil Deshmukh | 47 Y / M | Date: 24/01/2026\n"
                "SGOT / AST                        58          IU/L        10 - 40\n"
                "SGPT / ALT                        72          IU/L        10 - 45\n"
                "Serum Alkaline Phosphatase (ALP)  112         IU/L        40 - 130\n"
                "Total Bilirubin                   0.9         mg/dL       0.2 - 1.2\n"
                "Blood Urea Nitrogen (BUN)         14          mg/dL       7 - 20\n"
                "Serum Creatinine                  0.92        mg/dL       0.7 - 1.3\n"
                "Serum Uric Acid                   6.2         mg/dL       3.5 - 7.2\n"
            ),
            "gold_standard": {
                "document_date": "2026-01-24",
                "organ_system": "Hepatic & Renal",
                "labs": [
                    {"test_name": "SGOT / AST", "value": 58, "unit": "IU/L", "reference_range": "10 - 40", "flag": "ELEVATED", "loinc_code": "1920-8"},
                    {"test_name": "SGPT / ALT", "value": 72, "unit": "IU/L", "reference_range": "10 - 45", "flag": "ELEVATED", "loinc_code": "1742-6"},
                    {"test_name": "Alkaline Phosphatase", "value": 112, "unit": "IU/L", "reference_range": "40 - 130", "flag": "NORMAL", "loinc_code": "6768-6"},
                    {"test_name": "Total Bilirubin", "value": 0.9, "unit": "mg/dL", "reference_range": "0.2 - 1.2", "flag": "NORMAL", "loinc_code": "1975-2"},
                    {"test_name": "Blood Urea Nitrogen", "value": 14, "unit": "mg/dL", "reference_range": "7 - 20", "flag": "NORMAL", "loinc_code": "3094-0"},
                    {"test_name": "Serum Creatinine", "value": 0.92, "unit": "mg/dL", "reference_range": "0.7 - 1.3", "flag": "NORMAL", "loinc_code": "2160-0"},
                    {"test_name": "Serum Uric Acid", "value": 6.2, "unit": "mg/dL", "reference_range": "3.5 - 7.2", "flag": "NORMAL", "loinc_code": "3084-1"}
                ],
                "medications": [],
                "diagnoses": ["Elevated Liver Transaminases"]
            },
            "grounded_summary": {
                "text_en": "AST is 58 IU/L [fact_1] and ALT is 72 IU/L [fact_2]. Total bilirubin is 0.9 mg/dL [fact_3] and ALP is 112 IU/L [fact_4]. BUN is 14 mg/dL [fact_5], creatinine is 0.92 mg/dL [fact_6], and uric acid is 6.2 mg/dL [fact_7].",
                "text_te": "AST 58 IU/L [fact_1], ALT 72 IU/L [fact_2]. బిలిరుబిన్ 0.9 mg/dL [fact_3], ALP 112 IU/L [fact_4]. BUN 14 mg/dL [fact_5], క్రియాటినిన్ 0.92 mg/dL [fact_6], యూరిక్ యాసిడ్ 6.2 mg/dL [fact_7].",
                "text_hi": "AST 58 IU/L [fact_1] और ALT 72 IU/L [fact_2] है। बिलीरुबिन 0.9 mg/dL [fact_3] और ALP 112 IU/L [fact_4] है। BUN 14 mg/dL [fact_5], क्रिएटिनिन 0.92 mg/dL [fact_6] और यूरिक एसिड 6.2 mg/dL [fact_7] है।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "SGOT / AST 58 IU/L"},
                    {"fact_id": "fact_2", "claim": "SGPT / ALT 72 IU/L"},
                    {"fact_id": "fact_3", "claim": "Total Bilirubin 0.9 mg/dL"},
                    {"fact_id": "fact_4", "claim": "Alkaline Phosphatase 112 IU/L"},
                    {"fact_id": "fact_5", "claim": "Blood Urea Nitrogen 14 mg/dL"},
                    {"fact_id": "fact_6", "claim": "Serum Creatinine 0.92 mg/dL"},
                    {"fact_id": "fact_7", "claim": "Serum Uric Acid 6.2 mg/dL"}
                ]
            }
        },

        # 4. Max Healthcare - Cardiology & Prescription
        {
            "doc_id": "MAX_RX_004",
            "provider_name": "Max Super Speciality Hospital, Saket, New Delhi",
            "document_type": "Prescription & Summary",
            "document_date": "2026-03-02",
            "patient_info": {"name": "Vikram Malhotra", "age": 59, "gender": "M", "mock_abha_id": "91-3390-1122-8877 (MOCK)"},
            "raw_text": (
                "MAX HEALTHCARE - CARDIOLOGY CLINIC\n"
                "Patient: Vikram Malhotra | Age: 59 M | Date: 02/03/2026\n"
                "1. Tab Telma 40 (Telmisartan 40mg) - 1 tab OD morning after breakfast\n"
                "2. Tab Rosuvas 10 (Rosuvastatin 10mg) - 1 tab HS night after dinner\n"
                "3. Tab Ecosprin 75 (Aspirin 75mg) - 1 tab OD after lunch\n"
                "4. Tab Pan 40 (Pantoprazole 40mg) - 1 tab OD before breakfast\n"
            ),
            "gold_standard": {
                "document_date": "2026-03-02",
                "organ_system": "Cardiovascular",
                "labs": [],
                "medications": [
                    {"brand_name": "Telma 40", "generic_name": "Telmisartan", "strength": "40mg", "frequency": "1 tab OD morning", "food_relation": "after breakfast"},
                    {"brand_name": "Rosuvas 10", "generic_name": "Rosuvastatin", "strength": "10mg", "frequency": "1 tab HS night", "food_relation": "after dinner"},
                    {"brand_name": "Ecosprin 75", "generic_name": "Aspirin", "strength": "75mg", "frequency": "1 tab OD", "food_relation": "after lunch"},
                    {"brand_name": "Pan 40", "generic_name": "Pantoprazole", "strength": "40mg", "frequency": "1 tab OD", "food_relation": "before breakfast"}
                ],
                "diagnoses": ["Essential Hypertension", "Dyslipidemia"]
            },
            "grounded_summary": {
                "text_en": "Prescribed Telma 40 once daily in morning [fact_1], Rosuvas 10 at night [fact_2], Ecosprin 75 after lunch [fact_3], and Pan 40 before breakfast [fact_4].",
                "text_te": "ఉదయం Telma 40 [fact_1], రాత్రి Rosuvas 10 [fact_2], లంచ్ తర్వాత Ecosprin 75 [fact_3], టిఫిన్ ముందు Pan 40 [fact_4] సూచించబడ్డాయి.",
                "text_hi": "सुबह में Telma 40 [fact_1], रात में Rosuvas 10 [fact_2], दोपहर में Ecosprin 75 [fact_3], और नाश्ते से पहले Pan 40 [fact_4] दी गई है।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "Telma 40 1 tab OD morning"},
                    {"fact_id": "fact_2", "claim": "Rosuvas 10 1 tab HS night"},
                    {"fact_id": "fact_3", "claim": "Ecosprin 75 1 tab OD after lunch"},
                    {"fact_id": "fact_4", "claim": "Pan 40 1 tab OD before breakfast"}
                ]
            }
        },

        # 5. Fortis Hospital - Diabetes & GERD
        {
            "doc_id": "FORTIS_RX_005",
            "provider_name": "Fortis Memorial Research Institute, Gurugram",
            "document_type": "Prescription",
            "document_date": "2026-03-10",
            "patient_info": {"name": "Kavita R. Nair", "age": 45, "gender": "F", "mock_abha_id": "91-9920-3344-5566 (MOCK)"},
            "raw_text": (
                "FORTIS HEALTHCARE - ENDOCRINOLOGY CLINIC\n"
                "Date: 10-03-2026 | Patient: Kavita R. Nair (45/F)\n"
                "1. Tab Glycomet-GP 1 (Metformin 500mg + Glimepiride 1mg) - 1 tab BD before meals\n"
                "2. Tab Januvia 100 (Sitagliptin 100mg) - 1 tab OD with lunch\n"
                "3. Cap Pan-D (Pantoprazole 40mg + Domperidone 30mg) - 1 cap OD before breakfast\n"
                "4. Sachet Calcirol (Cholecalciferol 60000 IU) - 1 sachet weekly with warm milk\n"
            ),
            "gold_standard": {
                "document_date": "2026-03-10",
                "organ_system": "Endocrine & Gastrointestinal",
                "labs": [],
                "medications": [
                    {"brand_name": "Glycomet-GP 1", "generic_name": "Metformin + Glimepiride", "strength": "500mg/1mg", "frequency": "1 tab BD", "food_relation": "before meals"},
                    {"brand_name": "Januvia 100", "generic_name": "Sitagliptin", "strength": "100mg", "frequency": "1 tab OD", "food_relation": "with lunch"},
                    {"brand_name": "Pan-D", "generic_name": "Pantoprazole + Domperidone", "strength": "40mg/30mg", "frequency": "1 cap OD", "food_relation": "before breakfast"},
                    {"brand_name": "Calcirol", "generic_name": "Cholecalciferol", "strength": "60000 IU", "frequency": "1 sachet weekly", "food_relation": "with warm milk"}
                ],
                "diagnoses": ["Type 2 Diabetes Mellitus", "Acid Peptic Disease"]
            },
            "grounded_summary": {
                "text_en": "Prescribed Glycomet-GP 1 twice daily before meals [fact_1], Januvia 100 with lunch [fact_2], Pan-D before breakfast [fact_3], and Calcirol weekly [fact_4].",
                "text_te": "భోజనానికి ముందు Glycomet-GP 1 [fact_1], లంచ్‌తో Januvia 100 [fact_2], అల్పాహారానికి ముందు Pan-D [fact_3], వారానికి ఒకసారి Calcirol [fact_4].",
                "text_hi": "भोजन से पहले Glycomet-GP 1 [fact_1], दोपहर में Januvia 100 [fact_2], नाश्ते से पहले Pan-D [fact_3], और साप्ताहिक Calcirol [fact_4] निर्धारित है।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "Glycomet-GP 1 1 tab BD before meals"},
                    {"fact_id": "fact_2", "claim": "Januvia 100 1 tab OD with lunch"},
                    {"fact_id": "fact_3", "claim": "Pan-D 1 cap OD before breakfast"},
                    {"fact_id": "fact_4", "claim": "Calcirol 60000 IU 1 sachet weekly"}
                ]
            }
        },

        # 6. SRL Diagnostics - Nephrology
        {
            "doc_id": "SRL_NEPHRO_006",
            "provider_name": "SRL Diagnostics, Bengaluru",
            "document_type": "Diagnostic Report",
            "document_date": "2026-02-28",
            "patient_info": {"name": "Manish G. Patel", "age": 56, "gender": "M", "mock_abha_id": "91-7711-2299-4400 (MOCK)"},
            "raw_text": (
                "SRL LIMITED - RENAL EVALUATION\n"
                "Patient: Manish G. Patel | 56/M | Date: 28/02/2026\n"
                "Urine Microalbumin (Spot)         48.5        mg/L        < 20.0\n"
                "Urine Creatinine (Spot)           110         mg/dL       40 - 278\n"
                "Albumin to Creatinine Ratio (UACR)44.1        mg/g        < 30.0\n"
                "Serum Creatinine                  1.18        mg/dL       0.70 - 1.30\n"
                "Estimated GFR (CKD-EPI)           73          mL/min/1.73m2 >= 90\n"
                "Serum Potassium                   4.6         mEq/L       3.5 - 5.1\n"
                "Serum Sodium                      139         mEq/L       136 - 145\n"
            ),
            "gold_standard": {
                "document_date": "2026-02-28",
                "organ_system": "Nephrology",
                "labs": [
                    {"test_name": "Urine Microalbumin", "value": 48.5, "unit": "mg/L", "reference_range": "< 20.0", "flag": "ELEVATED", "loinc_code": "14957-5"},
                    {"test_name": "Urine Creatinine", "value": 110, "unit": "mg/dL", "reference_range": "40 - 278", "flag": "NORMAL", "loinc_code": "2161-8"},
                    {"test_name": "Urine Albumin Creatinine Ratio (UACR)", "value": 44.1, "unit": "mg/g", "reference_range": "< 30.0", "flag": "ELEVATED", "loinc_code": "9318-7"},
                    {"test_name": "Serum Creatinine", "value": 1.18, "unit": "mg/dL", "reference_range": "0.70 - 1.30", "flag": "NORMAL", "loinc_code": "2160-0"},
                    {"test_name": "Estimated GFR", "value": 73, "unit": "mL/min/1.73m2", "reference_range": ">= 90", "flag": "LOW", "loinc_code": "33914-3"},
                    {"test_name": "Serum Potassium", "value": 4.6, "unit": "mEq/L", "reference_range": "3.5 - 5.1", "flag": "NORMAL", "loinc_code": "2823-3"},
                    {"test_name": "Serum Sodium", "value": 139, "unit": "mEq/L", "reference_range": "136 - 145", "flag": "NORMAL", "loinc_code": "2951-2"}
                ],
                "medications": [],
                "diagnoses": ["Microalbuminuria", "Mildly Decreased eGFR"]
            },
            "grounded_summary": {
                "text_en": "Urine microalbumin is 48.5 mg/L [fact_1] with UACR of 44.1 mg/g [fact_2]. Creatinine is 1.18 mg/dL [fact_3], eGFR is 73 mL/min/1.73m2 [fact_4], potassium is 4.6 mEq/L [fact_5], and sodium is 139 mEq/L [fact_6].",
                "text_te": "యూరిన్ మైక్రోఅల్బుమిన్ 48.5 mg/L [fact_1], UACR 44.1 mg/g [fact_2]. క్రియాటినిన్ 1.18 mg/dL [fact_3], eGFR 73 mL/min/1.73m2 [fact_4], పొటాషియం 4.6 mEq/L [fact_5], సోడియం 139 mEq/L [fact_6].",
                "text_hi": "मूत्र माइक्रोएल्ब्यूमिन 48.5 mg/L [fact_1] और UACR 44.1 mg/g [fact_2] है। क्रिएटिनिन 1.18 mg/dL [fact_3], eGFR 73 mL/min/1.73m2 [fact_4], पोटेशियम 4.6 mEq/L [fact_5], सोडियम 139 mEq/L [fact_6] है।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "Urine Microalbumin 48.5 mg/L"},
                    {"fact_id": "fact_2", "claim": "Urine Albumin Creatinine Ratio 44.1 mg/g"},
                    {"fact_id": "fact_3", "claim": "Serum Creatinine 1.18 mg/dL"},
                    {"fact_id": "fact_4", "claim": "Estimated GFR 73 mL/min/1.73m2"},
                    {"fact_id": "fact_5", "claim": "Serum Potassium 4.6 mEq/L"},
                    {"fact_id": "fact_6", "claim": "Serum Sodium 139 mEq/L"}
                ]
            }
        },

        # 7. Vijaya Diagnostic - Vitamins & Iron
        {
            "doc_id": "VIJAYA_VIT_007",
            "provider_name": "Vijaya Diagnostic Centre, Hyderabad",
            "document_type": "Diagnostic Report",
            "document_date": "2026-03-05",
            "patient_info": {"name": "Pooja Reddy", "age": 29, "gender": "F", "mock_abha_id": "91-1234-5678-9012 (MOCK)"},
            "raw_text": (
                "VIJAYA DIAGNOSTIC - VITAMIN & ANEMIA PANEL\n"
                "Patient: Pooja Reddy | 29 Y / F | Date: 05/03/2026\n"
                "Vitamin B12                       142         pg/mL       211 - 911\n"
                "25-Hydroxy Vitamin D              14.2        ng/mL       30.0 - 100.0\n"
                "Serum Ferritin                    9.4         ng/mL       13.0 - 150.0\n"
                "Serum Iron                        42          mcg/dL      60 - 170\n"
                "TIBC                              410         mcg/dL      250 - 400\n"
                "Hemoglobin                        11.1        g/dL        12.0 - 15.0\n"
            ),
            "gold_standard": {
                "document_date": "2026-03-05",
                "organ_system": "Nutritional & Hematology",
                "labs": [
                    {"test_name": "Vitamin B12", "value": 142, "unit": "pg/mL", "reference_range": "211 - 911", "flag": "LOW", "loinc_code": "2132-9"},
                    {"test_name": "25-Hydroxy Vitamin D", "value": 14.2, "unit": "ng/mL", "reference_range": "30.0 - 100.0", "flag": "LOW", "loinc_code": "62292-8"},
                    {"test_name": "Serum Ferritin", "value": 9.4, "unit": "ng/mL", "reference_range": "13.0 - 150.0", "flag": "LOW", "loinc_code": "2276-4"},
                    {"test_name": "Serum Iron", "value": 42, "unit": "mcg/dL", "reference_range": "60 - 170", "flag": "LOW", "loinc_code": "2498-4"},
                    {"test_name": "TIBC", "value": 410, "unit": "mcg/dL", "reference_range": "250 - 400", "flag": "ELEVATED", "loinc_code": "2500-7"},
                    {"test_name": "Hemoglobin", "value": 11.1, "unit": "g/dL", "reference_range": "12.0 - 15.0", "flag": "LOW", "loinc_code": "718-7"}
                ],
                "medications": [],
                "diagnoses": ["Vitamin B12 Deficiency", "Vitamin D Deficiency", "Iron Deficiency"]
            },
            "grounded_summary": {
                "text_en": "Vitamin B12 is 142 pg/mL [fact_1] and Vitamin D is 14.2 ng/mL [fact_2]. Ferritin is 9.4 ng/mL [fact_3], serum iron is 42 mcg/dL [fact_4], TIBC is 410 mcg/dL [fact_5], and hemoglobin is 11.1 g/dL [fact_6].",
                "text_te": "విటమిన్ B12 142 pg/mL [fact_1], విటమిన్ D 14.2 ng/mL [fact_2]. ఫెర్రిటిన్ 9.4 ng/mL [fact_3], ఐరన్ 42 mcg/dL [fact_4], TIBC 410 mcg/dL [fact_5], హిమోగ్లోబిన్ 11.1 g/dL [fact_6].",
                "text_hi": "विटामिन B12 142 pg/mL [fact_1] और विटामिन D 14.2 ng/mL [fact_2] है। फेरिटिन 9.4 ng/mL [fact_3], आयरन 42 mcg/dL [fact_4], TIBC 410 mcg/dL [fact_5], हीमोग्लोबिन 11.1 g/dL [fact_6] है।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "Vitamin B12 142 pg/mL"},
                    {"fact_id": "fact_2", "claim": "25-Hydroxy Vitamin D 14.2 ng/mL"},
                    {"fact_id": "fact_3", "claim": "Serum Ferritin 9.4 ng/mL"},
                    {"fact_id": "fact_4", "claim": "Serum Iron 42 mcg/dL"},
                    {"fact_id": "fact_5", "claim": "TIBC 410 mcg/dL"},
                    {"fact_id": "fact_6", "claim": "Hemoglobin 11.1 g/dL"}
                ]
            }
        },

        # 8. Medall Healthcare - Dengue & Infection
        {
            "doc_id": "MEDALL_INF_008",
            "provider_name": "Medall Healthcare, Chennai",
            "document_type": "Diagnostic Report",
            "document_date": "2026-03-01",
            "patient_info": {"name": "Karthik Sundaram", "age": 31, "gender": "M", "mock_abha_id": "91-6677-8899-0011 (MOCK)"},
            "raw_text": (
                "MEDALL HEALTHCARE - FEVER PANEL\n"
                "Patient: Karthik Sundaram | 31/M | Date: 01-03-2026\n"
                "Dengue NS1 Antigen (ELISA)        POSITIVE    -           Negative\n"
                "Platelet Count                    88000       /cumm       150000 - 450000\n"
                "Total Leucocyte Count (WBC)       3400        /cumm       4000 - 11000\n"
                "Hematocrit (PCV)                  44.5        %           40.0 - 50.0\n"
            ),
            "gold_standard": {
                "document_date": "2026-03-01",
                "organ_system": "Immune & Hematology",
                "labs": [
                    {"test_name": "Dengue NS1 Antigen", "value": "POSITIVE", "unit": "", "reference_range": "Negative", "flag": "ELEVATED", "loinc_code": "51590-8"},
                    {"test_name": "Platelet Count", "value": 88000, "unit": "/cumm", "reference_range": "150000 - 450000", "flag": "CRITICAL_LOW", "loinc_code": "777-3"},
                    {"test_name": "Total Leucocyte Count", "value": 3400, "unit": "/cumm", "reference_range": "4000 - 11000", "flag": "LOW", "loinc_code": "6690-2"},
                    {"test_name": "Hematocrit", "value": 44.5, "unit": "%", "reference_range": "40.0 - 50.0", "flag": "NORMAL", "loinc_code": "20570-8"}
                ],
                "medications": [],
                "diagnoses": ["Acute Dengue Infection", "Thrombocytopenia"]
            },
            "grounded_summary": {
                "text_en": "Dengue NS1 is POSITIVE [fact_1]. Platelets are 88000 /cumm [fact_2], WBC is 3400 /cumm [fact_3], and hematocrit is 44.5% [fact_4].",
                "text_te": "డెంగ్యూ NS1 పాజిటివ్ [fact_1]. ప్లేట్‌లెట్స్ 88000 /cumm [fact_2], WBC 3400 /cumm [fact_3], హెమటోక్రిట్ 44.5% [fact_4].",
                "text_hi": "डेंगू NS1 पॉजिटिव [fact_1] है। प्लेटलेट 88000 /cumm [fact_2], WBC 3400 /cumm [fact_3], और हेमेटोक्रिट 44.5% [fact_4] है।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "Dengue NS1 Antigen POSITIVE"},
                    {"fact_id": "fact_2", "claim": "Platelet Count 88000 /cumm"},
                    {"fact_id": "fact_3", "claim": "Total Leucocyte Count 3400 /cumm"},
                    {"fact_id": "fact_4", "claim": "Hematocrit 44.5 %"}
                ]
            }
        },

        # 9. Narayana Health - Cardiac Biomarkers
        {
            "doc_id": "NARAYANA_CAR_009",
            "provider_name": "Narayana Institute of Cardiac Sciences, Bengaluru",
            "document_type": "Diagnostic Report",
            "document_date": "2026-03-08",
            "patient_info": {"name": "Subramanian Iyer", "age": 63, "gender": "M", "mock_abha_id": "91-2233-4455-6677 (MOCK)"},
            "raw_text": (
                "NARAYANA HEALTH - CARDIAC BIOMARKERS\n"
                "Patient: Subramanian Iyer | 63/M | Date: 08/03/2026\n"
                "High Sensitivity Troponin I (hsTnI)0.012      ng/mL       < 0.040\n"
                "NT-proBNP                         185         pg/mL       < 125\n"
                "High Sensitivity CRP (hs-CRP)     3.8         mg/L        < 1.0\n"
                "Creatine Kinase-MB (CK-MB)        14.2        U/L         0.0 - 24.0\n"
                "Total Cholesterol                 188         mg/dL       125 - 200\n"
                "Serum Potassium                   4.2         mEq/L       3.5 - 5.1\n"
            ),
            "gold_standard": {
                "document_date": "2026-03-08",
                "organ_system": "Cardiovascular",
                "labs": [
                    {"test_name": "hs-Troponin I", "value": 0.012, "unit": "ng/mL", "reference_range": "< 0.040", "flag": "NORMAL", "loinc_code": "89579-7"},
                    {"test_name": "NT-proBNP", "value": 185, "unit": "pg/mL", "reference_range": "< 125", "flag": "ELEVATED", "loinc_code": "33762-6"},
                    {"test_name": "hs-CRP", "value": 3.8, "unit": "mg/L", "reference_range": "< 1.0", "flag": "ELEVATED", "loinc_code": "30522-7"},
                    {"test_name": "CK-MB", "value": 14.2, "unit": "U/L", "reference_range": "0.0 - 24.0", "flag": "NORMAL", "loinc_code": "13969-1"},
                    {"test_name": "Total Cholesterol", "value": 188, "unit": "mg/dL", "reference_range": "125 - 200", "flag": "NORMAL", "loinc_code": "2093-3"},
                    {"test_name": "Serum Potassium", "value": 4.2, "unit": "mEq/L", "reference_range": "3.5 - 5.1", "flag": "NORMAL", "loinc_code": "2823-3"}
                ],
                "medications": [],
                "diagnoses": ["Elevated hs-CRP", "Elevated NT-proBNP"]
            },
            "grounded_summary": {
                "text_en": "Troponin I is 0.012 ng/mL [fact_1] and CK-MB is 14.2 U/L [fact_2]. hs-CRP is 3.8 mg/L [fact_3], NT-proBNP is 185 pg/mL [fact_4], cholesterol is 188 mg/dL [fact_5], and potassium is 4.2 mEq/L [fact_6].",
                "text_te": "ట్రోపోనిన్ I 0.012 ng/mL [fact_1], CK-MB 14.2 U/L [fact_2]. hs-CRP 3.8 mg/L [fact_3], NT-proBNP 185 pg/mL [fact_4], కొలెస్ట్రాల్ 188 mg/dL [fact_5], పొటాషియం 4.2 mEq/L [fact_6].",
                "text_hi": "ट्रोपोनिन I 0.012 ng/mL [fact_1] और CK-MB 14.2 U/L [fact_2] है। hs-CRP 3.8 mg/L [fact_3], NT-proBNP 185 pg/mL [fact_4], कोलेस्ट्रॉल 188 mg/dL [fact_5], पोटेशियम 4.2 mEq/L [fact_6] है।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "hs-Troponin I 0.012 ng/mL"},
                    {"fact_id": "fact_2", "claim": "CK-MB 14.2 U/L"},
                    {"fact_id": "fact_3", "claim": "hs-CRP 3.8 mg/L"},
                    {"fact_id": "fact_4", "claim": "NT-proBNP 185 pg/mL"},
                    {"fact_id": "fact_5", "claim": "Total Cholesterol 188 mg/dL"},
                    {"fact_id": "fact_6", "claim": "Serum Potassium 4.2 mEq/L"}
                ]
            }
        },

        # 10. Aster DM Healthcare - Pulmonology
        {
            "doc_id": "ASTER_RESP_010",
            "provider_name": "Aster CMI Hospital, Bengaluru",
            "document_type": "Pulmonology Assessment",
            "document_date": "2026-02-14",
            "patient_info": {"name": "Deepak Nambiar", "age": 35, "gender": "M", "mock_abha_id": "91-8899-0011-2233 (MOCK)"},
            "raw_text": (
                "ASTER DM HEALTHCARE - PULMONOLOGY\n"
                "Patient: Deepak Nambiar | Age: 35 M | Date: 14/02/2026\n"
                "Serum Total IgE                  480         IU/mL       < 100\n"
                "Absolute Eosinophil Count (AEC)   650         /cumm       40 - 450\n"
                "FEV1 / FVC Ratio                  68          %           > 75\n"
                "1. Inhaler Foracort 200 (Budesonide 200mcg + Formoterol 6mcg) - 2 puffs BD\n"
                "2. Tab Montair-LC (Montelukast 10mg + Levocetirizine 5mg) - 1 tab HS night\n"
            ),
            "gold_standard": {
                "document_date": "2026-02-14",
                "organ_system": "Respiratory",
                "labs": [
                    {"test_name": "Total IgE", "value": 480, "unit": "IU/mL", "reference_range": "< 100", "flag": "ELEVATED", "loinc_code": "19113-0"},
                    {"test_name": "Absolute Eosinophil Count", "value": 650, "unit": "/cumm", "reference_range": "40 - 450", "flag": "ELEVATED", "loinc_code": "706-2"},
                    {"test_name": "FEV1 / FVC Ratio", "value": 68, "unit": "%", "reference_range": "> 75", "flag": "LOW", "loinc_code": "19926-5"}
                ],
                "medications": [
                    {"brand_name": "Foracort 200", "generic_name": "Budesonide + Formoterol", "strength": "200mcg/6mcg", "frequency": "2 puffs BD", "food_relation": ""},
                    {"brand_name": "Montair-LC", "generic_name": "Montelukast + Levocetirizine", "strength": "10mg/5mg", "frequency": "1 tab HS night", "food_relation": ""}
                ],
                "diagnoses": ["Bronchial Asthma", "Allergic Rhinitis"]
            },
            "grounded_summary": {
                "text_en": "Total IgE is 480 IU/mL [fact_1] and AEC is 650 /cumm [fact_2], with FEV1/FVC at 68% [fact_3]. Prescribed Foracort 200 twice daily [fact_4] and Montair-LC at night [fact_5].",
                "text_te": "మొత్తం IgE 480 IU/mL [fact_1], AEC 650 /cumm [fact_2], FEV1/FVC 68% [fact_3]. Foracort 200 [fact_4], Montair-LC [fact_5] సూచించబడ్డాయి.",
                "text_hi": "कुल IgE 480 IU/mL [fact_1] और AEC 650 /cumm [fact_2] है, FEV1/FVC 68% [fact_3] है। Foracort 200 [fact_4] और Montair-LC [fact_5] दिया गया है।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "Total IgE 480 IU/mL"},
                    {"fact_id": "fact_2", "claim": "Absolute Eosinophil Count 650 /cumm"},
                    {"fact_id": "fact_3", "claim": "FEV1 / FVC Ratio 68 %"},
                    {"fact_id": "fact_4", "claim": "Foracort 200 2 puffs BD"},
                    {"fact_id": "fact_5", "claim": "Montair-LC 1 tab HS night"}
                ]
            }
        },

        # 11. KIMS Hospitals - Endocrine & PCOS
        {
            "doc_id": "KIMS_ENDO_011",
            "provider_name": "KIMS Hospitals, Secunderabad",
            "document_type": "Diagnostic Report",
            "document_date": "2026-02-22",
            "patient_info": {"name": "Ananya Singhania", "age": 26, "gender": "F", "mock_abha_id": "91-7788-9900-1122 (MOCK)"},
            "raw_text": (
                "KIMS HOSPITALS - ENDOCRINE INVESTIGATIONS\n"
                "Patient: Ananya Singhania | 26/F | Date: 22/02/2026\n"
                "Serum LH                          14.8        mIU/mL      2.4 - 12.6\n"
                "Serum FSH                         4.9         mIU/mL      3.5 - 12.5\n"
                "Fasting Insulin                   18.4        uIU/mL      2.6 - 24.9\n"
                "Serum Prolactin                   16.2        ng/mL       4.8 - 23.3\n"
            ),
            "gold_standard": {
                "document_date": "2026-02-22",
                "organ_system": "Endocrine",
                "labs": [
                    {"test_name": "Serum LH", "value": 14.8, "unit": "mIU/mL", "reference_range": "2.4 - 12.6", "flag": "ELEVATED", "loinc_code": "10501-5"},
                    {"test_name": "Serum FSH", "value": 4.9, "unit": "mIU/mL", "reference_range": "3.5 - 12.5", "flag": "NORMAL", "loinc_code": "15067-2"},
                    {"test_name": "Fasting Insulin", "value": 18.4, "unit": "uIU/mL", "reference_range": "2.6 - 24.9", "flag": "NORMAL", "loinc_code": "20448-7"},
                    {"test_name": "Serum Prolactin", "value": 16.2, "unit": "ng/mL", "reference_range": "4.8 - 23.3", "flag": "NORMAL", "loinc_code": "2842-3"}
                ],
                "medications": [],
                "diagnoses": ["Polycystic Ovarian Syndrome (PCOS)"]
            },
            "grounded_summary": {
                "text_en": "LH is 14.8 mIU/mL [fact_1] and FSH is 4.9 mIU/mL [fact_2]. Fasting insulin is 18.4 uIU/mL [fact_3] and prolactin is 16.2 ng/mL [fact_4].",
                "text_te": "LH 14.8 mIU/mL [fact_1], FSH 4.9 mIU/mL [fact_2]. ఇన్సులిన్ 18.4 uIU/mL [fact_3], ప్రోలాక్టిన్ 16.2 ng/mL [fact_4].",
                "text_hi": "LH 14.8 mIU/mL [fact_1] और FSH 4.9 mIU/mL [fact_2] है। इंसुलिन 18.4 uIU/mL [fact_3] और प्रोलैक्टिन 16.2 ng/mL [fact_4] है।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "Serum LH 14.8 mIU/mL"},
                    {"fact_id": "fact_2", "claim": "Serum FSH 4.9 mIU/mL"},
                    {"fact_id": "fact_3", "claim": "Fasting Insulin 18.4 uIU/mL"},
                    {"fact_id": "fact_4", "claim": "Serum Prolactin 16.2 ng/mL"}
                ]
            }
        },

        # 12. Yashoda Hospitals - Rheumatology
        {
            "doc_id": "YASHODA_RHEUM_012",
            "provider_name": "Yashoda Hospitals, Hyderabad",
            "document_type": "Diagnostic Report",
            "document_date": "2026-03-12",
            "patient_info": {"name": "Meenakshi Sundaram", "age": 49, "gender": "F", "mock_abha_id": "91-4455-6677-8899 (MOCK)"},
            "raw_text": (
                "YASHODA HOSPITALS - RHEUMATOLOGY\n"
                "Patient: Meenakshi Sundaram | 49/F | Date: 12/03/2026\n"
                "Rheumatoid Factor (RA Factor)     64.2        IU/mL       < 14.0\n"
                "Anti-CCP Antibodies (ACPA)        78.5        U/mL        < 20.0\n"
                "C-Reactive Protein (CRP)          18.6        mg/L        < 5.0\n"
                "ESR                               48          mm/1st hr   0 - 20\n"
                "Serum Uric Acid                   4.8         mg/dL       2.4 - 5.7\n"
            ),
            "gold_standard": {
                "document_date": "2026-03-12",
                "organ_system": "Musculoskeletal",
                "labs": [
                    {"test_name": "Rheumatoid Factor", "value": 64.2, "unit": "IU/mL", "reference_range": "< 14.0", "flag": "ELEVATED", "loinc_code": "11572-5"},
                    {"test_name": "Anti-CCP Antibodies", "value": 78.5, "unit": "U/mL", "reference_range": "< 20.0", "flag": "ELEVATED", "loinc_code": "33935-8"},
                    {"test_name": "C-Reactive Protein", "value": 18.6, "unit": "mg/L", "reference_range": "< 5.0", "flag": "ELEVATED", "loinc_code": "1988-5"},
                    {"test_name": "ESR", "value": 48, "unit": "mm/1st hr", "reference_range": "0 - 20", "flag": "ELEVATED", "loinc_code": "4537-7"},
                    {"test_name": "Serum Uric Acid", "value": 4.8, "unit": "mg/dL", "reference_range": "2.4 - 5.7", "flag": "NORMAL", "loinc_code": "3084-1"}
                ],
                "medications": [],
                "diagnoses": ["Seropositive Rheumatoid Arthritis"]
            },
            "grounded_summary": {
                "text_en": "Rheumatoid Factor is 64.2 IU/mL [fact_1] and Anti-CCP is 78.5 U/mL [fact_2]. CRP is 18.6 mg/L [fact_3], ESR is 48 mm/1st hr [fact_4], and uric acid is 4.8 mg/dL [fact_5].",
                "text_te": "RA ఫ్యాక్టర్ 64.2 IU/mL [fact_1], యాంటీ-CCP 78.5 U/mL [fact_2]. CRP 18.6 mg/L [fact_3], ESR 48 mm/1st hr [fact_4], యూరిక్ యాసిడ్ 4.8 mg/dL [fact_5].",
                "text_hi": "रुमेटीइड फैक्टर 64.2 IU/mL [fact_1] और एंटी-CCP 78.5 U/mL [fact_2] है। CRP 18.6 mg/L [fact_3], ESR 48 mm/1st hr [fact_4], यूरिक एसिड 4.8 mg/dL [fact_5] है।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "Rheumatoid Factor 64.2 IU/mL"},
                    {"fact_id": "fact_2", "claim": "Anti-CCP Antibodies 78.5 U/mL"},
                    {"fact_id": "fact_3", "claim": "C-Reactive Protein 18.6 mg/L"},
                    {"fact_id": "fact_4", "claim": "ESR 48 mm/1st hr"},
                    {"fact_id": "fact_5", "claim": "Serum Uric Acid 4.8 mg/dL"}
                ]
            }
        },

        # 13. Apollo Teleconsultation - URTI
        {
            "doc_id": "APOLLO_TELE_013",
            "provider_name": "Apollo 24|7 Virtual Care Clinic",
            "document_type": "Digital Prescription",
            "document_date": "2026-03-14",
            "patient_info": {"name": "Naveen Reddy", "age": 28, "gender": "M", "mock_abha_id": "91-1199-2288-3377 (MOCK)"},
            "raw_text": (
                "APOLLO 247 - DIGITAL E-PRESCRIPTION\n"
                "Patient: Naveen Reddy | Age: 28/M | Date: 14-03-2026\n"
                "1. Tab Augmentin 625 (Amoxicillin 500mg + Clavulanic Acid 125mg) - 1 tab BD after food x 5 days\n"
                "2. Tab Dolo 650 (Paracetamol 650mg) - 1 tab TDS SOS\n"
                "3. Tab Allegra 120 (Fexofenadine 120mg) - 1 tab OD at night\n"
            ),
            "gold_standard": {
                "document_date": "2026-03-14",
                "organ_system": "Respiratory",
                "labs": [],
                "medications": [
                    {"brand_name": "Augmentin 625", "generic_name": "Amoxicillin + Clavulanic Acid", "strength": "625mg", "frequency": "1 tab BD", "food_relation": "after food"},
                    {"brand_name": "Dolo 650", "generic_name": "Paracetamol", "strength": "650mg", "frequency": "1 tab TDS SOS", "food_relation": ""},
                    {"brand_name": "Allegra 120", "generic_name": "Fexofenadine", "strength": "120mg", "frequency": "1 tab OD", "food_relation": "at night"}
                ],
                "diagnoses": ["Acute URTI"]
            },
            "grounded_summary": {
                "text_en": "Prescribed Augmentin 625 twice daily after food [fact_1], Dolo 650 as needed [fact_2], and Allegra 120 at night [fact_3].",
                "text_te": "ఆహారం తర్వాత Augmentin 625 [fact_1], అవసరమైనప్పుడు Dolo 650 [fact_2], రాత్రి Allegra 120 [fact_3] సూచించబడ్డాయి.",
                "text_hi": "भोजन बाद Augmentin 625 [fact_1], जरूरत पर Dolo 650 [fact_2], और रात में Allegra 120 [fact_3] दी गई है।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "Augmentin 625 1 tab BD after food"},
                    {"fact_id": "fact_2", "claim": "Dolo 650 1 tab TDS SOS"},
                    {"fact_id": "fact_3", "claim": "Allegra 120 1 tab OD at night"}
                ]
            }
        },

        # 14. Suburban Diagnostics - Coagulation
        {
            "doc_id": "SUBURBAN_COAG_014",
            "provider_name": "Suburban Diagnostics, Mumbai",
            "document_type": "Diagnostic Report",
            "document_date": "2026-02-10",
            "patient_info": {"name": "Arun K. Sen", "age": 67, "gender": "M", "mock_abha_id": "91-3344-5566-7788 (MOCK)"},
            "raw_text": (
                "SUBURBAN DIAGNOSTICS - COAGULATION\n"
                "Patient: Arun K. Sen | Age: 67 / M | Date: 10/02/2026\n"
                "Prothrombin Time (PT)             14.8        seconds     11.0 - 13.5\n"
                "INR                               1.24        -           0.8 - 1.2\n"
                "APTT                              32.4        seconds     26.0 - 38.0\n"
                "D-Dimer                           320         ng/mL FEU   < 500\n"
                "Fibrinogen                        310         mg/dL       200 - 400\n"
            ),
            "gold_standard": {
                "document_date": "2026-02-10",
                "organ_system": "Cardiovascular & Hematology",
                "labs": [
                    {"test_name": "Prothrombin Time", "value": 14.8, "unit": "seconds", "reference_range": "11.0 - 13.5", "flag": "ELEVATED", "loinc_code": "5902-2"},
                    {"test_name": "INR", "value": 1.24, "unit": "", "reference_range": "0.8 - 1.2", "flag": "ELEVATED", "loinc_code": "6301-6"},
                    {"test_name": "APTT", "value": 32.4, "unit": "seconds", "reference_range": "26.0 - 38.0", "flag": "NORMAL", "loinc_code": "3173-2"},
                    {"test_name": "D-Dimer", "value": 320, "unit": "ng/mL FEU", "reference_range": "< 500", "flag": "NORMAL", "loinc_code": "48065-7"},
                    {"test_name": "Fibrinogen", "value": 310, "unit": "mg/dL", "reference_range": "200 - 400", "flag": "NORMAL", "loinc_code": "3255-7"}
                ],
                "medications": [],
                "diagnoses": ["Mildly Elevated INR"]
            },
            "grounded_summary": {
                "text_en": "PT is 14.8 seconds [fact_1] and INR is 1.24 [fact_2]. APTT is 32.4 seconds [fact_3], D-Dimer is 320 ng/mL FEU [fact_4], and fibrinogen is 310 mg/dL [fact_5].",
                "text_te": "PT 14.8 సెకన్లు [fact_1], INR 1.24 [fact_2]. APTT 32.4 సెకన్లు [fact_3], D-Dimer 320 ng/mL [fact_4], ఫైబ్రినోజెన్ 310 mg/dL [fact_5].",
                "text_hi": "PT 14.8 सेकंड [fact_1] और INR 1.24 [fact_2] है। APTT 32.4 सेकंड [fact_3], डी-डिमर 320 ng/mL [fact_4], फाइब्रिनोजेन 310 mg/dL [fact_5] है।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "Prothrombin Time 14.8 seconds"},
                    {"fact_id": "fact_2", "claim": "INR 1.24"},
                    {"fact_id": "fact_3", "claim": "APTT 32.4 seconds"},
                    {"fact_id": "fact_4", "claim": "D-Dimer 320 ng/mL FEU"},
                    {"fact_id": "fact_5", "claim": "Fibrinogen 310 mg/dL"}
                ]
            }
        },

        # 15. AIG Hospitals - Gastroenterology
        {
            "doc_id": "AIG_GASTRO_015",
            "provider_name": "Asian Institute of Gastroenterology, Hyderabad",
            "document_type": "Diagnostic & Endoscopy Summary",
            "document_date": "2026-03-04",
            "patient_info": {"name": "Venkatesh Murthy", "age": 42, "gender": "M", "mock_abha_id": "91-9988-7766-5544 (MOCK)"},
            "raw_text": (
                "AIG HOSPITALS - GASTROENTEROLOGY\n"
                "Patient: Venkatesh Murthy | 42/M | Date: 04/03/2026\n"
                "Rapid Urease Test (RUT): POSITIVE (Helicobacter pylori)\n"
                "Serum Lipase: 36 U/L (Reference: 13 - 60)\n"
                "Serum Amylase: 54 U/L (Reference: 28 - 100)\n"
                "1. Tab Sompraz 40 (Esomeprazole 40mg) - 1 tab BD before meals\n"
                "2. Tab Clavam 625 (Amoxicillin + Clavulanate) - 1 tab BD after food\n"
                "3. Tab Claribid 500 (Clarithromycin 500mg) - 1 tab BD after food\n"
            ),
            "gold_standard": {
                "document_date": "2026-03-04",
                "organ_system": "Gastrointestinal",
                "labs": [
                    {"test_name": "Rapid Urease Test (RUT)", "value": "POSITIVE", "unit": "", "reference_range": "Negative", "flag": "ELEVATED", "loinc_code": "29893-5"},
                    {"test_name": "Serum Lipase", "value": 36, "unit": "U/L", "reference_range": "13 - 60", "flag": "NORMAL", "loinc_code": "3040-3"},
                    {"test_name": "Serum Amylase", "value": 54, "unit": "U/L", "reference_range": "28 - 100", "flag": "NORMAL", "loinc_code": "1798-8"}
                ],
                "medications": [
                    {"brand_name": "Sompraz 40", "generic_name": "Esomeprazole", "strength": "40mg", "frequency": "1 tab BD", "food_relation": "before meals"},
                    {"brand_name": "Clavam 625", "generic_name": "Amoxicillin + Clavulanic Acid", "strength": "625mg", "frequency": "1 tab BD", "food_relation": "after food"},
                    {"brand_name": "Claribid 500", "generic_name": "Clarithromycin", "strength": "500mg", "frequency": "1 tab BD", "food_relation": "after food"}
                ],
                "diagnoses": ["H. pylori Gastritis"]
            },
            "grounded_summary": {
                "text_en": "Rapid Urease Test is POSITIVE [fact_1]. Lipase (36 U/L) [fact_2] and Amylase (54 U/L) [fact_3] are normal. Prescribed Sompraz 40 [fact_4], Clavam 625 [fact_5], and Claribid 500 [fact_6].",
                "text_te": "రాపిడ్ యూరియేస్ పరీక్ష పాజిటివ్ [fact_1]. లైపేస్ (36 U/L) [fact_2], అమైలేస్ (54 U/L) [fact_3]. Sompraz 40 [fact_4], Clavam 625 [fact_5], Claribid 500 [fact_6] సూచించబడ్డాయి.",
                "text_hi": "रैपिड यूरिएज टेस्ट पॉजिटिव [fact_1] है। लाइपेज (36 U/L) [fact_2] और एमाइलेज (54 U/L) [fact_3] सामान्य हैं। Sompraz 40 [fact_4], Clavam 625 [fact_5], और Claribid 500 [fact_6] दिए गए हैं।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "Rapid Urease Test POSITIVE"},
                    {"fact_id": "fact_2", "claim": "Serum Lipase 36 U/L"},
                    {"fact_id": "fact_3", "claim": "Serum Amylase 54 U/L"},
                    {"fact_id": "fact_4", "claim": "Sompraz 40 1 tab BD"},
                    {"fact_id": "fact_5", "claim": "Clavam 625 1 tab BD"},
                    {"fact_id": "fact_6", "claim": "Claribid 500 1 tab BD"}
                ]
            }
        },

        # 16. CARE Hospitals - Executive Health
        {
            "doc_id": "CARE_MHC_016",
            "provider_name": "CARE Hospitals, Hyderabad",
            "document_type": "Executive Health Package",
            "document_date": "2026-02-05",
            "patient_info": {"name": "Rajeshwari Rao", "age": 50, "gender": "F", "mock_abha_id": "91-5566-7788-9900 (MOCK)"},
            "raw_text": (
                "CARE HOSPITALS - HEALTH SUMMARY\n"
                "Patient: Rajeshwari Rao | 50/F | Date: 05/02/2026\n"
                "Fasting Blood Sugar: 94 mg/dL (70 - 100)\n"
                "HbA1c: 5.4 % (4.0 - 5.6)\n"
                "Serum Creatinine: 0.81 mg/dL (0.6 - 1.1)\n"
                "Total Bilirubin: 0.7 mg/dL (0.2 - 1.2)\n"
                "Serum Uric Acid: 4.1 mg/dL (2.4 - 5.7)\n"
            ),
            "gold_standard": {
                "document_date": "2026-02-05",
                "organ_system": "General Metabolic",
                "labs": [
                    {"test_name": "Fasting Blood Sugar", "value": 94, "unit": "mg/dL", "reference_range": "70 - 100", "flag": "NORMAL", "loinc_code": "1558-6"},
                    {"test_name": "HbA1c", "value": 5.4, "unit": "%", "reference_range": "4.0 - 5.6", "flag": "NORMAL", "loinc_code": "4548-4"},
                    {"test_name": "Serum Creatinine", "value": 0.81, "unit": "mg/dL", "reference_range": "0.6 - 1.1", "flag": "NORMAL", "loinc_code": "2160-0"},
                    {"test_name": "Total Bilirubin", "value": 0.7, "unit": "mg/dL", "reference_range": "0.2 - 1.2", "flag": "NORMAL", "loinc_code": "1975-2"},
                    {"test_name": "Serum Uric Acid", "value": 4.1, "unit": "mg/dL", "reference_range": "2.4 - 5.7", "flag": "NORMAL", "loinc_code": "3084-1"}
                ],
                "medications": [],
                "diagnoses": ["Healthy Metabolic Status"]
            },
            "grounded_summary": {
                "text_en": "Fasting blood sugar is 94 mg/dL [fact_1] and HbA1c is 5.4% [fact_2]. Creatinine is 0.81 mg/dL [fact_3], bilirubin is 0.7 mg/dL [fact_4], and uric acid is 4.1 mg/dL [fact_5].",
                "text_te": "పరగడుపున గ్లూకోజ్ 94 mg/dL [fact_1], HbA1c 5.4% [fact_2]. క్రియాటినిన్ 0.81 mg/dL [fact_3], బిలిరుబిన్ 0.7 mg/dL [fact_4], యూరిక్ యాసిడ్ 4.1 mg/dL [fact_5].",
                "text_hi": "फास्टिंग शुगर 94 mg/dL [fact_1] और HbA1c 5.4% [fact_2] है। क्रिएटिनिन 0.81 mg/dL [fact_3], बिलीरुबिन 0.7 mg/dL [fact_4], यूरिक एसिड 4.1 mg/dL [fact_5] है।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "Fasting Blood Sugar 94 mg/dL"},
                    {"fact_id": "fact_2", "claim": "HbA1c 5.4 %"},
                    {"fact_id": "fact_3", "claim": "Serum Creatinine 0.81 mg/dL"},
                    {"fact_id": "fact_4", "claim": "Total Bilirubin 0.7 mg/dL"},
                    {"fact_id": "fact_5", "claim": "Serum Uric Acid 4.1 mg/dL"}
                ]
            }
        },

        # 17. Dr. Reddy's Clinic - Geriatric Review
        {
            "doc_id": "REDDY_GERI_017",
            "provider_name": "Dr. Reddy's Senior Clinic, Visakhapatnam",
            "document_type": "Clinical Review & Prescription",
            "document_date": "2026-03-07",
            "patient_info": {"name": "Krishnamurthy V.", "age": 74, "gender": "M", "mock_abha_id": "91-1122-3344-9988 (MOCK)"},
            "raw_text": (
                "DR. REDDY'S GERIATRIC CLINIC\n"
                "Patient: Krishnamurthy V. | Age: 74 M | Date: 07-03-2026\n"
                "1. Tab Cilacar 10 (Cilnidipine 10mg) - 1 tab OD morning after food\n"
                "2. Tab Urimax 0.4 (Tamsulosin 0.4mg) - 1 tab HS night after food\n"
                "3. Tab Shellcal 500 (Calcium + Vit D3) - 1 tab OD after lunch\n"
            ),
            "gold_standard": {
                "document_date": "2026-03-07",
                "organ_system": "Cardiovascular & Urology",
                "labs": [],
                "medications": [
                    {"brand_name": "Cilacar 10", "generic_name": "Cilnidipine", "strength": "10mg", "frequency": "1 tab OD", "food_relation": "after food"},
                    {"brand_name": "Urimax 0.4", "generic_name": "Tamsulosin", "strength": "0.4mg", "frequency": "1 tab HS", "food_relation": "after food"},
                    {"brand_name": "Shellcal 500", "generic_name": "Calcium Carbonate + Vitamin D3", "strength": "500mg", "frequency": "1 tab OD", "food_relation": "after lunch"}
                ],
                "diagnoses": ["Hypertension", "Benign Prostatic Hyperplasia"]
            },
            "grounded_summary": {
                "text_en": "Prescribed Cilacar 10 once daily in morning [fact_1], Urimax 0.4 at night [fact_2], and Shellcal 500 after lunch [fact_3].",
                "text_te": "ఉదయం Cilacar 10 [fact_1], రాత్రి Urimax 0.4 [fact_2], భోజనం తర్వాత Shellcal 500 [fact_3] సూచించబడ్డాయి.",
                "text_hi": "सुबह में Cilacar 10 [fact_1], रात में Urimax 0.4 [fact_2], और दोपहर में Shellcal 500 [fact_3] दिया गया है।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "Cilacar 10 1 tab OD morning"},
                    {"fact_id": "fact_2", "claim": "Urimax 0.4 1 tab HS night"},
                    {"fact_id": "fact_3", "claim": "Shellcal 500 1 tab OD after lunch"}
                ]
            }
        },

        # 18. Amrita Hospital - Pediatric Growth & CBC
        {
            "doc_id": "AMRITA_PED_018",
            "provider_name": "Amrita Institute of Medical Sciences, Kochi",
            "document_type": "Pediatric Report",
            "document_date": "2026-02-25",
            "patient_info": {"name": "Master Aarav Menon", "age": 7, "gender": "M", "mock_abha_id": "91-4433-2211-0099 (MOCK)"},
            "raw_text": (
                "AMRITA INSTITUTE - PEDIATRIC LAB\n"
                "Patient: Master Aarav Menon | Age: 7 Y / M | Date: 25/02/2026\n"
                "Hemoglobin                        11.8        g/dL        11.5 - 15.5\n"
                "Total WBC Count                   8100        /cumm       5000 - 13000\n"
                "Platelet Count                    310000      /cumm       150000 - 450000\n"
                "Serum Ferritin                    28          ng/mL       14 - 120\n"
            ),
            "gold_standard": {
                "document_date": "2026-02-25",
                "organ_system": "Pediatric Hematology",
                "labs": [
                    {"test_name": "Hemoglobin", "value": 11.8, "unit": "g/dL", "reference_range": "11.5 - 15.5", "flag": "NORMAL", "loinc_code": "718-7"},
                    {"test_name": "Total WBC Count", "value": 8100, "unit": "/cumm", "reference_range": "5000 - 13000", "flag": "NORMAL", "loinc_code": "6690-2"},
                    {"test_name": "Platelet Count", "value": 310000, "unit": "/cumm", "reference_range": "150000 - 450000", "flag": "NORMAL", "loinc_code": "777-3"},
                    {"test_name": "Serum Ferritin", "value": 28, "unit": "ng/mL", "reference_range": "14 - 120", "flag": "NORMAL", "loinc_code": "2276-4"}
                ],
                "medications": [],
                "diagnoses": ["Normal Pediatric Hematology"]
            },
            "grounded_summary": {
                "text_en": "Hemoglobin is 11.8 g/dL [fact_1], WBC is 8100 /cumm [fact_2], Platelets are 310000 /cumm [fact_3], and Ferritin is 28 ng/mL [fact_4].",
                "text_te": "హిమోగ్లోబిన్ 11.8 g/dL [fact_1], WBC 8100 /cumm [fact_2], ప్లేట్‌లెట్స్ 310000 /cumm [fact_3], ఫెర్రిటిన్ 28 ng/mL [fact_4].",
                "text_hi": "हीमोग्लोबिन 11.8 g/dL [fact_1], WBC 8100 /cumm [fact_2], प्लेटलेट्स 310000 /cumm [fact_3], फेरिटिन 28 ng/mL [fact_4] है।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "Hemoglobin 11.8 g/dL"},
                    {"fact_id": "fact_2", "claim": "Total WBC Count 8100 /cumm"},
                    {"fact_id": "fact_3", "claim": "Platelet Count 310000 /cumm"},
                    {"fact_id": "fact_4", "claim": "Serum Ferritin 28 ng/mL"}
                ]
            }
        },

        # 19. Manipal Hospital - Post-Op Discharge Summary
        {
            "doc_id": "MANIPAL_DISC_019",
            "provider_name": "Manipal Hospitals, Bengaluru",
            "document_type": "Discharge Summary & Prescription",
            "document_date": "2026-03-09",
            "patient_info": {"name": "Sanjay K. Roy", "age": 44, "gender": "M", "mock_abha_id": "91-6655-4433-2211 (MOCK)"},
            "raw_text": (
                "MANIPAL HOSPITALS - SURGICAL DISCHARGE\n"
                "Patient: Sanjay K. Roy | Age: 44 M | Date: 09/03/2026\n"
                "1. Tab Zifi-CV 200 (Cefixime 200mg + Clavulanic Acid 125mg) - 1 tab BD x 5 days\n"
                "2. Tab Zerodol-SP (Aceclofenac + Paracetamol + Serratiopeptidase) - 1 tab BD after food x 3 days\n"
                "3. Tab Razo 20 (Rabeprazole 20mg) - 1 tab OD before breakfast\n"
            ),
            "gold_standard": {
                "document_date": "2026-03-09",
                "organ_system": "Surgical / Gastrointestinal",
                "labs": [],
                "medications": [
                    {"brand_name": "Zifi-CV 200", "generic_name": "Cefixime + Clavulanic Acid", "strength": "200mg/125mg", "frequency": "1 tab BD", "food_relation": ""},
                    {"brand_name": "Zerodol-SP", "generic_name": "Aceclofenac + Paracetamol + Serratiopeptidase", "strength": "100mg/325mg/15mg", "frequency": "1 tab BD", "food_relation": "after food"},
                    {"brand_name": "Razo 20", "generic_name": "Rabeprazole", "strength": "20mg", "frequency": "1 tab OD", "food_relation": "before breakfast"}
                ],
                "diagnoses": ["Status Post Laparoscopic Cholecystectomy"]
            },
            "grounded_summary": {
                "text_en": "Prescribed Zifi-CV 200 twice daily [fact_1], Zerodol-SP twice daily after food [fact_2], and Razo 20 before breakfast [fact_3].",
                "text_te": "Zifi-CV 200 రోజుకు రెండుసార్లు [fact_1], ఆహారం తర్వాత Zerodol-SP [fact_2], టిఫిన్ ముందు Razo 20 [fact_3] సూచించబడ్డాయి.",
                "text_hi": "Zifi-CV 200 दिन में दो बार [fact_1], भोजन बाद Zerodol-SP [fact_2], और नाश्ते से पहले Razo 20 [fact_3] निर्धारित है।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "Zifi-CV 200 1 tab BD"},
                    {"fact_id": "fact_2", "claim": "Zerodol-SP 1 tab BD after food"},
                    {"fact_id": "fact_3", "claim": "Razo 20 1 tab OD before breakfast"}
                ]
            }
        },

        # 20. AIIMS New Delhi - Outpatient Assessment
        {
            "doc_id": "AIIMS_OUTP_020",
            "provider_name": "All India Institute of Medical Sciences, New Delhi",
            "document_type": "Outpatient Assessment",
            "document_date": "2026-03-11",
            "patient_info": {"name": "Geeta Bhattacharya", "age": 41, "gender": "F", "mock_abha_id": "91-7766-5544-3322 (MOCK)"},
            "raw_text": (
                "AIIMS NEW DELHI - ENDOCRINOLOGY CLINIC\n"
                "Patient: Geeta Bhattacharya | 41/F | Date: 11/03/2026\n"
                "Serum TSH: 2.45 uIU/mL (0.35 - 4.94)\n"
                "Free T4: 1.15 ng/dL (0.70 - 1.48)\n"
                "Fasting Blood Glucose: 92 mg/dL (70 - 100)\n"
                "HbA1c: 5.6 % (4.0 - 5.6)\n"
                "1. Tab Thyronorm 50mcg (Levothyroxine 50mcg) - 1 tab OD empty stomach morning\n"
            ),
            "gold_standard": {
                "document_date": "2026-03-11",
                "organ_system": "Endocrine",
                "labs": [
                    {"test_name": "Serum TSH", "value": 2.45, "unit": "uIU/mL", "reference_range": "0.35 - 4.94", "flag": "NORMAL", "loinc_code": "3016-3"},
                    {"test_name": "Free T4", "value": 1.15, "unit": "ng/dL", "reference_range": "0.70 - 1.48", "flag": "NORMAL", "loinc_code": "3024-7"},
                    {"test_name": "Fasting Blood Glucose", "value": 92, "unit": "mg/dL", "reference_range": "70 - 100", "flag": "NORMAL", "loinc_code": "1558-6"},
                    {"test_name": "HbA1c", "value": 5.6, "unit": "%", "reference_range": "4.0 - 5.6", "flag": "NORMAL", "loinc_code": "4548-4"}
                ],
                "medications": [
                    {"brand_name": "Thyronorm 50mcg", "generic_name": "Levothyroxine", "strength": "50mcg", "frequency": "1 tab OD", "food_relation": "empty stomach morning"}
                ],
                "diagnoses": ["Euthyroid on Replacement"]
            },
            "grounded_summary": {
                "text_en": "TSH is 2.45 uIU/mL [fact_1], Free T4 is 1.15 ng/dL [fact_2], Glucose is 92 mg/dL [fact_3], and HbA1c is 5.6% [fact_4]. Continue Thyronorm 50mcg [fact_5].",
                "text_te": "TSH 2.45 uIU/mL [fact_1], ఫ్రీ T4 1.15 ng/dL [fact_2], గ్లూకోజ్ 92 mg/dL [fact_3], HbA1c 5.6% [fact_4]. Thyronorm 50mcg కొనసాగించండి [fact_5].",
                "text_hi": "TSH 2.45 uIU/mL [fact_1], फ्री T4 1.15 ng/dL [fact_2], ग्लूकोज 92 mg/dL [fact_3], और HbA1c 5.6% [fact_4] है। Thyronorm 50mcg जारी रखें [fact_5]।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "Serum TSH 2.45 uIU/mL"},
                    {"fact_id": "fact_2", "claim": "Free T4 1.15 ng/dL"},
                    {"fact_id": "fact_3", "claim": "Fasting Blood Glucose 92 mg/dL"},
                    {"fact_id": "fact_4", "claim": "HbA1c 5.6 %"},
                    {"fact_id": "fact_5", "claim": "Thyronorm 50mcg 1 tab OD empty stomach"}
                ]
            }
        },

        # 21. Fortis Hospital - Cardiology Heart Failure Follow-up
        {
            "doc_id": "FORTIS_CHF_021",
            "provider_name": "Fortis Escorts Heart Institute, Okhla, New Delhi",
            "document_type": "Cardiology Follow-up",
            "document_date": "2026-03-03",
            "patient_info": {"name": "Harishankar Prasad", "age": 68, "gender": "M", "mock_abha_id": "91-6677-4411-8899 (MOCK)"},
            "raw_text": (
                "FORTIS ESCORTS HEART INSTITUTE - CHF CLINIC\n"
                "Patient: Harishankar Prasad | 68 M | Date: 03/03/2026\n"
                "NT-proBNP: 420 pg/mL (< 125)\n"
                "Serum Potassium: 4.8 mEq/L (3.5 - 5.1)\n"
                "Serum Sodium: 137 mEq/L (136 - 145)\n"
                "1. Tab Cidmus 50 (Sacubitril + Valsartan 50mg) - 1 tab BD\n"
                "2. Tab Lasix 40 (Furosemide 40mg) - 1 tab OD morning\n"
                "3. Tab Aldactone 25 (Spironolactone 25mg) - 1 tab OD\n"
            ),
            "gold_standard": {
                "document_date": "2026-03-03",
                "organ_system": "Cardiovascular",
                "labs": [
                    {"test_name": "NT-proBNP", "value": 420, "unit": "pg/mL", "reference_range": "< 125", "flag": "ELEVATED", "loinc_code": "33762-6"},
                    {"test_name": "Serum Potassium", "value": 4.8, "unit": "mEq/L", "reference_range": "3.5 - 5.1", "flag": "NORMAL", "loinc_code": "2823-3"},
                    {"test_name": "Serum Sodium", "value": 137, "unit": "mEq/L", "reference_range": "136 - 145", "flag": "NORMAL", "loinc_code": "2951-2"}
                ],
                "medications": [
                    {"brand_name": "Cidmus 50", "generic_name": "Sacubitril + Valsartan", "strength": "50mg", "frequency": "1 tab BD", "food_relation": ""},
                    {"brand_name": "Lasix 40", "generic_name": "Furosemide", "strength": "40mg", "frequency": "1 tab OD", "food_relation": "morning"},
                    {"brand_name": "Aldactone 25", "generic_name": "Spironolactone", "strength": "25mg", "frequency": "1 tab OD", "food_relation": ""}
                ],
                "diagnoses": ["Chronic Heart Failure"]
            },
            "grounded_summary": {
                "text_en": "NT-proBNP is 420 pg/mL [fact_1]. Potassium is 4.8 mEq/L [fact_2] and Sodium is 137 mEq/L [fact_3]. Prescribed Cidmus 50 [fact_4], Lasix 40 [fact_5], and Aldactone 25 [fact_6].",
                "text_te": "NT-proBNP 420 pg/mL [fact_1]. పొటాషియం 4.8 mEq/L [fact_2], సోడియం 137 mEq/L [fact_3]. Cidmus 50 [fact_4], Lasix 40 [fact_5], Aldactone 25 [fact_6] సూచించబడ్డాయి.",
                "text_hi": "NT-proBNP 420 pg/mL [fact_1] है। पोटेशियम 4.8 mEq/L [fact_2] और सोडियम 137 mEq/L [fact_3] है। Cidmus 50 [fact_4], Lasix 40 [fact_5], Aldactone 25 [fact_6] निर्धारित है।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "NT-proBNP 420 pg/mL"},
                    {"fact_id": "fact_2", "claim": "Serum Potassium 4.8 mEq/L"},
                    {"fact_id": "fact_3", "claim": "Serum Sodium 137 mEq/L"},
                    {"fact_id": "fact_4", "claim": "Cidmus 50 1 tab BD"},
                    {"fact_id": "fact_5", "claim": "Lasix 40 1 tab OD morning"},
                    {"fact_id": "fact_6", "claim": "Aldactone 25 1 tab OD"}
                ]
            }
        },

        # 22. Max Healthcare - Endocrinology Osteoporosis Screening
        {
            "doc_id": "MAX_OSTEO_022",
            "provider_name": "Max Super Speciality Hospital, Dehradun",
            "document_type": "Diagnostic Report",
            "document_date": "2026-02-12",
            "patient_info": {"name": "Kamla Devi", "age": 62, "gender": "F", "mock_abha_id": "91-5544-3322-1100 (MOCK)"},
            "raw_text": (
                "MAX HEALTHCARE - BONE METABOLISM\n"
                "Patient: Kamla Devi | 62 F | Date: 12/02/2026\n"
                "Serum Calcium: 8.8 mg/dL (8.5 - 10.2)\n"
                "Serum Phosphorus: 3.4 mg/dL (2.5 - 4.5)\n"
                "Alkaline Phosphatase (Bone ALP): 142 IU/L (40 - 130)\n"
                "1. Tab Gemcal (Calcium Carbonate 500mg + Calcitriol) - 1 tab OD\n"
                "2. Tab Fosavance 70 (Alendronate 70mg) - 1 tab weekly empty stomach\n"
            ),
            "gold_standard": {
                "document_date": "2026-02-12",
                "organ_system": "Musculoskeletal",
                "labs": [
                    {"test_name": "Serum Calcium", "value": 8.8, "unit": "mg/dL", "reference_range": "8.5 - 10.2", "flag": "NORMAL", "loinc_code": "17861-6"},
                    {"test_name": "Serum Phosphorus", "value": 3.4, "unit": "mg/dL", "reference_range": "2.5 - 4.5", "flag": "NORMAL", "loinc_code": "2777-1"},
                    {"test_name": "Alkaline Phosphatase", "value": 142, "unit": "IU/L", "reference_range": "40 - 130", "flag": "ELEVATED", "loinc_code": "6768-6"}
                ],
                "medications": [
                    {"brand_name": "Gemcal", "generic_name": "Calcium Carbonate + Calcitriol", "strength": "500mg", "frequency": "1 tab OD", "food_relation": ""},
                    {"brand_name": "Fosavance 70", "generic_name": "Alendronate + Cholecalciferol", "strength": "70mg", "frequency": "1 tab weekly", "food_relation": "empty stomach"}
                ],
                "diagnoses": ["Postmenopausal Osteopenia"]
            },
            "grounded_summary": {
                "text_en": "Calcium is 8.8 mg/dL [fact_1], Phosphorus is 3.4 mg/dL [fact_2], and ALP is 142 IU/L [fact_3]. Prescribed Gemcal [fact_4] and Fosavance 70 weekly [fact_5].",
                "text_te": "కాల్షియం 8.8 mg/dL [fact_1], ఫాస్ఫరస్ 3.4 mg/dL [fact_2], ALP 142 IU/L [fact_3]. Gemcal [fact_4], Fosavance 70 [fact_5] సూచించబడ్డాయి.",
                "text_hi": "कैल्शियम 8.8 mg/dL [fact_1], फास्फोरस 3.4 mg/dL [fact_2], और ALP 142 IU/L [fact_3] है। Gemcal [fact_4] और Fosavance 70 [fact_5] दिया गया है।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "Serum Calcium 8.8 mg/dL"},
                    {"fact_id": "fact_2", "claim": "Serum Phosphorus 3.4 mg/dL"},
                    {"fact_id": "fact_3", "claim": "Alkaline Phosphatase 142 IU/L"},
                    {"fact_id": "fact_4", "claim": "Gemcal 1 tab OD"},
                    {"fact_id": "fact_5", "claim": "Fosavance 70 1 tab weekly"}
                ]
            }
        },

        # 23. Tata Memorial / Onco Diagnostic - CBC & Tumor Marker
        {
            "doc_id": "TATA_ONCO_023",
            "provider_name": "Tata Memorial Centre, Kharghar, Navi Mumbai",
            "document_type": "Oncology Lab Assessment",
            "document_date": "2026-03-06",
            "patient_info": {"name": "Gopalakrishnan Nair", "age": 58, "gender": "M", "mock_abha_id": "91-9988-1122-3344 (MOCK)"},
            "raw_text": (
                "TATA MEMORIAL - ONCOLOGY LAB\n"
                "Patient: Gopalakrishnan Nair | 58 M | Date: 06/03/2026\n"
                "Total PSA (Prostate Specific Ag)  2.1         ng/mL       0.0 - 4.0\n"
                "Carcinoembryonic Antigen (CEA)    1.8         ng/mL       < 3.0\n"
                "Hemoglobin                        13.2        g/dL        12.0 - 15.0\n"
                "Platelet Count                    190000      /cumm       150000 - 450000\n"
            ),
            "gold_standard": {
                "document_date": "2026-03-06",
                "organ_system": "Urology & Oncology",
                "labs": [
                    {"test_name": "Total PSA", "value": 2.1, "unit": "ng/mL", "reference_range": "0.0 - 4.0", "flag": "NORMAL", "loinc_code": "2857-1"},
                    {"test_name": "Carcinoembryonic Antigen", "value": 1.8, "unit": "ng/mL", "reference_range": "< 3.0", "flag": "NORMAL", "loinc_code": "2039-6"},
                    {"test_name": "Hemoglobin", "value": 13.2, "unit": "g/dL", "reference_range": "12.0 - 15.0", "flag": "NORMAL", "loinc_code": "718-7"},
                    {"test_name": "Platelet Count", "value": 190000, "unit": "/cumm", "reference_range": "150000 - 450000", "flag": "NORMAL", "loinc_code": "777-3"}
                ],
                "medications": [],
                "diagnoses": ["Normal Tumor Markers"]
            },
            "grounded_summary": {
                "text_en": "PSA is normal at 2.1 ng/mL [fact_1] and CEA is 1.8 ng/mL [fact_2]. Hemoglobin is 13.2 g/dL [fact_3] and platelets are 190000 /cumm [fact_4].",
                "text_te": "PSA 2.1 ng/mL [fact_1], CEA 1.8 ng/mL [fact_2]. హిమోగ్లోబిన్ 13.2 g/dL [fact_3], ప్లేట్‌లెట్స్ 190000 /cumm [fact_4].",
                "text_hi": "PSA 2.1 ng/mL [fact_1] और CEA 1.8 ng/mL [fact_2] है। हीमोग्लोबिन 13.2 g/dL [fact_3] और प्लेटलेट्स 190000 /cumm [fact_4] है।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "Total PSA 2.1 ng/mL"},
                    {"fact_id": "fact_2", "claim": "Carcinoembryonic Antigen 1.8 ng/mL"},
                    {"fact_id": "fact_3", "claim": "Hemoglobin 13.2 g/dL"},
                    {"fact_id": "fact_4", "claim": "Platelet Count 190000 /cumm"}
                ]
            }
        },

        # 24. Apollo Spectra - Orthopedic Joint Infiltration Prescription
        {
            "doc_id": "APOLLO_ORTHO_024",
            "provider_name": "Apollo Spectra Hospitals, Alwarpet, Chennai",
            "document_type": "Orthopedic Prescription",
            "document_date": "2026-03-13",
            "patient_info": {"name": "Lalitha Swaminathan", "age": 55, "gender": "F", "mock_abha_id": "91-3322-7788-9900 (MOCK)"},
            "raw_text": (
                "APOLLO SPECTRA - ORTHOPEDICS\n"
                "Patient: Lalitha Swaminathan | 55/F | Date: 13-03-2026\n"
                "1. Tab Tendocare (Collagen + Sodium Hyaluronate) - 1 tab BD after food\n"
                "2. Tab Etrik 90 (Etoricoxib 90mg) - 1 tab OD after lunch x 5 days\n"
                "3. Sachet Jointace C2 - 1 sachet daily with water\n"
            ),
            "gold_standard": {
                "document_date": "2026-03-13",
                "organ_system": "Musculoskeletal",
                "labs": [],
                "medications": [
                    {"brand_name": "Tendocare", "generic_name": "Collagen Peptide + Sodium Hyaluronate", "strength": "1 tab", "frequency": "1 tab BD", "food_relation": "after food"},
                    {"brand_name": "Etrik 90", "generic_name": "Etoricoxib", "strength": "90mg", "frequency": "1 tab OD", "food_relation": "after lunch"},
                    {"brand_name": "Jointace C2", "generic_name": "Glucosamine + Collagen Type II", "strength": "1 sachet", "frequency": "1 sachet daily", "food_relation": ""}
                ],
                "diagnoses": ["Bilateral Knee Osteoarthritis"]
            },
            "grounded_summary": {
                "text_en": "Prescribed Tendocare twice daily after food [fact_1], Etrik 90 once daily after lunch for 5 days [fact_2], and Jointace C2 daily [fact_3].",
                "text_te": "ఆహారం తర్వాత Tendocare [fact_1], లంచ్ తర్వాత 5 రోజుల పాటు Etrik 90 [fact_2], Jointace C2 రోజువారీగా [fact_3] సూచించబడ్డాయి.",
                "text_hi": "भोजन बाद Tendocare [fact_1], दोपहर में 5 दिनों के लिए Etrik 90 [fact_2], और Jointace C2 प्रतिदिन [fact_3] निर्धारित किया गया है।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "Tendocare 1 tab BD after food"},
                    {"fact_id": "fact_2", "claim": "Etrik 90 1 tab OD after lunch for 5 days"},
                    {"fact_id": "fact_3", "claim": "Jointace C2 1 sachet daily"}
                ]
            }
        },

        # 25. Manipal Hospital - Comprehensive Neurological Assessment
        {
            "doc_id": "MANIPAL_NEURO_025",
            "provider_name": "Manipal Hospitals, Whitefield, Bengaluru",
            "document_type": "Neurology Summary & Lab",
            "document_date": "2026-03-16",
            "patient_info": {"name": "Raghavan S.", "age": 51, "gender": "M", "mock_abha_id": "91-1100-2233-4455 (MOCK)"},
            "raw_text": (
                "MANIPAL HOSPITALS - NEUROLOGY CLINIC\n"
                "Patient: Raghavan S. | 51 M | Date: 16/03/2026\n"
                "Serum Homocysteine: 18.2 umol/L (< 15.0)\n"
                "Serum Folate: 7.8 ng/mL (3.0 - 17.0)\n"
                "Vitamin B12: 320 pg/mL (211 - 911)\n"
                "1. Tab Nurokind-Plus RF (Mecobalamin + Alpha Lipoic Acid) - 1 tab OD\n"
                "2. Tab Gabapin-NT (Gabapentin 100mg + Nortriptyline 10mg) - 1 tab HS night\n"
            ),
            "gold_standard": {
                "document_date": "2026-03-16",
                "organ_system": "Neurology & Metabolic",
                "labs": [
                    {"test_name": "Serum Homocysteine", "value": 18.2, "unit": "umol/L", "reference_range": "< 15.0", "flag": "ELEVATED", "loinc_code": "13965-9"},
                    {"test_name": "Serum Folate", "value": 7.8, "unit": "ng/mL", "reference_range": "3.0 - 17.0", "flag": "NORMAL", "loinc_code": "2284-8"},
                    {"test_name": "Vitamin B12", "value": 320, "unit": "pg/mL", "reference_range": "211 - 911", "flag": "NORMAL", "loinc_code": "2132-9"}
                ],
                "medications": [
                    {"brand_name": "Nurokind-Plus RF", "generic_name": "Mecobalamin + Alpha Lipoic Acid", "strength": "1 tab", "frequency": "1 tab OD", "food_relation": ""},
                    {"brand_name": "Gabapin-NT", "generic_name": "Gabapentin + Nortriptyline", "strength": "100mg/10mg", "frequency": "1 tab HS night", "food_relation": ""}
                ],
                "diagnoses": ["Peripheral Neuropathy", "Mild Hyperhomocysteinemia"]
            },
            "grounded_summary": {
                "text_en": "Homocysteine is 18.2 umol/L [fact_1], Folate is 7.8 ng/mL [fact_2], and B12 is 320 pg/mL [fact_3]. Prescribed Nurokind-Plus RF [fact_4] and Gabapin-NT at night [fact_5].",
                "text_te": "హోమోసిస్టీన్ 18.2 umol/L [fact_1], ఫోలేట్ 7.8 ng/mL [fact_2], B12 320 pg/mL [fact_3]. Nurokind-Plus RF [fact_4], Gabapin-NT [fact_5] సూచించబడ్డాయి.",
                "text_hi": "होमोसिस्टीन 18.2 umol/L [fact_1], फोलेट 7.8 ng/mL [fact_2], B12 320 pg/mL [fact_3] है। Nurokind-Plus RF [fact_4] और Gabapin-NT [fact_5] निर्धारित है।",
                "facts": [
                    {"fact_id": "fact_1", "claim": "Serum Homocysteine 18.2 umol/L"},
                    {"fact_id": "fact_2", "claim": "Serum Folate 7.8 ng/mL"},
                    {"fact_id": "fact_3", "claim": "Vitamin B12 320 pg/mL"},
                    {"fact_id": "fact_4", "claim": "Nurokind-Plus RF 1 tab OD"},
                    {"fact_id": "fact_5", "claim": "Gabapin-NT 1 tab HS night"}
                ]
            }
        }
    ]
    return dataset


def save_synthetic_dataset(output_dir: str = "eval/synthetic_data"):
    """Saves the 25 synthetic gold standard medical records as JSON files."""
    os.makedirs(output_dir, exist_ok=True)
    dataset = generate_synthetic_dataset()
    
    master_path = os.path.join(output_dir, "benchmark_25_gold_records.json")
    with open(master_path, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2, ensure_ascii=False)
        
    print(f"Generated {len(dataset)} synthetic Indian gold-standard medical records in '{output_dir}'.")
    return master_path


if __name__ == "__main__":
    save_synthetic_dataset()
