import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize safe Gemini connection
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API Client initialized successfully using Env Key.");
  } catch (error) {
    console.error("Failed to initialize Gemini API Client:", error);
  }
} else {
  console.error("CRITICAL: GEMINI_API_KEY is not set in environment variables. Gemini features will be disabled.");
}

// IN-MEMORY COMPREHENSIVE RATE LIMITER TO PREVENT API KEY SPAMS & COLD TIMEOUTS
interface ClientLimitStore {
  chatCount: number;
  lastChatTime: number;
  analysisCount: number;
  lastAnalysisTime: number;
}
const rateLimits = new Map<string, ClientLimitStore>();

function checkRateLimit(clientId: string, type: "chat" | "analyze"): { blocked: boolean; message: string } {
  if (!clientId) return { blocked: false, message: "" };
  const now = Date.now();
  let limit = rateLimits.get(clientId);
  if (!limit) {
    limit = { chatCount: 0, lastChatTime: 0, analysisCount: 0, lastAnalysisTime: 0 };
    rateLimits.set(clientId, limit);
  }

  if (type === "chat") {
    // 1 chat per 3 seconds minimum gap to stop double clicks or scripts
    if (now - limit.lastChatTime < 3000) {
      return { blocked: true, message: "Ketik lebih tenang, Sobat. Beri jeda 3 detik antar pesan agar server tidak terbeban." };
    }
    // Max 12 chats per minute
    if (now - limit.lastChatTime > 60000) {
      limit.chatCount = 0;
    }
    if (limit.chatCount >= 12) {
      return { blocked: true, message: "Batas chat per menit tercapai. Harap tunggu 60 detik sebelum mengirim chat lagi." };
    }
    limit.chatCount++;
    limit.lastChatTime = now;
  } else if (type === "analyze") {
    // 1 deep analysis per 15 seconds minimum gap
    if (now - limit.lastAnalysisTime < 15000) {
      return { blocked: true, message: "Sistem sedang mengendapkan analisis sebelumnya. Beri jeda 15 detik untuk analisis kerja mendalam berikutnya." };
    }
    // Max 6 analyzes per hour to guard API limits
    if (now - limit.lastAnalysisTime > 3600000) {
      limit.analysisCount = 0;
    }
    if (limit.analysisCount >= 6) {
      return { blocked: true, message: "Sobat telah mencapai batas maksimal 6 kali analisis workplace per jam. Hal ini guna menghindari kehabisan kuota sistem." };
    }
    limit.analysisCount++;
    limit.lastAnalysisTime = now;
  }
  return { blocked: false, message: "" };
}

// Recursive helper to deeply sanitize all asterisks from any text or objects
function cleanAsterisks(obj: any): any {
  if (typeof obj === "string") {
    return obj.replace(/\*/g, "");
  } else if (Array.isArray(obj)) {
    return obj.map(cleanAsterisks);
  } else if (obj && typeof obj === "object") {
    const fresh: any = {};
    for (const key of Object.keys(obj)) {
      fresh[key] = cleanAsterisks(obj[key]);
    }
    return fresh;
  }
  return obj;
}

interface PostReply {
  id: string;
  author: string;
  content: string;
  time: string;
  clientId?: string;
}

// IN-MEMORY DATABASE FOR PUBLIC FEED AND COUNTERS
interface Post {
  id: string;
  author: string;
  time: string;
  city: string;
  industry: string;
  content: string;
  category: string;
  tags: string[];
  actionStatus: string;
  reactions: {
    aku_juga: number;
    kuatkan: number;
    survive: number;
  };
  aiAdvice: string;
  createdAt: number;
  replies?: PostReply[];
  clientId?: string;
  solusiNyata?: string;
}

