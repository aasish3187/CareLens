import type { Segment } from '../data/types'

export type Lang = 'en' | 'te' | 'hi' | 'ta'
type DocSummaries = Record<'apollo' | 'fortis' | 'max', { layman: Segment[]; clinical: Segment[] }>

const A1 = { t: '7.2%', fact: 'fact_1' }
const A2 = { t: '142 mg/dL', fact: 'fact_2' }
const A3 = { t: '0.9 mg/dL', fact: 'fact_3' }
const A4 = { t: '185 mg/dL', fact: 'fact_4' }
const A5 = { t: '28 U/L', fact: 'fact_5' }
const F1 = { t: 'Glycomet-GP 1', fact: 'fact_1' }
const F1g = { t: 'Glimepiride 1mg', fact: 'fact_1' }
const F1m = { t: 'Metformin 500mg', fact: 'fact_1' }
const F2 = { t: '1-0-0', fact: 'fact_2' }
const F3 = { t: 'Telma 40', fact: 'fact_3' }
const F4 = { t: 'HbA1c', fact: 'fact_4' }
const M1 = { t: 'T2DM', fact: 'fact_1' }
const M2 = { t: '7.6%', fact: 'fact_2' }
const M3 = { t: '98%', fact: 'fact_3' }
const M4 = { t: '120/80 mmHg', fact: 'fact_4' }
const M5 = { t: 'Metformin 500mg', fact: 'fact_5' }

