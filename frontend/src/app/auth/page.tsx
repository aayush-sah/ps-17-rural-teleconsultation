"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Shield, ChevronRight, Activity, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "../../lib/LanguageContext";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";

function AuthContent() {
  const router = useRouter();
  const params = useSearchParams();
  const role = params.get("role") || "patient";
  const { t } = useLanguage();

  const [step, setStep] = useState<"phone" | "otp" | "pin">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState("");

  const roleLabels: Record<string, string> = {
    patient: t("patient_asha"),
    doctor: t("doctor"),
    coordinator: t("coordinator"),
  };

  const roleColors: Record<string, string> = {
    patient: "from-emerald-500 to-teal-500",
    doctor: "from-indigo-500 to-violet-600",
    coordinator: "from-amber-500 to-orange-500",
  };

  const demoPins: Record<string, string> = {
    doctor: "5678",
    coordinator: "9090",
    asha_worker: "1234",
  };

  async function sendOtp() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setDemoOtp("123456");
    setLoading(false);
    setStep("otp");
  }

  async function verifyOtp() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    if (role === "patient") {
      router.push("/patient/register");
    } else {
      setStep("pin");
    }
  }

  async function verifyPin() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    router.push(`/${role}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 flex-col">
      <div className="w-full max-w-sm">
        {/* Header + English Switcher */}
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow: "0 4px 16px rgba(79,70,229,0.4)" }}
            >
              <Activity className="text-white" size={18} />
            </div>
            <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              PS-17 Teleconsult
            </span>
          </motion.div>
          <LanguageSwitcher />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8"
        >
          {/* Role badge */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r ${roleColors[role]} text-white mb-6`}
          >
            {roleLabels[role]}
          </div>

          <AnimatePresence mode="wait">
            {step === "phone" && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                  {t("login")}
                </h2>
                <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                  We&apos;ll send a 6-digit OTP via SMS.
                </p>
                <label className="label">{t("phone")}</label>
                <div className="flex gap-2 mb-6">
                  <span
                    className="flex items-center px-3 rounded-[10px] text-sm font-medium"
                    style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(100,116,139,0.2)", color: "var(--text-secondary)" }}
                  >
                    +91
                  </span>
                  <input
                    id="phone-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="input-field flex-1 text-lg py-3"
                    maxLength={10}
                  />
                </div>
                <button
                  id="send-otp-btn"
                  onClick={sendOtp}
                  disabled={phone.length < 10 || loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base"
                  style={{ opacity: phone.length < 10 ? 0.6 : 1 }}
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {t("send_otp")} <ChevronRight size={18} />
                    </>
                  )}
                </button>
                {role !== "patient" && (
                  <p className="text-xs text-center mt-4" style={{ color: "var(--text-muted)" }}>
                    Demo: use any 10-digit number
                  </p>
                )}
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                  {t("enter_otp")}
                </h2>
                <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                  Sent to +91 {phone}
                </p>
                {demoOtp && (
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-6"
                    style={{ background: "rgba(16,185,129,0.08)", color: "#059669" }}
                  >
                    <Shield size={14} />
                    Demo OTP: <strong>{demoOtp}</strong>
                  </div>
                )}
                <input
                  id="otp-input"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="input-field mb-6 text-center text-3xl font-bold tracking-[0.3em] py-4"
                  maxLength={6}
                />
                <button
                  id="verify-otp-btn"
                  onClick={verifyOtp}
                  disabled={otp.length < 6 || loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base"
                  style={{ opacity: otp.length < 6 ? 0.6 : 1 }}
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    t("verify_otp")
                  )}
                </button>
                <button onClick={() => setStep("phone")} className="btn-ghost w-full mt-3 text-sm py-2">
                  ← Change number
                </button>
              </motion.div>
            )}

            {step === "pin" && (
              <motion.div
                key="pin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                  Staff PIN
                </h2>
                <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                  Enter your 4-digit role PIN for shared device access.
                </p>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-6"
                  style={{ background: "rgba(79,70,229,0.06)", color: "var(--brand)" }}
                >
                  Demo PINs — Doctor: <strong>5678</strong> | Coord: <strong>9090</strong> | ASHA: <strong>1234</strong>
                </div>
                <label className="label">PIN</label>
                <div className="relative mb-6">
                  <input
                    id="pin-input"
                    type={showPin ? "text" : "password"}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    className="input-field text-center text-3xl tracking-[0.5em] py-4"
                    maxLength={4}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {showPin ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
                <button
                  id="verify-pin-btn"
                  onClick={verifyPin}
                  disabled={pin.length < 4 || loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base"
                  style={{ opacity: pin.length < 4 ? 0.6 : 1 }}
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Access Dashboard"
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="text-xs text-center mt-6" style={{ color: "var(--text-muted)" }}>
          Your data is protected under DPDPA 2023 · Stored in India (AWS ap-south-1)
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
  );
}
