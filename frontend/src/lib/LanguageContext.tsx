"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "hi" | "gu";

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  // Landing Page
  "smarter_queues": {
    en: "Quick & Easy Doctor Consultation",
    hi: "त्वरित और आसान डॉक्टर परामर्श",
    gu: "ઝડપી અને સરળ ડૉક્ટર પરામર્શ",
  },
  "sub_text": {
    en: "Real-time AI triage for rural PHCs. Made for 2G, shared tablets, and everyone.",
    hi: "ग्रामीण स्वास्थ्य केंद्रों के लिए AI ट्राइऐज (Triage)।",
    gu: "ગ્રામીણ આરોગ્ય કેન્દ્રો માટે AI ટ્રાયેજ (Triage).",
  },
  "patient_asha": {
    en: "Patient / ASHA Registration",
    hi: "मरीज़ / आशा पंजीकरण",
    gu: "દર્દી / આશા નોંધણી",
  },
  "patient_desc": {
    en: "Register new patient, record symptoms, and get a queue ticket.",
    hi: "नए मरीज़ को पंजीकृत करें, लक्षण दर्ज करें, और कतार टिकट प्राप्त करें।",
    gu: "નવા દર્દીની નોંધણી કરો, લક્ષણો દાખલ કરો અને કતારની ટિકિટ મેળવો.",
  },
  "doctor": { en: "Doctor", hi: "डॉक्टर", gu: "ડૉક્ટર" },
  "doctor_desc": {
    en: "View patient briefs, do teleconsult, prescribe meds.",
    hi: "मरीज़ का विवरण देखें, टेली-परामर्श करें, दवाइयां लिखें।",
    gu: "દર્દીની વિગતો જુઓ, ટેલિકન્સલ્ટ કરો, દવાઓ લખો.",
  },
  "coordinator": { en: "Clinic Staff", hi: "क्लीनिक स्टाफ", gu: "ક્લિનિક સ્ટાફ" },
  "coordinator_desc": {
    en: "Manage queue, monitor doctors and handle referrals.",
    hi: "कतार प्रबंधित करें, डॉक्टरों की निगरानी करें।",
    gu: "કતારનું સંચાલન કરો, ડૉક્ટરોનું નિરીક્ષણ કરો.",
  },
  "enter": { en: "Enter", hi: "आगे बढ़ें", gu: "આગળ વધો" },
  
  // Auth Page
  "login": { en: "Login / Register", hi: "लॉगिन / रजिस्टर", gu: "લૉગિન / રજીસ્ટર" },
  "phone": { en: "Mobile Number", hi: "मोबाइल नंबर", gu: "મોબાઇલ નંબર" },
  "send_otp": { en: "Send OTP", hi: "OTP भेजें", gu: "OTP મોકલો" },
  "enter_otp": { en: "Enter 6-digit OTP", hi: "6-अंकों का OTP दर्ज करें", gu: "6-અંકનો OTP દાખલ કરો" },
  "verify_otp": { en: "Verify & Continue", hi: "सत्यापित करें", gu: "ચકાસો" },

  // Patient Registration
  "step_demo": { en: "Demographics", hi: "विवरण", gu: "વિગતો" },
  "step_symptoms": { en: "Symptoms", hi: "लक्षण", gu: "લક્ષણો" },
  "step_vitals": { en: "Vitals", hi: "नब्ज / वाइटल्स", gu: "વાઇટલ્સ" },
  "step_review": { en: "Review", hi: "पुष्टि", gu: "પુષ્ટિ" },
  
  "full_name": { en: "Full Name", hi: "पूरा नाम", gu: "પૂરું નામ" },
  "age": { en: "Age", hi: "आयु (उम्र)", gu: "ઉંમર" },
  "gender": { en: "Gender", hi: "लिंग", gu: "લિંગ" },
  "female": { en: "Female", hi: "महिला", gu: "સ્ત્રી" },
  "male": { en: "Male", hi: "पुरुष", gu: "પુરુષ" },
  "village": { en: "Village", hi: "गांव", gu: "ગામ" },
  
  "what_brings": { en: "What brings you in today?", hi: "आज क्या परेशानी है?", gu: "આજે શું તકલીફ છે?" },
  "voice_hint": { en: "Tap to speak in Hindi/Gujarati", hi: "बोलने के लिए माइक दबाएं", gu: "બોલવા માટે માઇક દબાવો" },
  "body_hint": { en: "Or tap affected body areas", hi: "या शरीर के दर्द वाले हिस्से पर टैप करें", gu: "અથવા અસરગ્રસ્ત શરીરના ભાગો પર ટેપ કરો" },
  
  "head": { en: "Head / Face", hi: "सिर / चेहरा", gu: "માથું / ચહેરો" },
  "throat": { en: "Throat / Neck", hi: "गला / गर्दन", gu: "ગળું / ગરદન" },
  "chest": { en: "Chest (Warning)", hi: "छाती (चेतावनी)", gu: "છાતી (ચેતવણી)" },
  "abdomen": { en: "Stomach / Abdomen", hi: "पेट", gu: "પેટ" },
  
  "severity": { en: "Severity (1-10)", hi: "तीव्रता (1-10)", gu: "તીવ્રતા (1-10)" },
  "mild": { en: "Mild", hi: "हल्का", gu: "હળવું" },
  "severe": { en: "Severe", hi: "बहुत तेज़", gu: "વધુ" },
  
  "continue": { en: "Continue", hi: "आगे बढ़ें", gu: "આગળ વધો" },
  "back": { en: "Back", hi: "पीछे", gu: "પાછળ" },
  
  // Vitals
  "vitals_hint": { en: "Enter readings from PHC equipment. Skip if unavailable.", hi: "अगर मशीन नहीं है तो खाली छोड़ दें।", gu: "જો મશીન ઉપલબ્ધ ન હોય તો ખાલી છોડી દો." },
  
  "submit_get_ticket": { en: "Submit & Get Queue Ticket", hi: "टिकट प्राप्त करें", gu: "ટિકિટ મેળવો" }
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("phc_lang") as Language;
    if (saved && ["en", "hi", "gu"].includes(saved)) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("phc_lang", newLang);
  };

  const t = (key: string) => {
    return translations[key]?.[lang] || translations[key]?.en || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
