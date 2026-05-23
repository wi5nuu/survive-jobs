import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, ArrowLeft, ShieldAlert, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import Markdown from "react-markdown";
import { ChatMessage, AnalyzeResponse } from "../types";

interface ChatViewProps {
  onBackToHome: () => void;
  onAnalysisGenerated: (report: AnalyzeResponse) => void;
  presetMode?: string;
}

export default function ChatView({ onBackToHome, onAnalysisGenerated, presetMode }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-first",
      role: "model",
      text: "Halo! Saya Surjob AI. Ceritakan situasi kerja Anda sekarang — kerahasiaan Anda terjamin sepenuhnya di sini.",
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [selectedMode, setSelectedMode] = useState(presetMode || "Cerita bebas");
  const [isTyping, setIsTyping] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const modes = [
    "Konflik Atasan",
    "Beban Kerja Berlebih",
    "Isu Gaji & Potongan",
    "Isu Lembur",
    "Isu Kontrak Kerja",
    "Lingkungan Kerja",
    "Prosedur Resign"
  ];

  const quickReplies = [
    { text: "Konflik dengan atasan", prompt: "Saya sedang menghadapi atasan yang sering memberikan tekanan psikologis di luar wajar." },
    { text: "Lembur tidak dibayar", prompt: "Saya dipaksa lembur melampaui batas jam kerja biasa tanpa dibayar." },
    { text: "Ingin resign", prompt: "Saya ingin resign dari lingkungan kerja saat ini. Bagaimana prosedurnya?" },
    { text: "Masalah gaji", prompt: "Gaji saya dipotong secara sepihak atau terlambat dibayar." }
  ];

  useEffect(() => {
    if (presetMode) {
      setSelectedMode(presetMode);
      // Optional: auto-insert a helper starting user chat if desired
    }
  }, [presetMode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    setErrorText(null);

    const userMsg: ChatMessage = {
      id: "msg_user_" + Date.now(),
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      // Map history for API
      const historyPayload = messages.map((m) => ({
        role: m.role === "model" ? "model" : "user",
        text: m.text,
      }));

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          clientId: getOrCreateClientId(),
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "Gagal mengambil respon dari server AI.");
      }

      const data = await response.json();
      
      const systemMsg: ChatMessage = {
        id: "msg_ai_" + Date.now(),
        role: "model",
        text: data.text,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, systemMsg]);
    } catch (err: any) {
      console.error(err);
      setErrorText("Koneksi AI terputus. Klik tombol di bawah untuk mencoba ulang pesan ini.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleRetry = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.text);
    }
  };

  const handleModeChange = (mode: string) => {
    setSelectedMode(mode);
    let promptIntro = "";
    switch (mode) {
      case "Konflik Atasan":
      case "Beban Kerja Berlebih":
      case "Lingkungan Kerja":
        promptIntro = "Tolong bantu saya menghadapi situasi sulit di tempat kerja terkait " + mode.toLowerCase() + ": ";
        break;
      case "Isu Gaji & Potongan":
      case "Isu Lembur":
      case "Isu Kontrak Kerja":
        promptIntro = "Berapakah ketentuan hak hukum saya dan apa yang harus saya lakukan terkait " + mode.toLowerCase() + "?: ";
        break;
      case "Prosedur Resign":
        promptIntro = "Saya berencana resign dan memohon arahan hak hukum, tolong cek opsi saya untuk: ";
        break;
      default:
        promptIntro = "Saya butuh saran terkait " + mode.toLowerCase() + ": ";
    }
    setInputText(promptIntro);
  };

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

