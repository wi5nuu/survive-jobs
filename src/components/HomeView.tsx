import { AnimatePresence, motion } from "motion/react";
import { Shield, ArrowRight, Flag, MessageSquare, Scale, LogOut, Info, Bell, Gamepad2, Download, Trophy, FileText, Search, FileSearch, Building2, HeartPulse, PieChart } from "lucide-react";
import { useEffect, useState } from "react";
import { LeaderboardData } from "../types";

interface HomeViewProps {
  onNavigateToTab: (tabIndex: number, chatModePreset?: string) => void;
}

const slides = [
  {
    title: "Kompensasi Lembur...",
    flags: 3,
    progress: 65,
    tag: "REKAMAN TERAKHIR"
  },
  {
    title: "Pemotongan Gaji...",
    flags: 2,
    progress: 40,
    tag: "DALAM PROSES"
  },
  {
    title: "Status Kontrak PKWT",
    flags: 5,
    progress: 85,
    tag: "HASIL KELUAR"
  },
  {
    title: "Pelecehan Verbal Bos",
    flags: 4,
    progress: 100,
    tag: "SELESAI"
  },
  {
    title: "Jam Kerja Fleksibel?",
    flags: 1,
    progress: 20,
    tag: "BARU DIMULAI"
  }
];

export default function HomeView({ onNavigateToTab }: HomeViewProps) {
  const [stats, setStats] = useState<LeaderboardData | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Error loading home stats:", err));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

 


  return (
    <div className="w-full max-w-md mx-auto space-y-3 pb-24">
      {/* HEADER SECTION (Compact Android Style) */}
      <div className="flex items-center justify-between pb-1 gap-2">
        <div className="flex flex-col min-w-0">
          <h1 className="font-display font-bold text-base tracking-tight text-[#2C2A26] truncate">
            Selamat Sore, Pekerja
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-[#FEF5E7] text-[#D35400] px-2 py-1 rounded-full shadow-sm border border-[#FDEBD0]">
            <span className="text-[10px]">🔥</span>
            <span className="font-bold text-[10px]">{stats ? stats.surviveCount : 892}</span>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="bg-white p-1.5 rounded-full border border-[#E2DDD4] shadow-sm relative text-[#6B6458] active:scale-95 transition"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 w-64 md:w-72 bg-white border border-[#E2DDD4] rounded-2xl shadow-xl z-50 overflow-hidden shrink-0"
                >
                  <div className="p-3 border-b border-[#E2DDD4] bg-[#F7F3EC] flex justify-between items-center">
                    <h4 className="font-bold text-[11px] text-[#2C2A26]">Notifikasi</h4>
                    <span className="text-[9px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded cursor-pointer">Tandai dibaca</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <div className="p-3 border-b border-[#E2DDD4] hover:bg-slate-50 cursor-pointer transition text-left" onClick={() => { setShowNotifications(false); onNavigateToTab(2); }}>
                      <div className="flex justify-between items-start mb-0.5">
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Komunitas</span>
                        <span className="text-[7px] text-[#A09880]">Baru saja</span>
                      </div>
                      <p className="text-[9px] text-[#6B6458] leading-tight mt-1.5">Postingan Anda "Cara nego gaji" mendapat 5 tanggapan baru.</p>
                    </div>
                    <div className="p-3 border-b border-[#E2DDD4] hover:bg-slate-50 cursor-pointer transition text-left relative" onClick={() => { setShowNotifications(false); onNavigateToTab(4); }}>
                      <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                       <div className="flex justify-between items-start mb-0.5">
                        <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Sistem</span>
                        <span className="text-[7px] text-[#A09880]">1 jam lalu</span>
                      </div>
                      <p className="text-[9px] text-[#6B6458] leading-tight mt-1.5">Analisis dari kontrak kerja Anda sudah selesai diproses oleh AI.</p>
                    </div>
                  </div>
                  <div className="p-2 border-t border-[#E2DDD4] bg-white text-center">
                    <button className="text-[9px] font-bold text-[#A09880] w-full text-center hover:text-[#2C2A26]">Lihat semua notifikasi</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* INFO BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#EAF6FF] border border-[#BDE0FE] rounded-[14px] p-3 flex gap-2.5 shadow-sm relative overflow-hidden cursor-pointer"
        onClick={() => onNavigateToTab(1)}
      >
        <div className="bg-white text-blue-500 p-2 rounded-xl h-fit shrink-0 shadow-sm relative z-10">
          <Shield className="w-4 h-4 fill-blue-50 text-blue-500" />
        </div>
        <div className="flex-1 relative z-10 min-w-0">
          <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider block mb-0.5 truncate">INFO TERBARU</span>
          <p className="text-[11px] font-semibold text-blue-950 leading-tight mb-1 truncate">
            Cek kesehatan tempat kerjamu sekarang!
          </p>
          <p className="text-[9px] text-blue-800/80 leading-snug break-words line-clamp-2">
            Analisis kontrak kerja, red flag, dan keluhanmu bersama AI anonim.
          </p>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0 self-center relative z-10" />
      </motion.div>

      {/* 4 ICON BUTTONS (Compact Grid) */}
      <div className="grid grid-cols-4 gap-2 pt-0.5">
        <button onClick={() => onNavigateToTab(1, "Cerita Bebas")} className="flex flex-col items-center gap-1.5 group cursor-pointer">
          <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm w-full max-w-[48px]">
            <MessageSquare className="w-4 h-4 fill-blue-500 text-blue-500" />
          </div>
          <span className="text-[8px] font-bold text-[#6B6458] uppercase tracking-wider truncate w-full text-center">KONSUL AI</span>
        </button>
        
        <button onClick={() => onNavigateToTab(1, "Hak pekerja")} className="flex flex-col items-center gap-1.5 group cursor-pointer">
          <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm w-full max-w-[48px]">
            <Scale className="w-4 h-4 fill-green-500 text-green-500" />
          </div>
          <span className="text-[8px] font-bold text-[#6B6458] uppercase tracking-wider truncate w-full text-center">HUKUM</span>
        </button>

        <button onClick={() => onNavigateToTab(1, "Resign Checker")} className="flex flex-col items-center gap-1.5 group cursor-pointer">
          <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm w-full max-w-[48px]">
            <LogOut className="w-4 h-4 fill-orange-500 text-orange-500" />
          </div>
          <span className="text-[8px] font-bold text-[#6B6458] uppercase tracking-wider truncate w-full text-center">RESIGN</span>
        </button>

        <button onClick={() => onNavigateToTab(3)} className="flex flex-col items-center gap-1.5 group cursor-pointer">
          <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm w-full max-w-[48px]">
            <Trophy className="w-4 h-4 fill-purple-500 text-purple-500" />
          </div>
          <span className="text-[8px] font-bold text-[#6B6458] uppercase tracking-wider truncate w-full text-center">RANK</span>
        </button>
      </div>

      {/* PROGRES LEVEL CARD & TIP BENTO */}
      <div className="grid grid-cols-2 gap-2 mt-1">
        <div className="bg-white border border-[#E2DDD4] rounded-[14px] p-2.5 shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="flex justify-between items-center mb-2 gap-1">
            <div className="flex items-center gap-1 min-w-0">
              <div className="bg-yellow-100 p-1 rounded-lg text-yellow-500 shrink-0">
                <Shield className="w-3 h-3" />
              </div>
              <span className="text-[10px] font-bold text-[#2C2A26] truncate">Solidaritas</span>
            </div>
            <span className="text-[9px] font-bold text-blue-600 shrink-0">
              {stats ? stats.curhatCount.toLocaleString("id-ID") : "1.247"}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 mb-1.5">
            <div className="bg-yellow-400 h-1 rounded-full" style={{ width: '12%' }}></div>
          </div>
          <p className="text-[8px] text-[#6B6458] flex items-center gap-1 font-medium truncate">
            <Trophy className="w-2.5 h-2.5 shrink-0" /> Target 10rb kasus!
          </p>
        </div>

        <div className="bg-[#F0F7F4] border border-[#CDE1D6] rounded-[14px] p-2.5 shadow-sm flex gap-1.5 items-start relative overflow-hidden h-full">
          <Info className="w-3.5 h-3.5 text-[#1E5C3A] shrink-0 mt-0.5" />
          <div className="relative z-10 min-w-0">
            <span className="text-[8px] font-bold text-[#1E5C3A] uppercase tracking-wider block mb-0.5 truncate">FAKTA HARI INI</span>
            <p className="text-[8px] text-[#2C2A26] leading-tight font-medium break-words line-clamp-2">
              UU Kerja atur PHK tanpa alasan sah wajib tunjangan.
            </p>
          </div>
        </div>
      </div>

      {/* QUICK NEW FEATURES BENTO */}
      <div className="grid grid-cols-2 gap-2 mt-1">
        <div className="bg-gradient-to-br from-[#1E5C3A] to-[#144229] rounded-[14px] p-2.5 shadow-sm relative overflow-hidden text-white flex flex-col justify-between h-16 cursor-pointer" onClick={() => onNavigateToTab(1, "Simulasi Negosiasi")}>
           <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full blur-xl translate-x-4 -translate-y-4"></div>
           <div className="flex justify-between items-start gap-1">
             <MessageSquare className="w-3.5 h-3.5 text-green-200 shrink-0" />
             <span className="text-[6px] bg-white/20 px-1 py-0.5 rounded uppercase font-bold tracking-wider shrink-0">BARU</span>
           </div>
           <div className="min-w-0">
             <h3 className="text-[9px] sm:text-[10px] font-bold truncate">Simulasi Bos</h3>
             <p className="text-[7px] text-green-100/80 leading-tight truncate">Latih bicara ke atasan</p>
           </div>
        </div>

        <div className="bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded-[14px] p-2.5 shadow-sm relative overflow-hidden text-white flex flex-col justify-between h-16 cursor-pointer" onClick={() => onNavigateToTab(1, "Hitung Hak")}>
           <div className="absolute bottom-0 right-0 w-12 h-12 bg-white/10 rounded-full blur-xl translate-x-4 translate-y-4"></div>
           <div className="flex justify-between items-start gap-1">
             <Gamepad2 className="w-3.5 h-3.5 text-purple-200 shrink-0" />
             <span className="text-[6px] bg-white/20 px-1 py-0.5 rounded uppercase font-bold tracking-wider shrink-0">BARU</span>
           </div>
           <div className="min-w-0">
             <h3 className="text-[9px] sm:text-[10px] font-bold truncate">Kalkulator Hak</h3>
             <p className="text-[7px] text-purple-100/80 leading-tight truncate">Hitung estimasi Anda</p>
           </div>
        </div>

        {/* DARURAT / TEMPLATE: Full width new cool feature */}
        <div className="col-span-2 bg-gradient-to-r from-[#D35400] to-[#E67E22] rounded-[14px] p-2.5 shadow-sm relative overflow-hidden text-white flex items-center justify-between cursor-pointer group" onClick={() => onNavigateToTab(1, "Template Somasi")}>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
           <div className="flex items-center gap-2 relative z-10 min-w-0">
             <div className="bg-white/20 p-1.5 rounded-lg shrink-0">
               <Download className="w-3.5 h-3.5 text-orange-50" />
             </div>
             <div className="min-w-0">
               <h3 className="text-[10px] font-bold truncate">Generator Surat Kuasa & Somasi</h3>
               <p className="text-[7px] text-orange-100/90 truncate mt-0.5">Dapatkan draf resmi tegur perusahaan.</p>
             </div>
           </div>
           <ArrowRight className="w-3.5 h-3.5 text-orange-100 shrink-0 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* SEARCH BAR EMULATION */}
      <div className="relative mt-1">
        <Search className="w-3.5 h-3.5 text-[#A09880] absolute left-3 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          placeholder="Cari pedoman UU, dll..." 
          className="w-full bg-white border border-[#E2DDD4] rounded-xl py-2.5 pl-8 pr-3 text-[10px] font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          onFocus={() => onNavigateToTab(1)}
        />
      </div>

      {/* LANJUTKAN ANALISIS CARD (Similar to "Lanjutkan Belajar") with Slider */}
      <div className="bg-gradient-to-br from-[#0CA3E7] to-[#0A8AC3] text-white rounded-[14px] p-3 shadow-sm relative overflow-hidden mt-1 h-28">
         <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-xl translate-x-10 -translate-y-10"></div>
         <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start gap-2">
              <span className="inline-block bg-white/20 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase backdrop-blur-sm shrink-0">
                LANJUTKAN ANALISIS
              </span>
              <div className="flex gap-1 shrink-0 mt-1">
                {slides.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentSlideIndex ? 'bg-white w-2.5' : 'bg-white/50'}`}></div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 relative overflow-hidden mt-2 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlideIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex flex-col justify-end"
                >
                  <div className="min-w-0">
                    <span className="text-[8px] font-medium text-blue-100 tracking-wide uppercase truncate block">{slides[currentSlideIndex].tag}</span>
                    <h3 className="font-display font-bold text-xs mt-0.5 tracking-tight leading-tight truncate">{slides[currentSlideIndex].title}</h3>
                  </div>

                  <div className="flex items-center justify-between text-[9px] pt-1.5 gap-2">
                    <span className="text-blue-100 flex items-center gap-1 font-medium truncate">
                       <Flag className="w-2.5 h-2.5 shrink-0" /> <span className="truncate">{slides[currentSlideIndex].flags} Red Flags</span>
                    </span>
                    <button onClick={() => onNavigateToTab(4)} className="bg-white/10 hover:bg-white/20 transition-colors px-1.5 py-1 rounded flex items-center gap-1 backdrop-blur-sm cursor-pointer border border-white/20 shrink-0">
                      <FileText className="w-2.5 h-2.5 shrink-0" />
                      <span className="text-[8px]">Lihat</span>
                    </button>
                  </div>
                  
                  <div className="w-full bg-black/20 rounded-full h-1 mt-1.5">
                    <motion.div 
                      className="bg-white h-1 rounded-full" 
                      initial={{ width: 0 }}
                      animate={{ width: `${slides[currentSlideIndex].progress}%` }}
                      transition={{ duration: 0.5 }}
                    ></motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
         </div>
      </div>

      {/* KATEGORI HUKUM PILLS (Like "Mata Pelajaran") */}
      <div className="space-y-1.5 pb-2 mt-2 w-full overflow-hidden">
        <h3 className="font-display font-bold text-[11px] text-[#2C2A26]">Pilih Kategori Utama</h3>
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide w-full">
          <button onClick={() => onNavigateToTab(1, "Hak pekerja")} className="flex items-center gap-1.5 bg-white border border-[#E2DDD4] rounded-xl pl-1 pr-2 py-1 shadow-sm min-w-0 shrink-0 hover:bg-slate-50 transition-colors">
            <div className="bg-purple-100 p-1 rounded-lg text-purple-600 shrink-0">
              <Scale className="w-3 h-3" />
            </div>
            <span className="font-bold text-[8px] tracking-wide text-[#2C2A26] truncate">Hak Ketenagakerjaan</span>
          </button>
          
          <button onClick={() => onNavigateToTab(1, "Deteksi toxic")} className="flex items-center gap-1.5 bg-white border border-[#E2DDD4] rounded-xl pl-1 pr-2 py-1 shadow-sm min-w-0 shrink-0 hover:bg-slate-50 transition-colors">
            <div className="bg-red-100 p-1 rounded-lg text-red-600 shrink-0">
              <Flag className="w-3 h-3" />
            </div>
            <span className="font-bold text-[8px] tracking-wide text-[#2C2A26] truncate">Deteksi Red Flags</span>
          </button>

          <button onClick={() => onNavigateToTab(1, "Script bicara")} className="flex items-center gap-1.5 bg-white border border-[#E2DDD4] rounded-xl pl-1 pr-2 py-1 shadow-sm min-w-0 shrink-0 hover:bg-slate-50 transition-colors">
            <div className="bg-orange-100 p-1 rounded-lg text-orange-600 shrink-0">
              <MessageSquare className="w-3 h-3" />
            </div>
            <span className="font-bold text-[8px] tracking-wide text-[#2C2A26] truncate">Script HRD/Bos</span>
          </button>

          <button onClick={() => onNavigateToTab(1, "Analisis kontrak")} className="flex items-center gap-1.5 bg-white border border-[#E2DDD4] rounded-xl pl-1 pr-2 py-1 shadow-sm min-w-0 shrink-0 hover:bg-slate-50 transition-colors">
            <div className="bg-blue-100 p-1 rounded-lg text-blue-600 shrink-0">
              <FileSearch className="w-3 h-3" />
            </div>
            <span className="font-bold text-[8px] tracking-wide text-[#2C2A26] truncate">Analisis Kontrak</span>
          </button>

          <button onClick={() => onNavigateToTab(1, "Lapor Disnaker")} className="flex items-center gap-1.5 bg-white border border-[#E2DDD4] rounded-xl pl-1 pr-2 py-1 shadow-sm min-w-0 shrink-0 hover:bg-slate-50 transition-colors">
            <div className="bg-teal-100 p-1 rounded-lg text-teal-600 shrink-0">
              <Building2 className="w-3 h-3" />
            </div>
            <span className="font-bold text-[8px] tracking-wide text-[#2C2A26] truncate">Lapor Disnaker</span>
          </button>

          <button onClick={() => onNavigateToTab(1, "Panduan BPJS")} className="flex items-center gap-1.5 bg-white border border-[#E2DDD4] rounded-xl pl-1 pr-2 py-1 shadow-sm min-w-0 shrink-0 hover:bg-slate-50 transition-colors">
            <div className="bg-pink-100 p-1 rounded-lg text-pink-600 shrink-0">
              <HeartPulse className="w-3 h-3" />
            </div>
            <span className="font-bold text-[8px] tracking-wide text-[#2C2A26] truncate">Panduan BPJS</span>
          </button>
        </div>
      </div>

      {/* TREN KOMUNITAS / DISKUSI HANGAT */}
      <div className="space-y-1.5 pb-2 mt-2 w-full overflow-hidden">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-display font-bold text-[11px] text-[#2C2A26] flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
             Diskusi Hangat (Live)
          </h3>
          <button onClick={() => onNavigateToTab(2)} className="text-[9px] text-blue-600 font-bold hover:underline">Lihat Semua</button>
        </div>
        
        <div className="flex flex-col gap-2">
          {/* Mock Post 1 */}
          <div className="bg-white border border-[#E2DDD4] rounded-[12px] p-2.5 shadow-sm cursor-pointer hover:bg-slate-50 transition" onClick={() => onNavigateToTab(2)}>
            <div className="flex justify-between items-start mb-1">
              <span className="text-[8px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">Tanya Hukum</span>
              <span className="text-[7px] text-[#A09880]">2 mnt lalu</span>
            </div>
            <p className="text-[9px] font-medium text-[#2C2A26] line-clamp-2 leading-tight">
              Sore min, saya mau nanya. Bos saya tiba-tiba motong gaji 20% karena alasan target gak tercapai, padahal di kontrak gak ada aturan pemotongan...
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-[#A09880]">
              <span className="flex items-center gap-0.5 text-[8px]"><MessageSquare className="w-2.5 h-2.5" /> 12 Tanggapan</span>
              <span className="flex items-center gap-0.5 text-[8px]"><ArrowRight className="w-2.5 h-2.5 text-blue-500" /></span>
            </div>
          </div>

          {/* Mock Post 2 */}
          <div className="bg-white border border-[#E2DDD4] rounded-[12px] p-2.5 shadow-sm cursor-pointer hover:bg-slate-50 transition" onClick={() => onNavigateToTab(2)}>
            <div className="flex justify-between items-start mb-1">
               <span className="text-[8px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Red Flag Alert</span>
              <span className="text-[7px] text-[#A09880]">15 mnt lalu</span>
            </div>
            <p className="text-[9px] font-medium text-[#2C2A26] line-clamp-2 leading-tight">
              Hati-hati buat temen-temen yg apply di PT *** daerah Jaksel. Tadi siang interview malah disuruh tahan ijazah asli, terus dipaksa ttd kontrak hari itu juga.
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-[#A09880]">
              <span className="flex items-center gap-0.5 text-[8px]"><MessageSquare className="w-2.5 h-2.5" /> 45 Tanggapan</span>
              <span className="flex items-center gap-0.5 text-[8px]"><ArrowRight className="w-2.5 h-2.5 text-blue-500" /></span>
            </div>
          </div>
        </div>
      </div>

      {/* POLLING BERSAMA */}
      <div className="space-y-1.5 pb-2 mt-2 w-full overflow-hidden">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-display font-bold text-[11px] text-[#2C2A26] flex items-center gap-1.5">
             <PieChart className="w-3 h-3 text-blue-500" />
             Suara Pekerja (Polling)
          </h3>
          <span className="text-[7px] text-[#A09880] font-bold border border-[#E2DDD4] px-1.5 py-0.5 rounded-md bg-white">1.204 Suara</span>
        </div>
        
        <div className="bg-gradient-to-br from-white to-[#F7F3EC] border border-[#E2DDD4] rounded-[12px] p-2.5 shadow-sm">
          <p className="text-[10px] font-bold text-[#2C2A26] mb-2 leading-tight">Apakah kantormu bayar uang lembur sesuai aturan Undang-Undang?</p>
          
          <div className="space-y-1.5">
            <button className="w-full relative bg-white border border-[#E2DDD4] rounded-lg p-1.5 text-left overflow-hidden group hover:border-blue-400 transition-colors cursor-pointer">
               <div className="absolute top-0 left-0 h-full bg-blue-100/60 w-[12%] group-hover:bg-blue-200/50 transition-colors"></div>
               <div className="relative z-10 flex justify-between items-center px-1">
                 <span className="text-[9px] font-semibold text-[#2C2A26]">Sesuai aturan (Pasti dibayar)</span>
                 <span className="text-[8px] font-bold text-blue-600">12%</span>
               </div>
            </button>

            <button className="w-full relative bg-white border border-[#E2DDD4] rounded-lg p-1.5 text-left overflow-hidden group hover:border-blue-400 transition-colors cursor-pointer">
               <div className="absolute top-0 left-0 h-full bg-blue-100/60 w-[24%] group-hover:bg-blue-200/50 transition-colors"></div>
               <div className="relative z-10 flex justify-between items-center px-1">
                 <span className="text-[9px] font-semibold text-[#2C2A26]">Hitungan flat mingguan</span>
                 <span className="text-[8px] font-bold text-blue-600">24%</span>
               </div>
            </button>

            <button className="w-full relative bg-white border border-[#E2DDD4] rounded-lg p-1.5 text-left overflow-hidden group hover:border-blue-400 transition-colors cursor-pointer">
               <div className="absolute top-0 left-0 h-full bg-blue-100/60 w-[64%] group-hover:bg-blue-200/50 transition-colors"></div>
               <div className="relative z-10 flex justify-between items-center px-1">
                 <span className="text-[9px] font-semibold text-[#2C2A26]">Sama sekali tidak dibayar (Loyalitas)</span>
                 <span className="text-[8px] font-bold text-blue-600">64%</span>
               </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}