"use client";
import { useLanguage } from "../lib/LanguageContext";

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  
  return (
    <div className="flex bg-white/40 backdrop-blur rounded-full p-1 border border-white/60 shadow-sm" style={{ alignSelf: "flex-end" }}>
      <button 
        onClick={() => setLang("en")}
        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${lang === "en" ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 hover:bg-white/50"}`}
      >
        English
      </button>
      <button 
        onClick={() => setLang("hi")}
        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${lang === "hi" ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 hover:bg-white/50"}`}
      >
        हिंदी
      </button>
      <button 
        onClick={() => setLang("gu")}
        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${lang === "gu" ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 hover:bg-white/50"}`}
      >
        ગુજરાતી
      </button>
    </div>
  );
}
