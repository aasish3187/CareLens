"""
CareLens - Vertical GitHub-Style Workflow Diagram Generator
Generates high-resolution SVG, PNG, and JPG diagrams following the vertical
Mermaid / GitHub architecture layout shown in the user's reference image.
"""
import os
import subprocess
from PIL import Image

def generate_vertical_diagram():
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'docs'))
    images_dir = os.path.join(output_dir, 'images')
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(images_dir, exist_ok=True)
    
    html_path = os.path.join(output_dir, 'workflow_diagram.html')
    svg_path = os.path.join(output_dir, 'workflow_diagram.svg')
    png_path = os.path.join(output_dir, 'workflow_diagram.png')
    jpg_path = os.path.join(output_dir, 'workflow_diagram.jpg')
    artifact_png = r'C:\Users\aasis\.gemini\antigravity-ide\brain\43255036-0ef7-4bd8-b1a3-724b567143c8\workflow_diagram.png'
    artifact_jpg = r'C:\Users\aasis\.gemini\antigravity-ide\brain\43255036-0ef7-4bd8-b1a3-724b567143c8\workflow_diagram.jpg'

    # Width: 1200px, Height: 2480px (Clean vertical architecture diagram)
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 2480" width="1200" height="2480" style="background:#0d1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <defs>
    <!-- Card and Glow Filters -->
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.4" />
    </filter>
    <filter id="glow-teal" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <!-- Arrow Markers -->
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#8b949e" />
    </marker>
    <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#58a6ff" />
    </marker>
    <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#3fb950" />
    </marker>
    <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#f85149" />
    </marker>
    <marker id="arrow-gold" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#d29922" />
    </marker>
    <marker id="arrow-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#bc8cff" />
    </marker>
    <marker id="arrow-teal" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#14b8a6" />
    </marker>

    <!-- Database Cylinder Gradients -->
    <linearGradient id="dbGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#161b22" />
      <stop offset="50%" stop-color="#21262d" />
      <stop offset="100%" stop-color="#161b22" />
    </linearGradient>
  </defs>

  <!-- Background Canvas -->
  <rect width="1200" height="2480" fill="#0d1117" />

  <!-- Outer Frame: GitHub README Window Shell -->
  <rect x="25" y="20" width="1150" height="2440" rx="10" fill="#0d1117" stroke="#30363d" stroke-width="1.5" />
  
  <!-- Top Navigation Tab Bar -->
  <path d="M 25 20 L 1175 20 A 10 10 0 0 1 1175 64 L 25 64 A 0 0 0 0 1 25 20 Z" fill="#161b22" />
  <line x1="25" y1="64" x2="1175" y2="64" stroke="#30363d" stroke-width="1.5" />
  
  <!-- README Tab -->
  <rect x="45" y="30" width="100" height="34" rx="6" fill="#0d1117" stroke="#30363d" stroke-width="1" />
  <line x1="45" y1="30" x2="145" y2="30" stroke="#f78166" stroke-width="2" />
  <text x="62" y="52" fill="#e6edf3" font-size="13" font-weight="600">📖 README</text>

  <!-- Title / Badge in header -->
  <text x="165" y="52" fill="#7d8590" font-size="12">CareLens End-to-End Multimodal Healthcare Workflow Architecture</text>

  <!-- Top Right Tool Icons -->
  <g transform="translate(1090, 36)" opacity="0.8">
    <rect x="0" y="0" width="26" height="22" rx="4" fill="#21262d" stroke="#30363d" stroke-width="1" />
    <path d="M 7 11 L 19 11 M 13 5 L 19 11 L 13 17" stroke="#7d8590" stroke-width="1.2" fill="none" />
    <rect x="34" y="0" width="26" height="22" rx="4" fill="#21262d" stroke="#30363d" stroke-width="1" />
    <rect x="40" y="5" width="14" height="12" rx="2" fill="none" stroke="#7d8590" stroke-width="1.2" />
  </g>

  <!-- ========================================================================= -->
  <!-- 1. DUAL-TRACK INTAKE & PRIVACY REDACTION                                  -->
  <!-- ========================================================================= -->
  <g transform="translate(180, 85)">
    <!-- Stage 1 Container Box -->
    <rect x="0" y="0" width="840" height="380" rx="8" fill="#161b22" fill-opacity="0.85" stroke="#30363d" stroke-width="1.5" />
    <text x="420" y="28" fill="#7d8590" font-size="13" font-weight="700" letter-spacing="1" text-anchor="middle">1. DUAL-TRACK INTAKE &amp; PRIVACY REDACTION</text>

    <!-- Node 1.1: Document Upload -->
    <g transform="translate(260, 48)">
      <rect x="0" y="0" width="320" height="52" rx="6" fill="#0d1f2d" stroke="#38bdf8" stroke-width="1.5" />
      <text x="160" y="22" fill="#e6edf3" font-size="12" font-weight="600" text-anchor="middle">📄 Clinical Document Ingestion</text>
      <text x="160" y="39" fill="#7dd3fc" font-size="10.5" text-anchor="middle">PDF, Prescriptions, Lab Reports, Discharge Scans</text>
    </g>

    <!-- Connector: Upload -> SHA-256 -->
    <line x1="420" y1="100" x2="420" y2="120" stroke="#8b949e" stroke-width="1.5" marker-end="url(#arrow)" />

    <!-- Node 1.2: SHA-256 Deduplication -->
    <g transform="translate(270, 120)">
      <rect x="0" y="0" width="300" height="44" rx="6" fill="#161b22" stroke="#58a6ff" stroke-width="1.2" />
      <text x="150" y="20" fill="#e6edf3" font-size="11.5" font-weight="600" text-anchor="middle">⚡ SHA-256 Cryptographic Digest</text>
      <text x="150" y="34" fill="#8b949e" font-size="10" text-anchor="middle">Instant Hash-Key Deduplication Check</text>
    </g>

    <!-- Connector: SHA-256 -> Diamond -->
    <line x1="420" y1="164" x2="420" y2="188" stroke="#8b949e" stroke-width="1.5" marker-end="url(#arrow)" />

    <!-- Decision Diamond 1: Cache Hit? -->
    <g transform="translate(420, 230)">
      <polygon points="0,-36 90,0 0,36 -90,0" fill="#1c2128" stroke="#d29922" stroke-width="1.8" />
      <text x="0" y="-4" fill="#e6edf3" font-size="11" font-weight="600" text-anchor="middle">Cache Hit</text>
      <text x="0" y="11" fill="#e6edf3" font-size="11" font-weight="600" text-anchor="middle">Detected?</text>
    </g>

    <!-- Branch Left: YES (Cache Hit) -->
    <path d="M 330 230 L 170 230 L 170 285" fill="none" stroke="#3fb950" stroke-width="1.5" marker-end="url(#arrow-green)" />
    <!-- Pill: YES -->
    <rect x="210" y="218" width="55" height="18" rx="4" fill="#062319" stroke="#238636" stroke-width="1" />
    <text x="237" y="231" fill="#3fb950" font-size="9.5" font-weight="600" text-anchor="middle">YES [Hit]</text>

    <!-- Node 1.3: Verified Cache Hit -->
    <g transform="translate(40, 285)">
      <rect x="0" y="0" width="260" height="70" rx="6" fill="#062319" stroke="#3fb950" stroke-width="1.5" />
      <text x="130" y="22" fill="#3fb950" font-size="11.5" font-weight="600" text-anchor="middle">⚡ Instant Cache Hit</text>
      <text x="130" y="38" fill="#d1fae5" font-size="10" text-anchor="middle">• Zero Re-computation</text>
      <text x="130" y="53" fill="#d1fae5" font-size="10" text-anchor="middle">• Instant Retrieval &amp; Display (0ms)</text>
    </g>

    <!-- Branch Right: NO (New Document) -->
    <path d="M 510 230 L 670 230 L 670 285" fill="none" stroke="#58a6ff" stroke-width="1.5" marker-end="url(#arrow-blue)" />
    <!-- Pill: NO -->
    <rect x="575" y="218" width="60" height="18" rx="4" fill="#0d1f2d" stroke="#1f6feb" stroke-width="1" />
    <text x="605" y="231" fill="#58a6ff" font-size="9.5" font-weight="600" text-anchor="middle">NO [New]</text>

    <!-- Node 1.4: PII Redaction -->
    <g transform="translate(540, 285)">
      <rect x="0" y="0" width="260" height="70" rx="6" fill="#0d1f2d" stroke="#58a6ff" stroke-width="1.5" />
      <text x="130" y="22" fill="#58a6ff" font-size="11.5" font-weight="600" text-anchor="middle">🛡️ Local PII Redaction</text>
      <text x="130" y="38" fill="#7dd3fc" font-size="10" text-anchor="middle">• Presidio + RegEx Sanitizer</text>
      <text x="130" y="53" fill="#7dd3fc" font-size="10" text-anchor="middle">• Strips Aadhaar, Phone, PAN</text>
    </g>
  </g>

  <!-- Connector: Stage 1 -> Stage 2 -->
  <path d="M 850 440 L 850 480 L 600 480 L 600 500" fill="none" stroke="#58a6ff" stroke-width="1.8" marker-end="url(#arrow-blue)" />
  <rect x="670" y="471" width="105" height="18" rx="4" fill="#161b22" stroke="#30363d" stroke-width="1" />
  <text x="722" y="484" fill="#7d8590" font-size="9.5" text-anchor="middle">Sanitized Stream</text>

  <!-- ========================================================================= -->
  <!-- 2. MULTIMODAL DUAL-PASS AI EXTRACTION                                     -->
  <!-- ========================================================================= -->
  <g transform="translate(180, 500)">
    <!-- Stage 2 Container Box -->
    <rect x="0" y="0" width="840" height="430" rx="8" fill="#161b22" fill-opacity="0.85" stroke="#30363d" stroke-width="1.5" />
    <text x="420" y="28" fill="#7d8590" font-size="13" font-weight="700" letter-spacing="1" text-anchor="middle">2. MULTIMODAL DUAL-PASS AI EXTRACTION</text>

    <!-- Node 2.1: Rasterizer -->
    <g transform="translate(260, 48)">
      <rect x="0" y="0" width="320" height="46" rx="6" fill="#231908" stroke="#fb923c" stroke-width="1.3" />
      <text x="160" y="20" fill="#fed7aa" font-size="11.5" font-weight="600" text-anchor="middle">🖼️ High-Res Rasterizer &amp; OCR Engine</text>
      <text x="160" y="35" fill="#fdba74" font-size="10" text-anchor="middle">300 DPI Document Normalization + OCR Tokens</text>
    </g>

    <!-- Connector: Rasterizer -> BBoxes -->
    <line x1="420" y1="94" x2="420" y2="114" stroke="#8b949e" stroke-width="1.5" marker-end="url(#arrow)" />

    <!-- Node 2.2: Bounding Boxes -->
    <g transform="translate(260, 114)">
      <rect x="0" y="0" width="320" height="46" rx="6" fill="#231908" stroke="#fb923c" stroke-width="1.3" />
      <text x="160" y="20" fill="#fed7aa" font-size="11.5" font-weight="600" text-anchor="middle">📍 Spatial Bounding Box Coordinate Mapper</text>
      <text x="160" y="35" fill="#fdba74" font-size="10" text-anchor="middle">Generates [ymin, xmin, ymax, xmax] Pixel Coordinates</text>
    </g>

    <!-- Connector: BBoxes -> Gemini -->
    <line x1="420" y1="160" x2="420" y2="180" stroke="#8b949e" stroke-width="1.5" marker-end="url(#arrow)" />

    <!-- Node 2.3: Gemini VLM -->
    <g transform="translate(240, 180)">
      <rect x="0" y="0" width="360" height="50" rx="6" fill="#231908" stroke="#f97316" stroke-width="1.5" />
      <text x="180" y="22" fill="#fff7ed" font-size="12" font-weight="700" text-anchor="middle">🤖 Gemini 2.5 Flash VLM Multimodal Parser</text>
      <text x="180" y="38" fill="#fdba74" font-size="10" text-anchor="middle">Strict Temperature 0 · Pydantic JSON-Schema Constrained</text>
    </g>

    <!-- Connector: Gemini -> Diamond -->
    <line x1="420" y1="230" x2="420" y2="255" stroke="#8b949e" stroke-width="1.5" marker-end="url(#arrow)" />

    <!-- Decision Diamond 2: Modality -->
    <g transform="translate(420, 296)">
      <polygon points="0,-36 96,0 0,36 -96,0" fill="#1c2128" stroke="#d29922" stroke-width="1.8" />
      <text x="0" y="-4" fill="#e6edf3" font-size="11" font-weight="600" text-anchor="middle">Document</text>
      <text x="0" y="11" fill="#e6edf3" font-size="11" font-weight="600" text-anchor="middle">Category?</text>
    </g>

    <!-- Sub-Branch 1: Prescription -->
    <path d="M 324 296 L 150 296 L 150 345" fill="none" stroke="#fb923c" stroke-width="1.5" marker-end="url(#arrow)" />
    <!-- Sub-Branch 2: Lab Report -->
    <line x1="420" y1="332" x2="420" y2="345" stroke="#fb923c" stroke-width="1.5" marker-end="url(#arrow)" />
    <!-- Sub-Branch 3: Discharge Summary -->
    <path d="M 516 296 L 690 296 L 690 345" fill="none" stroke="#fb923c" stroke-width="1.5" marker-end="url(#arrow)" />

    <!-- Prescription Box -->
    <g transform="translate(30, 345)">
      <rect x="0" y="0" width="240" height="70" rx="6" fill="#161b22" stroke="#fb923c" stroke-width="1.2" />
      <text x="120" y="20" fill="#fed7aa" font-size="11" font-weight="600" text-anchor="middle">💊 Prescription / Rx</text>
      <text x="120" y="36" fill="#8b949e" font-size="9.5" text-anchor="middle">• Brand &amp; Generic Salts</text>
      <text x="120" y="50" fill="#8b949e" font-size="9.5" text-anchor="middle">• Dosage, Schedule, Refills</text>
      <text x="120" y="63" fill="#8b949e" font-size="9.5" text-anchor="middle">• Admin Timing (Before/After)</text>
    </g>

    <!-- Lab Report Box -->
    <g transform="translate(300, 345)">
      <rect x="0" y="0" width="240" height="70" rx="6" fill="#161b22" stroke="#38bdf8" stroke-width="1.2" />
      <text x="120" y="20" fill="#7dd3fc" font-size="11" font-weight="600" text-anchor="middle">🧪 Diagnostic Lab Report</text>
      <text x="120" y="36" fill="#8b949e" font-size="9.5" text-anchor="middle">• Quantitative Values &amp; Units</text>
      <text x="120" y="50" fill="#8b949e" font-size="9.5" text-anchor="middle">• Lab Reference Intervals</text>
      <text x="120" y="63" fill="#8b949e" font-size="9.5" text-anchor="middle">• LOINC Code Resolution</text>
    </g>

    <!-- Discharge Box -->
    <g transform="translate(570, 345)">
      <rect x="0" y="0" width="240" height="70" rx="6" fill="#161b22" stroke="#a78bfa" stroke-width="1.2" />
      <text x="120" y="20" fill="#ddd6fe" font-size="11" font-weight="600" text-anchor="middle">📋 Clinical Summary</text>
      <text x="120" y="36" fill="#8b949e" font-size="9.5" text-anchor="middle">• Diagnoses &amp; ICD-10</text>
      <text x="120" y="50" fill="#8b949e" font-size="9.5" text-anchor="middle">• Procedures &amp; Advice</text>
      <text x="120" y="63" fill="#8b949e" font-size="9.5" text-anchor="middle">• Physician / Hospital Details</text>
    </g>
  </g>

  <!-- Connectors: Stage 2 Branches -> Stage 3 Engine -->
  <path d="M 330 915 L 330 945 L 600 945 L 600 970" fill="none" stroke="#8b949e" stroke-width="1.5" />
  <path d="M 600 915 L 600 970" fill="none" stroke="#8b949e" stroke-width="1.5" />
  <path d="M 870 915 L 870 945 L 600 945 L 600 970" fill="none" stroke="#8b949e" stroke-width="1.5" marker-end="url(#arrow)" />

  <!-- ========================================================================= -->
  <!-- 3. DETERMINISTIC CLINICAL RULES & VALIDATION                               -->
  <!-- ========================================================================= -->
  <g transform="translate(180, 970)">
    <!-- Stage 3 Container Box (Height 470px for ample breathing room) -->
    <rect x="0" y="0" width="840" height="470" rx="8" fill="#161b22" fill-opacity="0.85" stroke="#30363d" stroke-width="1.5" />
    <text x="420" y="28" fill="#7d8590" font-size="13" font-weight="700" letter-spacing="1" text-anchor="middle">3. DETERMINISTIC CLINICAL RULES &amp; VALIDATION</text>

    <!-- Node 3.1: Deterministic Engine -->
    <g transform="translate(190, 48)">
      <rect x="0" y="0" width="460" height="54" rx="6" fill="#161b22" stroke="#eab308" stroke-width="1.5" />
      <text x="230" y="22" fill="#fef08a" font-size="12" font-weight="700" text-anchor="middle">🔬 Deterministic Rules Engine (ICMR / WHO / LOINC)</text>
      <text x="230" y="40" fill="#facc15" font-size="10" font-weight="600" text-anchor="middle">⚠️ Strict Rule: Zero LLM Guessing · 100% Deterministic Code</text>
    </g>

    <!-- Connector: Engine -> Diamond -->
    <line x1="420" y1="102" x2="420" y2="132" stroke="#8b949e" stroke-width="1.5" marker-end="url(#arrow)" />

    <!-- Decision Diamond 3: Is Value Abnormal? -->
    <g transform="translate(420, 172)">
      <polygon points="0,-34 94,0 0,34 -94,0" fill="#1c2128" stroke="#d29922" stroke-width="1.8" />
      <text x="0" y="-4" fill="#e6edf3" font-size="11" font-weight="600" text-anchor="middle">Is Value</text>
      <text x="0" y="11" fill="#e6edf3" font-size="11" font-weight="600" text-anchor="middle">Abnormal?</text>
    </g>

    <!-- Branch Left: YES (Abnormal Finding) -->
    <path d="M 326 172 L 150 172 L 150 240" fill="none" stroke="#f85149" stroke-width="1.5" marker-end="url(#arrow-red)" />
    <!-- Pill: YES -->
    <rect x="195" y="160" width="55" height="18" rx="4" fill="#2d0d15" stroke="#da3633" stroke-width="1" />
    <text x="222" y="173" fill="#f85149" font-size="9.5" font-weight="600" text-anchor="middle">YES</text>

    <!-- Node 3.2: Flagged Abnormal Finding -->
    <g transform="translate(30, 240)">
      <rect x="0" y="0" width="240" height="74" rx="6" fill="#2d0d15" stroke="#f85149" stroke-width="1.5" />
      <text x="120" y="22" fill="#f85149" font-size="11.5" font-weight="700" text-anchor="middle">🚨 Flagged Abnormal Finding</text>
      <text x="120" y="38" fill="#fca5a5" font-size="10" text-anchor="middle">• Status: Critical / High / Low</text>
      <text x="120" y="52" fill="#fca5a5" font-size="10" text-anchor="middle">• Clinical Warning &amp; ICMR Delta</text>
      <text x="120" y="65" fill="#fca5a5" font-size="10" text-anchor="middle">• Requires Follow-up Review</text>
    </g>

    <!-- Branch Center: NO (Normal Range) -->
    <path d="M 420 206 L 420 240" fill="none" stroke="#3fb950" stroke-width="1.5" marker-end="url(#arrow-green)" />
    <!-- Pill: NO -->
    <rect x="430" y="212" width="45" height="18" rx="4" fill="#062319" stroke="#238636" stroke-width="1" />
    <text x="452" y="225" fill="#3fb950" font-size="9.5" font-weight="600" text-anchor="middle">NO</text>

    <!-- Node 3.3: Normal Baseline -->
    <g transform="translate(300, 240)">
      <rect x="0" y="0" width="165" height="74" rx="6" fill="#062319" stroke="#3fb950" stroke-width="1.5" />
      <text x="82" y="22" fill="#3fb950" font-size="11.5" font-weight="700" text-anchor="middle">✅ Normal Range</text>
      <text x="82" y="38" fill="#86efac" font-size="10" text-anchor="middle">• Baseline Normal</text>
      <text x="82" y="52" fill="#86efac" font-size="10" text-anchor="middle">• LOINC Code Verified</text>
      <text x="82" y="65" fill="#86efac" font-size="10" text-anchor="middle">• Homeostatic State</text>
    </g>

    <!-- Database Cylinder 3.4: CareLens Health Store -->
    <g transform="translate(495, 215)">
      <!-- Cylinder Body -->
      <path d="M 0 25 C 0 8, 140 8, 140 25 L 140 105 C 140 122, 0 122, 0 105 Z" fill="url(#dbGrad)" stroke="#58a6ff" stroke-width="1.5" />
      <!-- Top Cap -->
      <ellipse cx="70" cy="25" rx="70" ry="16" fill="#21262d" stroke="#58a6ff" stroke-width="1.5" />
      <!-- Interior Disc Ribs -->
      <path d="M 0 52 C 0 66, 140 66, 140 52" fill="none" stroke="#58a6ff" stroke-width="1" stroke-dasharray="3,3" />
      <path d="M 0 78 C 0 92, 140 92, 140 78" fill="none" stroke="#58a6ff" stroke-width="1" stroke-dasharray="3,3" />
      <text x="70" y="24" fill="#58a6ff" font-size="11" font-weight="700" text-anchor="middle">🗄️ CareLens</text>
      <text x="70" y="38" fill="#e6edf3" font-size="10" font-weight="600" text-anchor="middle">Unified Store</text>
      <text x="70" y="70" fill="#8b949e" font-size="9" text-anchor="middle">SQLite / FHIR DB</text>
      <text x="70" y="96" fill="#8b949e" font-size="9" text-anchor="middle">SHA-256 Cache</text>
    </g>

    <!-- Node 3.5: Polypharmacy Collision Matrix -->
    <g transform="translate(660, 240)">
      <rect x="0" y="0" width="155" height="74" rx="6" fill="#1c2128" stroke="#fb923c" stroke-width="1.3" />
      <text x="77" y="20" fill="#fed7aa" font-size="11" font-weight="700" text-anchor="middle">⚠️ Drug Clash</text>
      <text x="77" y="36" fill="#8b949e" font-size="9.5" text-anchor="middle">• Duplicate Salts</text>
      <text x="77" y="50" fill="#8b949e" font-size="9.5" text-anchor="middle">• Cumulative Doses</text>
      <text x="77" y="64" fill="#8b949e" font-size="9.5" text-anchor="middle">• Multi-Doctor Clash</text>
    </g>

    <!-- Connections to DB -->
    <path d="M 270 277 L 495 277" fill="none" stroke="#8b949e" stroke-width="1.2" marker-end="url(#arrow)" />
    <path d="M 465 277 L 495 277" fill="none" stroke="#8b949e" stroke-width="1.2" marker-end="url(#arrow)" />
    <path d="M 635 277 L 660 277" fill="none" stroke="#8b949e" stroke-width="1.2" marker-end="url(#arrow)" />

    <!-- Stage 3 Output Connector from DB -->
    <path d="M 565 340 L 565 385 L 420 385 L 420 445" fill="none" stroke="#bc8cff" stroke-width="1.5" marker-end="url(#arrow-purple)" />
    <rect x="450" y="376" width="100" height="18" rx="4" fill="#161b22" stroke="#30363d" stroke-width="1" />
    <text x="500" y="389" fill="#bc8cff" font-size="9.5" text-anchor="middle">Verified Facts</text>
  </g>

  <!-- Connector: Stage 3 -> Stage 4 -->
  <line x1="600" y1="1440" x2="600" y2="1475" stroke="#bc8cff" stroke-width="1.8" marker-end="url(#arrow-purple)" />

  <!-- ========================================================================= -->
  <!-- 4. FACT-GROUNDED REASONING & LOCALIZATION                                  -->
  <!-- ========================================================================= -->
  <g transform="translate(180, 1475)">
    <!-- Stage 4 Container Box -->
    <rect x="0" y="0" width="840" height="410" rx="8" fill="#161b22" fill-opacity="0.85" stroke="#30363d" stroke-width="1.5" />
    <text x="420" y="28" fill="#7d8590" font-size="13" font-weight="700" letter-spacing="1" text-anchor="middle">4. FACT-GROUNDED REASONING &amp; LOCALIZATION</text>

    <!-- Node 4.1: Canonical Fact IDs -->
    <g transform="translate(240, 48)">
      <rect x="0" y="0" width="360" height="46" rx="6" fill="#220e2e" stroke="#c084fc" stroke-width="1.3" />
      <text x="180" y="20" fill="#f3e8ff" font-size="11.5" font-weight="600" text-anchor="middle">🏷️ Canonical Fact Assembly with Persistent IDs</text>
      <text x="180" y="35" fill="#d8b4fe" font-size="10" text-anchor="middle">Assigns Unique IDs: [fact_01], [fact_02], [med_01], [diag_01]</text>
    </g>

    <!-- Connector: Fact IDs -> Synthesizer -->
    <line x1="420" y1="94" x2="420" y2="114" stroke="#8b949e" stroke-width="1.5" marker-end="url(#arrow)" />

    <!-- Node 4.2: Grounded Synthesizer -->
    <g transform="translate(240, 114)">
      <rect x="0" y="0" width="360" height="46" rx="6" fill="#220e2e" stroke="#c084fc" stroke-width="1.3" />
      <text x="180" y="20" fill="#f3e8ff" font-size="11.5" font-weight="600" text-anchor="middle">📝 Grounded Narrative Patient Synthesizer</text>
      <text x="180" y="35" fill="#d8b4fe" font-size="10" text-anchor="middle">Translates Complex Clinical Jargon into Plain Language</text>
    </g>

    <!-- Connector: Synthesizer -> Diamond -->
    <line x1="420" y1="160" x2="420" y2="182" stroke="#8b949e" stroke-width="1.5" marker-end="url(#arrow)" />

    <!-- Decision Diamond 4: Strict Citation Verification -->
    <g transform="translate(420, 222)">
      <polygon points="0,-36 96,0 0,36 -96,0" fill="#1c2128" stroke="#d29922" stroke-width="1.8" />
      <text x="0" y="-4" fill="#e6edf3" font-size="11" font-weight="600" text-anchor="middle">Fact-Citing</text>
      <text x="0" y="11" fill="#e6edf3" font-size="11" font-weight="600" text-anchor="middle">Verified?</text>
    </g>

    <!-- Branch Left: NO (Uncited -> Rejection Gate) -->
    <path d="M 324 222 L 170 222 L 170 280" fill="none" stroke="#f85149" stroke-width="1.5" marker-end="url(#arrow-red)" />
    <!-- Pill: NO -->
    <rect x="205" y="210" width="65" height="18" rx="4" fill="#2d0d15" stroke="#da3633" stroke-width="1" />
    <text x="237" y="223" fill="#f85149" font-size="9.5" font-weight="600" text-anchor="middle">NO [Uncited]</text>

    <!-- Node 4.3: Rejection Gate -->
    <g transform="translate(50, 280)">
      <rect x="0" y="0" width="240" height="70" rx="6" fill="#2d0d15" stroke="#f85149" stroke-width="1.5" />
      <text x="120" y="22" fill="#f85149" font-size="11.5" font-weight="700" text-anchor="middle">⛔ REJECTION GATE</text>
      <text x="120" y="38" fill="#fca5a5" font-size="10" text-anchor="middle">• Rejects any hallucinated claim</text>
      <text x="120" y="52" fill="#fca5a5" font-size="10" text-anchor="middle">• Output discarded if facts</text>
      <text x="120" y="65" fill="#fca5a5" font-size="10" text-anchor="middle">  do not link to input IDs</text>
    </g>

    <!-- Branch Right: YES (100% Grounded -> Localization) -->
    <path d="M 516 222 L 670 222 L 670 280" fill="none" stroke="#3fb950" stroke-width="1.5" marker-end="url(#arrow-green)" />
    <!-- Pill: YES -->
    <rect x="560" y="210" width="75" height="18" rx="4" fill="#062319" stroke="#238636" stroke-width="1" />
    <text x="597" y="223" fill="#3fb950" font-size="9.5" font-weight="600" text-anchor="middle">YES [Grounded]</text>

    <!-- Node 4.4: Trilingual Localization -->
    <g transform="translate(540, 280)">
      <rect x="0" y="0" width="260" height="70" rx="6" fill="#220e2e" stroke="#c084fc" stroke-width="1.5" />
      <text x="130" y="22" fill="#f3e8ff" font-size="11.5" font-weight="700" text-anchor="middle">🌐 Trilingual Localization Engine</text>
      <text x="130" y="38" fill="#d8b4fe" font-size="10" text-anchor="middle">• English · Telugu (తెలుగు)</text>
      <text x="130" y="52" fill="#d8b4fe" font-size="10" text-anchor="middle">• Hindi (हिन्दी) Domain Glossaries</text>
      <text x="130" y="65" fill="#d8b4fe" font-size="10" text-anchor="middle">• Grounded Explanations with Citations</text>
    </g>
  </g>

  <!-- Connector: Stage 4 -> Stage 5 (Broad Dispatch Bus) -->
  <path d="M 850 1825 L 850 1900 L 600 1900 L 600 1925" fill="none" stroke="#14b8a6" stroke-width="1.8" marker-end="url(#arrow-teal)" />
  <rect x="670" y="1891" width="115" height="18" rx="4" fill="#161b22" stroke="#30363d" stroke-width="1" />
  <text x="727" y="1904" fill="#14b8a6" font-size="9.5" font-weight="600" text-anchor="middle">Dispatched Bundle</text>

  <!-- ========================================================================= -->
  <!-- 5. MULTI-SURFACE CLINICAL PRESENTATION & ABDM FHIR R4                      -->
  <!-- ========================================================================= -->
  <g transform="translate(50, 1925)">
    <!-- Stage 5 Container Box -->
    <rect x="0" y="0" width="1100" height="420" rx="8" fill="#161b22" fill-opacity="0.85" stroke="#30363d" stroke-width="1.5" />
    <text x="550" y="28" fill="#7d8590" font-size="13" font-weight="700" letter-spacing="1" text-anchor="middle">5. MULTI-SURFACE CLINICAL PRESENTATION &amp; ABDM FHIR R4</text>

    <!-- Dispatch Bus Horizontal Line -->
    <line x1="100" y1="60" x2="1000" y2="60" stroke="#14b8a6" stroke-width="1.5" />
    
    <!-- 5 Drops to Sub-Surfaces -->
    <line x1="100" y1="60" x2="100" y2="90" stroke="#14b8a6" stroke-width="1.5" marker-end="url(#arrow-teal)" />
    <line x1="325" y1="60" x2="325" y2="90" stroke="#14b8a6" stroke-width="1.5" marker-end="url(#arrow-teal)" />
    <line x1="550" y1="60" x2="550" y2="90" stroke="#14b8a6" stroke-width="1.5" marker-end="url(#arrow-teal)" />
    <line x1="775" y1="60" x2="775" y2="90" stroke="#14b8a6" stroke-width="1.5" marker-end="url(#arrow-teal)" />
    <line x1="1000" y1="60" x2="1000" y2="90" stroke="#14b8a6" stroke-width="1.5" marker-end="url(#arrow-teal)" />

    <!-- Surface 1: 3D Body Twin -->
    <g transform="translate(10, 90)">
      <rect x="0" y="0" width="195" height="150" rx="6" fill="#042f2e" stroke="#14b8a6" stroke-width="1.5" />
      <text x="97" y="24" fill="#5eead4" font-size="11.5" font-weight="700" text-anchor="middle">🧍 3D Anatomical Twin</text>
      <text x="97" y="44" fill="#e6edf3" font-size="10" font-weight="600" text-anchor="middle">Three.js WebGL</text>
      <text x="97" y="65" fill="#99f6e4" font-size="9" text-anchor="middle">• Organ Telemetry Beacons</text>
      <text x="97" y="80" fill="#99f6e4" font-size="9" text-anchor="middle">• Biomarker Shader Heatmap</text>
      <text x="97" y="95" fill="#99f6e4" font-size="9" text-anchor="middle">• 7 Anatomical Systems</text>
      <text x="97" y="110" fill="#99f6e4" font-size="9" text-anchor="middle">• Interactive Fly-Through</text>
      <rect x="25" y="122" width="145" height="18" rx="4" fill="#134e4a" />
      <text x="97" y="135" fill="#2dd4bf" font-size="9" font-weight="600" text-anchor="middle">LOINC-to-Organ Mapping</text>
    </g>

    <!-- Surface 2: Evidence Studio -->
    <g transform="translate(225, 90)">
      <rect x="0" y="0" width="195" height="150" rx="6" fill="#082f49" stroke="#38bdf8" stroke-width="1.5" />
      <text x="97" y="24" fill="#7dd3fc" font-size="11.5" font-weight="700" text-anchor="middle">🔍 Evidence Studio</text>
      <text x="97" y="44" fill="#e6edf3" font-size="10" font-weight="600" text-anchor="middle">Split-Screen Provenance</text>
      <text x="97" y="65" fill="#bae6fd" font-size="9" text-anchor="middle">• Bounding Box Highlighting</text>
      <text x="97" y="80" fill="#bae6fd" font-size="9" text-anchor="middle">• 100% Visual Verification</text>
      <text x="97" y="95" fill="#bae6fd" font-size="9" text-anchor="middle">• Raw OCR Text Snippets</text>
      <text x="97" y="110" fill="#bae6fd" font-size="9" text-anchor="middle">• Bidirectional Zoom Sync</text>
      <rect x="25" y="122" width="145" height="18" rx="4" fill="#075985" />
      <text x="97" y="135" fill="#38bdf8" font-size="9" font-weight="600" text-anchor="middle">Zero Hallucination Audit</text>
    </g>

    <!-- Surface 3: Unified Medications -->
    <g transform="translate(440, 90)">
      <rect x="0" y="0" width="195" height="150" rx="6" fill="#231908" stroke="#fb923c" stroke-width="1.5" />
      <text x="97" y="24" fill="#fed7aa" font-size="11.5" font-weight="700" text-anchor="middle">💊 Medication Manager</text>
      <text x="97" y="44" fill="#e6edf3" font-size="10" font-weight="600" text-anchor="middle">Active Therapy Tracker</text>
      <text x="97" y="65" fill="#ffedd5" font-size="9" text-anchor="middle">• 300,000+ Indian Brands</text>
      <text x="97" y="80" fill="#ffedd5" font-size="9" text-anchor="middle">• Active Salt Normalization</text>
      <text x="97" y="95" fill="#ffedd5" font-size="9" text-anchor="middle">• Timing &amp; Food Guidance</text>
      <text x="97" y="110" fill="#ffedd5" font-size="9" text-anchor="middle">• Duplicate Therapy Alert</text>
      <rect x="25" y="122" width="145" height="18" rx="4" fill="#7c2d12" />
      <text x="97" y="135" fill="#fb923c" font-size="9" font-weight="600" text-anchor="middle">RapidFuzz Salt Engine</text>
    </g>

    <!-- Surface 4: Health Timeline -->
    <g transform="translate(655, 90)">
      <rect x="0" y="0" width="195" height="150" rx="6" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.5" />
      <text x="97" y="24" fill="#c7d2fe" font-size="11.5" font-weight="700" text-anchor="middle">📈 Health Timeline</text>
      <text x="97" y="44" fill="#e6edf3" font-size="10" font-weight="600" text-anchor="middle">Longitudinal Trajectory</text>
      <text x="97" y="65" fill="#e0e7ff" font-size="9" text-anchor="middle">• Multi-Document History</text>
      <text x="97" y="80" fill="#e0e7ff" font-size="9" text-anchor="middle">• Lab Biomarker Trends</text>
      <text x="97" y="95" fill="#e0e7ff" font-size="9" text-anchor="middle">• Chronological Encounters</text>
      <text x="97" y="110" fill="#e0e7ff" font-size="9" text-anchor="middle">• Fast Filtering by Organ</text>
      <rect x="25" y="122" width="145" height="18" rx="4" fill="#312e81" />
      <text x="97" y="135" fill="#818cf8" font-size="9" font-weight="600" text-anchor="middle">Multi-Year Trajectory</text>
    </g>

    <!-- Surface 5: ABDM FHIR & ABHA -->
    <g transform="translate(870, 90)">
      <rect x="0" y="0" width="220" height="150" rx="6" fill="#062319" stroke="#10b981" stroke-width="1.5" />
      <text x="110" y="24" fill="#6ee7b7" font-size="11.5" font-weight="700" text-anchor="middle">🏥 ABDM FHIR R4 &amp; ABHA</text>
      <text x="110" y="44" fill="#e6edf3" font-size="10" font-weight="600" text-anchor="middle">National Interoperability</text>
      <text x="110" y="65" fill="#d1fae5" font-size="9" text-anchor="middle">• NRCeS Compliant Bundles</text>
      <text x="110" y="80" fill="#d1fae5" font-size="9" text-anchor="middle">• Mock ABHA 14-Digit Card</text>
      <text x="110" y="95" fill="#d1fae5" font-size="9" text-anchor="middle">• Cryptographic QR Export</text>
      <text x="110" y="110" fill="#d1fae5" font-size="9" text-anchor="middle">• DiagnosticReport &amp; Obs</text>
      <rect x="25" y="122" width="170" height="18" rx="4" fill="#064e3b" />
      <text x="110" y="135" fill="#34d399" font-size="9" font-weight="600" text-anchor="middle">HL7 FHIR R4 Standard</text>
    </g>

    <!-- Bottom Summary Banner -->
    <g transform="translate(150, 275)">
      <rect x="0" y="0" width="800" height="110" rx="8" fill="#0d1117" stroke="#30363d" stroke-width="1.2" />
      <text x="400" y="30" fill="#e6edf3" font-size="13" font-weight="700" text-anchor="middle">🛡️ Core Safety Contract &amp; Architecture Principles</text>
      <text x="400" y="55" fill="#7dd3fc" font-size="11" text-anchor="middle">1. Abnormal Flags Computed Deterministically By Code (ICMR/NABL/LOINC) — NEVER Guessed by LLM</text>
      <text x="400" y="75" fill="#fca5a5" font-size="11" text-anchor="middle">2. Rejection Gate Discards Uncited Claims — 100% Grounded Provenance with Pixel Bounding Boxes</text>
      <text x="400" y="95" fill="#86efac" font-size="11" text-anchor="middle">3. Privacy Fortress: Local PII Redaction + Temperature 0 Constrained JSON Decoding</text>
    </g>
  </g>

  <!-- ========================================================================= -->
  <!-- FLOATING NAVIGATION DOCK (BOTTOM RIGHT - LIKE GITHUB MERMAID CONTROLS)    -->
  <!-- ========================================================================= -->
  <g transform="translate(1105, 2340)" opacity="0.9">
    <rect x="0" y="0" width="60" height="90" rx="6" fill="#161b22" stroke="#30363d" stroke-width="1" />
    <!-- Pan Up -->
    <rect x="20" y="8" width="20" height="16" rx="3" fill="#21262d" />
    <path d="M 26 18 L 30 14 L 34 18" stroke="#7d8590" stroke-width="1.2" fill="none" />
    <!-- Pan Left / Right -->
    <rect x="8" y="28" width="20" height="16" rx="3" fill="#21262d" />
    <path d="M 19 32 L 15 36 L 19 40" stroke="#7d8590" stroke-width="1.2" fill="none" />
    <rect x="32" y="28" width="20" height="16" rx="3" fill="#21262d" />
    <path d="M 41 32 L 45 36 L 41 40" stroke="#7d8590" stroke-width="1.2" fill="none" />
    <!-- Pan Down -->
    <rect x="20" y="48" width="20" height="16" rx="3" fill="#21262d" />
    <path d="M 26 54 L 30 58 L 34 54" stroke="#7d8590" stroke-width="1.2" fill="none" />
    <!-- Reset Zoom -->
    <rect x="12" y="68" width="36" height="16" rx="3" fill="#21262d" />
    <text x="30" y="79" fill="#7d8590" font-size="9" text-anchor="middle">RESET</text>
  </g>

