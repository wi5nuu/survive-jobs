import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ShieldCheck, CheckCircle, Lock, Briefcase, Users, Coffee, MoreHorizontal } from "lucide-react";

interface OnboardingViewProps {
  onComplete: () => void;
}

const TOTAL_STEPS = 4;

const professionData = [
  { label: "Karyawan Pabrik", icon: "🏭", value: "Karyawan Pabrik" },
  { label: "Karyawan Kantor", icon: "🏢", value: "Karyawan Kantor" },
  { label: "Freelance", icon: "💻", value: "Freelance" },
  { label: "Retail / F&B", icon: "🛍️", value: "Retail/F&B" },
  { label: "Lainnya", icon: "✦", value: "Lainnya" },
];

const consentItems = [
  { icon: Briefcase, text: "Anda adalah seorang pekerja yang sedang mencari solusi profesional." },
  { icon: Users, text: "Anda menggunakan platform ini dengan kesadaran penuh." },
  { icon: Lock, text: "Analisis ini adalah panduan referensi, bukan nasihat hukum formal." },
];

// Step indicator dots
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i + 1 === current ? 24 : 6,
            backgroundColor: i + 1 === current ? "#1E5C3A" : i + 1 < current ? "#A8CDB8" : "#DDD8CF",
          }}
          transition={{ duration: 0.3 }}
          className="h-1.5 rounded-full"
        />
      ))}
    </div>
  );
}

// Floating badge top-right ambient decoration
function AmbientBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="absolute top-6 right-6 flex items-center gap-1.5 bg-[#E8F2EC] border border-[#C3D9CC] rounded-full px-3 py-1.5 text-[10px] font-bold text-[#1E5C3A] tracking-wide"
    >
      <Lock className="w-3 h-3" />
      100% ANONIM
    </motion.div>
  );
}

