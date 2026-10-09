import urllib.request
import json
from backend.app.core.config import settings
from backend.app.pipeline.extract_vlm import parse_gemini_response

groq_key = settings.GROQ_API_KEY
full_text = """Dr.Ak SLhospital M.S. Reg.No:MMC 2018 Date:30-Aug-2023
ID:11-OPD6PATIENT（M)/13Y Weight(Kg）:80,Height (Cm):200(B.M.1.=20.00),BP:120/80 mmHg
Chief Complaints: FEVERWITH CHILLS(4DAYS), HEADACHE (2 DAYS)
Diagnosis: MALARIA
R Medicine Name Dosage Duration
1)TAB.ABCIXIMAB 1 Morning 8Days (Tot:8 Tab)
2)TAB.VOMILAST 1 Morning,1 Night (After Food) 8Days (Tot:16Tab) DOXYLAMINE 10MG+PYRIDOXINE10 MG+ FOLIC ACID 2.5 MG
3)CAP.ZOCLAR 500 1 Morning 3 Days (Tot:3 Cap) CLARITHROMYCINIPSOOMG
4)TAB.GESTAKIND10/SR 1 Night 4Days (Tot:4 Tab) ISOXSUPRINE10 MG
Advice: TAKE BEDREST DO NOTEATOUTSIDEFOOD"""

instruction = """You are CareLens Medical Entity Extraction Engine.
Extract all clinical facts from this document text into strictly valid JSON matching this schema:
{
  "doc_type": "prescription",
  "document_date": "YYYY-MM-DD",
  "facility_name": "Hospital/Clinic name",
  "clinician_name": "Doctor name",
  "patient_name": "Patient name",
  "patient_age": 13,
  "patient_gender": "male",
  "diagnoses": [{"id": "diag_1", "text": "Exact diagnosis/impression", "organ_system": "cardiovascular"}],
  "observations": [
    {"id": "fact_1", "name": "Blood Pressure", "value": "120/80 mmHg", "numeric_value": 120, "unit": "mmHg", "ref_range": "90-120/60-80", "organ_system": "cardiovascular"}
  ],
  "medications": [
    {
      "id": "med_1",
      "brand_name": "TAB. ABCIXIMAB",
      "generic_name": "Abciximab",
      "strength": "strength",
      "frequency": "1-0-0",
      "timing": "morning",
      "duration": "8 days"
    }
  ],
  "warnings": []
}

IMPORTANT RULES:
1. Each numbered prescription line (1, 2, 3, etc.) represents ONE medicine. Do NOT extract the generic salt composition line as a separate medicine entry; place it in the 'generic_name' field of that medicine!
2. Extract vitals (Blood Pressure, Weight, Height, BMI, Heart Rate) as observations in the observations list.
3. Clean watermarks or demo labels (e.g. ignore 'SAMPLE PRESCRIPTION', 'ENTERING SAMPLE DIAGNOSIS').
4. Return strictly valid JSON with no markdown wrapping."""

payload = {
    "model": "openai/gpt-oss-120b",
    "messages": [
        {"role": "system", "content": instruction},
        {"role": "user", "content": f"Extract clinical facts from this document text:\n\n{full_text}"}
    ],
    "temperature": 0.0,
    "response_format": {"type": "json_object"}
}

req = urllib.request.Request(
    "https://api.groq.com/openai/v1/chat/completions",
    data=json.dumps(payload).encode("utf-8"),
    headers={"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json", "User-Agent": "CareLens/1.0"}
)
with urllib.request.urlopen(req, timeout=20) as resp:
    res = json.loads(resp.read().decode())
    raw_json = res["choices"][0]["message"]["content"]
    extraction = parse_gemini_response(raw_json)
    print("Extraction Result:")
    print("  Doc Type:", extraction.doc_type)
    print("  Date:", extraction.document_date)
    print("  Diagnoses:", [d.text for d in extraction.diagnoses])
    print("  Observations:", [f"{o.name}: {o.value}" for o in extraction.observations])
    for m in extraction.medications:
        print(f"  Med: {m.brand_name} | Generic: {m.generic_name} | Freq: {m.frequency} | Dur: {m.duration}")