const posts: Post[] = [
  {
    id: "post1",
    author: "Pekerja Tangguh #4821",
    time: "2 jam lalu",
    city: "Jakarta",
    industry: "Keuangan",
    content: "Sudah 8 bulan lembur setiap hari sampai jam 10 malam. Tidak ada tambahan gaji, tidak ada ucapan terima kasih. Hari ini saya akhirnya kirim email ke HRD. Doakan ya 🙏",
    category: "Lembur",
    tags: ["Lembur", "Upah", "Baru mulai bertindak"],
    actionStatus: "Baru mulai bertindak",
    reactions: { aku_juga: 47, kuatkan: 89, survive: 12 },
    aiAdvice: "Sikap Anda mengirim email ke HRD adalah langkah awal yang berani. Pastikan untuk mencatat semua jam lembur Anda secara tertulis (misal email/log kerja) guna memperkuat bukti sesuai dengan ketentuan lembur Pasal 78 UU Ketenagakerjaan.",
    createdAt: Date.now() - 7200000,
    replies: [
      { id: "rep1_1", author: "Pekerja Tangguh #9003", content: "Luar biasa keberaniannya kak, semangat! Jangan lupa dokumentasikan balasan HRD.", time: "1 jam lalu" },
      { id: "rep1_2", author: "Pekerja Tangguh #4412", content: "Lembur tak dibayar itu eksploitasi nyata, dukung penuh langkah hukummu!", time: "30 menit lalu" }
    ],
    solusiNyata: "Eksekusi UU Ciptaker: Catat log kehadiran lembur & minta persetujuan tertulis sebagai bukti Disnaker."
  },
  {
    id: "post2",
    author: "Pekerja Tangguh #3304",
    time: "5 jam lalu",
    city: "Surabaya",
    industry: "Retail",
    content: "Resign setelah 2 tahun kena gaslighting atasan. Sekarang kerja di tempat baru yang menghargai saya. Buat yang masih berjuang — kamu tidak sendirian 🌱",
    category: "Gaslighting",
    tags: ["Gaslighting", "Sudah Resign", "Inspirasi"],
    actionStatus: "Sudah Resign",
    reactions: { aku_juga: 203, kuatkan: 156, survive: 82 },
    aiAdvice: "Keputusan luar biasa untuk mengutamakan kesehatan mental. UU Ketenagakerjaan menjamin hak pekerja untuk resign sukarela dengan one month notice. Semoga ini menginspirasi pekerja lain yang masih menghadapi intimidasi.",
    createdAt: Date.now() - 18000000,
    replies: [
      { id: "rep2_1", author: "Pekerja Tangguh #2101", content: "Kisah Kakak memberi saya harapan baru, terima kasih banyak sudah berbagi!", time: "4 jam lalu" }
    ],
    solusiNyata: "Solusi Mental: Potong kontak toxic, rapikan CV & prioritaskan kesehatan demi masa depan."
  },
  {
    id: "post3",
    author: "Pekerja Tangguh #1209",
    time: "7 jam lalu",
    city: "Bandung",
    industry: "Manufaktur",
    content: "Gaji dipotong sepihak dengan alasan performa tim menurun, padahal target pribadi saya selalu tercapai. Kontrak berantakan dan tidak ada slip gaji resmi.",
    category: "Gaji/Upah",
    tags: ["Gaji/Upah", "Potong Gaji", "Masih berjuang"],
    actionStatus: "Masih berjuang",
    reactions: { aku_juga: 32, kuatkan: 41, survive: 5 },
    aiAdvice: "Pemotongan upah sepihak melanggar Peraturan Pemerintah No. 36 Tahun 2021 tentang Pengupahan. Segera minta klarifikasi tertulis dari manajemen mengenai klausul kontrak yang dilanggar.",
    createdAt: Date.now() - 25200000,
    replies: [],
    solusiNyata: "Mediasi Mandiri: Kumpulkan slip transfer, layangkan surat keberatan atau tempuh bipartit resmi."
  }
];

// Stat counters state
let basesolidarityCounter = 1247;
let startTodayTimestamp = new Date().setHours(0, 0, 0, 0);

function getCurhatCount(): number {
  // Simulate active community: augment counter slightly based on elapsed time today
  const elapsedMinutes = Math.floor((Date.now() - startTodayTimestamp) / 60000);
  const activeIncrement = Math.max(0, Math.floor(elapsedMinutes * 0.4)); // ~24 posts/hour
  return basesolidarityCounter + activeIncrement;
}

// ENDPOINTS

// 1. Get List of Community Posts
app.get("/api/posts", (req, res) => {
  const { category, industry, city } = req.query;
  let filtered = [...posts];

  if (category) {
    const catStr = String(category).toLowerCase();
    filtered = filtered.filter(p => p.category.toLowerCase().includes(catStr) || p.tags.some(t => t.toLowerCase().includes(catStr)));
  }
  if (industry) {
    filtered = filtered.filter(p => p.industry.toLowerCase() === String(industry).toLowerCase());
  }
  if (city) {
    filtered = filtered.filter(p => p.city.toLowerCase() === String(city).toLowerCase());
  }

  // Sort by newest
  filtered.sort((a, b) => b.createdAt - a.createdAt);
  res.json(filtered);
});

