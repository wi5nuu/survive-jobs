import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Trophy, ShieldCheck, Flame, Info, Check, RefreshCw } from "lucide-react";
import { LeaderboardData } from "../types";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function LeaderboardView() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  const toggleSolution = (id: string) => {
    setExpandedSolutions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    let unsubscribe: () => void;
    
    const loadFirebaseStats = async () => {
      try {
        setIsLoading(true);
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        unsubscribe = onSnapshot(q, (snapshot) => {
          let lemburCount = 0;
          let toxicCount = 0;
          let gajiCount = 0;
          let gaslightCount = 0;
          let lainnyaCount = 0;
          
          let survivePosts = 0;
          const userPejuang: any[] = [];
          
          let curhatCounter = 1247 + snapshot.docs.length;

          snapshot.forEach((doc) => {
            const data = doc.data();
            const cat = (data.category || "").toLowerCase();
            const text = (data.content || "").toLowerCase();
            if (cat.includes("lembur")) lemburCount++;
            else if (cat.includes("gaji") || cat.includes("upah")) gajiCount++;
            else if (cat.includes("gaslight")) gaslightCount++;
            else if (cat.includes("toxic") || text.includes("toxic")) toxicCount++;
            else lainnyaCount++;

            const isSurvive = data.actionStatus === "Sudah Resign" || (data.tags && data.tags.includes("Sudah Resign"));
            if (isSurvive) survivePosts++;

            if (userPejuang.length < 5) {
               userPejuang.push({
                 id: doc.id,
                 avatar: data.avatar || "🦁",
                 name: data.author || "Pejuang AI",
                 issue: (data.content || "").slice(0, 50) + "...",
                 status: isSurvive ? "Survive ✓" : "Berjuang 💪",
                 solusiNyata: data.solusiNyata || "Terus berjuang."
               });
            }
          });

          // Add placeholders if needed
          const fallbackPejuang = [
            { id: "pj1", avatar: "🦁", name: "Pejuang #8821", issue: "Lembur tidak dibayar 3 tahun", status: "Survive ✓", solusiNyata: "Tindakan Nyata: Amankan log absen." },
            { id: "pj2", avatar: "🐯", name: "Pejuang #3304", issue: "Atasan gaslighting — resign", status: "Survive ✓", solusiNyata: "Tindakan Nyata: Putus kontak." }
          ];

          for (const fb of fallbackPejuang) {
            if (userPejuang.length < 5) userPejuang.push(fb);
          }

          setData({
            curhatCount: curhatCounter,
            topProblems: {
               lembur: 34 + lemburCount,
               toxicBoss: 28 + toxicCount,
               gaji: 18 + gajiCount,
               gaslighting: 11 + gaslightCount,
               lainnya: 9 + lainnyaCount
            },
            surviveCount: 892 + survivePosts,
            pejuangSurvive: userPejuang
          });
          setIsLoading(false);
        });
      } catch (err) {
        console.error("Leaderboard Firebase load failed:", err);
      }
    };

    loadFirebaseStats();
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-24">
      {/* HEADER SECTION */}
      <div>
        <h2 className="font-display font-bold text-base text-[#2C2A26] flex items-center gap-1.5">
          <span>🏆 Leaderboard Realtime</span>
        </h2>
        <p className="text-xs text-[#6B6458]">Bukan kompetisi, melainkan wujud solidaritas & pembuktian kita tidak sendiri.</p>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-2 text-[#A09880]">
          <RefreshCw className="w-8 h-8 animate-spin text-[#1E5C3A]" />
          <span className="text-xs">Sinkronisasi counter nasional...</span>
        </div>
      ) : (
        <>
          {/* SOLIDARITY COUNTER SECTION */}
          <div className="bg-white border border-[#E2DDD4] rounded-lg p-5 shadow-sm space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#A09880] tracking-widest block">
                SOLIDARITY COUNTER
              </span>
              <p className="font-display font-black text-5xl text-[#1E5C3A] tracking-tight">
                {data ? data.curhatCount.toLocaleString("id-ID") : "1.247"}
              </p>
              <p className="text-xs text-[#6B6458] font-medium">
                pekerja Indonesia sudah curhat hari ini — <span className="text-[#1E5C3A] font-bold">100% anonim</span>
              </p>
            </div>

            {/* BAR CHART ISSUES PROGRESS */}
            <div className="space-y-2.5 pt-2 border-t border-[#F5F4F0]">
              <span className="text-[11px] font-bold text-[#2C2A26] block">
                Top Pelanggaran Masuk Hari Ini:
              </span>
              
              <div className="space-y-2">
                {/* Issue 1: Lembur */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#6B6458]">⏰ Lembur Melebihi Batas / Tak Dibayar</span>
                    <span className="font-bold text-[#1E5C3A]">{data?.topProblems.lembur || 34}%</span>
                  </div>
                  <div className="w-full bg-[#EDE8DF] h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${data?.topProblems.lembur || 34}%` }}
                      transition={{ duration: 0.8 }}
                      className="bg-[#1E5C3A] h-full"
                    />
                  </div>
                </div>

                {/* Issue 2: Bad Boss */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#6B6458]">🗣️ Atasan Gaslighting & Toxic</span>
                    <span className="font-bold text-[#1E5C3A]">{data?.topProblems.toxicBoss || 28}%</span>
                  </div>
                  <div className="w-full bg-[#EDE8DF] h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${data?.topProblems.toxicBoss || 28}%` }}
                      transition={{ duration: 0.8 }}
                      className="bg-[#1E5C3A] h-full"
                    />
                  </div>
                </div>

                {/* Issue 3: Gaji */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#6B6458]">💰 Gaji Dipotong / Terlambat</span>
                    <span className="font-bold text-[#1E5C3A]">{data?.topProblems.gaji || 18}%</span>
                  </div>
                  <div className="w-full bg-[#EDE8DF] h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${data?.topProblems.gaji || 18}%` }}
                      transition={{ duration: 0.8 }}
                      className="bg-[#1E5C3A] h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PEJUANG SURVIVE ROADMAP/PODIUM LIST */}
          <div className="bg-white border border-[#E2DDD4] rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#F5F4F0] pb-2">
              <h3 className="font-display font-bold text-[11px] text-[#2C2A26] flex items-center gap-1.5">
                <span>🏆 Pejuang Kerja Terverifikasi</span>
              </h3>
              <span className="bg-[#E8F2EC] text-[#1E5C3A] text-[9px] px-2 py-0.5 rounded font-bold uppercase border border-[#C3D9CC] whitespace-nowrap">
                {data ? data.surviveCount : "892"} SUDAH SURVIVE
              </span>
            </div>

            <div className="space-y-3.5">
              {data?.pejuangSurvive.map((item, index) => {
                const colors = [
                  { num: "🥇", bg: "bg-[#E8F2EC]", border: "border-[#C3D9CC]", text: "text-[#1E5C3A]" },
                  { num: "🥈", bg: "bg-[#E8F2EC]", border: "border-[#C3D9CC]", text: "text-[#1E5C3A]" },
                  { num: "🥉", bg: "bg-[#EDE8DF]", border: "border-[#D4CFC6]", text: "text-[#6B6458]" },
                  { num: "4", bg: "bg-[#EDE8DF]", border: "border-[#D4CFC6]", text: "text-[#6B6458]" },
                ];
                const col = colors[index] || colors[3];
                const isSurvive = item.status.toLowerCase().includes("survive");

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-1.5 p-3 rounded-lg bg-white hover:bg-[#F7F3EC]/20 border border-[#EDEADF]"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-black w-5 text-center text-[#A09880]`}>
                        {col.num}
                      </span>
                      
                      <div className="w-10 h-10 bg-[#EDE8DF]/90 border border-[#D4CFC6]/50 rounded-lg flex items-center justify-center text-xl shadow-inner shrink-0">
                        {item.avatar}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#2C2A26] flex items-center gap-1.5">
                          <span className="truncate">{item.name}</span>
                        </div>
                        <p className="text-[10px] text-[#6B6458] truncate leading-tight mt-0.5">
                          {item.issue}
                        </p>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <span
                          className={`text-[9.5px] font-bold px-2 py-0.5 rounded uppercase tracking-wider whitespace-nowrap inline-block shrink-0 ${
                            isSurvive
                              ? "bg-[#E8F2EC] text-[#1E5C3A] border border-[#C3D9CC]"
                              : "bg-orange-50 text-[#B07A10] border border-orange-100"
                          }`}
                        >
                          {item.status}
                        </span>
                        
                        <button
                          onClick={() => toggleSolution(item.id)}
                          className="text-[9.5px] font-bold text-[#1E5C3A] hover:underline flex items-center gap-0.5 cursor-pointer select-none"
                        >
                          <Flame className="w-2.5 h-2.5 text-[#C0392B]" />
                          <span>{expandedSolutions[item.id] ? "Tutup" : "Lihat Solusi"}</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Real-time, togglable action solution display */}
                    {expandedSolutions[item.id] && item.solusiNyata && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="ml-8 mt-1.5 text-[11px] bg-red-50/50 border border-red-100/70 rounded-lg p-2.5 text-gray-700 flex items-start gap-1.5 leading-normal"
                      >
                        <Flame className="w-3.5 h-3.5 text-[#C0392B] shrink-0 mt-0.5 block" />
                        <span className="font-semibold block">{item.solusiNyata}</span>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* SOLIDARITY ADVICE ACCENT */}
            <div className="p-3 bg-[#E8F2EC]/40 border border-[#C3D9CC]/50 rounded-lg flex items-start gap-2 text-[10px] text-[#6B6458] leading-relaxed">
              <Info className="w-4 h-4 text-[#1E5C3A] shrink-0 mt-0.5" />
              <span>
                Setiap penyelesaian (tanda cek lis atau resign ke tempat kerja yang sehat) dilaporkan oleh para user sendiri secara sadar guna memberikan dorongan moril bagi jutaan buruh/karyawan sesama bangsa.
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