export default function OnboardingView({ onComplete }: OnboardingViewProps) {
  const [step, setStep] = useState(1);
  const [profession, setProfession] = useState("");
  const [agreed, setAgreed] = useState(false);

  const startAnalysis = () => {
    setStep(5);
    setTimeout(onComplete, 2200);
  };

  return (
    <div className="fixed inset-0 bg-[#F8F5EF] flex flex-col items-center justify-center p-6 text-[#1A1A1A] overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#1E5C3A]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#1E5C3A]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>

      {step < 5 && <AmbientBadge />}

      <div className="w-full max-w-sm relative z-10">
        <AnimatePresence mode="wait">

          {/* ─── STEP 1: WELCOME ─── */}
          {step === 1 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8 text-center"
            >
              {/* Logo lockup */}
              <div className="space-y-5">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                  className="relative w-20 h-20 mx-auto"
                >
                  <div className="absolute inset-0 bg-[#1E5C3A] rounded-2xl shadow-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2D7A50] to-[#1E5C3A] rounded-2xl" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck className="w-9 h-9 text-white drop-shadow" />
                  </div>
                  {/* Glow ring */}
                  <div className="absolute -inset-1 bg-[#1E5C3A]/20 rounded-3xl blur-sm -z-10" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  className="space-y-2"
                >
                  <h1 className="text-[2.6rem] font-black tracking-tighter leading-none text-[#111]">
                    Surjob<span className="text-[#1E5C3A]"> AI</span>
                  </h1>
                  <p className="text-[#777] text-sm leading-relaxed max-w-[260px] mx-auto">
                    Bantuan cerdas untuk hak pekerja & resign yang lebih profesional.
                  </p>
                </motion.div>
              </div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="grid grid-cols-3 divide-x divide-[#E2DDD4] bg-white border border-[#E2DDD4] rounded-2xl overflow-hidden shadow-sm"
              >
                {[
                  { value: "1.2rb+", label: "Kasus" },
                  { value: "892", label: "Survive" },
                  { value: "100%", label: "Anonim" },
                ].map((s) => (
                  <div key={s.label} className="py-3 px-2 text-center">
                    <p className="text-sm font-black text-[#1E5C3A]">{s.value}</p>
                    <p className="text-[10px] text-[#999] font-medium">{s.label}</p>
                  </div>
                ))}
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                onClick={() => setStep(2)}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-[#1E5C3A] hover:bg-[#153F28] text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-[#1E5C3A]/25 transition-colors"
              >
                Mulai Sekarang <ArrowRight className="w-4 h-4" />
              </motion.button>

              <p className="text-[10px] text-[#BBB] text-center">
                Gratis sepenuhnya · Tidak perlu akun
              </p>
            </motion.div>
          )}

          {/* ─── STEP 2: PROFESSION ─── */}
          {step === 2 && (
            <motion.div
              key="profession"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <StepDots current={1} total={TOTAL_STEPS} />

              <div className="space-y-1">
                <p className="text-[11px] font-bold text-[#1E5C3A] uppercase tracking-widest">Langkah 1 / {TOTAL_STEPS}</p>
                <h2 className="text-2xl font-black tracking-tight">Apa profesi Anda?</h2>
                <p className="text-[#888] text-xs">Ini membantu AI memberikan panduan yang lebih relevan.</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {professionData.map((p, i) => (
                  <motion.button
                    key={p.value}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    onClick={() => { setProfession(p.value); setStep(3); }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-4 p-3.5 rounded-xl border-2 font-semibold text-sm text-left transition-all ${
                      profession === p.value
                        ? "bg-[#1E5C3A] text-white border-[#1E5C3A] shadow-md"
                        : "bg-white border-[#E8E3DA] hover:border-[#1E5C3A] text-[#1A1A1A]"
                    }`}
                  >
                    <span className="text-xl w-8 text-center">{p.icon}</span>
                    <span>{p.label}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ml-auto transition-opacity ${profession === p.value ? "opacity-100" : "opacity-30"}`} />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─── STEP 3: EMPATHY ─── */}
          {step === 3 && (
            <motion.div
              key="empathy"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <StepDots current={2} total={TOTAL_STEPS} />

              <div className="space-y-1">
                <p className="text-[11px] font-bold text-[#1E5C3A] uppercase tracking-widest">Langkah 2 / {TOTAL_STEPS}</p>
                <h2 className="text-2xl font-black tracking-tight leading-tight">Anda tidak<br/>sendirian.</h2>
              </div>

              {/* Empathy card */}
              <div className="bg-white border border-[#E2DDD4] rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-[#1E5C3A] to-[#2D7A50] px-5 py-4">
                  <p className="text-white text-sm font-semibold leading-relaxed italic">
                    "Di sini, kita saling berbagi untuk menguatkan, bukan melemahkan."
                  </p>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <p className="text-xs text-[#666] leading-relaxed">
                    Situasi sulit di tempat kerja adalah tantangan yang dialami banyak orang, bukan hanya Anda. Menyadari hal ini adalah langkah pertama menuju perubahan.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex -space-x-2">
                      {["🧑", "👩", "🧔", "👨‍💼"].map((e, i) => (
                        <div key={i} className="w-6 h-6 bg-[#EDE8DF] rounded-full flex items-center justify-center text-xs border-2 border-white">{e}</div>
                      ))}
                    </div>
                    <p className="text-[10px] text-[#999] font-medium">1.247+ pekerja telah berbagi</p>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={() => setStep(4)}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-[#1E5C3A] hover:bg-[#153F28] text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-[#1E5C3A]/20 transition-colors"
              >
                Saya Siap Melanjutkan
              </motion.button>
            </motion.div>
          )}

          {/* ─── STEP 4: CONSENT ─── */}
          {step === 4 && (
            <motion.div
              key="consent"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              <StepDots current={4} total={TOTAL_STEPS} />

              <div className="space-y-1">
                <p className="text-[11px] font-bold text-[#1E5C3A] uppercase tracking-widest">Langkah 4 / {TOTAL_STEPS}</p>
                <h2 className="text-2xl font-black tracking-tight">Persetujuan<br/>Pengguna</h2>
              </div>

              <div className="bg-white border border-[#E2DDD4] rounded-2xl p-5 space-y-3 shadow-sm">
                <p className="text-xs text-[#888] mb-1">Dengan melanjutkan, Anda menyatakan dan menyetujui bahwa:</p>
                {consentItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-7 h-7 bg-[#E8F2EC] rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="w-3.5 h-3.5 text-[#1E5C3A]" />
                    </div>
                    <p className="text-xs text-[#555] leading-relaxed">{item.text}</p>
                  </motion.div>
                ))}
              </div>

              {/* Custom checkbox */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setAgreed(!agreed)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                    agreed ? "bg-[#1E5C3A] border-[#1E5C3A]" : "bg-white border-[#D4CFC6] group-hover:border-[#1E5C3A]"
                  }`}
                >
                  <AnimatePresence>
                    {agreed && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <CheckCircle className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <span className="text-sm font-medium text-[#333]">Saya mengerti dan menyetujui.</span>
              </label>

              <motion.button
                onClick={startAnalysis}
                disabled={!agreed}
                whileTap={agreed ? { scale: 0.97 } : {}}
                className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all ${
                  agreed
                    ? "bg-[#1E5C3A] hover:bg-[#153F28] text-white shadow-lg shadow-[#1E5C3A]/25"
                    : "bg-[#EDE8DF] text-[#B0A898] cursor-not-allowed"
                }`}
              >
                Mulai Analisis <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* ─── STEP 5: LOADING ─── */}
          {step === 5 && (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-8 text-center"
            >
              {/* Spinner only — no overlapping icon */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="animate-spin w-16 h-16" style={{ animationDuration: "1.6s" }} viewBox="0 0 64 64">
                  {/* Track */}
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#C3D9CC" strokeWidth="4" />
                  {/* Spinner arc */}
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#1E5C3A" strokeWidth="4" strokeDasharray="50 114" strokeLinecap="round" strokeDashoffset="0" />
                </svg>
              </div>

              <div className="space-y-2">
                <p className="font-black text-lg tracking-tight text-[#1A1A1A]">Menyiapkan Sistem...</p>
                <p className="text-xs text-[#999] leading-relaxed max-w-[220px] mx-auto">
                  Memuat panduan hukum, modul analisis, dan enkripsi data Anda
                </p>
              </div>

              {/* Loading steps */}
              <div className="space-y-2 w-full max-w-[220px]">
                {["Enkripsi aktif", "Modul AI dimuat", "Siap digunakan"].map((label, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.5 + 0.3 }}
                    className="flex items-center gap-2.5"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.5 + 0.5, type: "spring" }}
                      className="w-4 h-4 bg-[#E8F2EC] rounded-full flex items-center justify-center shrink-0"
                    >
                      <CheckCircle className="w-3 h-3 text-[#1E5C3A]" />
                    </motion.div>
                    <span className="text-xs text-[#666] font-medium">{label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}