"""
CareLens - Doctor Visit Preparation Brief Generator
Generates a downloadable, clinical-grade 1-page PDF Doctor Visit Preparation Brief
using ReportLab, containing patient credentials (ABHA), active conditions, current medications,
recent abnormal lab trends, 3 AI-suggested physician questions, and regulatory safety disclaimers.
"""

import os
import sys
from typing import Dict, List, Any, Optional
from datetime import datetime

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


def generate_doctor_brief_pdf(patient_data: Optional[Dict[str, Any]] = None, output_filename: str = "eval/doctor_visit_brief.pdf") -> str:
    """
    Generates a 1-page PDF summary for the patient to hand to their physician.
    """
    if not REPORTLAB_AVAILABLE:
        print("Warning: ReportLab is not installed. Skipping PDF generation.")
        return ""

    os.makedirs(os.path.dirname(output_filename) or ".", exist_ok=True)

    if not patient_data:
        # Default comprehensive sample (Ramesh Kumar Sharma - Apollo Lab)
        patient_data = {
            "name": "Ramesh Kumar Sharma",
            "age": 52,
            "gender": "Male",
            "mock_abha_id": "91-8721-4432-1098 (MOCK)",
            "date": "2026-03-15",
            "active_diagnoses": ["Type 2 Diabetes Mellitus (Suboptimal Control)", "Dyslipidemia", "Mild Hypertension"],
            "medications": [
                {"brand": "Glycomet-GP 1", "generic": "Metformin 500mg + Glimepiride 1mg", "dosage": "1 tab BD before meals"},
                {"brand": "Telma 40", "generic": "Telmisartan 40mg", "dosage": "1 tab OD morning"},
                {"brand": "Rosuvas 10", "generic": "Rosuvastatin 10mg", "dosage": "1 tab HS night"}
            ],
            "abnormal_labs": [
                {"test": "HbA1c (Glycated Hb)", "result": "7.4 %", "ref": "4.0 - 5.6", "status": "ELEVATED", "flag_color": colors.HexColor("#d97706")},
                {"test": "Fasting Blood Sugar", "result": "128 mg/dL", "ref": "70 - 99", "status": "ELEVATED", "flag_color": colors.HexColor("#d97706")},
                {"test": "Post Prandial Sugar", "result": "184 mg/dL", "ref": "< 140", "status": "ELEVATED", "flag_color": colors.HexColor("#d97706")},
                {"test": "Total Cholesterol", "result": "218 mg/dL", "ref": "125 - 200", "status": "ELEVATED", "flag_color": colors.HexColor("#d97706")},
                {"test": "LDL Cholesterol", "result": "138 mg/dL", "ref": "< 100", "status": "ELEVATED", "flag_color": colors.HexColor("#d97706")},
                {"test": "Serum Creatinine", "result": "1.05 mg/dL", "ref": "0.70 - 1.20", "status": "NORMAL", "flag_color": colors.HexColor("#059669")}
            ],
            "doctor_questions": [
                "Should we consider adjusting my Glycomet-GP dosage or adding an SGLT2 inhibitor given my HbA1c is 7.4%?",
                "Are there additional dietary or lifestyle interventions recommended for my elevated LDL (138 mg/dL)?",
                "When should we schedule my next renal microalbuminuria and glycemic checkup?"
            ]
        }

    doc = SimpleDocTemplate(
        output_filename,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=32,
        bottomMargin=32
    )

    styles = getSampleStyleSheet()

    # Custom styles
    header_style = ParagraphStyle(
        'DocHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        textColor=colors.HexColor('#0f172a'),
        leading=22
    )

    sub_header_style = ParagraphStyle(
        'DocSubHeader',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=colors.HexColor('#64748b'),
        leading=12
    )

    section_title = ParagraphStyle(
        'SectionTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        textColor=colors.HexColor('#0369a1'),
        spaceBefore=8,
        spaceAfter=4
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#1e293b')
    )

    body_regular = ParagraphStyle(
        'BodyRegular',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#334155')
    )

    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7,
        leading=9,
        textColor=colors.HexColor('#94a3b8'),
        alignment=1
    )

    elements = []

    # 1. Header Banner
    header_table_data = [
        [
            Paragraph("🏥 <b>CareLens</b> | Doctor Visit Preparation Brief", header_style),
            Paragraph(f"<b>Visit Date:</b> {patient_data.get('date', datetime.today().strftime('%Y-%m-%d'))}<br/><b>ABHA ID:</b> {patient_data.get('mock_abha_id')}", sub_header_style)
        ]
    ]
    t_header = Table(header_table_data, colWidths=[360, 180])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
    ]))
    elements.append(t_header)
    elements.append(Spacer(1, 4))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284c7"), spaceAfter=6, spaceBefore=2))

    # 2. Patient Demographics & Active Diagnoses
    patient_info = f"<b>Patient:</b> {patient_data.get('name')} | <b>Age/Gender:</b> {patient_data.get('age')} Y / {patient_data.get('gender')} | <b>Active Conditions:</b> {', '.join(patient_data.get('active_diagnoses', []))}"
    elements.append(Paragraph(patient_info, body_regular))
    elements.append(Spacer(1, 6))

    # 3. Active Medications Table
    elements.append(Paragraph("💊 Current Prescriptions & Active Generic Formulations", section_title))
    med_rows = [["Medication / Brand", "Active Generic Salt & Strength", "Dosage & Instructions"]]
    for m in patient_data.get("medications", []):
        med_rows.append([
            Paragraph(f"<b>{m.get('brand')}</b>", body_regular),
            Paragraph(m.get('generic', ''), body_regular),
            Paragraph(m.get('dosage', ''), body_regular)
        ])
    t_meds = Table(med_rows, colWidths=[140, 240, 160])
    t_meds.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
    ]))
    elements.append(t_meds)
    elements.append(Spacer(1, 6))

    # 4. Recent Abnormal & Key Lab Findings
    elements.append(Paragraph("🔬 Recent Lab Investigations & Out-of-Range Indicators", section_title))
    lab_rows = [["Diagnostic Test", "Observed Result", "Reference Range", "Clinical Flag"]]
    for l in patient_data.get("abnormal_labs", []):
        status = l.get('status', 'NORMAL')
        badge_bg = '#fef3c7' if status == 'ELEVATED' else ('#fee2e2' if 'CRITICAL' in status else '#ecfdf5')
        badge_fg = '#b45309' if status == 'ELEVATED' else ('#b91c1c' if 'CRITICAL' in status else '#047857')
        lab_rows.append([
            Paragraph(f"<b>{l.get('test')}</b>", body_regular),
            Paragraph(str(l.get('result')), body_bold),
            Paragraph(str(l.get('ref')), body_regular),
            Paragraph(f"<font color='{badge_fg}'><b>{status}</b></font>", body_bold)
        ])
    t_labs = Table(lab_rows, colWidths=[180, 120, 140, 100])
    t_labs.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
    ]))
    elements.append(t_labs)
    elements.append(Spacer(1, 6))

    # 5. AI Suggested Questions for Doctor
    elements.append(Paragraph("💡 AI-Suggested Discussion Questions for Your Physician", section_title))
    for i, q in enumerate(patient_data.get("doctor_questions", []), 1):
        elements.append(Paragraph(f"<b>{i}.</b> {q}", body_regular))
        elements.append(Spacer(1, 2))

    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceAfter=4, spaceBefore=4))

    # 6. Medical Disclaimer Footer
    disclaimer = (
        "<b>Medical Disclaimer:</b> CareLens is an educational personal health copilot. This preparation brief is compiled for informational "
        "review with your licensed healthcare practitioner and does not constitute formal medical diagnosis or treatment decisions."
    )
    elements.append(Paragraph(disclaimer, disclaimer_style))

    # Build PDF
    doc.build(elements)
    print(f"✅ Generated Doctor Visit Preparation Brief at '{output_filename}'")
    return output_filename


if __name__ == "__main__":
    generate_doctor_brief_pdf()
