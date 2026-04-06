"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity, Users, Clock, AlertTriangle,
  CheckCircle, TrendingUp, Wifi, ToggleLeft, ToggleRight
} from "lucide-react";

const DEMO_QUEUE = [
  { id: "q-001", name: "Savitaben Patel", age: 67, priority: "P1", complaint: "Chest tightness and breathlessness", wait: 22, reviewed: true, confidence: 1.0, override: true },
  { id: "q-002", name: "Ramkumar Singh", age: 45, priority: "P2", complaint: "High fever for 3 days with chills", wait: 35, reviewed: false, confidence: 0.84, override: false },
  { id: "q-003", name: "Meena Devi", age: 32, priority: "P2", complaint: "Severe abdominal pain after eating", wait: 18, reviewed: false, confidence: 0.61, override: false, flag: true },
  { id: "q-004", name: "Arjun Yadav", age: 8, priority: "P2", complaint: "Persistent cough and runny nose", wait: 12, reviewed: false, confidence: 0.78, override: false },
  { id: "q-005", name: "Lalitaben Trivedi", age: 55, priority: "P3", complaint: "Routine BP check and diabetes follow-up", wait: 8, reviewed: false, confidence: 0.93, override: false },
  { id: "q-006", name: "Suresh Bhai", age: 28, priority: "P3", complaint: "Minor skin rash on forearm", wait: 5, reviewed: false, confidence: 0.88, override: false },
];

const DEMO_DOCTORS = [
  { id: "d-001", name: "Dr. Priya Sharma", specialty: "General Medicine", online: true, consulting: 0 },
  { id: "d-002", name: "Dr. Rajan Mehta", specialty: "Pediatrics", online: false, consulting: 0 },
];

const FOLLOWUP_ALERTS = [
  { patient: "Ramkumar Singh", response: "3 — Worse", time: "2 hours ago", escalated: true },
  { patient: "Geeta Patel", response: "1 — Better", time: "Yesterday 6PM", escalated: false },
];

