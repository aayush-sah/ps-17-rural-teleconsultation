"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle, Phone, Activity, Users, Bell } from "lucide-react";

// Mock queue state (in production: Supabase Realtime subscription)
const MOCK_PATIENT = {
  name: "Savitaben Patel",
  priority: "P2",
  position: 3,
  totalInQueue: 6,
  estimatedWait: 28,
  ticketId: "PHC-2026-0847",
  joinedAt: "6:52 AM",
  reasoning: "Moderate urgency — needs assessment within 30-60 minutes.",
};

export default function PatientQueue() {
  const [position, setPosition] = useState(MOCK_PATIENT.position);
  const [status, setStatus] = useState<"waiting" | "called" | "in_consult">("waiting");
  const [showNotification, setShowNotification] = useState(false);

  // Simulate real-time queue movement
  useEffect(() => {
    const timer = setTimeout(() => {
      if (position > 1) {
        setPosition((p) => p - 1);
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [position]);

  useEffect(() => {
    if (position === 1) {
      setTimeout(() => {
        setStatus("called");
        setShowNotification(true);
      }, 8000);
    }
  }, [position]);

  const priorityColors: Record<string, { text: string; bg: string; border: string; class: string }> = {
    P1: { text: "var(--p1-text)", bg: "var(--p1-bg)", border: "var(--p1-border)", class: "triage-p1" },
    P2: { text: "var(--p2-text)", bg: "var(--p2-bg)", border: "var(--p2-border)", class: "triage-p2" },
    P3: { text: "var(--p3-text)", bg: "var(--p3-bg)", border: "var(--p3-border)", class: "triage-p3" },
  };
  const pc = priorityColors[MOCK_PATIENT.priority];

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center">
      {/* Notification banner */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            className="fixed top-4 left-4 right-4 z-50 p-4 rounded-2xl flex items-center gap-3"
            style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "white", boxShadow: "0 8px 32px rgba(79,70,229,0.4)" }}
          >
            <Bell size={20} />
            <div>
              <p className="font-bold text-sm">Doctor is ready for you!</p>
              <p className="text-xs opacity-90">Please proceed to the teleconsultation screen.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow: "0 4px 16px rgba(79,70,229,0.4)" }}
          >
            <Activity className="text-white" size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--brand)" }}>Queue Position</p>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Anand Primary Health Centre</p>
          </div>
        </div>

        {/* Ticket card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Queue Ticket</p>
              <p className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>{MOCK_PATIENT.ticketId}</p>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${pc.class}`}>
              {MOCK_PATIENT.priority}
            </div>
          </div>

          <p className="text-sm font-medium mb-5" style={{ color: "var(--text-secondary)" }}>{MOCK_PATIENT.name}</p>

          {/* Position display */}
          <div className="text-center py-6 mb-4 rounded-2xl" style={{ background: "rgba(79,70,229,0.04)" }}>
            {status === "waiting" ? (
              <>
                <motion.div
                  key={position}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-6xl font-extrabold mb-2"
                  style={{ color: "var(--brand)" }}
                >
                  #{position}
                </motion.div>
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>in queue</p>
                <div className="flex items-center justify-center gap-2 mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
                  <Clock size={14} />
                  ~{Math.max(5, position * 10)} min estimated wait
                </div>
              </>
            ) : (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                <CheckCircle size={40} className="mx-auto mb-2" style={{ color: "#059669" }} />
                <p className="text-lg font-bold" style={{ color: "#059669" }}>Doctor is ready!</p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Tap below to start your consultation</p>
              </motion.div>
            )}
          </div>

          {/* Queue progress */}
          <div className="flex items-center gap-1 mb-4">
            {Array.from({ length: MOCK_PATIENT.totalInQueue }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-1.5 rounded-full transition-all"
                style={{
                  background: i < position - 1
                    ? "rgba(100,116,139,0.15)"
                    : i === position - 1
                    ? "var(--brand)"
                    : "rgba(100,116,139,0.1)",
                }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
            <span><Users size={11} className="inline mr-1" />{MOCK_PATIENT.totalInQueue} in queue total</span>
            <span>Joined at {MOCK_PATIENT.joinedAt}</span>
          </div>
        </motion.div>

        {/* Triage info */}
        <div className="glass-card p-4 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
            AI Triage Assessment
          </p>
          <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
            {MOCK_PATIENT.reasoning}
          </p>
        </div>

        {status === "called" && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="btn-primary w-full flex items-center justify-center gap-2"
            onClick={() => window.open(process.env.NEXT_PUBLIC_DAILY_ROOM_URL || "https://demo.daily.co", "_blank")}
          >
            <Phone size={16} /> Join Teleconsultation
          </motion.button>
        )}

        {/* SMS reminder */}
        <p className="text-xs text-center mt-4" style={{ color: "var(--text-muted)" }}>
          📱 SMS updates sent to your phone · No app needed
        </p>
      </div>
    </div>
  );
}
