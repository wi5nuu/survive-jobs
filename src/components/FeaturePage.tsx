import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FeaturePage({ title, description }: { title: string, description: string }) {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `Tolong buatkan draf atau solusi untuk ${title}. Konteks: ${input}` })
      });
      const data = await res.json();
      setResponse(data.text);
    } catch (err) {
      setResponse("Gagal memproses permintaan. Pastikan server aktif.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col space-y-4 pb-20">
      <button onClick={() => navigate("/")} className="flex items-center gap-2 text-[#6B6458] text-sm font-bold pt-4">
        <ArrowLeft className="w-5 h-5" /> Kembali
      </button>
      
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-[#2C2A26]">{title}</h1>
        <p className="text-xs text-[#6B6458]">{description}</p>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Jelaskan situasi Anda terkait ${title.toLowerCase()}...`}
          className="w-full h-32 p-4 rounded-xl border border-[#E2DDD4] bg-white text-sm focus:ring-1 focus:ring-[#1E5C3A] outline-none"
        />
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="w-full bg-[#1E5C3A] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#153F28] disabled:opacity-50"
        >
          {loading ? "Memproses..." : <><Sparkles className="w-4 h-4" /> Dapatkan Solusi AI</>}
        </button>
      </div>

      {response && (
        <div className="bg-[#E8F2EC] p-4 rounded-xl border border-[#C3D9CC] mt-4">
          <h4 className="text-xs font-bold text-[#1E5C3A] mb-2 uppercase tracking-wider">Hasil Analisis</h4>
          <p className="text-xs text-[#1A4A2E] leading-relaxed whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </motion.div>
  );
}