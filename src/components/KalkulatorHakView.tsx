import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Calculator, HelpCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function KalkulatorHakView() {
  const navigate = useNavigate();
  const [gaji, setGaji] = useState("");
  const [masaKerja, setMasaKerja] = useState("");
  const [alasanPHK, setAlasanPHK] = useState("Efisiensi");
  const [hasil, setHasil] = useState<null | { pesangon: number, penghargaan: number, total: number }>(null);

  const hitung = () => {
    const gajiPokok = parseInt(gaji.replace(/\D/g, '')) || 0;
    const tahun = parseInt(masaKerja) || 0;
    
    if (gajiPokok === 0 || tahun === 0) return;

    // Asumsi perhitungan UU Cipta Kerja (Sederhana untuk demo)
    let pengaliPesangon = tahun <= 1 ? 1 : tahun < 9 ? tahun : 9;
    let pengaliPenghargaan = tahun < 3 ? 0 : tahun < 6 ? 2 : tahun < 9 ? 3 : tahun < 12 ? 4 : 5;

    if (alasanPHK === "Resign Sukarela") {
      pengaliPesangon = 0;
      pengaliPenghargaan = 0; // Uang pisah biasanya diatur PP/PKB
    } else if (alasanPHK === "Pelanggaran Berat") {
      pengaliPesangon = 0;
    }

    const uangPesangon = gajiPokok * pengaliPesangon;
    const uangPenghargaan = gajiPokok * pengaliPenghargaan;

    setHasil({
      pesangon: uangPesangon,
      penghargaan: uangPenghargaan,
      total: uangPesangon + uangPenghargaan
    });
  };

  const formatRp = (num: number) => {
    return "Rp " + num.toLocaleString("id-ID");
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col bg-[#FDFBF7] pb-24 overflow-y-auto">
      <div className="bg-white border-b border-[#E2DDD4] px-4 py-3 flex items-center gap-3 shrink-0 sticky top-0 z-10">
        <button onClick={() => navigate("/")} className="text-[#6B6458] p-1 -ml-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-[#2C2A26] text-sm">Kalkulator Hak</h1>
          <p className="text-[10px] text-[#A09880]">Estimasi Pesangon & Hak Sesuai UU</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-[#EAF6FF] border border-[#BDE0FE] p-4 rounded-xl shadow-sm text-[#1A4A2E]">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-blue-500" />
            <h2 className="font-bold text-sm text-blue-900">Petunjuk Penggunaan</h2>
          </div>
          <p className="text-[11px] text-blue-800 leading-relaxed">
            Kalkulator ini membantu Anda menghitung estimasi hak pesangon dan uang penghargaan masa kerja (UPMK) berdasarkan <strong>UU Cipta Kerja (UU No. 6 Tahun 2023)</strong>. Masukkan gaji pokok bulanan (termasuk tunjangan tetap) dan masa kerja Anda.
          </p>
        </div>

        <div className="bg-white border border-[#E2DDD4] p-4 rounded-xl shadow-sm space-y-4">
          <div>
            <label className="text-xs font-bold text-[#2C2A26] block mb-1">Gaji Pokok & Tunjangan Tetap</label>
            <input 
              type="number" 
              value={gaji} 
              onChange={e => setGaji(e.target.value)} 
              placeholder="Contoh: 5000000"
              className="w-full bg-[#F5F4F0] border border-[#E2DDD4] p-3 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#1E5C3A]"
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-[#2C2A26] block mb-1">Masa Kerja (Tahun)</label>
            <input 
              type="number" 
              value={masaKerja} 
              onChange={e => setMasaKerja(e.target.value)} 
              placeholder="Contoh: 3"
              className="w-full bg-[#F5F4F0] border border-[#E2DDD4] p-3 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#1E5C3A]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#2C2A26] block mb-1">Alasan Berakhirnya Kontrak / PHK</label>
            <select 
              value={alasanPHK} 
              onChange={e => setAlasanPHK(e.target.value)}
              className="w-full bg-[#F5F4F0] border border-[#E2DDD4] p-3 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#1E5C3A]"
            >
              <option>Efisiensi / Kerugian Perusahaan</option>
              <option>Perusahaan Pailit</option>
              <option>Resign Sukarela</option>
              <option>Pelanggaran Berat</option>
            </select>
          </div>

          <button 
            onClick={hitung}
            className="w-full bg-[#1E5C3A] text-white py-3 rounded-lg font-bold text-xs hover:bg-[#153F28] transition"
          >
            Hitung Estimasi Hak
          </button>
        </div>

        {hasil && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#F0F7F4] border border-[#CDE1D6] p-4 rounded-xl shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-[#1E5C3A] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Hasil Estimasi
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs border-b border-[#CDE1D6] pb-2">
                <span className="text-[#6B6458]">Uang Pesangon</span>
                <span className="font-bold text-[#2C2A26]">{formatRp(hasil.pesangon)}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-[#CDE1D6] pb-2">
                <span className="text-[#6B6458]">Uang Penghargaan</span>
                <span className="font-bold text-[#2C2A26]">{formatRp(hasil.penghargaan)}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-1">
                <span className="font-bold text-[#2C2A26]">Total Estimasi Hak</span>
                <span className="font-bold text-[#1E5C3A]">{formatRp(hasil.total)}</span>
              </div>
            </div>

            <div className="bg-yellow-50 p-2 rounded-lg flex items-start gap-2 mt-2">
              <HelpCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-yellow-800 leading-tight">
                <strong>Catatan:</strong> Ini adalah estimasi dasar. Hak cuti yang belum diambil dan ongkos pulang belum termasuk. Pastikan Anda memiliki bukti slip gaji dan kontrak.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
