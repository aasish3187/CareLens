"""
CareLens - Quantitative Evaluation & Benchmarking Metrics Module
Computes Field-Level Precision, Recall, and F1 Scores, Hallucination/Grounding Scores,
Translation Number-Preservation, and Deterministic Clinical Accuracy.
Supports scikit-learn metrics and tabulate reporting.
"""

from typing import Dict, List, Any, Set, Tuple, Optional
import re
import math

try:
    from sklearn.metrics import precision_score, recall_score, f1_score
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

try:
    from tabulate import tabulate
    TABULATE_AVAILABLE = True
except ImportError:
    TABULATE_AVAILABLE = False


def normalize_text(text: Optional[str]) -> str:
    """Normalize text by lowercasing, stripping punctuation, and collapsing whitespace."""
    if text is None:
        return ""
    text = str(text).lower().strip()
    text = re.sub(r'[\u2010-\u2015\u2212]', '-', text)
    text = re.sub(r'\s+', ' ', text)
    return text


def normalize_unit(unit: Optional[str]) -> str:
    """Normalize common clinical lab units (e.g. mg/dl vs mg/dL, % vs percent)."""
    if not unit:
        return ""
    u = normalize_text(unit)
    u = u.replace(" ", "")
    u = u.replace("milligram/deciliter", "mg/dl")
    u = u.replace("gm/dl", "g/dl")
    u = u.replace("grams/dl", "g/dl")
    u = u.replace("microgram/dl", "mcg/dl")
    u = u.replace("ug/dl", "mcg/dl")
    u = u.replace("u/l", "iu/l")
    u = u.replace("percent", "%")
    return u


def normalize_date(date_str: Optional[str]) -> str:
    """Normalize date strings into ISO format YYYY-MM-DD if possible."""
    if not date_str:
        return ""
    d = normalize_text(date_str)
    # Match DD/MM/YYYY or DD-MM-YYYY
    m1 = re.match(r'^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$', d)
    if m1:
        day, month, year = int(m1.group(1)), int(m1.group(2)), int(m1.group(3))
        return f"{year:04d}-{month:02d}-{day:02d}"
    
    # Match YYYY-MM-DD
    m2 = re.match(r'^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$', d)
    if m2:
        year, month, day = int(m2.group(1)), int(m2.group(2)), int(m2.group(3))
        return f"{year:04d}-{month:02d}-{day:02d}"
    
    return d


def extract_numbers_from_text(text: str) -> List[float]:
    """Extract all numerical values (integers, floats, percentages) from text."""
    if not text:
        return []
    matches = re.findall(r'[-+]?\d*\.?\d+', text)
    numbers = []
    for m in matches:
        try:
            if m not in ('.', '-', '+', ''):
                numbers.append(float(m))
        except ValueError:
            continue
    return numbers


def compute_prf1(tp: int, fp: int, fn: int) -> Tuple[float, float, float]:
    """
    Computes Precision, Recall, and F1 score safely.
    Returns (precision, recall, f1) in percentage [0.0 - 100.0].
    """
    precision = (tp / (tp + fp) * 100.0) if (tp + fp) > 0 else (100.0 if fn == 0 else 0.0)
    recall = (tp / (tp + fn) * 100.0) if (tp + fn) > 0 else (100.0 if fp == 0 else 0.0)
    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0
    return round(precision, 2), round(recall, 2), round(f1, 2)