export const docSummaries: Record<Lang, DocSummaries> = {
  en: {
    apollo: {
      layman: ['Your 3-month average blood sugar (HbA1c) is ', A1, ', which is above the healthy range. Your fasting sugar is ', A2, '. Your kidneys are working well, with creatinine at ', A3, ', and your cholesterol of ', A4, ' is in the healthy range.'],
      clinical: ['HbA1c ', A1, ', consistent with suboptimally controlled T2DM; FBS ', A2, '. Renal function preserved (S. creatinine ', A3, '). Total cholesterol ', A4, ' and ALT ', A5, ' within reference limits.'],
    },
    fortis: {
      layman: ['Your doctor prescribed ', F1, ', which contains ', F1g, ' and ', F1m, '. Take it as ', F2, ', before breakfast. Continue ', F3, ' after dinner for blood pressure. Repeat the ', F4, ' test after 3 months.'],
      clinical: ['Rx: ', F1, ' (', F1g, ' + ', F1m, ') ', F2, ' AC breakfast. ', F3, ' (Telmisartan 40mg) 0-0-1 PC dinner. Review with repeat ', F4, ' in 12 weeks.'],
    },
    max: {
      layman: ['You were admitted for high blood sugar (', M1, ') and discharged after 2 days. Your HbA1c was ', M2, ' at that time. Your oxygen level was normal at ', M3, ' and blood pressure was ', M4, '. You were started on ', M5, ' twice a day.'],
      clinical: ['Dx: ', M1, ', uncontrolled. HbA1c ', M2, ' on admission. SpO₂ ', M3, ' on room air, BP ', M4, '. Discharged on ', M5, ' BD; endocrinology follow-up advised.'],
    },
  },
  hi: {
    apollo: {
      layman: ['आपका 3 महीने का औसत ब्लड शुगर (HbA1c) ', A1, ' है, जो स्वस्थ सीमा से ऊपर है। आपका खाली पेट शुगर ', A2, ' है। आपकी किडनी ठीक काम कर रही है, क्रिएटिनिन ', A3, ' है, और कोलेस्ट्रॉल ', A4, ' स्वस्थ सीमा में है।'],
      clinical: ['HbA1c ', A1, ', अनियंत्रित T2DM के अनुरूप; FBS ', A2, '। किडनी कार्य सामान्य (S. क्रिएटिनिन ', A3, ')। कुल कोलेस्ट्रॉल ', A4, ' और ALT ', A5, ' संदर्भ सीमा में।'],
    },
    fortis: {
      layman: ['आपके डॉक्टर ने ', F1, ' लिखी है, जिसमें ', F1g, ' और ', F1m, ' है। इसे ', F2, ' नाश्ते से पहले लें। रक्तचाप के लिए रात के खाने के बाद ', F3, ' जारी रखें। 3 महीने बाद ', F4, ' जाँच दोबारा कराएँ।'],
      clinical: ['Rx: ', F1, ' (', F1g, ' + ', F1m, ') ', F2, ' नाश्ते से पहले। ', F3, ' (Telmisartan 40mg) 0-0-1 रात के खाने के बाद। 12 सप्ताह में ', F4, ' के साथ समीक्षा।'],
    },
    max: {
      layman: ['आपको हाई ब्लड शुगर (', M1, ') के लिए भर्ती किया गया और 2 दिन बाद छुट्टी दी गई। उस समय आपका HbA1c ', M2, ' था। ऑक्सीजन स्तर ', M3, ' सामान्य था और रक्तचाप ', M4, ' था। आपको दिन में दो बार ', M5, ' शुरू की गई।'],
      clinical: ['निदान: ', M1, ', अनियंत्रित। भर्ती पर HbA1c ', M2, '। SpO₂ ', M3, ', BP ', M4, '। ', M5, ' BD पर छुट्टी; एंडोक्रिनोलॉजी फॉलो-अप की सलाह।'],
    },
  },
  te: {
    apollo: {
      layman: ['మీ 3 నెలల సగటు రక్తంలో చక్కెర (HbA1c) ', A1, ', ఇది ఆరోగ్యకరమైన పరిధి కంటే ఎక్కువ. ఖాళీ కడుపు చక్కెర ', A2, '. మీ కిడ్నీలు బాగా పనిచేస్తున్నాయి, క్రియాటినిన్ ', A3, ', మరియు కొలెస్ట్రాల్ ', A4, ' ఆరోగ్యకరమైన పరిధిలో ఉంది.'],
      clinical: ['HbA1c ', A1, ', నియంత్రణలో లేని T2DM కు అనుగుణంగా; FBS ', A2, '. మూత్రపిండాల పనితీరు సాధారణం (S. క్రియాటినిన్ ', A3, '). మొత్తం కొలెస్ట్రాల్ ', A4, ' మరియు ALT ', A5, ' సూచన పరిధిలో.'],
    },
    fortis: {
      layman: ['మీ డాక్టర్ ', F1, ' సూచించారు, ఇందులో ', F1g, ' మరియు ', F1m, ' ఉన్నాయి. దీన్ని ', F2, ' అల్పాహారానికి ముందు తీసుకోండి. రక్తపోటు కోసం రాత్రి భోజనం తర్వాత ', F3, ' కొనసాగించండి. 3 నెలల తర్వాత ', F4, ' పరీక్ష మళ్ళీ చేయించుకోండి.'],
      clinical: ['Rx: ', F1, ' (', F1g, ' + ', F1m, ') ', F2, ' అల్పాహారానికి ముందు. ', F3, ' (Telmisartan 40mg) 0-0-1 రాత్రి భోజనం తర్వాత. 12 వారాల్లో ', F4, ' తో సమీక్ష.'],
    },
    max: {
      layman: ['అధిక రక్తంలో చక్కెర (', M1, ') కోసం మిమ్మల్ని చేర్చుకుని 2 రోజుల తర్వాత డిశ్చార్జ్ చేశారు. అప్పుడు మీ HbA1c ', M2, '. ఆక్సిజన్ స్థాయి ', M3, ' సాధారణం, రక్తపోటు ', M4, '. మీకు రోజుకు రెండుసార్లు ', M5, ' ప్రారంభించారు.'],
      clinical: ['నిర్ధారణ: ', M1, ', నియంత్రణలో లేదు. చేరినప్పుడు HbA1c ', M2, '. SpO₂ ', M3, ', BP ', M4, '. ', M5, ' BD తో డిశ్చార్జ్; ఎండోక్రినాలజీ ఫాలో-అప్ సూచించబడింది.'],
    },
  },
  ta: {
    apollo: {
      layman: ['உங்கள் 3 மாத சராசரி இரத்த சர்க்கரை (HbA1c) ', A1, ', இது ஆரோக்கியமான வரம்பை விட அதிகம். வெறும் வயிற்று சர்க்கரை ', A2, '. உங்கள் சிறுநீரகங்கள் நன்றாக செயல்படுகின்றன, கிரியேட்டினின் ', A3, ', மற்றும் கொலஸ்ட்ரால் ', A4, ' ஆரோக்கியமான வரம்பில் உள்ளது.'],
      clinical: ['HbA1c ', A1, ', கட்டுப்பாடற்ற T2DM உடன் ஒத்துப்போகிறது; FBS ', A2, '. சிறுநீரக செயல்பாடு இயல்பு (S. கிரியேட்டினின் ', A3, '). மொத்த கொலஸ்ட்ரால் ', A4, ' மற்றும் ALT ', A5, ' குறிப்பு வரம்பிற்குள்.'],
    },
    fortis: {
      layman: ['உங்கள் மருத்துவர் ', F1, ' பரிந்துரைத்துள்ளார், இதில் ', F1g, ' மற்றும் ', F1m, ' உள்ளன. இதை ', F2, ' காலை உணவுக்கு முன் எடுத்துக்கொள்ளுங்கள். இரத்த அழுத்தத்திற்கு இரவு உணவுக்குப் பின் ', F3, ' தொடரவும். 3 மாதங்களுக்குப் பிறகு ', F4, ' பரிசோதனையை மீண்டும் செய்யவும்.'],
      clinical: ['Rx: ', F1, ' (', F1g, ' + ', F1m, ') ', F2, ' காலை உணவுக்கு முன். ', F3, ' (Telmisartan 40mg) 0-0-1 இரவு உணவுக்குப் பின். 12 வாரங்களில் ', F4, ' உடன் மறுஆய்வு.'],
    },
    max: {
      layman: ['அதிக இரத்த சர்க்கரைக்காக (', M1, ') நீங்கள் அனுமதிக்கப்பட்டு 2 நாட்களுக்குப் பின் வீடு திரும்பினீர்கள். அப்போது உங்கள் HbA1c ', M2, '. ஆக்ஸிஜன் அளவு ', M3, ' இயல்பு, இரத்த அழுத்தம் ', M4, '. உங்களுக்கு தினமும் இருமுறை ', M5, ' தொடங்கப்பட்டது.'],
      clinical: ['நோயறிதல்: ', M1, ', கட்டுப்பாடற்றது. அனுமதியின் போது HbA1c ', M2, '. SpO₂ ', M3, ', BP ', M4, '. ', M5, ' BD உடன் டிஸ்சார்ஜ்; நாளமில்லா சுரப்பியியல் பின்தொடர்தல் பரிந்துரைக்கப்பட்டது.'],
    },
  },
}