// Helper for Fallback Advice Generation
function getFallbackAdvice(content: string): string {
  const text = content.toLowerCase();
  if (text.includes("lembur") || text.includes("overtime")) {
    return "Lembur yang melebihi batas waktu 4 jam/hari wajib mendapatkan upah lembur sesuai ketentuan UU Cipta Kerja Klaster Ketenagakerjaan. Pastikan Anda mengoleksi jadwal shift kerja Anda.";
  }
  if (text.includes("resign") || text.includes("keluar") || text.includes("undur")) {
    return "Berdasarkan regulasi di Indonesia, pekerja berhak mengundurkan diri dengan mengajukan surat minimal 30 hari sebelumnya dan tetap mendapatkan uang penggantian hak (UPH).";
  }
  if (text.includes("gaji") || text.includes("upah") || text.includes("bayar")) {
    return "Potongan gaji tanpa kesepakatan tertulis melanggar asas pengupahan nasional. Kumpulkan slip gaji dan laporkan jika terdapat indikasi pelanggaran pidana ketenagakerjaan.";
  }
  return "Situasi Anda krusial. Jaga kesehatan mental Anda dan tulislah kronologi kejadian secara mendetail untuk mempermudah mediasi bersama Disnaker atau perwakilan hukum jika diperlukan.";
}

function getActionableSolution(content: string, category: string): string {
  const text = content.toLowerCase();
  const cat = (category || "").toLowerCase();
  
  if (cat.includes("lembur") || text.includes("lembur") || text.includes("overtime")) {
    return "Tindakan Nyata: Catat log kehadiran lembur mandiri & mintakan formulir lembur resmi sesuai Pasal 78 UU Ketenagakerjaan.";
  }
  if (cat.includes("gaslighting") || text.includes("toxic") || text.includes("marah") || text.includes("gaslight") || text.includes("bully")) {
    return "Tindakan Nyata: Amankan kesehatan mental, batasi komunikasi non-pekerjaan & rapikan portfolio CV untuk mencari tempat sehat.";
  }
  if (cat.includes("gaji") || cat.includes("upah") || text.includes("gaji") || text.includes("upah") || text.includes("bayar") || text.includes("potong")) {
    return "Tindakan Nyata: Siapkan mutasi rekening / slip gaji, layangkan surat bipartit tertulis, dan konsultasikan ke Disnaker setempat.";
  }
  if (cat.includes("resign") || text.includes("resign") || text.includes("keluar") || text.includes("undur")) {
    return "Tindakan Nyata: Tempuh one-month notice formal, amankan surat keterangan kerja (paklaring), dan urus sisa hak cuti tahunan.";
  }
  return "Tindakan Nyata: Ingat perjuangan keluarga, dokumentasikan komunikasi janggal perusahaan, dan prioritaskan stabilitas mental.";
}

