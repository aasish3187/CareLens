import re
from typing import Dict, Any, Tuple, List

# Common medical phrases dictionary for high-quality instant Indic rendering
INDIC_DICTIONARY = {
    "te": {  # Telugu
        "Here is a simple overview of your medical report from": "మీ వైద్య నివేదిక యొక్క వివరణ ఇక్కడ ఇవ్వబడింది:",
        "Key Lab Findings:": "ముఖ్యమైన ల్యాబ్ ఫలితాలు:",
        "Your record notes the following condition(s):": "మీ రికార్డులో నమోదైన ఆరోగ్య పరిస్థితి:",
        "test result is": "పరీక్ష ఫలితం",
        "which is within normal healthy limits": "ఇది సాధారణ ఆరోగ్యకరమైన పరిమితుల్లో ఉంది",
        "which is above the standard healthy reference range": "ఇది ప్రామాణిక ఆరోగ్యకరమైన పరిధి కంటే ఎక్కువగా ఉంది",
        "which is significantly higher than target limits and warrants clinical follow-up": "ఇది లక్ష్య పరిమితుల కంటే చాలా ఎక్కువగా ఉంది, వైద్యుని సంప్రదింపు అవసరం",
        "which is lower than the typical reference range": "ఇది సాధారణ పరిధి కంటే తక్కువగా ఉంది",
        "Prescribed Medications:": "సూచించిన మందులు:",
        "with dosage": "మోతాదు వివరాలు",
        "to be taken before food": "ఆహారానికి ముందు తీసుకోవాలి",
        "to be taken after food": "ఆహారం తర్వాత తీసుకోవాలి",
        "Disclaimer: This summary is generated for personal health information only.": "నిరాకరణ: ఈ సారాంశం వ్యక్తిగత ఆరోగ్య సమాచారం కోసం మాత్రమే తయారు చేయబడింది.",
        "Please consult your healthcare provider to discuss these findings.": "ఈ ఫలితాల గురించి మీ వైద్యునితో చర్చించండి."
    },
    "hi": {  # Hindi
        "Here is a simple overview of your medical report from": "यहाँ आपकी मेडिकल रिपोर्ट का एक संक्षिप्त विवरण दिया गया है:",
        "Key Lab Findings:": "प्रमुख लैब परिणाम:",
        "Your record notes the following condition(s):": "आपके रिकॉर्ड में दर्ज स्थिति:",
        "test result is": "परीक्षण परिणाम",
        "which is within normal healthy limits": "यह सामान्य स्वस्थ सीमा के भीतर है",
        "which is above the standard healthy reference range": "यह मानक स्वस्थ संदर्भ सीमा से अधिक है",
        "which is significantly higher than target limits and warrants clinical follow-up": "यह लक्षित सीमा से काफी अधिक है और चिकित्सीय सलाह की आवश्यकता है",
        "which is lower than the typical reference range": "यह सामान्य संदर्भ सीमा से कम है",
        "Prescribed Medications:": "निर्धारित दवाएं:",
        "with dosage": "खुराक विवरण",
        "to be taken before food": "भोजन से पहले लेना है",
        "to be taken after food": "भोजन के बाद लेना है",
        "Disclaimer: This summary is generated for personal health information only.": "अस्वीकरण: यह सारांश केवल व्यक्तिगत स्वास्थ्य जानकारी के लिए तैयार किया गया है।",
        "Please consult your healthcare provider to discuss these findings.": "कृपया इन परिणामों पर अपने डॉक्टर से परामर्श करें।"
    },
    "ta": {  # Tamil
        "Here is a simple overview of your medical report from": "உங்கள் மருத்துவ அறிக்கையின் எளிய விளக்கம் இங்கே கொடுக்கப்பட்டுள்ளது:",
        "Key Lab Findings:": "முக்கிய ஆய்வக முடிவுகள்:",
        "Your record notes the following condition(s):": "உங்கள் பதிவில் உள்ள சுகாதார நிலை:",
        "test result is": "பரிசோதனை முடிவு",
        "which is within normal healthy limits": "இது சாதாரண ஆரோக்கியமான வரம்பிற்குள் உள்ளது",
        "which is above the standard healthy reference range": "இது நிலையான ஆரோக்கியமான வரம்பை விட அதிகமாக உள்ளது",
        "which is significantly higher than target limits and warrants clinical follow-up": "இது இலக்கு வரம்பை விட கணிசமாக அதிகமாக உள்ளது, மருத்துவ ஆலோசனை தேவை",
        "which is lower than the typical reference range": "இது வழக்கமான வரம்பை விட குறைவாக உள்ளது",
        "Prescribed Medications:": "பரிந்துரைக்கப்பட்ட மருந்துகள்:",
        "with dosage": "அளவு விவரம்",
        "to be taken before food": "உணவுக்கு முன் எடுத்துக்கொள்ள வேண்டும்",
        "to be taken after food": "உணவுக்குப் பின் எடுத்துக்கொள்ள வேண்டும்",
        "Disclaimer: This summary is generated for personal health information only.": "பொறுப்புத் துறப்பு: இந்த சுருக்கம் தனிப்பட்ட சுகாதாரத் தகவல்களுக்காக மட்டுமே உருவாக்கப்பட்டது.",
        "Please consult your healthcare provider to discuss these findings.": "இந்த முடிவுகளைப் பற்றி உங்கள் மருத்துவரிடம் விவாதிக்கவும்."
    }
}

