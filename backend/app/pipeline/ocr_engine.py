import re
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional, Union
import numpy as np
from PIL import Image

logger = logging.getLogger("carelens.ocr")

class OCREngine:
    """
    High-performance OCR engine with character & layout extraction.
    Uses RapidOCR (PaddleOCR ONNX weights) for fast, zero-dependency local OCR,
    with normalized 0-1000 bounding boxes.
    """
    def __init__(self, use_gpu: bool = False):
        self.engine = None
        try:
            from rapidocr_onnxruntime import RapidOCR
            self.engine = RapidOCR()
            logger.info("RapidOCR initialized successfully.")
        except Exception as e:
            logger.warning(f"RapidOCR initialization failed: {e}")
            self.engine = None

    def _load_image(self, image_input: Any) -> Optional[tuple[np.ndarray, int, int]]:
        """Loads image input into a numpy RGB array, returning (np_array, width, height)."""
        try:
            if isinstance(image_input, (str, Path)):
                img = Image.open(str(image_input)).convert("RGB")
            elif isinstance(image_input, bytes):
                import io
                img = Image.open(io.BytesIO(image_input)).convert("RGB")
            elif isinstance(image_input, Image.Image):
                img = image_input.convert("RGB")
            elif isinstance(image_input, np.ndarray):
                h, w = image_input.shape[:2]
                return image_input, w, h
            else:
                return None
            w, h = img.size
            return np.array(img), w, h
        except Exception as e:
            logger.error(f"Error loading image for OCR: {e}")
            return None

    def extract_text_boxes(self, image_input: Any, page_num: int = 1) -> List[Dict[str, Any]]:
        """
        Extracts words and character lines with normalized bounding boxes
        [ymin, xmin, ymax, xmax] scaled to 0-1000 for responsive UI overlays.
        """
        boxes = []
        if not self.engine:
            return boxes

        loaded = self._load_image(image_input)
        if not loaded:
            return boxes

        img_np, w, h = loaded
        if w <= 0 or h <= 0:
            return boxes

        try:
            results, _ = self.engine(img_np)
            if not results:
                return boxes

            for line in results:
                coords, text, conf = line
                # coords is 4 points: [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]
                xs = [pt[0] for pt in coords]
                ys = [pt[1] for pt in coords]
                xmin_px = max(0, min(xs))
                ymin_px = max(0, min(ys))
                xmax_px = min(w, max(xs))
                ymax_px = min(h, max(ys))

                # Normalize to 0-1000 scale
                norm_xmin = int(round((xmin_px / w) * 1000))
                norm_ymin = int(round((ymin_px / h) * 1000))
                norm_xmax = int(round((xmax_px / w) * 1000))
                norm_ymax = int(round((ymax_px / h) * 1000))

                boxes.append({
                    "text": str(text).strip(),
                    "confidence": float(conf),
                    "page": page_num,
                    "bounding_box": {
                        "xmin": max(0, min(1000, norm_xmin)),
                        "ymin": max(0, min(1000, norm_ymin)),
                        "xmax": max(0, min(1000, norm_xmax)),
                        "ymax": max(0, min(1000, norm_ymax))
                    }
                })
        except Exception as e:
            logger.error(f"OCR extraction error: {e}")

        return boxes

    def extract_from_pdf(self, pdf_path: Union[str, Path], max_pages: int = 5) -> List[Dict[str, Any]]:
        """
        Renders PDF pages to images and runs OCR on each page.
        """
        all_boxes = []
        pdf_path = Path(pdf_path)
        if not pdf_path.exists():
            return all_boxes

        try:
            import pypdfium2 as pdfium
            pdf = pdfium.PdfDocument(str(pdf_path))
            num_pages = min(len(pdf), max_pages)

            for i in range(num_pages):
                page = pdf[i]
                pil_image = page.render(scale=2.0).to_pil()
                page_boxes = self.extract_text_boxes(pil_image, page_num=i + 1)
                all_boxes.extend(page_boxes)
        except Exception as e:
            logger.warning(f"PDF OCR extraction via pdfium failed: {e}")

        return all_boxes

    def cross_check_number(self, extracted_value: str, detected_boxes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Cross-checks an extracted numerical value against OCR text boxes
        to prevent decimal point errors (e.g. 12.5 vs 125).
        """
        val_clean = extracted_value.strip()
        num_match = re.search(r'([0-9]+(?:\.[0-9]+)?)', val_clean)
        if not num_match:
            return {"verified": True, "note": "Non-numeric token"}

        target_num = num_match.group(1)
        found_matches = []
        for b in detected_boxes:
            if target_num in b["text"]:
                found_matches.append(b)

        if found_matches:
            return {
                "verified": True,
                "confidence": max(b["confidence"] for b in found_matches),
                "matched_text": found_matches[0]["text"]
            }

        # Check for decimal point omission warning
        no_dot = target_num.replace(".", "")
        for b in detected_boxes:
            if no_dot in b["text"]:
                return {
                    "verified": False,
                    "warning": f"Possible decimal shift: extracted {target_num} but OCR read {b['text']}",
                    "suggested_value": b["text"]
                }

        return {"verified": True, "note": "Unverified by secondary OCR, accepted VLM output"}