const T1 = { t: '7.2%' }
const T2 = { t: 'Metformin 500mg' }
const T3 = { t: 'Glimepiride 1mg' }
const T4 = { t: '0.9 mg/dL' }

export const crossSummary: Record<Lang, Segment[]> = {
  en: ['Your HbA1c is ', T1, ', above the target range, but improving. Continue ', T2, ' with ', T3, ' before breakfast every day. Your kidney function is normal (creatinine ', T4, ').'],
  te: ['మీ HbA1c ', T1, ', లక్ష్య పరిధి కంటే ఎక్కువ, కానీ మెరుగుపడుతోంది. ప్రతిరోజూ అల్పాహారానికి ముందు ', T3, ' తో ', T2, ' కొనసాగించండి. మీ కిడ్నీ పనితీరు సాధారణం (క్రియాటినిన్ ', T4, ').'],
  hi: ['आपका HbA1c ', T1, ' है, लक्ष्य सीमा से ऊपर, लेकिन सुधर रहा है। रोज़ नाश्ते से पहले ', T3, ' के साथ ', T2, ' जारी रखें। आपकी किडनी का कार्य सामान्य है (क्रिएटिनिन ', T4, ')।'],
  ta: ['உங்கள் HbA1c ', T1, ', இலக்கு வரம்பை விட அதிகம், ஆனால் மேம்பட்டு வருகிறது. தினமும் காலை உணவுக்கு முன் ', T3, ' உடன் ', T2, ' தொடரவும். உங்கள் சிறுநீரக செயல்பாடு இயல்பு (கிரியேட்டினின் ', T4, ').'],
}
