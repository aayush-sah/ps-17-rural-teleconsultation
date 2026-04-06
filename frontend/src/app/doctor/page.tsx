"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video, FileText, ChevronRight, X, Clock, AlertTriangle,
  Activity, Stethoscope, Users, CheckCircle, Phone, Send, Plus, Minus
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
interface QueuePatient {
  id: string; visit_id: string; patient_name: string; age: number; gender: string;
  priority: "P1" | "P2" | "P3"; chief_complaint: string; wait_minutes: number; status: string;
}

interface SOAPBrief {
  subjective: string; objective: string; assessment: string; plan: string;
  allergies_flagged: string[]; chronic_conditions: string[]; wait_minutes: number;
}

interface Medication { name: string; dose: string; frequency: string; duration: string; }

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_QUEUE: QueuePatient[] = [
  { id: "q-001", visit_id: "v-001", patient_name: "Savitaben Patel", age: 67, gender: "F", priority: "P1", chief_complaint: "Chest tightness and breathlessness", wait_minutes: 22, status: "waiting" },
  { id: "q-002", visit_id: "v-002", patient_name: "Ramkumar Singh", age: 45, gender: "M", priority: "P2", chief_complaint: "High fever for 3 days with chills", wait_minutes: 35, status: "waiting" },
  { id: "q-003", visit_id: "v-003", patient_name: "Meena Devi", age: 32, gender: "F", priority: "P2", chief_complaint: "Severe abdominal pain after eating", wait_minutes: 18, status: "waiting" },
  { id: "q-004", visit_id: "v-004", patient_name: "Arjun Yadav", age: 8, gender: "M", priority: "P2", chief_complaint: "Persistent cough and runny nose for 5 days", wait_minutes: 12, status: "waiting" },
  { id: "q-005", visit_id: "v-005", patient_name: "Lalitaben Trivedi", age: 55, gender: "F", priority: "P3", chief_complaint: "Routine BP check and diabetes follow-up", wait_minutes: 8, status: "waiting" },
  { id: "q-006", visit_id: "v-006", patient_name: "Suresh Bhai", age: 28, gender: "M", priority: "P3", chief_complaint: "Minor skin rash on forearm", wait_minutes: 5, status: "waiting" },
];

const SOAP_DATABASE: Record<string, SOAPBrief & { bp?: string; temp?: string; spo2?: number }> = {
  "q-001": {
    subjective: "67-year-old female presents with chest tightness and breathlessness for 2 hours. Self-rated severity 8/10. Worsens on exertion. Associated palpitations reported.",
    objective: "BP: 155/95 mmHg | Temp: 37.2°C | SpO₂: 91%. Patient appears distressed. Mild cyanosis of lips. Labored breathing noted.",
    assessment: "P1 — Hard override triggered: chest tightness + breathlessness. Possible ACS or acute decompensated heart failure. SpO₂ concerning at 91%.",
    plan: "Immediate 12-lead ECG. Oxygen supplementation via mask. IV access. Rule out ACS with troponin if available. Consider emergency referral if no improvement in 15 min.",
    allergies_flagged: ["Aspirin", "NSAID"],
    chronic_conditions: ["Hypertension (known)", "Type 2 Diabetes"],
    wait_minutes: 22,
    bp: "155/95", temp: "37.2", spo2: 91,
  },
  "q-002": {
    subjective: "45-year-old male with high fever for 3 days. Temperature reaching 39.8°C. Associated chills, headache, and body ache. No chest pain or breathlessness.",
    objective: "BP: 118/75 mmHg | Temp: 39.4°C | SpO₂: 97%. Patient appears fatigued but alert. Mild dehydration signs.",
    assessment: "P2 — Moderate urgency. Prolonged high fever with systemic symptoms. Malaria, typhoid, or dengue should be considered in rural Gujarat setting.",
    plan: "Rapid malaria test if available. CBC recommended. Oral hydration reinforced. Paracetamol for fever control. Return immediately if breathing worsens.",
    allergies_flagged: [],
    chronic_conditions: ["None reported"],
    wait_minutes: 35,
    bp: "118/75", temp: "39.4", spo2: 97,
  },
  "q-003": {
    subjective: "32-year-old female with severe abdominal pain after eating, 3-day duration. Pain is cramping, right upper quadrant. Associated nausea. No vomiting. Severity 7/10.",
    objective: "BP: 110/70 mmHg | Temp: 37.8°C | SpO₂: 98%. Tenderness on right upper quadrant palpation.",
    assessment: "P2 — Possible cholecystitis or gallstone disease. RUQ pain post-prandial pattern is classic. Low fever may indicate early cholecystitis.",
    plan: "Abdominal examination. Ultrasound abdomen if available at district level. Spasmolytics for pain relief. Dietary advice. Refer if fever raises.",
    allergies_flagged: [],
    chronic_conditions: [],
    wait_minutes: 18,
    bp: "110/70", temp: "37.8", spo2: 98,
  },
};