</svg>'''

    # 1. Write SVG
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print(f"Written SVG: {svg_path}")

    # 2. Write HTML wrapper for crisp rendering
    html_content = f'''<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{ background: #0d1117; display: flex; justify-content: center; align-items: flex-start; padding: 20px; }}
  svg {{ width: 1200px; height: 2480px; }}
</style>
</head>
<body>
{svg_content}
</body>
</html>'''

    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"Written HTML: {html_path}")

    # 3. Render PNG using Headless Chrome
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if os.path.exists(chrome_path):
        cmd = [
            chrome_path,
            "--headless=new",
            "--disable-gpu",
            "--force-device-scale-factor=1",
            "--window-size=1240,2560",
            f"--screenshot={png_path}",
            f"file:///{html_path.replace(os.sep, '/')}"
        ]
        print("Rendering PNG with Chrome...")
        res = subprocess.run(cmd, capture_output=True, text=True)
        print("Chrome output:", res.returncode)

    # 4. Generate JPG and copy to destinations
    if os.path.exists(png_path):
        im = Image.open(png_path)
        im_rgb = im.convert('RGB')
        im_rgb.save(jpg_path, 'JPEG', quality=95, optimize=True)
        print(f"Saved JPG: {jpg_path}")

        # Copy to docs/images
        im.save(os.path.join(images_dir, 'workflow_diagram.png'), 'PNG')
        im_rgb.save(os.path.join(images_dir, 'workflow_diagram.jpg'), 'JPEG', quality=95, optimize=True)

        # Copy to brain artifact directory for user embedding
        im.save(artifact_png, 'PNG')
        im_rgb.save(artifact_jpg, 'JPEG', quality=95, optimize=True)
        print("Copied to artifacts and docs/images!")

if __name__ == '__main__':
    generate_vertical_diagram()
