"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, Users, Stethoscope, Shield, ChevronRight, Heart, Zap, Globe } from "lucide-react";
import { useLanguage } from "../lib/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

const stats = [
  { label: "Patients Served", value: "1,240+", icon: Users },
  { label: "Avg. Triage Time", value: "< 30s", icon: Zap },
  { label: "Clinics Connected", value: "12", icon: Globe },
  { label: "DPDPA Compliant", value: "✓", icon: Shield },
];

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();

  const roles = [
    {
      id: "patient",
      icon: Heart,
      title: t("patient_asha"),
      desc: t("patient_desc"),
      color: "from-emerald-500 to-teal-500",
      glow: "rgba(16,185,129,0.25)",
      path: "/auth?role=patient",
    },
    {
      id: "doctor",
      icon: Stethoscope,
      title: t("doctor"),
      desc: t("doctor_desc"),
      color: "from-indigo-500 to-violet-600",
      glow: "rgba(99,102,241,0.25)",
      path: "/auth?role=doctor",
    },
    {
      id: "coordinator",
      icon: Activity,
      title: t("coordinator"),
      desc: t("coordinator_desc"),
      color: "from-amber-500 to-orange-500",
      glow: "rgba(245,158,11,0.25)",
      path: "/auth?role=coordinator",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <header className="relative px-4 sm:px-8 pt-6 pb-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 self-start sm:self-auto"
          >
            <div
              style={{
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                boxShadow: "0 4px 16px rgba(79,70,229,0.4)",
              }}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            >
              <Activity className="text-white" size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--brand)" }}>
                PS-17 Health Informatics
              </p>
              <h1 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                PHC Teleconsultation
              </h1>
            </div>
          </motion.div>

          {/* Top Right section: Language Switcher + Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-end gap-3 self-end sm:self-auto"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: "rgba(16,185,129,0.1)", color: "#059669" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              System Online
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Hero */}
      <main className="flex-1 px-4 sm:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-10 sm:mb-14"
          >
            <div className="flex justify-center mb-6">
              <LanguageSwitcher />
            </div>
            
            <h2
              className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              <span style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {t("smarter_queues")}
              </span>
            </h2>
            <p className="text-base sm:text-lg max-w-xl mx-auto px-4" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
              {t("sub_text")}
            </p>
          </motion.div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            {roles.map((role, i) => (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                onClick={() => router.push(role.path)}
                className="glass-card p-6 text-left cursor-pointer group transition-all duration-200 hover:scale-[1.02] border-2 border-transparent hover:border-indigo-500/30"
                style={{
                  boxShadow: `var(--shadow-card), 0 0 0 0 ${role.glow}`,
                }}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-5`}
                  style={{ boxShadow: `0 8px 24px ${role.glow}` }}
                >
                  <role.icon className="text-white" size={26} />
                </div>
                <h3 className="font-bold text-xl sm:text-lg mb-2" style={{ color: "var(--text-primary)" }}>
                  {role.title}
                </h3>
                <p className="text-sm mb-6 max-w-[200px]" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {role.desc}
                </p>
                <div className="flex items-center gap-1 font-bold text-lg sm:text-sm" style={{ color: "var(--brand)" }}>
                  {t("enter")} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 hidden sm:grid"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card text-center py-4">
                <stat.icon size={20} className="mx-auto mb-2" style={{ color: "var(--brand)" }} />
                <div className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>
                  {stat.value}
                </div>
                <div className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 text-center mt-auto">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          DPDPA 2023 Compliant · Data stored on AWS ap-south-1 (Mumbai) · PS-17 Hackathon Demo
        </p>
      </footer>
    </div>
  );
}