class CareLensMetricsEvaluator:
    """
    Comprehensive evaluator for CareLens Multimodal Medical Extraction & Guardrails.
    """

    def __init__(self):
        self.category_counts = {
            "lab_names": {"ground_truth": 0, "extracted": 0, "tp": 0, "fp": 0, "fn": 0},
            "lab_values": {"ground_truth": 0, "extracted": 0, "tp": 0, "fp": 0, "fn": 0},
            "reference_ranges": {"ground_truth": 0, "extracted": 0, "tp": 0, "fp": 0, "fn": 0},
            "medication_brands": {"ground_truth": 0, "extracted": 0, "tp": 0, "fp": 0, "fn": 0},
            "generic_salts": {"ground_truth": 0, "extracted": 0, "tp": 0, "fp": 0, "fn": 0},
            "dosage_timing": {"ground_truth": 0, "extracted": 0, "tp": 0, "fp": 0, "fn": 0},
            "document_dates": {"ground_truth": 0, "extracted": 0, "tp": 0, "fp": 0, "fn": 0}
        }
        self.grounding_facts_total = 0
        self.grounding_facts_supported = 0
        self.translation_checks_total = 0
        self.translation_checks_passed = 0
        self.abnormality_checks_total = 0
        self.abnormality_checks_passed = 0

    def evaluate_lab_observations(self, predicted_labs: List[Dict[str, Any]], gold_labs: List[Dict[str, Any]]) -> None:
        """
        Evaluate extracted lab observations against gold standard.
        Fields checked: Test Name, Value & Units, Reference Range.
        """
        self.category_counts["lab_names"]["ground_truth"] += len(gold_labs)
        self.category_counts["lab_names"]["extracted"] += len(predicted_labs)
        self.category_counts["lab_values"]["ground_truth"] += len(gold_labs)
        self.category_counts["lab_values"]["extracted"] += len(predicted_labs)

        gold_ref_count = sum(1 for g in gold_labs if g.get("reference_range"))
        pred_ref_count = sum(1 for p in predicted_labs if p.get("reference_range"))
        self.category_counts["reference_ranges"]["ground_truth"] += gold_ref_count
        self.category_counts["reference_ranges"]["extracted"] += pred_ref_count

        gold_lookup = {}
        for idx, g in enumerate(gold_labs):
            norm_name = normalize_text(g.get("test_name", ""))
            gold_lookup[norm_name] = g

        matched_gold_keys = set()

        for pred in predicted_labs:
            p_name = normalize_text(pred.get("test_name", ""))
            p_val = normalize_text(str(pred.get("value", "")))
            p_unit = normalize_unit(pred.get("unit", ""))
            p_ref = normalize_text(pred.get("reference_range", ""))

            matched_key = None
            for g_key in gold_lookup:
                if p_name == g_key or p_name in g_key or g_key in p_name:
                    matched_key = g_key
                    break

            if matched_key and matched_key not in matched_gold_keys:
                matched_gold_keys.add(matched_key)
                g_item = gold_lookup[matched_key]
                g_val = normalize_text(str(g_item.get("value", "")))
                g_unit = normalize_unit(g_item.get("unit", ""))
                g_ref = normalize_text(g_item.get("reference_range", ""))

                # 1. Lab Name match
                self.category_counts["lab_names"]["tp"] += 1

                # 2. Value & Unit match
                val_match = False
                try:
                    num_p = float(p_val)
                    num_g = float(g_val)
                    if math.isclose(num_p, num_g, rel_tol=1e-3, abs_tol=1e-3) and p_unit == g_unit:
                        val_match = True
                except (ValueError, TypeError):
                    if p_val == g_val and p_unit == g_unit:
                        val_match = True

                if val_match:
                    self.category_counts["lab_values"]["tp"] += 1
                else:
                    self.category_counts["lab_values"]["fp"] += 1
                    self.category_counts["lab_values"]["fn"] += 1

                # 3. Reference range match
                if p_ref and g_ref:
                    if p_ref == g_ref or (g_ref in p_ref) or (p_ref in g_ref):
                        self.category_counts["reference_ranges"]["tp"] += 1
                    else:
                        self.category_counts["reference_ranges"]["fp"] += 1
                        self.category_counts["reference_ranges"]["fn"] += 1
                elif not p_ref and not g_ref:
                    self.category_counts["reference_ranges"]["tp"] += 1
                else:
                    if p_ref and not g_ref:
                        self.category_counts["reference_ranges"]["fp"] += 1
                    else:
                        self.category_counts["reference_ranges"]["fn"] += 1
            else:
                self.category_counts["lab_names"]["fp"] += 1
                self.category_counts["lab_values"]["fp"] += 1

        for g_key in gold_lookup:
            if g_key not in matched_gold_keys:
                self.category_counts["lab_names"]["fn"] += 1
                self.category_counts["lab_values"]["fn"] += 1
                if gold_lookup[g_key].get("reference_range"):
                    self.category_counts["reference_ranges"]["fn"] += 1

    def evaluate_medications(self, predicted_meds: List[Dict[str, Any]], gold_meds: List[Dict[str, Any]]) -> None:
        """
        Evaluate extracted medications against gold standard.
        Fields: Brand Name, Generic Salt Resolution, Dosage & Timing.
        """
        self.category_counts["medication_brands"]["ground_truth"] += len(gold_meds)
        self.category_counts["medication_brands"]["extracted"] += len(predicted_meds)
        self.category_counts["generic_salts"]["ground_truth"] += len(gold_meds)
        self.category_counts["generic_salts"]["extracted"] += len(predicted_meds)
        self.category_counts["dosage_timing"]["ground_truth"] += len(gold_meds)
        self.category_counts["dosage_timing"]["extracted"] += len(predicted_meds)

        gold_lookup = {}
        for idx, g in enumerate(gold_meds):
            brand_norm = normalize_text(g.get("brand_name", ""))
            gold_lookup[brand_norm] = g

        matched_gold_keys = set()

        for pred in predicted_meds:
            p_brand = normalize_text(pred.get("brand_name", ""))
            p_generic = normalize_text(pred.get("generic_name", ""))
            p_freq = normalize_text(pred.get("frequency", ""))
            p_strength = normalize_text(pred.get("strength", ""))

            matched_key = None
            for g_key in gold_lookup:
                if p_brand == g_key or p_brand in g_key or g_key in p_brand:
                    matched_key = g_key
                    break

            if matched_key and matched_key not in matched_gold_keys:
                matched_gold_keys.add(matched_key)
                g_item = gold_lookup[matched_key]
                g_generic = normalize_text(g_item.get("generic_name", ""))
                g_freq = normalize_text(g_item.get("frequency", ""))
                g_strength = normalize_text(g_item.get("strength", ""))

                # Brand match
                self.category_counts["medication_brands"]["tp"] += 1

                # Generic salt resolution match
                generic_match = (p_generic == g_generic or p_generic in g_generic or g_generic in p_generic) if (p_generic and g_generic) else True
                if generic_match:
                    self.category_counts["generic_salts"]["tp"] += 1
                else:
                    self.category_counts["generic_salts"]["fp"] += 1
                    self.category_counts["generic_salts"]["fn"] += 1

                # Dosage & timing match
                freq_match = (p_freq == g_freq or p_freq in g_freq or g_freq in p_freq) if (p_freq and g_freq) else (p_freq == g_freq)
                strength_match = (p_strength == g_strength or p_strength in g_strength or g_strength in p_strength) if (p_strength and g_strength) else True

                if freq_match and strength_match:
                    self.category_counts["dosage_timing"]["tp"] += 1
                else:
                    self.category_counts["dosage_timing"]["fp"] += 1
                    self.category_counts["dosage_timing"]["fn"] += 1
            else:
                self.category_counts["medication_brands"]["fp"] += 1
                self.category_counts["generic_salts"]["fp"] += 1
                self.category_counts["dosage_timing"]["fp"] += 1

        for g_key in gold_lookup:
            if g_key not in matched_gold_keys:
                self.category_counts["medication_brands"]["fn"] += 1
                self.category_counts["generic_salts"]["fn"] += 1
                self.category_counts["dosage_timing"]["fn"] += 1

    def evaluate_document_dates(self, predicted_date: Optional[str], gold_date: Optional[str]) -> None:
        """Evaluate document date extraction."""
        self.category_counts["document_dates"]["ground_truth"] += 1
        self.category_counts["document_dates"]["extracted"] += 1 if predicted_date else 0

        p_d = normalize_date(predicted_date)
        g_d = normalize_date(gold_date)

        if p_d and g_d:
            if p_d == g_d:
                self.category_counts["document_dates"]["tp"] += 1
            else:
                self.category_counts["document_dates"]["fp"] += 1
                self.category_counts["document_dates"]["fn"] += 1
        elif p_d and not g_d:
            self.category_counts["document_dates"]["fp"] += 1
        elif not p_d and g_d:
            self.category_counts["document_dates"]["fn"] += 1
        else:
            self.category_counts["document_dates"]["tp"] += 1

    def evaluate_grounding_and_hallucination(self, summary_facts: List[Dict[str, Any]], extracted_entities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Verifies that 100% of facts cited in the AI Summary map directly to
        extracted document entities (fact_id grounding).
        """
        extracted_fact_ids = {e.get("fact_id") for e in extracted_entities if e.get("fact_id")}
        extracted_text_corpus = " ".join([normalize_text(str(v)) for e in extracted_entities for v in e.values()])

        doc_facts_supported = 0
        for fact in summary_facts:
            self.grounding_facts_total += 1
            fact_id = fact.get("fact_id")
            fact_claim = normalize_text(fact.get("claim", ""))
            
            is_grounded = False
            if fact_id and fact_id in extracted_fact_ids:
                is_grounded = True
            elif fact_claim:
                words = [w for w in fact_claim.split() if len(w) > 3]
                if words and any(w in extracted_text_corpus for w in words):
                    is_grounded = True

            if is_grounded:
                self.grounding_facts_supported += 1
                doc_facts_supported += 1

        return {
            "total_facts": len(summary_facts),
            "supported_facts": doc_facts_supported,
            "grounding_rate": (doc_facts_supported / len(summary_facts) * 100.0) if summary_facts else 100.0
        }

    def evaluate_translation_preservation(self, source_text_en: str, translated_texts: Dict[str, str]) -> Dict[str, bool]:
        """
        Verifies that numerical clinical metrics (e.g. 7.4%, 126 mg/dL, 500 mg)
        are 100% mathematically preserved in regional translations (Telugu, Hindi, Tamil).
        """
        source_numbers = sorted(extract_numbers_from_text(source_text_en))
        results = {}

        for lang, trans_text in translated_texts.items():
            self.translation_checks_total += 1
            trans_numbers = sorted(extract_numbers_from_text(trans_text))
            
            preserved = (source_numbers == trans_numbers)
            if preserved:
                self.translation_checks_passed += 1
            results[lang] = preserved

        return results

    def record_abnormality_check(self, passed: bool) -> None:
        """Record accuracy of deterministic rules engine vs clinical standard."""
        self.abnormality_checks_total += 1
        if passed:
            self.abnormality_checks_passed += 1

    def get_summary_report(self) -> Dict[str, Any]:
        """Generate final benchmark metrics report."""
        report = {}
        total_gt = 0
        total_ext = 0
        total_tp = 0
        total_fp = 0
        total_fn = 0

        readable_names = {
            "lab_names": "Lab Test Names",
            "lab_values": "Lab Values & Units",
            "reference_ranges": "Reference Ranges",
            "medication_brands": "Medication Brands",
            "generic_salts": "Generic Salt Resolution",
            "dosage_timing": "Dosage & Timing",
            "document_dates": "Document Dates"
        }

        for cat_key, counts in self.category_counts.items():
            gt = counts["ground_truth"]
            ext = counts["extracted"]
            tp, fp, fn = counts["tp"], counts["fp"], counts["fn"]
            total_gt += gt
            total_ext += ext
            total_tp += tp
            total_fp += fp
            total_fn += fn
            p, r, f1 = compute_prf1(tp, fp, fn)
            report[cat_key] = {
                "name": readable_names.get(cat_key, cat_key),
                "ground_truth": gt,
                "extracted": ext,
                "precision": p,
                "recall": r,
                "f1": f1,
                "tp": tp,
                "fp": fp,
                "fn": fn
            }

        overall_p, overall_r, overall_f1 = compute_prf1(total_tp, total_fp, total_fn)
        report["overall"] = {
            "name": "OVERALL ACCURACY",
            "ground_truth": total_gt,
            "extracted": total_ext,
            "precision": overall_p,
            "recall": overall_r,
            "f1": overall_f1,
            "tp": total_tp,
            "fp": total_fp,
            "fn": total_fn
        }

        grounding_score = (self.grounding_facts_supported / self.grounding_facts_total * 100.0) if self.grounding_facts_total > 0 else 100.0
        hallucination_rate = 100.0 - grounding_score

        translation_preservation_rate = (self.translation_checks_passed / self.translation_checks_total * 100.0) if self.translation_checks_total > 0 else 100.0
        translation_num_shift = 100.0 - translation_preservation_rate

        abnormality_accuracy = (self.abnormality_checks_passed / self.abnormality_checks_total * 100.0) if self.abnormality_checks_total > 0 else 100.0

        report["safety_and_grounding"] = {
            "grounding_score": round(grounding_score, 2),
            "hallucination_rate": round(hallucination_rate, 2),
            "abnormality_accuracy": round(abnormality_accuracy, 2),
            "translation_num_shift": round(translation_num_shift, 2),
            "translation_preservation_rate": round(translation_preservation_rate, 2)
        }

        return report
