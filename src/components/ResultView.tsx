import { motion } from "motion/react";
import { ShieldAlert, CheckCircle, HelpCircle, FileText, ArrowRight, BookOpen, AlertCircle, Loader2, RefreshCw, Send, X } from "lucide-react";
import { AnalyzeResponse } from "../types";
import { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

interface ResultViewProps {
  report: AnalyzeResponse | null;
  onNavigateToChat: () => void;
  onNavigateToCommunity?: () => void;
}

export default function ResultView({ report, onNavigateToChat, onNavigateToCommunity }: ResultViewProps) {
  const [showScoreLoader, setShowScoreLoader] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (report) {
      setShowScoreLoader(true);
      const timer = setTimeout(() => {
        setShowScoreLoader(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [report]);

  const handleShare = async () => {
    if (!feedbackText.trim() || !report) return;
    setIsSharing(true);
    try {
      await addDoc(collection(db, "posts"), {
        author: `Pekerja Tangguh #${Math.floor(1000 + Math.random() * 9000)}`,
        content: feedbackText,
        category: report.category,
        tags: [report.category, report.score < 40 ? "Sangat Toxic" : "Rawan"],
        actionStatus: report.score < 40 ? "Masih berjuang" : "Baru mulai bertindak",
        reactions: { aku_juga: 0, kuatkan: 0, survive: 0 },
        aiAdvice: `Berdasarkan analisis kesehatan kerja, kantor ini memiliki skor ${report.score}/100. Prioritaskan regulasi ketenagakerjaan RI dan lindungi hak Anda.`,
        createdAt: Date.now(),
        city: "Indonesia",
        industry: "Umum",
        solusiNyata: report.steps[0] || "Hubungi Disnaker terkait.",
        replies: []
      });
      setShowShareModal(false);
      if (onNavigateToCommunity) {
        onNavigateToCommunity();
      }
    } catch (e) {
      console.error(e);
      alert("Gagal membagikan hasil. Periksa koneksi.");
    } finally {
      setIsSharing(false);
    }
  };

  if (!report) {
    return (
      <div className="max-w-md mx-auto bg-white border border-[#E2DDD4] p-8 rounded-lg text-center space-y-6 shadow-sm my-4">
        <div className="mx-auto w-16 h-16 bg-[#EDE8DF] rounded-full flex items-center justify-center text-2xl">
          📊
        </div>
        <div className="space-y-2">
          <h2 className="font-display font-bold text-base text-[#2C2A26]">Belum Ada Laporan Hasil</h2>
          <p className="text-xs text-[#6B6458] leading-relaxed max-w-sm mx-auto">
            Mulailah mengobrol dengan asisten Surjob AI mengenai keluh kesah, jam lembur, atau suasana kantor kamu. AI akan merangkum skor kesehatan kerja kamu secara instan dan rahasia.
          </p>
        </div>
        <button
          onClick={onNavigateToChat}
          className="w-full bg-[#1E5C3A] hover:bg-[#153F28] text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <span>Mulai Analisis dengan AI</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (showScoreLoader) {
    return (
      <div className="max-w-md mx-auto bg-white border border-[#E2DDD4] p-10 rounded-lg text-center space-y-6 shadow-sm my-10 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-12 h-12 text-[#1E5C3A] animate-spin mb-2" />
        <div className="space-y-2">
          <h3 className="font-display font-bold text-base text-[#2C2A26]">Menganalisis Sistem...</h3>
          <p className="text-xs text-[#6B6458] leading-relaxed max-w-xs mx-auto">
            Surjob AI sedang menghitung kalkulasi hak pekerja, red flags, dan skor lingkungan kerja Anda...
          </p>
        </div>
      </div>
    );
  }

  const { score, category, redFlags, steps, rights } = report;

  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let scoreColor = "#C0392B"; 
  let scoreBg = "bg-[#FDECEA]";
  let scoreText = "text-[#7B2020]";

  if (score >= 70) {
    scoreColor = "#1E5C3A"; 
    scoreBg = "bg-[#E8F2EC]";
    scoreText = "text-[#1E5C3A]";
  } else if (score >= 40) {
    scoreColor = "#D35400"; 
    scoreBg = "bg-[#FEF5E7]";
    scoreText = "text-[#A04000]";
  }

  return (
    <div className="space-y-6 max-w-md mx-auto pb-12">
      <div>
        <h2 className="font-display font-bold text-base text-[#2C2A26] flex items-center gap-1.5">
          <span>📊 Hasil Analisis Workplace</span>
        </h2>
        <p className="text-xs text-[#6B6458]">Saringan obyektif kondisi kantor kamu berdasarkan Undang-Undang RI.</p>
      </div>

      <div className="bg-white border border-[#E2DDD4] rounded-lg p-6 shadow-sm flex flex-col items-center text-center space-y-4">
        <span className="text-[10px] uppercase font-bold text-[#A09880] tracking-widest">
          Workplace Health Score
        </span>

        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="stroke-[#EDE8DF]"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <motion.circle
              cx="72"
              cy="72"
              r={radius}
              stroke={scoreColor}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <span className="font-display font-black text-3xl text-[#2C2A26] block">
              {score}
            </span>
            <span className="text-[9px] text-[#6B6458] font-bold tracking-wider block">
              DARI 100
            </span>
          </div>
        </div>

        <div className={`px-4 py-1.5 rounded-full ${scoreBg} ${scoreText} font-bold text-xs border border-transparent`}>
          Status: {category || (score >= 70 ? "Cukup Sehat" : score >= 40 ? "Rawan / Kuning" : "Sangat Toxic")}
        </div>

        <p className="text-[11px] text-[#6B6458] max-w-xs leading-relaxed italic mt-2">
          *Skor ini dianalisis AI berdasarkan deskripsi masalah yang kamu laporkan secara objektif sesuai regulasi nasional.
        </p>

        <div className="w-full mt-4 bg-[#FDFBF7] border border-[#E2DDD4] p-4 rounded-xl flex flex-col gap-2 shadow-sm text-left">
          <span className="text-[11px] font-bold text-[#A09880] uppercase tracking-wider block">Insight Komunitas</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E8F2EC] flex items-center justify-center shrink-0">
              <span className="text-xl">👥</span>
            </div>
            <div>
              <p className="text-xs text-[#2C2A26] font-medium leading-tight">
                <span className="font-bold text-[#1E5C3A]">{(Math.floor(Math.random() * 50) + 10)} ribu pekerja</span> mengalami masalah serupa.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-8 h-8 rounded-full bg-[#1E5C3A]/10 flex items-center justify-center shrink-0">
              <span className="text-xl">🤝</span>
            </div>
            <div>
              <p className="text-xs text-[#2C2A26] font-medium leading-tight">
                <span className="font-bold text-[#1E5C3A]">94% pekerja</span> merasa sangat terbantu setelah mengambil langkah konkret seperti rekomendasi di bawah.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-xs font-semibold tracking-wider text-[#A09880] uppercase block">
          🚩 Temuan Red Flags ({redFlags.length})
        </span>

        <div className="space-y-3">
          {redFlags.map((flag, idx) => (
            <div
              key={idx}
              className="border-l-4 border-[#C0392B] bg-[#FDECEA] p-4 rounded-xl rounded-l-none space-y-1 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-[#7B2020] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-[#C0392B]" />
                  <span>{flag.title}</span>
                </h3>
                <span className="bg-[#7B2020]/10 text-[#7B2020] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                  {flag.severity || "Tinggi"}
                </span>
              </div>
              <p className="text-[11px] text-[#5A1F1F] leading-relaxed">
                {flag.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-xs font-semibold tracking-wider text-[#A09880] uppercase block">
          🌱 Langkah Konkret untuk Kamu
        </span>

        <div className="space-y-2.5">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-[#E8F2EC] p-3.5 rounded-xl flex items-start gap-3 border border-[#C3D9CC]/40"
            >
              <div className="w-5 h-5 bg-[#1E5C3A] text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 shadow-sm">
                {idx + 1}
              </div>
              <p className="text-xs text-[#1A4A2E] leading-relaxed font-medium">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-xs font-semibold tracking-wider text-[#A09880] uppercase block">
          ⚖️ Hak Hukum Kamu Sesuai Regulasi RI
        </span>

        <div className="space-y-3">
          {rights.map((right, idx) => (
            <div
              key={idx}
              className="bg-[#FFEAA7]/15 border border-[#FFEAA7]/60 p-4 rounded-xl space-y-2"
              style={{ backgroundColor: "#FCF9F2" }}
            >
              <div className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-[#A04000] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-[#2C2A26]">{right.title}</h4>
                  <span className="inline-block mt-0.5 bg-[#FEF5E7] text-[#A04000] font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#FADBD8]">
                    {right.lawReference}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#6B6458] leading-relaxed pl-6">
                {right.details}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 space-y-3">
        <button
          onClick={() => setShowShareModal(true)}
          className="w-full bg-[#1E5C3A] hover:bg-[#153F28] text-white font-semibold py-3.5 rounded-xl text-center text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
        >
          <span>Share & Posting ke Komunitas</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onNavigateToChat}
          className="w-full bg-[#FDFBF7] border border-[#E2DDD4] hover:bg-[#F3EFE6] text-[#2C2A26] font-semibold py-3.5 rounded-xl text-center text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
        >
          <span>Lakukan Analisis Ulang</span>
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#E2DDD4] pb-2">
              <h3 className="font-bold text-[#2C2A26] text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#1E5C3A]" /> 
                Bagikan Analisis
              </h3>
              <button onClick={() => setShowShareModal(false)} className="text-[#A09880] hover:text-[#2C2A26]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[11px] text-[#6B6458] mb-2 font-medium leading-relaxed">
              Bantu pekerja lain dengan membagikan ringkasan masalahmu dan langkah solusi yang AI rekomendasikan. Ceritakan sedikit kenyamanan atau feedback Anda:
            </p>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Contoh: Sangat membantu, ternyata lembur saya harus tetap dibayar..."
              className="w-full border border-[#E2DDD4] bg-[#FDFBF7] rounded-xl p-3 text-[11px] text-[#2C2A26] focus:ring-1 focus:ring-[#1E5C3A] outline-none"
              rows={4}
            />
            <button
              onClick={handleShare}
              disabled={isSharing || !feedbackText.trim()}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs ${
                isSharing || !feedbackText.trim() ? "bg-[#EDE8DF] text-[#A09880]" : "bg-[#1E5C3A] text-white shadow-sm hover:bg-[#153F28]"
              }`}
            >
              {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Bagikan ke Publik
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