// Compile full dashboard report based on chat discussion
  const handleCompileReport = async () => {
    setIsAnalyzing(true);
    setErrorText(null);

    // Aggregate user messages to build a comprehensive story for analysis
    const userSpeeches = messages
      .filter((m) => m.role === "user")
      .map((m) => m.text)
      .join("\n\n");

    const analysisInput = userSpeeches || "Saya ingin menguji status kelayakan kondisi di perusahaan saya secara menyeluruh.";

    try {
      const res = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          story: analysisInput, 
          clientId: getOrCreateClientId() 
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal menyusun data laporan dengan AI.");
      }

      const reportData: AnalyzeResponse = await res.json();
      onAnalysisGenerated(reportData);
    } catch (err) {
      console.error("Analysis generation error:", err);
      setErrorText("Tidak dapat memproses rangkuman hasil. Silakan ulangi draf cerita Anda.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full max-w-md mx-auto bg-[#FDFBF7] rounded-none sm:rounded-2xl overflow-hidden border-0 sm:border border-[#E2DDD4] sm:shadow-sm">
      {/* SHIELD CHAT BAR */}
      <div className="bg-[#FFFFFF] px-4 py-3 flex items-center justify-between border-b border-[#E2DDD4]">
        <div className="flex items-center gap-3">
           <button
            onClick={onBackToHome}
            className="p-1.5 hover:bg-[#F7F3EC] rounded-full transition-colors text-[#6B6458]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-display font-semibold text-base text-[#2C2A26] flex items-center gap-1.5">
              <span>Analisis Workplace</span>
            </h2>
            <p className="text-[11px] text-[#A09880] font-medium">Surjob AI • 100% Terenkripsi</p>
          </div>
        </div>
        <button
          onClick={handleCompileReport}
          disabled={isAnalyzing || messages.length < 2}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm transition-all ${
            messages.length < 2
              ? "opacity-60 bg-[#EDE8DF] text-[#A09880] cursor-not-allowed"
              : "bg-[#1E5C3A] hover:bg-[#153F28] text-white cursor-pointer"
          }`}
          title="Klik untuk melihat skoring dan pasal ketenagakerjaan di tab Hasil"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Memproses</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dapatkan Skor</span>
            </>
          )}
        </button>
      </div>

      {/* FILTER/MODE PILLS - Horizontal Scroll */}
      <div className="bg-[#FFFFFF] border-b border-[#E2DDD4] px-3 py-2 flex items-center">
        <span className="text-[11px] font-bold text-[#A09880] uppercase tracking-wider shrink-0 mr-2">KENDALA:</span>
        <div className="flex gap-2 overflow-x-auto select-none no-scrollbar flex-1 pb-0.5">
          {modes.map((mode) => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`whitespace-nowrap px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer shrink-0 border ${
                selectedMode === mode
                  ? "bg-[#1E5C3A] text-white border-[#1E5C3A]"
                  : "bg-white text-[#6B6458] hover:bg-[#F7F3EC] border-[#E2DDD4]"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* CHAT BUBBLES CANVAS */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 bg-[#FDFBF7]">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              {isUser ? (
                <div className="max-w-[85%] bg-[#1E5C3A] text-white rounded-2xl rounded-tr-sm px-4 py-3 text-[11px] font-normal leading-relaxed shadow-sm">
                  {msg.text}
                </div>
              ) : (
                <div className="flex items-start gap-3 max-w-[95%]">
                   <div className="w-6 h-6 rounded-full bg-[#1E5C3A] flex items-center justify-center shrink-0 mt-0.5 shadow-sm text-white">
                     <Sparkles className="w-3.5 h-3.5" />
                   </div>
                   <div>
                     <div className="text-[11px] bg-white border border-[#E2DDD4] px-4 py-3 rounded-2xl rounded-tl-sm text-[#2C2A26] font-normal leading-relaxed markdown-body shadow-sm">
                       <Markdown>{msg.text}</Markdown>
                     </div>
                   </div>
                </div>
              )}
              {/* <span className="text-[10px] text-gray-400 mt-1.5 px-1">{msg.timestamp}</span> */}

              {/* Quick Reply Selection right below the very first agent greeting */}
              {index === 0 && messages.length === 1 && (
                <div className="flex flex-col gap-2 mt-4 self-stretch animate-fade-in pl-9">
                  <span className="text-[11px] font-medium text-[#A09880] mb-1">
                    Atau pilih respon cepat berikut:
                  </span>
                  <div className="flex flex-col gap-2 w-full">
                    {quickReplies.map((qr) => (
                      <button
                        key={qr.text}
                        onClick={() => handleSendMessage(qr.prompt)}
                        className="text-[11px] font-medium px-4 py-3 rounded-xl bg-white hover:bg-[#F7F3EC] border border-[#E2DDD4] text-[#1E5C3A] transition-colors cursor-pointer text-left shadow-sm"
                      >
                        {qr.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
           <div className="flex items-start gap-3 max-w-[95%]">
             <div className="w-6 h-6 rounded-full bg-[#1E5C3A] flex items-center justify-center shrink-0 mt-0.5 text-white shadow-sm">
               <Sparkles className="w-3.5 h-3.5" />
             </div>
             <div className="flex items-center gap-1.5 h-6 bg-white border border-[#E2DDD4] px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                <div className="w-1.5 h-1.5 bg-[#A09880] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-[#A09880] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-[#A09880] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
             </div>
          </div>
        )}

        {/* Error reporting Banner */}
        {errorText && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorText}</span>
            </div>
            <button
              onClick={handleRetry}
              className="bg-white text-red-700 font-medium px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-[11px]"
            >
              Ulangi
            </button>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* INPUT CONTROL BAR */}
      <div className="bg-[#FFFFFF] border-t border-[#E2DDD4] px-4 pt-3 pb-2 w-full">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="flex items-end gap-2 bg-[#F7F3EC] rounded-2xl p-2 border border-[#E2DDD4] focus-within:border-[#1E5C3A] transition-colors"
        >
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
               if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if(inputText.trim() && !isTyping) handleSendMessage(inputText);
               }
            }}
            placeholder="Ketik draf di sini..."
            rows={1}
            className="flex-1 bg-transparent border-none text-[#2C2A26] placeholder-[#A09880] px-2 py-1.5 text-[11px] focus:ring-0 focus:outline-none resize-none max-h-32 min-h-[28px] my-auto"
            style={{ overflowY: 'hidden' }}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className={`p-2 rounded-xl text-white transition-all cursor-pointer shrink-0 shadow-sm ${
              !inputText.trim() || isTyping
                ? "bg-[#D4CFC6] cursor-not-allowed"
                : "bg-[#1E5C3A] hover:bg-[#153F28]"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="flex justify-center pt-2 pb-1 w-full">
          <span className="text-[10px] text-[#A09880] text-center w-full">🔒 Privasi Terjamin — Identitas dan interaksi Anda 100% aman disamarkan</span>
        </div>
      </div>
    </div>
  );
}
