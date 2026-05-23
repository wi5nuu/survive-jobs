import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ShieldAlert, Heart, HardHat, Briefcase, GraduationCap, X } from "lucide-react";

interface OnboardingViewProps {
  onComplete: () => void;
}

export default function OnboardingView({ onComplete }: OnboardingViewProps) {
  const [step, setStep] = useState(0);
  const [profession, setProfession] = useState("");
  const [reason, setReason] = useState("");

  const professions = [
    { id: "office", label: "Pekerja Kantoran", icon: Briefcase },
    { id: "factory", label: "Pekerja Pabrik", icon: HardHat },
    { id: "retail", label: "Pekerja Retail/Jasa", icon: Briefcase },
    { id: "freelance", label: "Freelancer/Kontrak", icon: GraduationCap },
  ];

  const reasons = [
    "Merasa Tidak Dihargai",
    "Gaji Tidak Sesuai",
    "Lingkungan Toxic",
    "Lembur Tidak Manusiawi",
    "Kesehatan Mental Menurun",
    "Konflik Atasan"
  ];

  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => {
        setStep(1);
      }, 3500); // Intro 3.5s
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full max-w-md mx-auto bg-[#FDFBF7] border-0 sm:border border-[#E2DDD4] sm:shadow-sm sm:rounded-2xl relative overflow-hidden h-[100dvh]">
      <AnimatePresence mode="wait">
        
        {/* STEP 0: SPLASH SCREEN */}
        {step === 0 && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center flex-1 space-y-6 text-center px-8 h-full min-h-[100dvh] bg-[#1E5C3A]"
          >
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 mb-4">
              <ShieldAlert className="w-10 h-10 text-[#1E5C3A]" />
            </div>
            <div>
              <h1 className="font-display font-black text-3xl text-white mb-2">Surjob AI</h1>
              <p className="text-[#C3D9CC] text-sm font-medium">Bantuan Cerdas untuk Hak Pekerja & Resign</p>
            </div>
            
            <div className="mt-8 flex gap-1.5 items-center">
               <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
               <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
               <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </motion.div>
        )}

        {/* STEP 1: PROFESSION */}
        {step === 1 && (
          <motion.div
            key="prof"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col flex-1 p-6 sm:p-8 h-full bg-[#FDFBF7] absolute inset-0 z-10"
          >
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="font-display font-bold text-2xl text-[#2C2A26] mb-2 leading-tight">Halo! Apa profesi kamu saat ini?</h2>
              <p className="text-[#6B6458] text-[13px] mb-8">Memilih profesi membantu kami menyesuaikan analisis hukum dengan UU yang sesuai.</p>
              
              <div className="space-y-3">
                {professions.map((p) => {
                  const Icon = p.icon;
                  const isSelected = profession === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setProfession(p.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                        isSelected 
                          ? "border-[#1E5C3A] bg-[#1E5C3A]/5 shadow-sm" 
                          : "border-[#E2DDD4] hover:border-[#1E5C3A]/40 bg-white"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isSelected ? "bg-[#1E5C3A] text-white" : "bg-[#EDE8DF] text-[#6B6458]"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`font-semibold text-[15px] ${isSelected ? "text-[#1E5C3A]" : "text-[#2C2A26]"}`}>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={handleNext}
                disabled={!profession}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  profession ? "bg-[#1E5C3A] hover:bg-[#153F28] text-white shadow-md shadow-[#1E5C3A]/20" : "bg-[#EDE8DF] text-[#A09880] cursor-not-allowed"
                }`}
              >
                <span>Lanjutkan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: REASON */}
        {step === 2 && (
          <motion.div
            key="reason"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col flex-1 p-6 sm:p-8 h-full bg-[#FDFBF7] absolute inset-0 z-10"
          >
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="font-display font-bold text-2xl text-[#2C2A26] mb-2 leading-tight">Kendala utama apa yang kamu alami?</h2>
              <p className="text-[#6B6458] text-[13px] mb-8">Pilih alasan terbesarmu, ini akan menjadi dasar solusi nyata yang kami berikan.</p>
              
              <div className="flex flex-wrap gap-2.5">
                {reasons.map((r) => {
                  const isSelected = reason === r;
                  return (
                    <button
                      key={r}
                      onClick={() => setReason(r)}
                      className={`px-4 py-2.5 rounded-full border text-[13px] font-semibold transition-all ${
                        isSelected 
                          ? "border-[#1E5C3A] bg-[#1E5C3A] text-white shadow-sm" 
                          : "border-[#E2DDD4] hover:bg-[#F3EFE6] bg-white text-[#6B6458]"
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 flex justify-between gap-3">
              <button
                onClick={() => setStep(1)}
                className="w-14 shrink-0 py-4 rounded-xl border border-[#E2DDD4] hover:bg-[#F3EFE6] text-[#6B6458] flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                disabled={!reason}
                className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  reason ? "bg-[#1E5C3A] hover:bg-[#153F28] text-white shadow-md shadow-[#1E5C3A]/20" : "bg-[#EDE8DF] text-[#A09880] cursor-not-allowed"
                }`}
              >
                <span>Lanjutkan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: REFLECTION */}
        {step === 3 && (
          <motion.div
            key="reflection"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col flex-1 p-6 sm:p-8 h-full absolute inset-0 z-10 text-[#2C2A26] overflow-hidden"
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-[#FDFBF7] z-0">
               <motion.div 
                 animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                 transition={{ duration: 10, repeat: Infinity }}
                 className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#EDE8DF] rounded-full blur-3xl"
               />
               <motion.div 
                 animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                 transition={{ duration: 15, repeat: Infinity, delay: 2 }}
                 className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[#E2DDD4] rounded-full blur-3xl"
               />
            </div>

            <div className="relative z-10 py-2.5 flex justify-end">
               <button onClick={onComplete} className="text-[#6B6458] hover:text-[#1E5C3A] flex items-center gap-1 text-[11px] font-bold">
                 <span>LEWATI</span>
                 <ArrowRight className="w-3 h-3" />
               </button>
            </div>
            <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center pb-12">
              <h2 className="font-display font-bold text-2xl sm:text-3xl mb-6 leading-tight">Analisis Situasi</h2>
              
              <div className="text-[#6B6458] text-[13px] leading-relaxed max-w-sm mb-6 space-y-4">
                <p>
                  Kami memahami bahwa menghadapi kendala <strong className="text-[#1E5C3A]">{reason.toLowerCase()}</strong> menuntut ketahanan mental yang tinggi. Anda telah melangkah sejauh ini dengan usaha maksimal.
                </p>
                <p>
                  Sebelum melanjutkan, pertimbangkan kembali tujuan awal dan konsekuensi dari langkah yang akan diambil. Rencanakan keputusan Anda dengan matang demi stabilitas pribadi dan keluarga.
                </p>
              </div>
              
              <div className="text-[#2C2A26] text-sm leading-relaxed max-w-sm font-semibold p-5 bg-white/60 backdrop-blur-sm rounded-xl border border-[#EDEADF] shadow-sm">
                Sistem kami akan memberikan analisis berdasarkan ketentuan hukum ketenagakerjaan yang berlaku di Indonesia. Gunakan informasi ini sebagai referensi dasar untuk menentukan langkah selanjutnya.
              </div>
            </div>

            <div className="relative z-10 pt-6">
              <button
                onClick={onComplete}
                className="w-full bg-[#1E5C3A] hover:bg-[#153F28] text-white font-bold py-4 rounded-xl text-center flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <span>Mulai Analisis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// Helper arrow left
function ArrowLeft(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}
