"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Mic, MicOff, ChevronRight, ChevronLeft, CheckCircle,
  Thermometer, Heart, Activity, User, MapPin, Clock
} from "lucide-react";
import { useLanguage } from "../../../lib/LanguageContext";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";

const FOLLOW_UP_QUESTIONS: Record<string, string[]> = {
  chest: ["Is it pressure/tightness?", "Does it spread to your arm/jaw?", "Any shortness of breath?"],
  head: ["Any fever with it?", "Severe sudden headache?", "Vision changes?"],
  abdomen: ["Is it after eating?", "Any vomiting?", "How long?"],
  default: ["How long have you had this?", "Is it getting worse?", "On a scale of 1–10?"],
};

export default function PatientRegister() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const STEPS = [t("step_demo"), t("step_symptoms"), t("step_vitals"), t("step_review")];

  const BODY_REGIONS = [
    { id: "head", label: t("head"), emoji: "🤕" },
    { id: "throat", label: t("throat"), emoji: "🫁" },
    { id: "chest", label: t("chest"), emoji: "💔", warning: true },
    { id: "abdomen", label: t("abdomen"), emoji: "🤰" },
    { id: "back", label: "Back", emoji: "🔙" },
    { id: "arms", label: "Arms / Hands", emoji: "💪" },
    { id: "legs", label: "Legs / Feet", emoji: "🦵" },
    { id: "skin", label: "Skin / Rash", emoji: "🩹" },
  ];

  const [step, setStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [severity, setSeverity] = useState(5);
  const [associatedSymptoms, setAssociatedSymptoms] = useState<string[]>([]);
  const [triageResult, setTriageResult] = useState<null | { priority: string; confidence: number; reasoning: string }>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "", age: "", gender: t("female"), village: "",
    known_conditions: "", allergies: "", current_meds: "",
    chief_complaint: "",
    bp: "", temp: "", spo2: "",
  });

  const followUps = selectedRegions.length > 0
    ? (FOLLOW_UP_QUESTIONS[selectedRegions[0]] || FOLLOW_UP_QUESTIONS.default)
    : [];

  async function mockRecord() {
    setIsRecording(true);
    await new Promise((r) => setTimeout(r, 2000));
    const transcripts = [
      "Mujhe teen din se bukhaar hai aur sar mein dard ho raha hai",
      "Pet mein dard ho raha hai khana khane ke baad",
      "Khasi aur naak bah rahi hai",
    ];
    const tr = transcripts[Math.floor(Math.random() * transcripts.length)];
    setTranscript(tr);
    setForm({ ...form, chief_complaint: tr });
    setIsRecording(false);
  }

  async function submitTriage() {
    setSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/triage/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visit_id: "v-new",
          patient_id: "p-new",
          age: parseInt(form.age) || 30,
          gender: form.gender,
          known_conditions: form.known_conditions ? [form.known_conditions] : [],
          current_meds: form.current_meds ? [form.current_meds] : [],
          allergies: form.allergies ? [form.allergies] : [],
          chief_complaint: form.chief_complaint || transcript,
          duration: "2 days",
          severity,
          associated_symptoms: associatedSymptoms,
          mobility: "ambulatory",
          bp: form.bp || null,
          temp: form.temp ? parseFloat(form.temp) : null,
          spo2: form.spo2 ? parseInt(form.spo2) : null,
        }),
      });
      const data = await res.json();
      setTriageResult(data);
    } catch {
      setTriageResult({
        priority: "P2",
        confidence: 0.84,
        reasoning: "Moderate symptoms reported. Needs assessment within 30-60 minutes.",
      });
    }
    setSubmitting(false);
    setTimeout(() => router.push("/patient/queue"), 2500);
  }

  const priorityBg: Record<string, string> = {
    P1: "var(--p1-bg)", P2: "var(--p2-bg)", P3: "var(--p3-bg)",
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow: "0 4px 16px rgba(79,70,229,0.4)" }}
            >
              <Activity className="text-white" size={18} />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--brand)" }}>{t("patient_asha")}</p>
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Anand PHC</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1 sm:gap-2 mb-8 select-none">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 sm:gap-2 flex-1">
              <div className="flex items-center gap-1 sm:gap-2">
                <div
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: i <= step ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "rgba(100,116,139,0.15)",
                    color: i <= step ? "white" : "var(--text-muted)",
                  }}
                >
                  {i < step ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className="text-[10px] sm:text-xs font-medium hidden sm:block truncate max-w-[60px]" style={{ color: i === step ? "var(--brand)" : "var(--text-muted)" }}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 rounded" style={{ background: i < step ? "var(--brand)" : "rgba(100,116,139,0.15)" }} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 0: Demographics */}
          {step === 0 && (
            <motion.div key="demo" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="glass-card p-5 sm:p-6 mb-4">
                <h2 className="text-xl font-bold mb-5" style={{ color: "var(--text-primary)" }}>{t("step_demo")}</h2>
                <div className="space-y-5">
                  <div>
                    <label className="label text-sm"><User size={13} className="inline mr-1" /> {t("full_name")}</label>
                    <input id="reg-name" className="input-field py-3 text-base" placeholder="Savitaben Patel" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label text-sm">{t("age")}</label>
                      <input id="reg-age" className="input-field py-3 text-base" type="number" placeholder="45" value={form.age}
                        onChange={(e) => setForm({ ...form, age: e.target.value })} />
                    </div>
                    <div>
                      <label className="label text-sm">{t("gender")}</label>
                      <select id="reg-gender" className="input-field py-3 text-base" value={form.gender}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                        <option>{t("female")}</option><option>{t("male")}</option><option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label text-sm"><MapPin size={13} className="inline mr-1" /> {t("village")}</label>
                    <input id="reg-village" className="input-field py-3 text-base" placeholder="Vasad, Anand" value={form.village}
                      onChange={(e) => setForm({ ...form, village: e.target.value })} />
                  </div>
                </div>
              </div>
              <button id="demo-next" onClick={() => setStep(1)} className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base">
                {t("continue")} <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 1: Symptom Intake */}
          {step === 1 && (
            <motion.div key="symptoms" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="glass-card p-5 sm:p-6 mb-4">
                <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{t("what_brings")}</h2>
                <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>{t("body_hint")}</p>

                {/* Voice record */}
                <div className="mb-6">
                  <button
                    id="voice-record-btn"
                    onClick={mockRecord}
                    disabled={isRecording}
                    className="w-full flex flex-col items-center justify-center py-8 rounded-2xl border-2 border-dashed transition-all"
                    style={{
                      borderColor: isRecording ? "var(--brand)" : "rgba(100,116,139,0.25)",
                      background: isRecording ? "rgba(79,70,229,0.05)" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {isRecording ? (
                      <>
                        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 animate-pulse"
                          style={{ background: "rgba(239,68,68,0.15)" }}>
                          <MicOff size={26} style={{ color: "#dc2626" }} />
                        </div>
                        <span className="text-base font-semibold" style={{ color: "#dc2626" }}>Recording... (Hindi/Gujarati)</span>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                          style={{ background: "var(--brand-soft)", boxShadow: "0 0 20px rgba(79,70,229,0.15)" }}>
                          <Mic size={26} style={{ color: "var(--brand)" }} />
                        </div>
                        <span className="text-base font-semibold px-4 text-center leading-snug" style={{ color: "var(--text-primary)" }}>
                          {t("voice_hint")}
                        </span>
                      </>
                    )}
                  </button>
                  {transcript && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 rounded-xl text-base"
                      style={{ background: "rgba(79,70,229,0.06)", color: "var(--text-primary)", border: "1px solid rgba(79,70,229,0.12)" }}>
                      <span className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: "var(--brand)" }}>Transcribed</span>
                      {transcript}
                    </motion.div>
                  )}
                </div>

                {/* Body Map */}
                <div className="mb-6">
                  <label className="label mb-3 text-sm">{t("body_hint")}</label>
                  <div className="grid grid-cols-2 gap-3">
                    {BODY_REGIONS.map((region) => (
                      <button
                        key={region.id}
                        id={`body-${region.id}`}
                        onClick={() => {
                          setSelectedRegions((prev) =>
                            prev.includes(region.id) ? prev.filter((r) => r !== region.id) : [...prev, region.id]
                          );
                          if (!form.chief_complaint) {
                            setForm({ ...form, chief_complaint: `Pain/discomfort in ${region.label}` });
                          }
                        }}
                        className="flex flex-col items-center justify-center gap-1 p-4 rounded-xl text-sm font-medium transition-all min-h-[80px]"
                        style={{
                          background: selectedRegions.includes(region.id)
                            ? region.warning ? "var(--p1-bg)" : "var(--brand-soft)"
                            : "rgba(255,255,255,0.6)",
                          border: selectedRegions.includes(region.id)
                            ? region.warning ? "2px solid var(--p1-border)" : "2px solid rgba(79,70,229,0.4)"
                            : "1px solid rgba(100,116,139,0.2)",
                          color: selectedRegions.includes(region.id)
                            ? region.warning ? "var(--p1-text)" : "var(--brand)"
                            : "var(--text-secondary)",
                        }}
                      >
                        <span className="text-2xl mb-1">{region.emoji}</span>
                        <span className="text-center w-full leading-tight">{region.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Severity slider */}
                <div className="pt-2">
                  <label className="label text-sm">{t("severity")}: <strong className="text-lg" style={{ color: "var(--text-primary)" }}>{severity}/10</strong></label>
                  <input type="range" min={1} max={10} value={severity}
                    onChange={(e) => setSeverity(parseInt(e.target.value))}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer mt-4"
                    style={{ accentColor: severity >= 7 ? "#dc2626" : severity >= 4 ? "#d97706" : "#059669" }}
                  />
                  <div className="flex justify-between text-xs sm:text-sm mt-3 font-semibold" style={{ color: "var(--text-secondary)" }}>
                    <span>{t("mild")}</span><span>{t("severe")}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(0)} className="btn-secondary w-24 flex items-center justify-center gap-1 font-semibold">
                  <ChevronLeft size={18} /> {t("back")}
                </button>
                <button id="symptoms-next" onClick={() => setStep(2)} className="btn-primary flex-1 flex items-center justify-center gap-2 py-4 text-base">
                  {t("continue")} <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Vitals */}
          {step === 2 && (
            <motion.div key="vitals" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="glass-card p-5 sm:p-6 mb-4">
                <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>{t("step_vitals")}</h2>
                <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>{t("vitals_hint")}</p>
                <div className="space-y-5">
                  <div className="vitals-widget py-4">
                    <label className="label text-sm"><Heart size={14} className="inline mr-1 text-red-500" /> Blood Pressure (mmHg)</label>
                    <input id="vitals-bp" className="input-field mt-3 py-3 text-lg" placeholder="120/80" value={form.bp}
                      onChange={(e) => setForm({ ...form, bp: e.target.value })} />
                  </div>
                  <div className="vitals-widget py-4">
                    <label className="label text-sm"><Thermometer size={14} className="inline mr-1 text-amber-500" /> Temperature (°C)</label>
                    <input id="vitals-temp" className="input-field mt-3 py-3 text-lg" type="number" placeholder="37.0" value={form.temp}
                      onChange={(e) => setForm({ ...form, temp: e.target.value })} />
                  </div>
                  <div className="vitals-widget py-4">
                    <label className="label text-sm"><Activity size={14} className="inline mr-1 text-blue-500" /> SpO₂ (%)</label>
                    <input id="vitals-spo2" className="input-field mt-3 py-3 text-lg" type="number" placeholder="98" value={form.spo2}
                      onChange={(e) => setForm({ ...form, spo2: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="btn-secondary w-24 flex items-center justify-center gap-1 font-semibold">
                  <ChevronLeft size={18} /> {t("back")}
                </button>
                <button id="vitals-next" onClick={() => setStep(3)} className="btn-primary flex-1 flex items-center justify-center gap-2 py-4 text-base">
                  {t("continue")} <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Review + Triage */}
          {step === 3 && (
            <motion.div key="review" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              {!triageResult ? (
                <div className="glass-card p-5 sm:p-6 mb-4">
                  <h2 className="text-xl font-bold mb-5" style={{ color: "var(--text-primary)" }}>{t("step_review")}</h2>
                  <div className="space-y-4 mb-8">
                    {[
                      { label: t("full_name"), value: `${form.name || "—"}, ${form.age || "—"}y ${form.gender}` },
                      { label: t("village"), value: form.village || "—" },
                      { label: "Symptoms", value: form.chief_complaint || (selectedRegions.length > 0 ? `Area: ${selectedRegions.join(", ")}` : "—") },
                      { label: "Vitals", value: `BP: ${form.bp || "—"} | Temp: ${form.temp || "—"}°C | SpO₂: ${form.spo2 || "—"}%` },
                    ].map((item) => (
                      <div key={item.label} className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-base">
                        <span className="w-32 flex-shrink-0 font-semibold" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                        <span style={{ color: "var(--text-primary)" }} className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4">
                     <button onClick={() => setStep(2)} className="btn-secondary w-24 flex items-center justify-center gap-1 font-semibold">
                      <ChevronLeft size={18} /> {t("back")}
                    </button>
                    <button
                      id="submit-triage-btn"
                      onClick={submitTriage}
                      disabled={submitting}
                      className="btn-primary flex-1 flex items-center justify-center gap-2 py-4 text-base font-bold"
                    >
                      {submitting ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>{t("submit_get_ticket")} <ChevronRight size={18} /></>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-black shadow-lg"
                    style={{
                      background: priorityBg[triageResult.priority],
                      border: `3px solid ${triageResult.priority === "P1" ? "var(--p1-border)" : triageResult.priority === "P2" ? "var(--p2-border)" : "var(--p3-border)"}`,
                      color: triageResult.priority === "P1" ? "var(--p1-text)" : triageResult.priority === "P2" ? "var(--p2-text)" : "var(--p3-text)"
                    }}
                  >
                    {triageResult.priority}
                  </div>
                  <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                    {triageResult.priority === "P1" ? "Immediate Urgency" : triageResult.priority === "P2" ? "Moderate Urgency" : "Low Urgency"}
                  </h2>
                  <p className="text-base mb-6" style={{ color: "var(--text-secondary)" }}>{triageResult.reasoning}</p>
                  <div className="flex items-center justify-center gap-3 text-base font-bold" style={{ color: "var(--brand)" }}>
                    <span className="w-5 h-5 border-[3px] border-current border-t-transparent rounded-full animate-spin" />
                    Adding to queue...
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