export default function CoordinatorDashboard() {
  const [queue, setQueue] = useState(DEMO_QUEUE);
  const [doctors, setDoctors] = useState(DEMO_DOCTORS);
  const [overriding, setOverriding] = useState<string | null>(null);
  const [overrideNote, setOverrideNote] = useState("");

  const priorityCls: Record<string, string> = {
    P1: "triage-p1", P2: "triage-p2", P3: "triage-p3",
  };

  function toggleDoctor(id: string) {
    setDoctors((docs) => docs.map((d) => d.id === id ? { ...d, online: !d.online } : d));
  }

  function applyOverride(id: string, newPriority: string) {
    setQueue((q) => q.map((p) => p.id === id
      ? { ...p, priority: newPriority as "P1" | "P2" | "P3", reviewed: true }
      : p
    ));
    setOverriding(null);
    setOverrideNote("");
  }

  const flagged = queue.filter((p) => p.flag && !p.reviewed);
  const stats = {
    total: queue.length,
    p1: queue.filter((p) => p.priority === "P1").length,
    p2: queue.filter((p) => p.priority === "P2").length,
    p3: queue.filter((p) => p.priority === "P3").length,
    avgWait: Math.round(queue.reduce((s, p) => s + p.wait, 0) / queue.length),
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", boxShadow: "0 4px 16px rgba(245,158,11,0.4)" }}
            >
              <Activity className="text-white" size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#d97706" }}>Coordinator</p>
              <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Anand PHC · Queue Monitor</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            <Wifi size={14} className="text-emerald-500" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Supabase Realtime
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 stagger-children">
          {[
            { label: "Total Patients", value: stats.total, icon: Users, color: "#4f46e5" },
            { label: "P1 Critical", value: stats.p1, icon: AlertTriangle, color: "#dc2626" },
            { label: "P2 Urgent", value: stats.p2, icon: Clock, color: "#d97706" },
            { label: "P3 Stable", value: stats.p3, icon: CheckCircle, color: "#059669" },
            { label: "Avg. Wait (min)", value: stats.avgWait, icon: TrendingUp, color: "#0891b2" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="stat-card"
            >
              <stat.icon size={18} className="mb-2" style={{ color: stat.color }} />
              <div className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>{stat.value}</div>
              <div className="text-xs uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Queue table */}
          <div className="lg:col-span-2 glass-card p-5">
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Users size={16} style={{ color: "var(--brand)" }} /> Live Queue
            </h2>

            {/* Flagged banner */}
            {flagged.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-3 rounded-xl mb-4"
                style={{ background: "var(--p2-bg)", border: "1px solid var(--p2-border)" }}
              >
                <AlertTriangle size={16} style={{ color: "var(--p2-text)" }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--p2-text)" }}>
                    {flagged.length} case{flagged.length > 1 ? "s" : ""} need coordinator review
                  </p>
                  <p className="text-xs" style={{ color: "var(--p2-text)", opacity: 0.8 }}>
                    AI confidence below 70% — manual triage priority check required
                  </p>
                </div>
              </motion.div>
            )}

            <div className="space-y-2">
              {queue.map((patient, i) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-3.5 rounded-2xl"
                  style={{
                    background: patient.flag ? "rgba(245,158,11,0.05)" : "rgba(255,255,255,0.55)",
                    border: patient.flag ? "1px solid rgba(245,158,11,0.25)" : "1px solid rgba(255,255,255,0.7)",
                  }}
                >
                  <span className={`${priorityCls[patient.priority]} px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0`}>{patient.priority}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{patient.name}</p>
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{patient.complaint}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{patient.wait}m wait</p>
                    <p className="text-xs" style={{ color: patient.confidence < 0.70 ? "var(--p2-text)" : "var(--text-muted)" }}>
                      {(patient.confidence * 100).toFixed(0)}% conf
                    </p>
                  </div>
                  {patient.flag && !patient.reviewed && (
                    <div className="flex-shrink-0">
                      {overriding === patient.id ? (
                        <div className="flex items-center gap-2">
                          {["P1", "P2", "P3"].map((p) => (
                            <button
                              key={p}
                              onClick={() => applyOverride(patient.id, p)}
                              className={`${priorityCls[p]} px-2 py-1 rounded-lg text-xs font-bold cursor-pointer`}
                            >{p}</button>
                          ))}
                          <button onClick={() => setOverriding(null)} className="text-xs" style={{ color: "var(--text-muted)" }}>×</button>
                        </div>
                      ) : (
                        <button
                          id={`review-${patient.id}`}
                          onClick={() => setOverriding(patient.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: "var(--p2-bg)", color: "var(--p2-text)", border: "1px solid var(--p2-border)" }}
                        >
                          Review
                        </button>
                      )}
                    </div>
                  )}
                  {patient.override && (
                    <span className="flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-lg"
                      style={{ background: "var(--p1-bg)", color: "var(--p1-text)" }}>
                      Override
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Doctor availability */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                Doctor Availability
              </h2>
              <div className="space-y-3">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.8)" }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: doc.online ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "rgba(100,116,139,0.3)" }}
                    >
                      {doc.name.split(" ")[1]?.[0] || "D"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{doc.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{doc.specialty}</p>
                    </div>
                    <button
                      id={`toggle-doc-${doc.id}`}
                      onClick={() => toggleDoctor(doc.id)}
                      className="flex-shrink-0"
                    >
                      {doc.online ? (
                        <ToggleRight size={28} style={{ color: "#059669" }} />
                      ) : (
                        <ToggleLeft size={28} style={{ color: "#94a3b8" }} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-up alerts */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                24hr Follow-up Alerts
              </h2>
              <div className="space-y-3">
                {FOLLOWUP_ALERTS.map((alert, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl"
                    style={{
                      background: alert.escalated ? "var(--p1-bg)" : "var(--p3-bg)",
                      border: `1px solid ${alert.escalated ? "var(--p1-border)" : "var(--p3-border)"}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold" style={{ color: alert.escalated ? "var(--p1-text)" : "var(--p3-text)" }}>
                        {alert.escalated ? "⚠ " : "✓ "}{alert.patient}
                      </p>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{alert.time}</span>
                    </div>
                    <p className="text-xs" style={{ color: alert.escalated ? "var(--p1-text)" : "var(--p3-text)" }}>
                      Response: {alert.response}
                    </p>
                    {alert.escalated && (
                      <button className="mt-2 w-full text-xs font-semibold py-1.5 rounded-lg"
                        style={{ background: "rgba(239,68,68,0.15)", color: "var(--p1-text)" }}>
                        Contact Patient
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
