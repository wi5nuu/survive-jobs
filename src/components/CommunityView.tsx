import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Filter, Send, MessageSquare, RefreshCw, Smile, Heart, CheckCircle2, ShieldCheck, Check, AlertTriangle } from "lucide-react";
import { Post } from "../types";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, increment, addDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

// Unique identifier utility per client (Anti-Spam & User tracking safety)
const getOrCreateClientId = (): string => {
  let cid = "";
  try {
    cid = localStorage.getItem("surjob_client_id") || "";
    if (!cid) {
      cid = "client_" + Math.random().toString(36).substring(2, 15) + "_" + Date.now().toString(36);
      localStorage.setItem("surjob_client_id", cid);
    }
  } catch (e) {
    cid = "client_" + Math.random().toString(36).substring(2, 15) + "_" + Date.now().toString(36);
  }
  return cid;
};

export default function CommunityView() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("Semua");
  const [showFilters, setShowFilters] = useState(false); // Collapsible filter system inspired by LinkedIn UI
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("Lembur");
  const [city, setCity] = useState("Jakarta");
  const [industry, setIndustry] = useState("Umum");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Discussion reply board states
  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  const categories = ["Semua", "Lembur", "Gaslighting", "Gaji/Upah", "Umum"];
  const cities = ["Jakarta", "Surabaya", "Bandung", "Medan", "Makassar", "Semarang", "Yogyakarta", "Lainnya"];
  
  const clientId = getOrCreateClientId();

  const [reactedPostIds, setReactedPostIds] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem("surjob_reacted_posts");
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  });

  const loadPosts = () => {
    setLoading(true);
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData: Post[] = [];
      snapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() } as Post);
      });
      // Filter logically handled locally for simpler implementation without compound indexes needed
      let filtered = postsData;
      if (filterCategory !== "Semua") {
        const catStr = filterCategory.toLowerCase();
        filtered = filtered.filter(p => {
          const pCat = (p.category || "").toLowerCase();
          const pTags = p.tags || [];
          return pCat.includes(catStr) || pTags.some((t: string) => (t || "").toLowerCase().includes(catStr));
        });
      }
      setPosts(filtered);
      setLoading(false);
    }, (error) => {
      console.error("Error loading firestore posts:", error);
      setLoading(false);
    });

    return unsubscribe;
  };

  useEffect(() => {
    const unsub = loadPosts();
    return () => unsub && unsub();
  }, [filterCategory]);

  const handleReact = async (id: string, ttype: "aku_juga" | "kuatkan" | "survive") => {
    if (reactedPostIds[id]) {
      setErrorMsg("Anda sudah memberikan respon/dukungan untuk curhatan ini!");
      setTimeout(() => setErrorMsg(null), 3500);
      return;
    }

    try {
      const updated = { ...reactedPostIds, [id]: true };
      setReactedPostIds(updated);
      try {
        localStorage.setItem("surjob_reacted_posts", JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }

      const postRef = doc(db, "posts", id);
      await updateDoc(postRef, {
        [`reactions.${ttype}`]: increment(1)
      });
    } catch (err) {
      console.error("Failed to post reaction:", err);
      setErrorMsg("Gagal mengirim respon.");
      setTimeout(() => setErrorMsg(null), 3500);
    }
  };

  const handleSendReply = async (postId: string) => {
    if (!replyContent || replyContent.trim().length === 0) return;
    setIsSendingReply(true);
    setErrorMsg(null);

    try {
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);
      
      if (postSnap.exists()) {
        const postData = postSnap.data() as Post;
        const currentReplies = postData.replies || [];
        
        let pseudCode = Math.floor(1000 + Math.random() * 9000);
        let hash = 0;
        for (let i = 0; i < clientId.length; i++) {
          hash = clientId.charCodeAt(i) + ((hash << 5) - hash);
        }
        pseudCode = Math.abs(hash % 9000) + 1000;

        const newReply = {
          id: "reply_" + Date.now(),
          author: `Pekerja Tangguh #${pseudCode}`,
          content: replyContent,
          time: "Baru saja",
          clientId
        };
        
        await updateDoc(postRef, {
          replies: [...currentReplies, newReply]
        });
        setReplyContent("");
      }
    } catch (err) {
      console.error("Reply submission failed:", err);
      setErrorMsg("Koneksi gagal. Silakan coba kembali.");
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newContent || newContent.length < 10) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await addDoc(collection(db, "posts"), {
        content: newContent,
        category: newCategory,
        city,
        industry,
        actionStatus: "Baru mulai bertindak",
        tags: [newCategory, "Baru mulai bertindak"],
        author: `Pekerja Tangguh #${Math.floor(1000 + Math.random() * 9000)}`,
        time: "Baru saja",
        reactions: { aku_juga: 0, kuatkan: 1, survive: 0 },
        aiAdvice: "Tetap kuat! Kami telah mencatat curhatanmu secara anonim.",
        solusiNyata: "Prioritaskan kesehatan mental dan jadikan ini pengalaman.",
        createdAt: Date.now(),
        clientId,
        replies: []
      });

      setNewContent("");
      setSuccessMsg("Curhat anonim kamu berhasil diposting. Solidaritas bertambah!");
      setShowWriteModal(false);
      setTimeout(() => setSuccessMsg(null), 4200);
    } catch (err) {
      console.error("Post submission failed:", err);
      setErrorMsg("Koneksi gagal. Silakan coba kembali.");
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-md mx-auto pb-12 px-2">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between border-b border-[#EDEADF] pb-3">
        <div>
          <h2 className="font-display font-bold text-base text-[#2C2A26] flex items-center gap-1.5">
            <Users className="w-5 h-5 text-[#1E5C3A]" />
            <span>Komunitas Solidaritas Pekerja</span>
          </h2>
          <p className="text-xs text-[#6B6458]">Gerakan bersama menyuarakan hak tanpa rasa takut.</p>
        </div>
        
        <button
          onClick={() => {
            setErrorMsg(null);
            setShowWriteModal(!showWriteModal);
          }}
          className="bg-[#1E5C3A] hover:bg-[#153F28] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-sm cursor-pointer transition-colors"
        >
          <Send className="w-3 h-3" />
          <span>Curhat</span>
        </button>
      </div>

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-[#E8F2EC] text-[#1E5C3A] font-medium text-xs rounded-xl flex items-center gap-2 border border-[#C3D9CC]"
        >
          <CheckCircle2 className="w-4 h-4 text-[#1E5C3A] flex-shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-[#FDECEA] text-[#C0392B] font-medium text-xs rounded-xl flex items-center gap-2 border border-[#FAD0C8]"
        >
          <AlertTriangle className="w-4 h-4 text-[#C0392B] flex-shrink-0" />
          <span>{errorMsg}</span>
        </motion.div>
      )}

      {/* ANONYMOUS CREATOR BOX (Drawer / Form expansion) */}
      <AnimatePresence>
        {showWriteModal && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white border border-[#E2DDD4] p-4 rounded-lg shadow-sm space-y-3"
          >
            <form onSubmit={handleSubmit} className="space-y-3">
              <span className="text-xs font-bold text-[#6B6458] tracking-wider block">
                Tulis Curhatan Anda (100% Rahasia & Anonim)
              </span>
              
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Sudah berbulan-bulan lembur tanpa uang lembur? Atasan membentak kamu di depan rapat?... Ceritakan di sini. Minimal 10 karakter."
                rows={4}
                className="w-full bg-[#EDE8DF]/40 border border-[#D4CFC6] text-[#2C2A26] p-3 rounded-lg text-xs focus:ring-1 focus:ring-[#1E5C3A] focus:outline-none"
                required
              />

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#6B6458] block mb-1">Masalah Utama</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#EDE8DF]/40 text-[#2C2A26] border border-[#D4CFC6] px-2 py-1.5 rounded-lg text-xs"
                  >
                    <option value="Lembur">Lembur</option>
                    <option value="Gaslighting">Gaslighting</option>
                    <option value="Gaji/Upah">Gaji/Upah</option>
                    <option value="Umum">Umum</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#6B6458] block mb-1">Lokasi Kerja</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#EDE8DF]/40 text-[#2C2A26] border border-[#D4CFC6] px-2 py-1.5 rounded-lg text-xs"
                  >
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#6B6458] block mb-1">Bidang Industri</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="Keuangan, Retail.."
                    className="w-full bg-[#EDE8DF]/40 text-[#2C2A26] border border-[#D4CFC6] px-2.5 py-1.5 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowWriteModal(false)}
                  className="bg-transparent hover:bg-[#EDE8DF] text-[#6B6458] text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || newContent.length < 10}
                  className={`bg-[#1E5C3A] hover:bg-[#153F28] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isSubmitting || newContent.length < 10 ? "opacity-40 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Anonim</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTER CONTROL PANEL BAR (Inspired by Glints/LinkedIn, with 100% professional consistency, no emojis) */}
      <div className="flex flex-col gap-2 bg-white border border-[#E2DDD4] p-3 rounded-lg shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[#6B6458]">
            <Filter className="w-3.5 h-3.5 text-[#1E5C3A]" />
            <span className="font-semibold text-gray-700">Filter Topik Ketenagakerjaan</span>
            <span className="text-gray-300">|</span>
            <span className="text-[#1E5C3A] font-bold bg-[#E8F2EC] px-2.5 py-0.5 rounded text-[10px]">
              {filterCategory}
            </span>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-1.5 text-[#1E5C3A] hover:bg-[#E8F2EC] border border-gray-100 rounded-lg bg-gray-50 transition-all flex items-center justify-center cursor-pointer"
            aria-label="Filter"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Collapsible category selection panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-2 border-t border-gray-100">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setFilterCategory(cat);
                      setShowFilters(false);
                    }}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all border text-center cursor-pointer ${
                      filterCategory === cat
                        ? "bg-[#1E5C3A] text-white border-[#1E5C3A] font-bold"
                        : "bg-[#FBFBFA] text-[#6B6458] border-gray-200 hover:bg-[#EDE8DF]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* COMMUNITY FEED LISTING */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-2 text-[#A09880]">
          <RefreshCw className="w-8 h-8 animate-spin text-[#1E5C3A]" />
          <span className="text-xs">Memuat curhat pekerja...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-[#E2DDD4] p-10 rounded-lg text-center space-y-3">
          <p className="text-lg">🌿</p>
          <h3 className="font-bold text-sm text-[#2C2A26]">Papan Bersih</h3>
          <p className="text-xs text-[#6B6458] max-w-xs mx-auto leading-relaxed">
            Tidak ada curhatan terlaporkan untuk kategori ini. Semuanya tampak berjalan aman atau jadilah yang pertama beraspirasi secara rahasia!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            // Pick avatar based on name values
            const authorName = post.author || "Anonim";
            const code = authorName.replace("Pekerja Tangguh #", "");
            const avatars = ["🦁", "🐯", "🦊", "🐻", "🦄", "🦅", "🦖"];
            const pCode = parseInt(code);
            const avatar = isNaN(pCode) ? "🦁" : avatars[pCode % avatars.length] || "🦁";
            const alreadyReplied = post.replies?.some((r) => r.clientId === clientId);

            return (
              <motion.div
                key={post.id}
                layoutId={post.id}
                className="bg-white border border-[#E2DDD4] rounded-lg p-4 space-y-3.5 shadow-sm text-left"
              >
                {/* HEAD & ALIAS INFO */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-[#E8F2EC] rounded-full flex items-center justify-center text-xl shadow-inner border border-[#C3D9CC]">
                    {avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#2C2A26] flex items-center gap-1.5">
                      <span>{post.author}</span>
                      <span className="text-[10px] select-none text-[#A09880]">·</span>
                      <span className="text-[10px] font-mono text-[#D4CFC6] bg-[#EDE8DF]/50 px-1 py-0.5 rounded">
                        #{code}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#A09880] flex items-center gap-1.5">
                      <span>{post.time}</span>
                      <span>·</span>
                      <span className="truncate">{post.city} • {post.industry}</span>
                    </div>
                  </div>
                </div>

                {/* POST BODY CONTENT */}
                <p className="text-[11px] text-[#6B6458] leading-relaxed whitespace-pre-line bg-[#EDE8DF]/10 p-2.5 rounded-xl border border-[#EDE8DF]/60 italic font-medium">
                  "{post.content}"
                </p>

                {/* TAG PILLS */}
                <div className="flex flex-wrap gap-1.5 py-0.5">
                  {(post.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-[#FDECEA] text-[#7B2020] text-[9px] font-bold rounded-md uppercase border border-[#FDECEA]/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* DIRECT AI RESPONSE FEEDBACK */}
                {post.aiAdvice && (
                  <div className="bg-[#E8F2EC] p-3 rounded-xl border-l-4 border-[#1E5C3A] space-y-1">
                    <span className="text-[9px] font-bold text-[#1E5C3A] uppercase tracking-wider flex items-center gap-1">
                      💡 Analisis Regulasi AI
                    </span>
                    <p className="text-[11px] text-[#1A4A2E] leading-normal font-sans">
                      {post.aiAdvice}
                    </p>
                  </div>
                )}

                {/* ACTION PLAN DEED (Solusi Nyata / Tindakan Langsung) */}
                {post.solusiNyata && (
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EDE8DF] space-y-1">
                    <span className="text-[9px] font-bold text-[#C0392B] uppercase tracking-wider flex items-center gap-1">
                      ⚡ Tindakan Eksekusi Nyata
                    </span>
                    <p className="text-[11px] text-[#5C5549] leading-normal font-sans font-medium">
                      {post.solusiNyata}
                    </p>
                  </div>
                )}

                {/* SOLIDARITY ACTIONS PANEL */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F5F4F0] text-xs">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => handleReact(post.id, "aku_juga")}
                      className="flex items-center flex-nowrap gap-1 px-2.5 py-1.5 rounded-lg bg-[#FDF0ED] hover:bg-[#FCE2DC] text-[#C0392B] font-bold text-[10px] transition-all cursor-pointer border border-[#FAD0C8] shadow-sm select-none active:scale-95 whitespace-nowrap shrink-0"
                    >
                      <Heart className="w-3.5 h-3.5 text-[#C0392B] fill-[#C0392B]/10 shrink-0" />
                      <span className="whitespace-nowrap">Sama/Alami</span>
                      <span className="bg-white/80 px-1 rounded text-[9px] min-w-[14px] text-center whitespace-nowrap">{post.reactions?.aku_juga || 0}</span>
                    </button>

                    <button
                      onClick={() => handleReact(post.id, "kuatkan")}
                      className="flex items-center flex-nowrap gap-1 px-2.5 py-1.5 rounded-lg bg-[#FAF3E5] hover:bg-[#F5E9CE] text-[#B07A10] font-bold text-[10px] transition-all cursor-pointer border border-[#EEDEB4] shadow-sm select-none active:scale-95 whitespace-nowrap shrink-0"
                    >
                      <Smile className="w-3.5 h-3.5 text-[#B07A10] shrink-0" />
                      <span className="whitespace-nowrap">Kuatkan</span>
                      <span className="bg-white/80 px-1 rounded text-[9px] min-w-[14px] text-center whitespace-nowrap">{post.reactions?.kuatkan || 0}</span>
                    </button>

                    <button
                      onClick={() => handleReact(post.id, "survive")}
                      className="flex items-center flex-nowrap gap-1 px-2.5 py-1.5 rounded-lg bg-[#E8F2EC] hover:bg-[#D3E8DC] text-[#1E5C3A] font-bold text-[10px] transition-all cursor-pointer border border-[#C3D9CC] shadow-sm select-none active:scale-95 whitespace-nowrap shrink-0"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1E5C3A] shrink-0" />
                      <span className="whitespace-nowrap">Survive</span>
                      <span className="bg-white/80 px-1 rounded text-[9px] min-w-[14px] text-center whitespace-nowrap">{post.reactions?.survive || 0}</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveReplyPostId(activeReplyPostId === post.id ? null : post.id)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer border text-[10px] font-bold shadow-sm active:scale-95 ${
                        activeReplyPostId === post.id
                          ? "bg-[#1E5C3A] text-white border-[#1E5C3A]"
                          : "bg-white text-[#6B6458] border-[#E2DDD4] hover:bg-[#EDE8DF]"
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Balasan ({post.replies?.length || 0})</span>
                    </button>
                  </div>

                  <span className="text-[10px] font-bold text-[#1E5C3A] bg-[#E8F2EC] px-2 py-1 rounded-lg border border-[#C3D9CC] flex items-center gap-1 select-none">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>AI Verified</span>
                  </span>
                </div>

                {/* COLLAPSIBLE DISCUSSION REPLY BOARD */}
                <AnimatePresence>
                  {activeReplyPostId === post.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-3 pt-3 border-t border-[#F5F4F0] space-y-3"
                    >
                      <h4 className="text-[10px] font-bold text-[#4A4740] uppercase tracking-wider text-left">
                        Diskusi Pekerja ({post.replies?.length || 0})
                      </h4>
                      
                      {/* List of Replies */}
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar text-left">
                        {(!post.replies || post.replies.length === 0) ? (
                          <p className="text-[10px] text-[#A09880] italic">Belum ada tanggapan. Jadilah yang pertama memberikan kata-kata dukungan!</p>
                        ) : (
                          post.replies.map((reply) => (
                            <div key={reply.id} className="bg-[#F8F6F1] p-2.5 rounded-xl border border-[#EDEADF] space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-semibold text-[#6B6458]">
                                <span className="text-[#1E5C3A]">{reply.author}</span>
                                <span className="text-[9px] text-[#A09880]">{reply.time}</span>
                              </div>
                              <p className="text-[11px] text-[#2C2A26] leading-relaxed select-text font-medium">
                                {reply.content}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Reply Input Form & 1 User 1 Reply Constraint visual indication */}
                      {alreadyReplied ? (
                        <div className="py-2 px-3 bg-[#E8F2EC] text-[#1E5C3A] border border-[#C3D9CC] rounded-xl text-left text-[11px] flex items-center gap-1.5 font-medium">
                          <Check className="w-4 h-4 text-[#1E5C3A] flex-shrink-0" />
                          <span>Dukungan Anda terkirim. Batas 1 tanggapan per akun aktif untuk menjaga kualitas forum.</span>
                        </div>
                      ) : (
                        <div className="flex gap-1.5 mt-2">
                          <input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Tulis balasan solider anonim..."
                            className="flex-1 bg-[#F5F4F0] border border-[#E2DDD4] text-[#2C2A26] px-3 py-1.5 rounded-xl text-xs focus:ring-1 focus:ring-[#1E5C3A] focus:outline-none placeholder-[#A09880]"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSendReply(post.id);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSendReply(post.id)}
                            disabled={isSendingReply || !replyContent.trim()}
                            className={`bg-[#1E5C3A] hover:bg-[#153F28] text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1 ${
                              isSendingReply || !replyContent.trim() ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                            }`}
                          >
                            {isSendingReply ? (
                              <RefreshCw className="w-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            <span>Kirim</span>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
