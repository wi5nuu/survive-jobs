import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, MessageSquare, Shield, CheckCircle2, AlertTriangle, ChevronRight, Mic, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SimulasiBosView() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState("");
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const startSimulation = () => {
    if (!topic) return;
    setStep(2);
    setMessages([
      { role: "system", text: "Simulasi dimulai. AI akan berperan sebagai atasan/HRD Anda berdasarkan topik: " + topic },
      { role: "boss", text: "Ada apa kamu minta waktu saya hari ini? Cepat bicara, saya sibuk." }
    ]);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMsgs = [...messages, { role: "user", text: inputText }];
    setMessages(newMsgs);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages([...newMsgs, { role: "boss", text: "Itu kan sudah ada aturannya dari pusat. Kamu tidak bisa protes begitu saja. Kalau tidak suka, pintu terbuka lebar." }]);
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="bg-white border-b border-[#E2DDD4] px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate("/")} className="text-[#6B6458] p-1 -ml-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-[#2C2A26] text-sm">Simulasi Bos</h1>
          <p className="text-[10px] text-[#A09880]">Latih bicara ke atasan tanpa risiko</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {step === 1 ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#1E5C3A] to-[#144229] p-4 rounded-xl text-white shadow-sm">
              <MessageSquare className="w-6 h-6 mb-2 text-green-200" />
              <h2 className="font-bold text-sm mb-1">Kenapa Simulasi Ini Penting?</h2>
              <p className="text-[11px] text-green-50 leading-relaxed">
                Banyak pekerja gagal mendapatkan haknya karena gugup, terintimidasi, atau salah berbicara saat berhadapan dengan atasan/HRD. Fitur ini menggunakan AI untuk mensimulasikan respons tipikal manajemen (termasuk gaslighting atau ancaman) agar Anda bisa berlatih merespons dengan tenang dan berlandaskan hukum.
              </p>
            </div>

            <div className="bg-white border border-[#E2DDD4] p-4 rounded-xl shadow-sm space-y-3">
              <h3 className="font-bold text-xs text-[#2C2A26]">Pilih Topik Simulasi</h3>
              <div className="space-y-2">
                {["Nego Kenaikan Gaji", "Menolak Lembur Tidak Dibayar", "Klarifikasi SP/Teguran", "Menanyakan Status PKWT", "Lainnya"].map(t => (
                  <label key={t} className="flex items-center gap-2 p-2 border border-[#E2DDD4] rounded-lg cursor-pointer hover:bg-slate-50 transition">
                    <input type="radio" name="topic" value={t} onChange={(e) => setTopic(e.target.value)} className="text-[#1E5C3A]" />
                    <span className="text-xs text-[#2C2A26] font-medium">{t}</span>
                  </label>
                ))}
              </div>
              
              <button 
                onClick={startSimulation}
                disabled={!topic}
                className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${topic ? 'bg-[#1E5C3A] text-white hover:bg-[#153F28]' : 'bg-[#E2DDD4] text-[#A09880] cursor-not-allowed'}`}
              >
                Mulai Simulasi <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 bg-orange-50 border border-orange-100 p-3 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-orange-800 leading-tight">Bersiaplah, AI mungkin akan memberikan respons defensif, manipulatif, atau intimidatif sesuai realita lapangan.</p>
              </div>
              <div className="flex-1 bg-green-50 border border-green-100 p-3 rounded-xl flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-green-800 leading-tight">Gunakan kepala dingin, fokus pada data/kontrak kerja Anda.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'system' ? (
                  <div className="w-full text-center">
                    <span className="bg-[#E2DDD4] text-[#6B6458] text-[9px] font-bold px-2 py-1 rounded-full">{msg.text}</span>
                  </div>
                ) : (
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#1E5C3A] text-white rounded-tr-sm' : 'bg-white border border-[#E2DDD4] text-[#2C2A26] rounded-tl-sm'}`}>
                    {msg.role === 'boss' && <div className="text-[9px] font-bold text-red-500 mb-1">HRD / Atasan</div>}
                    {msg.text}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#E2DDD4] p-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-[#A09880] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#A09880] rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-[#A09880] rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {step === 2 && (
        <div className="bg-white border-t border-[#E2DDD4] p-3 flex gap-2 items-end pb-[env(safe-area-inset-bottom)] shrink-0">
          <div className="flex-1 bg-[#F5F4F0] border border-[#E2DDD4] rounded-xl flex items-center px-3 py-1">
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tulis balasan Anda..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-xs py-2 outline-none resize-none"
              rows={1}
            />
            <button className="text-[#A09880] p-1"><Mic className="w-4 h-4" /></button>
          </div>
          <button 
            onClick={handleSendMessage}
            className="bg-[#1E5C3A] text-white p-2.5 rounded-xl shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
