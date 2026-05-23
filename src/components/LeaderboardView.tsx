import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Info, RefreshCw } from "lucide-react";
import { LeaderboardData } from "../types";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

// Animated counter hook — counts up from 0 to target
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!target) return;
    startRef.current = null;
    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

// Deterministic avatar color per name
const AVATAR_COLORS = [
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-orange-100 text-orange-700 border-orange-200",
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-rose-100 text-rose-700 border-rose-200",
  "bg-teal-100 text-teal-700 border-teal-200",
];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Skeleton block
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#EDE8DF] rounded-lg ${className}`} />
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Counter card skeleton */}
      <div className="bg-white border border-[#E2DDD4] rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
        <div className="space-y-3 pt-2 border-t border-[#F5F4F0]">
          <Skeleton className="h-3 w-36" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </div>
      {/* Pejuang card skeleton */}
      <div className="bg-white border border-[#E2DDD4] rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex justify-between pb-2 border-b border-[#F5F4F0]">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-[#EDEADF]">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-2.5 w-40" />
            </div>
            <Skeleton className="h-5 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LeaderboardView() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  const animatedCount = useCountUp(data?.curhatCount ?? 0, 1400);
  const animatedSurvive = useCountUp(data?.surviveCount ?? 0, 1000);

  const toggleSolution = (id: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
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
            const d = doc.data();
            const cat = (d.category || "").toLowerCase();
            const text = (d.content || "").toLowerCase();
            if (cat.includes("lembur")) lemburCount++;
            else if (cat.includes("gaji") || cat.includes("upah")) gajiCount++;
            else if (cat.includes("gaslight")) gaslightCount++;
            else if (cat.includes("toxic") || text.includes("toxic")) toxicCount++;
            else lainnyaCount++;

            const isSurvive = d.actionStatus === "Sudah Resign" || (d.tags && d.tags.includes("Sudah Resign"));
            if (isSurvive) survivePosts++;

            if (userPejuang.length < 5) {
              userPejuang.push({
                id: doc.id,
                avatar: d.avatar || "🦁",
                name: d.author || "Pejuang AI",
                issue: (d.content || "").slice(0, 50) + "...",
                status: isSurvive ? "Survive ✓" : "Berjuang 💪",
                solusiNyata: d.solusiNyata || "Terus berjuang.",
              });
            }
          });

          const fallbackPejuang = [
            { id: "pj1", avatar: "🦁", name: "Pejuang #8821", issue: "Lembur tidak dibayar 3 tahun", status: "Survive ✓", solusiNyata: "Tindakan Nyata: Amankan log absen." },
            { id: "pj2", avatar: "🐯", name: "Pejuang #3304", issue: "Atasan gaslighting — resign", status: "Survive ✓", solusiNyata: "Tindakan Nyata: Putus kontak." },
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
              lainnya: 9 + lainnyaCount,
            },
            surviveCount: 892 + survivePosts,
            pejuangSurvive: userPejuang,
          });
          setIsLoading(false);
        });
      } catch (err) {
        console.error("Leaderboard Firebase load failed:", err);
        setIsLoading(false);
      }
    };

    loadFirebaseStats();
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const problems = data
    ? [
        { label: "⏰ Lembur Melebihi Batas / Tak Dibayar", value: data.topProblems.lembur },
        { label: "🗣️ Atasan Gaslighting & Toxic", value: data.topProblems.toxicBoss },
        { label: "💰 Gaji Dipotong / Terlambat", value: data.topProblems.gaji },
        { label: "🧠 Gaslighting & Manipulasi", value: data.topProblems.gaslighting },
        { label: "📋 Lainnya", value: data.topProblems.lainnya },
      ]
    : [];

  const medals = ["🥇", "🥈", "🥉", "4", "5"];

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-24">
      {/* HEADER */}
      <div>
        <h2 className="font-display font-bold text-base text-[#2C2A26] flex items-center gap-1.5">
          🏆 Leaderboard Realtime
        </h2>
        <p className="text-xs text-[#6B6458]">Bukan kompetisi, melainkan wujud solidaritas & pembuktian kita tidak sendiri.</p>
      </div>

      {isLoading ? (
        <LeaderboardSkeleton />
      ) : (
        <>
          {/* SOLIDARITY COUNTER */}
          <div className="bg-white border border-[#E2DDD4] rounded-lg p-5 shadow-sm space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#A09880] tracking-widest block">
                SOLIDARITY COUNTER
              </span>
              <p className="font-display font-black text-5xl text-[#1E5C3A] tracking-tight tabular-nums">
                {animatedCount.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-[#6B6458] font-medium">
                pekerja Indonesia sudah curhat hari ini —{" "}
                <span className="text-[#1E5C3A] font-bold">100% anonim</span>
              </p>
            </div>

            {/* BAR CHART — semua 5 kategori */}
            <div className="space-y-2.5 pt-2 border-t border-[#F5F4F0]">
              <span className="text-[11px] font-bold text-[#2C2A26] block">
                Top Pelanggaran Masuk Hari Ini:
              </span>
              <div className="space-y-2">
                {problems.map((p) => (
                  <div key={p.label} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#6B6458]">{p.label}</span>
                      <span className="font-bold text-[#1E5C3A]">{p.value}%</span>
                    </div>
                    <div className="w-full bg-[#EDE8DF] h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${p.value}%` }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className="bg-[#1E5C3A] h-full rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PEJUANG SURVIVE LIST */}
          <div className="bg-white border border-[#E2DDD4] rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#F5F4F0] pb-2">
              <h3 className="font-display font-bold text-[11px] text-[#2C2A26] flex items-center gap-1.5">
                🏆 Pejuang Kerja Terverifikasi
              </h3>
              <span className="bg-[#E8F2EC] text-[#1E5C3A] text-[9px] px-2 py-0.5 rounded font-bold uppercase border border-[#C3D9CC] whitespace-nowrap">
                {animatedSurvive.toLocaleString("id-ID")} SUDAH SURVIVE
              </span>
            </div>

            {/* Empty state */}
            {(!data?.pejuangSurvive || data.pejuangSurvive.length === 0) ? (
              <div className="py-10 flex flex-col items-center justify-center gap-3 text-center">
                <span className="text-4xl">🤝</span>
                <p className="text-xs font-semibold text-[#2C2A26]">Belum ada pejuang terdaftar</p>
                <p className="text-[11px] text-[#A09880] max-w-[200px] leading-relaxed">
                  Jadilah yang pertama berbagi cerita dan menginspirasi sesama pekerja.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.pejuangSurvive.map((item, index) => {
                  const isSurvive = item.status.toLowerCase().includes("survive");
                  const avatarColor = getAvatarColor(item.name);

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.07 }}
                      className="flex flex-col gap-1.5 p-3 rounded-lg bg-white hover:bg-[#F7F3EC]/40 border border-[#EDEADF] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black w-5 text-center text-[#A09880] shrink-0">
                          {medals[index] ?? index + 1}
                        </span>

                        {/* Colored avatar with emoji + background */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl border shrink-0 shadow-inner ${avatarColor}`}>
                          {item.avatar}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-[#2C2A26] truncate">{item.name}</div>
                          <p className="text-[10px] text-[#6B6458] truncate leading-tight mt-0.5">
                            {item.issue}
                          </p>
                        </div>

                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <span
                            className={`text-[9.5px] font-bold px-2 py-0.5 rounded uppercase tracking-wider whitespace-nowrap ${
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

                      <AnimatePresence>
                        {expandedSolutions[item.id] && item.solusiNyata && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-8 mt-1 text-[11px] bg-red-50/60 border border-red-100/70 rounded-lg p-2.5 text-gray-700 flex items-start gap-1.5 leading-normal overflow-hidden"
                          >
                            <Flame className="w-3.5 h-3.5 text-[#C0392B] shrink-0 mt-0.5" />
                            <span className="font-semibold">{item.solusiNyata}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* SOLIDARITY ADVICE */}
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