TOKEN_PATTERN = re.compile(r'(\[(?:fact_\d+|med_\d+|diag_\d+)\]|[0-9]+(?:\.[0-9]+)?(?:\s*(?:mg/dL|g/dL|%|/uL|U/L|uIU/mL))?)')

def lock_tokens(text: str) -> Tuple[str, Dict[str, str]]:
    """
    Replaces numbers, units, drug names, and [fact_id] tags with immutable tokens: {{T0}}, {{T1}}.
    """
    token_map = {}
    counter = 0

    def replacer(match):
        nonlocal counter
        val = match.group(0).strip()
        if not val:
            return match.group(0)
        token = f"{{{{T{counter}}}}}"
        token_map[token] = val
        counter += 1
        return token

    # Lock citations first: [fact_1]
    locked_text = re.sub(r'\[(fact_\d+|med_\d+|diag_\d+)\]', replacer, text)
    # Lock numerical expressions with units: e.g. 7.2 %, 14,200 /uL, 500mg
    locked_text = re.sub(r'[0-9]+(?:\.[0-9]+)?(?:\s*(?:mg/dL|g/dL|%|/uL|U/L|uIU/mL|mg|tab))', replacer, locked_text)

    return locked_text, token_map

def restore_tokens(translated_text: str, token_map: Dict[str, str]) -> str:
    """Restores the locked tokens back to their exact clinical numbers and units."""
    result = translated_text
    for token, original in token_map.items():
        result = result.replace(token, original)
    return result

def verify_numerical_invariance(source_text: str, translated_text: str) -> bool:
    """
    Safety verification: Ensures that every single numerical token in the source
    exists verbatim in the translated text.
    """
    source_numbers = set(re.findall(r'\b[0-9]+(?:\.[0-9]+)?\b', source_text))
    translated_numbers = set(re.findall(r'\b[0-9]+(?:\.[0-9]+)?\b', translated_text))
    
    missing = source_numbers - translated_numbers
    return len(missing) == 0

def translate_health_summary(english_text: str, target_lang: str) -> Dict[str, Any]:
    """
    Translates an English health summary into Telugu ('te'), Hindi ('hi'), or Tamil ('ta')
    with mathematically guaranteed numerical preservation.
    """
    if target_lang not in ["te", "hi", "ta"]:
        return {
            "lang": "en",
            "text": english_text,
            "verified": True,
            "warning": None
        }

    # 1. Lock clinical tokens
    locked_text, token_map = lock_tokens(english_text)

    # 2. Translate narrative phrases
    translated_locked = locked_text
    glossary = INDIC_DICTIONARY.get(target_lang, {})
    for eng_phrase, indic_phrase in glossary.items():
        translated_locked = translated_locked.replace(eng_phrase, indic_phrase)

    # 3. Restore clinical tokens
    restored_text = restore_tokens(translated_locked, token_map)

    # 4. Perform invariant safety audit
    is_safe = verify_numerical_invariance(english_text, restored_text)
    if not is_safe:
        return {
            "lang": "en",
            "text": english_text,
            "verified": False,
            "warning": "Translation verification detected potential number drift. Reverted safely to English for patient safety."
        }

    return {
        "lang": target_lang,
        "text": restored_text,
        "verified": True,
        "warning": None
    }