const COMMON_MEDS: Medication[] = [
  { name: "Paracetamol", dose: "500mg", frequency: "3 times/day", duration: "5 days" },
  { name: "Amoxicillin", dose: "500mg", frequency: "3 times/day", duration: "7 days" },
  { name: "ORS", dose: "1 packet", frequency: "After each loose stool", duration: "Until resolved" },
  { name: "Cetirizine", dose: "10mg", frequency: "Once at night", duration: "5 days" },
  { name: "Omeprazole", dose: "20mg", frequency: "Before breakfast", duration: "14 days" },
  { name: "Metformin", dose: "500mg", frequency: "Twice daily", duration: "30 days" },
];

// ── Priority Badge ─────────────────────────────────────────────────────────────
function PriorityBadge({ p, size = "sm" }: { p: string; size?: "sm" | "lg" }) {
  const cls = `triage-${p.toLowerCase()}`;
  return (
    <span className={`${cls} font-bold rounded-full inline-flex items-center justify-center ${size === "lg" ? "px-4 py-1.5 text-sm" : "px-2.5 py-1 text-xs"}`}>
      {p}
    </span>
  );
}

// ── Main Doctor Dashboard ─────────────────────────────────────────────────────
export default function DoctorDashboard() {
  const [queue, setQueue] = useState<QueuePatient[]>(DEMO_QUEUE);
  const [selectedPatient, setSelectedPatient] = useState<QueuePatient | null>(null);
  const [soap, setSoap] = useState<(SOAPBrief & { bp?: string; temp?: string; spo2?: number }) | null>(null);
  const [showConsult, setShowConsult] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [selectedMeds, setSelectedMeds] = useState<Medication[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [prescriptionSent, setPrescriptionSent] = useState(false);
  const [soapLoading, setSoapLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate realtime queue pulse
  useEffect(() => {
    const interval = setInterval(() => setLastUpdate(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  async function selectPatient(patient: QueuePatient) {
    setSelectedPatient(patient);
    setSoap(null);
    setSoapLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const mockSoap = SOAP_DATABASE[patient.id];
    if (mockSoap) {
      setSoap(mockSoap);
    } else {
      setSoap({
        subjective: `${patient.patient_name}, ${patient.age}y, presents with: ${patient.chief_complaint}. Self-assessed severity reported.`,
        objective: `BP: Not measured | Temp: Not measured | SpO₂: Not measured. Patient is ambulatory.`,
        assessment: `Priority ${patient.priority} — ${patient.chief_complaint.toLowerCase()}. Further clinical assessment required.`,
        plan: `Conduct focused physical examination. Review symptom history in detail. Consider appropriate investigations.`,
        allergies_flagged: [],
        chronic_conditions: [],
        wait_minutes: patient.wait_minutes,
      });
    }
    setSoapLoading(false);
  }

  function addMed(med: Medication) {
    if (!selectedMeds.find((m) => m.name === med.name)) {
      setSelectedMeds([...selectedMeds, { ...med }]);
    }
  }

  function removeMed(name: string) {
    setSelectedMeds(selectedMeds.filter((m) => m.name !== name));
  }

  async function submitPrescription() {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setPrescriptionSent(true);

    // Mark as completed in queue
    setQueue((q) => q.filter((p) => p.id !== selectedPatient?.id));
    setTimeout(() => {
      setShowPrescription(false);
      setSelectedPatient(null);
      setSoap(null);
      setSelectedMeds([]);
      setPrescriptionSent(false);
    }, 3000);
  }

  const priorityOrder = { P1: 0, P2: 1, P3: 2 };
  const sortedQueue = [...queue].sort((a, b) =>
    priorityOrder[a.priority] - priorityOrder[b.priority] || b.wait_minutes - a.wait_minutes
  );

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "var(--bg-base)" }}>
      {/* ── LEFT SIDEBAR: Queue ─────────────────────────────────────────────── */}
      <aside className="sidebar w-80 flex-shrink-0 flex flex-col overflow-hidden">
        {/* Sidebar header */}
        <div className="p-5 border-b border-white/50">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow: "0 4px 16px rgba(79,70,229,0.35)" }}
            >
              <Stethoscope className="text-white" size={15} />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Dr. Priya Sharma</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Online · Anand PHC</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              <Users size={14} className="inline mr-1" />
              Queue ({sortedQueue.length})
            </h2>
            <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live · {lastUpdate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>

        {/* Patient list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 stagger-children">
          <AnimatePresence>
            {sortedQueue.map((patient, i) => (
              <motion.button
                key={patient.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => selectPatient(patient)}
                className="w-full text-left p-3.5 rounded-2xl transition-all duration-150"
                style={{
                  background: selectedPatient?.id === patient.id
                    ? "rgba(79,70,229,0.08)"
                    : "rgba(255,255,255,0.55)",
                  border: selectedPatient?.id === patient.id
                    ? "1px solid rgba(79,70,229,0.25)"
                    : "1px solid rgba(255,255,255,0.7)",
                  boxShadow: selectedPatient?.id === patient.id
                    ? "var(--shadow-panel)"
                    : "var(--shadow-card)",
                }}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <PriorityBadge p={patient.priority} />
                    {patient.priority === "P1" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    <Clock size={10} /> {patient.wait_minutes}m
                  </div>
                </div>
                <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>
                  {patient.patient_name}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {patient.age}y {patient.gender} · {patient.chief_complaint.substring(0, 38)}...
                </p>
              </motion.button>
            ))}
          </AnimatePresence>

          {sortedQueue.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle size={32} className="mx-auto mb-3" style={{ color: "#10b981" }} />
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>All patients seen!</p>
            </div>
          )}
        </div>
      </aside>

      {/* ── CENTER: SOAP Brief ───────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6">
        {!selectedPatient ? (
          <div className="h-full flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div
                className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center"
                style={{ background: "var(--brand-soft)", boxShadow: "0 0 40px rgba(79,70,229,0.12)" }}
              >
                <FileText size={36} style={{ color: "var(--brand)" }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                Select a patient
              </h2>
              <p style={{ color: "var(--text-secondary)" }}>
                Choose from the priority queue to view SOAP brief
              </p>
            </motion.div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPatient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Patient header */}
              <div className="glass-card p-5 mb-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white"
                      style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
                    >
                      {selectedPatient.patient_name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                          {selectedPatient.patient_name}
                        </h2>
                        <PriorityBadge p={selectedPatient.priority} size="lg" />
                      </div>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {selectedPatient.age}y · {selectedPatient.gender === "M" ? "Male" : "Female"} ·&nbsp;
                        <Clock size={12} className="inline" /> Waiting {selectedPatient.wait_minutes} minutes
                        {selectedPatient.wait_minutes > 30 && (
                          <span className="ml-2 font-semibold" style={{ color: "var(--p2-text)" }}>⏰ Long wait</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button id="start-consult-btn" onClick={() => setShowConsult(true)}
                    className="btn-primary flex items-center gap-2">
                    <Video size={15} /> Start Call
                  </button>
                </div>
              </div>

              {/* Allergy / condition alerts */}
              {soap && (soap.allergies_flagged.length > 0 || soap.chronic_conditions.length > 0) && (
                <div className="grid grid-cols-2 gap-4 mb-5">
                  {soap.allergies_flagged.length > 0 && (
                    <div className="glass-card p-4" style={{ borderColor: "var(--p1-border)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={14} style={{ color: "var(--p1-text)" }} />
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--p1-text)" }}>Allergies</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {soap.allergies_flagged.map((a) => (
                          <span key={a} className="triage-p1 text-xs px-2 py-0.5 rounded-full">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {soap.chronic_conditions.length > 0 && (
                    <div className="glass-card p-4" style={{ borderColor: "var(--p2-border)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Activity size={14} style={{ color: "var(--p2-text)" }} />
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--p2-text)" }}>Known Conditions</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {soap.chronic_conditions.map((c) => (
                          <span key={c} className="triage-p2 text-xs px-2 py-0.5 rounded-full">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SOAP sections */}
              {soapLoading ? (
                <div className="space-y-4">
                  {["Subjective", "Objective", "Assessment", "Plan"].map((s) => (
                    <div key={s} className="glass-card p-5">
                      <div className="skeleton h-4 w-24 mb-3" />
                      <div className="space-y-2">
                        <div className="skeleton h-3 w-full" />
                        <div className="skeleton h-3 w-4/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : soap && (
                <div className="space-y-4">
                  {[
                    { key: "S", label: "Subjective", text: soap.subjective, color: "#4f46e5" },
                    { key: "O", label: "Objective", text: soap.objective, color: "#0891b2" },
                    { key: "A", label: "Assessment", text: soap.assessment, color: "#d97706", bold: selectedPatient.priority === "P1" },
                    { key: "P", label: "Plan", text: soap.plan, color: "#059669" },
                  ].map((section) => (
                    <motion.div
                      key={section.key}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-5"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
                          style={{ background: section.color }}
                        >
                          {section.key}
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                          {section.label}
                        </h3>
                      </div>
                      <p
                        className="text-sm leading-relaxed"
                        style={{
                          color: section.bold ? "#b45309" : "var(--text-primary)",
                          fontWeight: section.bold ? 600 : 400,
                        }}
                      >
                        {section.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Vitals + Prescription */}
              <div className="flex gap-3 mt-5">
                <button
                  id="open-prescription-btn"
                  onClick={() => setShowPrescription(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FileText size={15} /> Prescription Pad
                </button>
                <button
                  className="btn-secondary flex items-center gap-2 text-amber-700"
                  style={{ borderColor: "rgba(245,158,11,0.3)" }}
                >
                  <ChevronRight size={15} /> Refer to Specialist
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* ── RIGHT PANEL: Vitals ──────────────────────────────────────────────── */}
      {selectedPatient && soap && (
        <aside className="w-60 flex-shrink-0 p-4 space-y-3 overflow-y-auto"
          style={{ background: "rgba(255,255,255,0.4)", backdropFilter: "blur(16px)", borderLeft: "1px solid rgba(255,255,255,0.7)" }}>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>Vitals</h3>

          {[
            { label: "Blood Pressure", value: soap.bp || "—", unit: "mmHg", icon: "❤️", alert: soap.bp ? parseInt(soap.bp) > 140 : false },
            { label: "Temperature", value: soap.temp || "—", unit: "°C", icon: "🌡️", alert: soap.temp ? parseFloat(soap.temp) > 38.5 : false },
            { label: "SpO₂", value: soap.spo2?.toString() || "—", unit: "%", icon: "🫁", alert: soap.spo2 ? soap.spo2 < 95 : false },
          ].map((v) => (
            <div key={v.label} className="vitals-widget">
              <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>{v.icon} {v.label}</p>
              <p className="text-xl font-extrabold" style={{ color: v.alert ? "var(--p1-text)" : "var(--text-primary)" }}>
                {v.value} <span className="text-xs font-normal">{v.unit}</span>
              </p>
              {v.alert && <p className="text-xs font-semibold mt-1" style={{ color: "var(--p1-text)" }}>⚠ Abnormal</p>}
            </div>
          ))}

          <div className="vitals-widget">
            <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>⏱ Wait Time</p>
            <p className="text-xl font-extrabold" style={{ color: selectedPatient.wait_minutes > 30 ? "var(--p2-text)" : "var(--text-primary)" }}>
              {selectedPatient.wait_minutes} <span className="text-xs font-normal">min</span>
            </p>
          </div>

          <div className="vitals-widget">
            <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>🔴 Live Queue</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Supabase Realtime</span>
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Auto-synced across all devices</p>
          </div>
        </aside>
      )}

      {/* ── TELECONSULT MODAL ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showConsult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(12px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowConsult(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="w-full max-w-4xl rounded-3xl overflow-hidden"
              style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}
            >
              {/* Consult header */}
              <div className="px-6 py-4 flex items-center justify-between" style={{ background: "rgba(15,23,42,0.95)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-white font-semibold text-sm">Live Teleconsultation</span>
                  <span className="text-slate-400 text-sm">·</span>
                  <span className="text-slate-400 text-sm">{selectedPatient?.patient_name}</span>
                  {selectedPatient && <PriorityBadge p={selectedPatient.priority} />}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    id="open-prescription-modal-btn"
                    onClick={() => { setShowConsult(false); setShowPrescription(true); }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: "rgba(79,70,229,0.3)", color: "#a5b4fc" }}
                  >
                    <FileText size={13} /> Prescription
                  </button>
                  <button
                    id="close-consult-btn"
                    onClick={() => setShowConsult(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Video iframe */}
              <div style={{ background: "#030712", height: "500px", position: "relative" }}>
                <iframe
                  id="daily-iframe"
                  src={process.env.NEXT_PUBLIC_DAILY_ROOM_URL || "about:blank"}
                  allow="camera; microphone; fullscreen; speaker; display-capture"
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
                {/* Demo overlay when no Daily URL */}
                {!process.env.NEXT_PUBLIC_DAILY_ROOM_URL && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%)" }}>
                    <div className="w-20 h-20 rounded-full mb-4 flex items-center justify-center text-3xl font-bold text-white"
                      style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
                      {selectedPatient?.patient_name[0]}
                    </div>
                    <p className="text-white text-lg font-semibold mb-1">{selectedPatient?.patient_name}</p>
                    <p className="text-slate-400 text-sm mb-6">Connecting via Daily.co WebRTC...</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer"
                        style={{ background: "rgba(239,68,68,0.2)", border: "2px solid #dc2626" }}>
                        <Phone size={18} style={{ color: "#dc2626" }} />
                      </div>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer"
                        style={{ background: "rgba(16,185,129,0.2)", border: "2px solid #059669" }}>
                        <Video size={18} style={{ color: "#059669" }} />
                      </div>
                    </div>
                    <p className="text-slate-500 text-xs mt-6">Set NEXT_PUBLIC_DAILY_ROOM_URL to enable live video</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PRESCRIPTION PAD MODAL ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showPrescription && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 24 }}
              className="glass-panel w-full max-w-2xl rounded-3xl overflow-hidden"
              style={{ maxHeight: "85vh", overflowY: "auto" }}
            >
              <div className="p-6 border-b border-white/50 flex items-center justify-between">
                <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  Prescription Pad — {selectedPatient?.patient_name}
                </h2>
                <button onClick={() => setShowPrescription(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center btn-ghost">
                  <X size={16} />
                </button>
              </div>

              {prescriptionSent ? (
                <div className="p-8 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <CheckCircle size={48} className="mx-auto mb-4" style={{ color: "#059669" }} />
                    <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>Prescription Sent!</h3>
                    <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                      PDF delivered via WhatsApp. 24hr follow-up scheduled.
                    </p>
                    <div className="text-sm p-3 rounded-xl" style={{ background: "rgba(16,185,129,0.08)", color: "#059669" }}>
                      ✅ WhatsApp delivered · 📱 SMS backup sent · ⏰ 24hr check-in scheduled
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="p-6">
                  {/* Quick-add templates */}
                  <div className="mb-5">
                    <label className="label mb-3">Quick-Add Common Medications</label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_MEDS.map((med) => (
                        <button
                          key={med.name}
                          id={`add-med-${med.name.toLowerCase()}`}
                          onClick={() => addMed(med)}
                          disabled={selectedMeds.some((m) => m.name === med.name)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                          style={{
                            background: selectedMeds.some((m) => m.name === med.name) ? "var(--brand-soft)" : "rgba(255,255,255,0.7)",
                            border: selectedMeds.some((m) => m.name === med.name) ? "1px solid rgba(79,70,229,0.3)" : "1px solid rgba(100,116,139,0.15)",
                            color: selectedMeds.some((m) => m.name === med.name) ? "var(--brand)" : "var(--text-secondary)",
                            opacity: selectedMeds.some((m) => m.name === med.name) ? 0.6 : 1,
                          }}
                        >
                          {selectedMeds.some((m) => m.name === med.name) ? "✓ " : "+ "}{med.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected medications */}
                  {selectedMeds.length > 0 && (
                    <div className="mb-5">
                      <label className="label mb-3">Prescription</label>
                      <div className="space-y-2">
                        {selectedMeds.map((med) => (
                          <div
                            key={med.name}
                            className="flex items-center gap-3 p-3 rounded-xl"
                            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(100,116,139,0.12)" }}
                          >
                            <div className="flex-1">
                              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{med.name} {med.dose}</p>
                              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{med.frequency} · {med.duration}</p>
                            </div>
                            <button onClick={() => removeMed(med.name)}
                              className="w-7 h-7 rounded-full flex items-center justify-center"
                              style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626" }}>
                              <Minus size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    id="submit-prescription-btn"
                    onClick={submitPrescription}
                    disabled={selectedMeds.length === 0 || submitting}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                    style={{ opacity: selectedMeds.length === 0 ? 0.6 : 1 }}
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating PDF & Sending WhatsApp...
                      </>
                    ) : (
                      <>
                        <Send size={15} /> Send Prescription via WhatsApp
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