// 2. Submit a New Community Post (Anonymous)
app.post("/api/posts", async (req, res) => {
  try {
    const { content, category, city, industry, actionStatus, tags, clientId } = req.body;

    if (!content || content.length < 10) {
      return res.status(400).json({ error: "Cerita curhat terlalu pendek (minimal 10 karakter)." });
    }

    // Anti-spam control: limiting to 1 post per 3 minutes per client
    if (clientId) {
      const recentPost = posts.find(p => p.clientId === clientId && (Date.now() - p.createdAt) < 180000);
      if (recentPost) {
        return res.status(429).json({ error: "Komunitas mengutamakan kualitas. Silakan beri jeda 3 menit sebelum membagikan curhat lainnya." });
      }
    }

    // Generate random Pekerja Tangguh number
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const author = `Pekerja Tangguh #${randNum}`;

    let aiAdvice = "";

    if (ai) {
      try {
        const prompt = `Anda adalah Surjob AI, pakar kesejahteraan pekerja dan hukum ketenagakerjaan Indonesia.
Tugas Anda adalah membaca curhat pekerja berikut dan memberikan 1-2 kalimat (Maksimal 35 kata) tanggapan yang berisi simpati singkat dan satu tips hukum/wellness berdasarkan regulasi Indonesia.
Gunakan bahasa Indonesia yang solider dan profesional. JANGAN berikan instruksi panjang lebar.
PENTING: Jangan gunakan karakter bintang (*) atau (**) sama sekali dalam teks jawaban Anda. Berikan teks bersih.

Curhat Pekerja:
"${content}"

Kategori: ${category || "General"}
Lokasi: ${city || "Indonesia"}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            temperature: 0.7,
            maxOutputTokens: 120,
          }
        });

        aiAdvice = response.text ? response.text.trim() : getFallbackAdvice(content);
      } catch (geminiError) {
        console.error("Gemini advice generation failed, using fallback:", geminiError);
        aiAdvice = getFallbackAdvice(content);
      }
    } else {
      aiAdvice = getFallbackAdvice(content);
    }

    aiAdvice = cleanAsterisks(aiAdvice);

    const newPost: Post = {
      id: "post_" + Date.now() + "_" + randNum,
      author,
      time: "Baru saja",
      city: city || "Anonim",
      industry: industry || "Umum",
      content,
      category: category || "Umum",
      tags: tags || [category || "Umum", actionStatus || "Masih berjuang"],
      actionStatus: actionStatus || "Masih berjuang",
      reactions: { aku_juga: 0, kuatkan: 1, survive: 0 },
      aiAdvice,
      createdAt: Date.now(),
      clientId,
      solusiNyata: getActionableSolution(content, category || "Umum")
    };

    posts.unshift(newPost);
    basesolidarityCounter += 1; // Increment total counter

    res.status(201).json(newPost);
  } catch (error: any) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Memory tracking for reactions to guarantee 1 user 1 reaction per post
const postUserReactions = new Map<string, Set<string>>();

// 3. Increment Reaction on a Post
app.post("/api/posts/:id/react", (req, res) => {
  const { id } = req.params;
  const { ttype, clientId } = req.body; // "aku_juga", "kuatkan", "survive"

  const post = posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post tidak ditemukan." });
  }

  if (clientId) {
    if (!postUserReactions.has(id)) {
      postUserReactions.set(id, new Set());
    }
    const reactedClients = postUserReactions.get(id)!;
    if (reactedClients.has(clientId)) {
      return res.status(400).json({ error: "Anda sudah memberikan satu dukungan/reaksi untuk curhatan ini." });
    }
    reactedClients.add(clientId);
  }

  if (ttype === "aku_juga") {
    post.reactions.aku_juga += 1;
  } else if (ttype === "kuatkan") {
    post.reactions.kuatkan += 1;
  } else if (ttype === "survive") {
    post.reactions.survive += 1;
  } else {
    return res.status(400).json({ error: "Tipe reaksi tidak didukung." });
  }

  res.json(post);
});

// 3.5. Submit a Reply / Comment to a Post
app.post("/api/posts/:id/replies", (req, res) => {
  const { id } = req.params;
  const { content, clientId } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: "Isi balasan tidak boleh kosong." });
  }

  const post = posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post tidak ditemukan." });
  }

  if (!post.replies) {
    post.replies = [];
  }

  // Enforce 1 user 1 reply rule
  if (clientId) {
    const alreadyReplied = post.replies.some(reply => reply.clientId === clientId);
    if (alreadyReplied) {
      return res.status(400).json({ error: "Anda sudah memberikan satu dukungan/balasan untuk curhatan ini." });
    }
  }

  const randNum = Math.floor(1000 + Math.random() * 9000);
  
  // Deterministic user pseudonym code
  let pseudCode = randNum;
  if (clientId) {
    let hash = 0;
    for (let i = 0; i < clientId.length; i++) {
      hash = clientId.charCodeAt(i) + ((hash << 5) - hash);
    }
    pseudCode = Math.abs(hash % 9000) + 1000;
  }

  const newReply: PostReply = {
    id: "reply_" + Date.now() + "_" + randNum,
    author: `Pekerja Tangguh #${pseudCode}`,
    content: cleanAsterisks(content),
    time: "Baru saja",
    clientId
  };

  post.replies.push(newReply);
  res.status(201).json(newReply);
});

// 4. Get Leaderboard and Stats
app.get("/api/leaderboard", (req, res) => {
  // Transpile real user posts into leaderboard records
  const userPejuang = posts.slice(0, 6).map((p) => {
    const code = p.author.replace("Pekerja Tangguh #", "");
    const avatars = ["🦁", "🐯", "🦊", "🐻", "🦄", "🦅", "🦖"];
    const avatar = avatars[parseInt(code) % avatars.length] || "🦁";
    const name = `Pejuang #${code}`;
    
    // Determine status text gracefully
    let statusText = "Berjuang 💪";
    if (p.actionStatus === "Sudah Resign" || p.tags.includes("Sudah Resign")) {
      statusText = "Survive ✓";
    } else if (p.actionStatus === "Baru mulai bertindak" || p.tags.includes("Baru mulai bertindak")) {
      statusText = "Berjuang 💪";
    }

    return {
      id: p.id,
      avatar,
      name,
      issue: p.content.length > 55 ? `${p.content.slice(0, 52)}...` : p.content,
      status: statusText,
      solusiNyata: p.solusiNyata || getActionableSolution(p.content, p.category)
    };
  });

  // Baseline templates
  const fallbackPejuang = [
    {
      id: "pj1",
      avatar: "🦁",
      name: "Pejuang #8821",
      issue: "Lembur tidak dibayar 3 tahun — sudah lapor Disnaker",
      status: "Survive ✓",
      solusiNyata: "Tindakan Nyata: Amankan log absen, kirim surat mediasi bipartit resmi, bersiap lapor Disnaker."
    },
    {
      id: "pj2",
      avatar: "🐯",
      name: "Pejuang #3304",
      issue: "Atasan gaslighting — sudah resign dengan terhormat",
      status: "Survive ✓",
      solusiNyata: "Tindakan Nyata: Putus kontak dengan atasan toxic, perbarui portofolio CV kerja & lekas resign."
    },
    {
      id: "pj3",
      avatar: "🦊",
      name: "Pejuang #5512",
      issue: "Toxic boss + gaji tidak sesuai kontrak",
      status: "Berjuang 💪",
      solusiNyata: "Tindakan Nyata: Siapkan cetak rekening transfer, kumpulkan slip pembayaran & layangkan teguran."
    },
    {
      id: "pj4",
      avatar: "🐻",
      name: "Pejuang #9901",
      issue: "Micromanagement + tidak ada work-life balance",
      status: "Berjuang 💪",
      solusiNyata: "Tindakan Nyata: Batasi balasan di luar jam kerja, matikan HP kerja tepat jam 6 sore & amankan psikologis."
    }
  ];

  // Merge up to 5 unique pejuang
  const combinedPejuang = [...userPejuang];
  for (const item of fallbackPejuang) {
    if (combinedPejuang.length < 5) {
      if (!combinedPejuang.some(existing => existing.id === item.id)) {
        combinedPejuang.push(item);
      }
    }
  }

  const userSurviveCount = posts.filter(p => p.actionStatus === "Sudah Resign" || p.tags.includes("Sudah Resign")).length;
  const surviveCount = 892 + userSurviveCount;

  res.json({
    curhatCount: getCurhatCount(),
    topProblems: {
      lembur: 34,
      toxicBoss: 28,
      gaji: 18,
      gaslighting: 11,
      lainnya: 9
    },
    surviveCount,
    pejuangSurvive: combinedPejuang
  });
});

// 5. Chat Endpoint with Gemini (With complete workplace specialized system Instructions)
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history, clientId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Pesan tidak boleh kosong." });
    }

    if (clientId) {
      const limitStatus = checkRateLimit(clientId, "chat");
      if (limitStatus.blocked) {
        return res.status(429).json({ error: limitStatus.message });
      }
    }

    const systemInstruction = `Anda adalah Surjob AI, asisten analisis situasi kerja anonim untuk pekerja Indonesia.

Tugas Anda:
1. Berikan simpati singkat dan satu tips hukum berdasarkan regulasi Indonesia.
2. Berikan saran taktis (opsi bicara/draf pesan) yang sopan namun tegas.

ATURAN MUTLAK:
- MAKSIMAL 3 kalimat. Fokus pada inti jawaban.
- JANGAN PERNAH gunakan karakter bintang (*) atau (**) sama sekali.
- JANGAN menulis pengingat anonimitas, itu sudah tertangani oleh sistem.
- Jika ada poin, gunakan angka biasa.`;

    if (ai) {
      try {
        const contentsPayload: any[] = [];
        if (history && Array.isArray(history)) {
          history.forEach((h: any) => {
            contentsPayload.push({
              role: h.role === "user" ? "user" : "model",
              parts: [{ text: h.text }]
            });
          });
        }
        contentsPayload.push({
          role: "user",
          parts: [{ text: message }]
        });

        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: contentsPayload,
          config: {
            systemInstruction,
            temperature: 0.5,
            maxOutputTokens: 800,
          }
        });

        const reply = response.text ? response.text.trim() : "Maaf, silakan coba lagi.";
        return res.json({ text: cleanAsterisks(reply) });
      } catch (geminiError: any) {
        console.error("Gemini chat API error:", geminiError);
        return res.status(500).json({ error: "Koneksi terganggu.", details: geminiError.message });
      }
    } else {
      // Simulate highly precise Indonesian labor advisor responses in dev environment if key is missing
      setTimeout(() => {
        let reply = "";
        const lowerMsg = message.toLowerCase();

        if (lowerMsg.includes("lembur") || lowerMsg.includes("overtime")) {
          reply = `Duh, lembur terus-menerus tanpa upah yang adil itu bener-bener menguras fisik dan mental, kamu nggak sendirian merasakan ini. 

Berdasarkan UU Ketenagakerjaan No. 13/2003 & UU Cipta Kerja, berikut adalah hak kamu:
1. Batas Maksimal Lembur: Maksimal 4 jam dalam 1 hari dan 18 jam dalam 1 minggu (di luar lembur hari libur resmi).
2. Upah Lembur: Jam pertama wajib dibayar 1,5 kali upah sejam, dan jam berikutnya wajib dibayar 2 kali upah sejam.

Langkah konkret yang bisa kamu lakukan:
1. Catat Log Kerja: Buat spreadsheet pribadi yang mencantumkan tanggal, jam mulai, jam selesai, dan screenshot instruksi lembur dari atasan.
2. Gunakan Script Bicara: Sampaikan secara baik-baik saat 1-on-1 dengan atasan kamu.

Naskah Bicara Untukmu:
"Selamat pagi/siang Pak/Bu, saya ingin mendiskusikan terkait jam lembur dan target tugas saya akhir-akhir ini. Agar performa saya tetap prima dan sesuai ketentuan jam kerja di regulasi ketenagakerjaan, apakah saya bisa mengajukan form perhitungan lembur tertulis untuk jam kerja tambahan tersebut?"

🔒 Tenang, curhatan kamu di sini 100% aman dan anonim.`;
        } else if (lowerMsg.includes("resign") || lowerMsg.includes("keluar") || lowerMsg.includes("lapor")) {
          reply = `Memikirkan untuk resign adalah hal yang wajar ketika suasana kerja sudah mengorbankan kedamaian pikiranmu. Kita dukung penuh hak kamu untuk berkembang!

Berdasarkan peraturan ketenagakerjaan di Indonesia, pengunduran diri sukarela yang aman dan sah memiliki syarat:
1. Mengajukan berkas pengunduran diri selambat-lambatnya 30 hari sebelum tanggal mulai berhenti (Aturan One Month Notice).
2. Tetap melaksanakan kewajiban sampai tanggal pengunduran diri berlaku.
3. Mendapatkan Uang Penggantian Hak (UPH) seperti sisa cuti tahunan yang belum gugur dan ongkos pulang pekerja/keluarga.

Langkah konkret mengundurkan diri:
1. Kirimkan surat formal yang santun tanpa menumpahkan kekesalan secara berlebihan.
2. Amankan semua berkas portofolio pribadi dan surat paklaring kerja sebagai hak administrasi penting kamu.

Sudah siap menulis email HRD? Beritahu saya jika kamu butuh draf email pengunduran diri yang aman dan profesional!`;
        } else if (lowerMsg.includes("atasan") || lowerMsg.includes("toxic") || lowerMsg.includes("bully") || lowerMsg.includes("gaslight")) {
          reply = `Wah, menghadapi atasan yang melakukan gaslighting atau toxic behavior itu melelahkan sekali. Menghadapi micro-management atau ketidakadilan verbal di kantor adalah bentuk kekerasan psikologis yang nyata.

Pemeriksaan Red Flag Workplace untukmu:
1. Atasan sering melimpahkan kesalahan pribadi kepada anggota tim.
2. Mengabaikan waktu pribadi (melewati jam kerja) untuk urusan non-formal.
3. Manipulasi fakta atau meremehkan usahamu di depan umum.

Rekomendasi Surjob AI:
1. Batas Tertulis: Jawablah perintah tidak masuk akal melalui kanal tertulis (WhatsApp/Email) agar terekam jejak digital komunikasinya.
2. Fokus pada Fakta: Saat dikritik secara subjektif, kembalikan pada metrik performa tertulis di KPI kamu.

Butuh naskah email penolakan tugas di luar jam kerja dengan elegan? Ketik saja "Naskah email" sekarang.`;
        } else {
          reply = `Halo Sobat Kerja! Cerita kami dengarkan sepenuhnya. Kerja yang sehat adalah hak setiap warga negara.

Untuk membantu kamu lebih detail, silakan jabarkan masalah apa yang sedang mengganjal:
1. Atasan toxic / Gaslighting?
2. Lembur tidak dibayar?
3. Potongan Gaji ga jelas?
4. Bingung cara resign aman?

Saya siap menemani dan menganalisis secara mendalam langkah hukum serta solusi terbaik untukmu tanpa bocor ke siapapun! 🔒`;
        }
        res.json({ text: cleanAsterisks(reply) });
      }, 1000);
    }
  } catch (error) {
    console.error("General error in chat endpoint:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const registerAnalysisPost = (clientId: string | undefined, story: string, score: number, category: string) => {
  if (!clientId) return;
  
  // Deterministic user pseudonym code
  let hash = 0;
  for (let i = 0; i < clientId.length; i++) {
    hash = clientId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const pseudCode = Math.abs(hash % 9000) + 1000;
  const author = `Pekerja Tangguh #${pseudCode}`;
  
  // Clean up content snippet for public display (keep it anonymous, brief, and clean)
  const contentSnippet = story.length > 250 ? `${story.slice(0, 247)}...` : story;
  
  // Determine category clean
  let cleanCat = "Umum";
  const lowerStory = story.toLowerCase();
  if (lowerStory.includes("toxic") || lowerStory.includes("gaslight") || lowerStory.includes("bully") || lowerStory.includes("marah")) {
    cleanCat = "Gaslighting";
  } else if (lowerStory.includes("lembur") || lowerStory.includes("overtime")) {
    cleanCat = "Lembur";
  } else if (lowerStory.includes("gaji") || lowerStory.includes("upah") || lowerStory.includes("potong") || lowerStory.includes("bayar")) {
    cleanCat = "Gaji/Upah";
  }
  
  // Look for existing post with same clientId
  const existingPostIndex = posts.findIndex(p => p.clientId === clientId);
  
  const solusi = getActionableSolution(story, cleanCat);
  const aiAdviceText = `Berdasarkan analisis kesehatan kerja, kantor Anda memiliki skor ${score}/100 (${category}). Prioritaskan regulasi ketenagakerjaan RI dan lindungi hak Anda secepatnya.`;

  if (existingPostIndex >= 0) {
    // Update existing post
    posts[existingPostIndex].content = contentSnippet;
    posts[existingPostIndex].category = cleanCat;
    posts[existingPostIndex].tags = [cleanCat, score < 40 ? "Sangat Toxic" : score < 70 ? "Rawan / Kuning" : "Cukup Sehat"];
    posts[existingPostIndex].actionStatus = score < 40 ? "Masih berjuang" : score < 70 ? "Baru mulai bertindak" : "Survive ✓";
    posts[existingPostIndex].solusiNyata = solusi;
    posts[existingPostIndex].aiAdvice = aiAdviceText;
    posts[existingPostIndex].createdAt = Date.now(); // update timestamp
    posts[existingPostIndex].time = "Baru saja diperbarui";
  } else {
    // Create new post
    const newP: Post = {
      id: "post_analysis_" + Date.now() + "_" + pseudCode,
      author,
      time: "Baru saja",
      city: "Jakarta",
      industry: "Umum",
      content: contentSnippet,
      category: cleanCat,
      tags: [cleanCat, score < 40 ? "Sangat Toxic" : score < 70 ? "Rawan / Kuning" : "Cukup Sehat"],
      actionStatus: score < 40 ? "Masih berjuang" : "Baru mulai bertindak",
      reactions: { aku_juga: 1, kuatkan: 2, survive: 0 },
      aiAdvice: aiAdviceText,
      createdAt: Date.now(),
      clientId,
      solusiNyata: solusi,
      replies: []
    };
    posts.unshift(newP);
    basesolidarityCounter += 1; // Increment total counter
  }
};

// 6. Detailed Workplace Analysis API (Hasil Score, RedFlags, Langkah, Hak)
app.post("/api/gemini/analyze", async (req, res) => {
  try {
    const { story, clientId } = req.body;

    if (!story || story.length < 5) {
      return res.status(400).json({ error: "Masukkan cerita atau jawaban kuesioner Anda untuk dianalisis." });
    }

    if (clientId) {
      const limitStatus = checkRateLimit(clientId, "analyze");
      if (limitStatus.blocked) {
        return res.status(429).json({ error: limitStatus.message });
      }
    }

    if (ai) {
      try {
        const prompt = `Anda adalah Surjob AI, sistem pintar analisis toksisitas lingkungan kerja Indonesia.
Analisis cerita situasi kerja berikut secara akurat dan objektif berdasarkan standar wellness dan hukum ketenagakerjaan Indonesia.
Keluarkan output analisis murni dalam bentuk JSON yang sesuai dengan skema ini. JANGAN MENULIS TEKS LAIN selain JSON yang valid.
PENTING: Jangan gunakan atau sertakan karakter tanda bintang (*) atau bintang ganda (**) sama sekali di dalam nilai-nilai teks pada properti skema JSON Anda. Berikan tulisan biasa yang bersih.

Cerita Pekerja:
"${story}"

Schema JSON yang wajib Anda ikuti:
{
  "score": number, // Nilai 0-100 (0 sangat toxic dan berbahaya, 100 sangat sehat)
  "category": string, // "Sangat Toxic", "Rawan/Kuning", "Cukup Sehat", "Sangat Sehat"
  "redFlags": [
    {
      "title": string, // Judul pelanggaran/red flag singkat (maks 6 kata)
      "description": string, // Penjelasan detail masalah (maks 20 kata)
      "severity": string // "Tinggi", "Sedang", "Rendah"
    }
  ],
  "steps": [
    string // Langkah konkret berurutan (maksimal 3 langkah, masing-masing maks 15 kata)
  ],
  "rights": [
    {
      "title": string, // Judul hak pekerja (maks 6 kata)
      "lawReference": string, // Regulasi hukum atau pasal Indonesia yang relevan
      "details": string // Penjelasan pasal (maks 20 kata)
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            temperature: 0.3,
            responseMimeType: "application/json",
          }
        });

        const replyText = response.text ? response.text.trim() : "";
        const parsedReport = JSON.parse(replyText);
        
        // Register/Upsert analyzed story in real-time
        registerAnalysisPost(clientId, story, parsedReport.score, parsedReport.category);

        return res.json(cleanAsterisks(parsedReport));
      } catch (geminiError) {
        console.error("Gemini analysis generating failed, falling back to static generation:", geminiError);
      }
    }

    // Dynamic high-quality simulation logic based on keywords
    const lowerText = story.toLowerCase();
    let score = 75;
    let category = "Cukup Sehat";
    let redFlags = [];
    let steps = [];
    let rights = [];

    // Ensure helper doesn't fail
    const lowerMsgCheck = (term: string) => {
      return lowerText.includes(term);
    };

    if (lowerText.includes("lembur") || lowerText.includes("jam") || lowerMsgCheck("malam") || lowerMsgCheck("sabtu") || lowerMsgCheck("minggu")) {
      score = 42;
      category = "Rawan/Kuning";
      redFlags.push({
        title: "Eksploitasi Waktu Lembur",
        description: "Bekerja di luar jam operasional resmi perusahaan tanpa kompensasi finansial yang diatur undang-undang.",
        severity: "Tinggi"
      });
      steps.push("Dokumentasikan bukti kehadiran tertulis dan rekapan log penugasan lembur dari atasan.");
      steps.push("Diskusikan secara profesional mengenai upah lembur atau pengurangan beban kerja.");
      rights.push({
        title: "Upah Kerja Lembur",
        lawReference: "Pasal 78 UU No. 13/2003 Jo UU Cipta Kerja",
        details: "Pengusaha wajib membayar upah kerja lembur untuk pekerja yang melebihi waktu kerja normal."
      });
    }

    if (lowerText.includes("gaji") || lowerText.includes("upah") || lowerText.includes("potong") || lowerText.includes("telat") || lowerText.includes("tahan")) {
      score = Math.min(score, 35);
      category = "Sangat Toxic";
      redFlags.push({
        title: "Penahanan / Pemotongan Gaji Sepihak",
        description: "Mengurangi hak finansial pokok tanpa kesepakatan tertulis bersama di atas materai.",
        severity: "Tinggi"
      });
      steps.push("Ajukan nota keberatan tertulis kepada divisi finansial / HRD perusahaan.");
      steps.push("Hubungi dinas ketenagakerjaan setempat jika mediasi internal dihiraukan.");
      rights.push({
        title: "Asas Perlindungan Upah",
        lawReference: "PP No. 36 Tahun 2021 tentang Pengupahan",
        details: "Upah tidak boleh dipotong di luar ketentuan formal dan wajib dibayarkan tepat waktu."
      });
    }

    if (lowerText.includes("toxic") || lowerText.includes("marah") || lowerText.includes("gaslight") || lowerText.includes("bully") || lowerText.includes("hina")) {
      score = Math.min(score, 28);
      category = "Sangat Toxic";
      redFlags.push({
        title: "Verbal Abuse & Gaslighting",
        description: "Atasan menggunakan manipulasi verbal ekstrem demi merusak reputasi mental rekan kerja.",
        severity: "Tinggi"
      });
      steps.push("Simpan semua tangkapan layar chat ketus / bukti manipulasi verbal sebagai arsip pribadi.");
      steps.push("Batasi pembicaraan non-kerjaan dan prioritaskan komunikasi via email.");
      rights.push({
        title: "Hak atas Kemanusiaan & Martabat",
        lawReference: "Pasal 86 UU No. 13 Tahun 2003",
        details: "Sobat kerja berhak atas perlindungan moral, kesusilaan, martabat, dan perlakuan sesuai nilai kemanusiaan."
      });
    }

    // Default general case if nothing specifically matches
    if (redFlags.length === 0) {
      score = 55;
      category = "Rawan/Kuning";
      redFlags.push({
        title: "Ketidakjelasan Beban Serta Tugas",
        description: "Deskripsi tanggung jawab kerja tidak terdokumentasi terinci mengarah to micromanagement.",
        severity: "Sedang"
      });
      steps.push("Diskusikan kembali sasaran kerja (KPI) tertulis Anda demi memperjelas output.");
      steps.push("Jaga keseimbangan hidup dengan menetapkan batasan matikan notifikasi pasca jam kantor.");
      rights.push({
        title: "Aturan Perjanjian Kerja Formal",
        lawReference: "Pasal 54 UU No. 13 Tahun 2003",
        details: "Perjanjian kerja wajib memuat rincian jenis pekerjaan, upah, serta hak-kewajiban yang berimbang."
      });
    }

    // Register/Upsert analyzed story in real-time
    registerAnalysisPost(clientId, story, score, category);

    res.json(cleanAsterisks({
      score,
      category,
      redFlags,
      steps,
      rights
    }));

  } catch (error: any) {
    console.error("Error analyzing report:", error);
    res.status(500).json({ error: "Gagal memproses analisis laporan." });
  }
});

// VITE MIDDLEWARE SETUP
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev server middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production files from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Surjob AI full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
