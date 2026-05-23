import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Home, MessageSquare, Users, Trophy, BarChart3 } from "lucide-react";
import HomeView from "./components/HomeView";
import ChatView from "./components/ChatView";
import CommunityView from "./components/CommunityView";
import LeaderboardView from "./components/LeaderboardView";
import ResultView from "./components/ResultView";
import OnboardingView from "./components/OnboardingView";
import FeaturePage from "./components/FeaturePage";
import { AnalyzeResponse } from "./types";

const TAB_PATHS = ["/", "/analisis", "/komunitas", "/peringkat", "/hasil"];

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [chatModePreset, setChatModePreset] = useState<string>("Cerita bebas");
  const [reportState, setReportState] = useState<AnalyzeResponse | null>(null);

  const currentTab = TAB_PATHS.indexOf(location.pathname) ?? 0;
  const isChatView = location.pathname === "/analisis";

  const handleNavigateToTab = (tabIndex: number, modePreset?: string) => {
    if (modePreset) setChatModePreset(modePreset);
    navigate(TAB_PATHS[tabIndex] ?? "/");
  };

  const handleAnalysisGenerated = (report: AnalyzeResponse) => {
    setReportState(report);
    navigate("/hasil");
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[#FDFBF7] flex flex-col text-[#2C2A26]">

      {/* SCROLLABLE / FLEX INNER SECTION */}
      <div
        className={`flex-1 w-full relative min-h-0 ${
          isChatView
            ? "flex flex-col overflow-hidden pb-[68px]"
            : "overflow-y-auto px-4 py-5 pb-28"
        }`}
      >
        <div className={`w-full max-w-md mx-auto flex-1 flex flex-col ${isChatView ? "h-full" : ""}`}>
          <Routes>
            <Route
              path="/"
              element={
                <HomeView onNavigateToTab={handleNavigateToTab} />
              }
            />
            <Route
              path="/analisis"
              element={
                <ChatView
                  onBackToHome={() => navigate("/")}
                  onAnalysisGenerated={handleAnalysisGenerated}
                  presetMode={chatModePreset}
                />
              }
            />
            <Route path="/komunitas" element={<CommunityView />} />
            <Route path="/peringkat" element={<LeaderboardView />} />
            <Route
              path="/hasil"
              element={
                <ResultView
                  report={reportState}
                  onNavigateToChat={() => navigate("/analisis")}
                />
              }
            />
            <Route path="/simulasi-bos" element={<FeaturePage title="Simulasi Bos" description="Latih bicara ke atasan" />} />
            <Route path="/kalkulator-hak" element={<FeaturePage title="Kalkulator Hak" description="Hitung estimasi Anda" />} />
            <Route path="/template-somasi" element={<FeaturePage title="Generator Surat Kuasa & Somasi" description="Draf resmi teguran perusahaan" />} />
          </Routes>
        </div>
      </div>

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 w-full h-[68px] sm:h-16 bg-white border-t border-[#E2DDD4] flex items-center justify-around z-50 shadow-[0_-4px_15px_-4px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-md w-full mx-auto flex justify-between px-2">
          {[
            { label: "Beranda", icon: Home, path: "/" },
            { label: "Analisis", icon: MessageSquare, path: "/analisis" },
            { label: "Komunitas", icon: Users, path: "/komunitas" },
            { label: "Peringkat", icon: Trophy, path: "/peringkat" },
            { label: "Hasil", icon: BarChart3, path: "/hasil" },
          ].map((item, idx) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex-1 flex flex-col items-center gap-1.5 justify-center py-1 transition-all cursor-pointer ${
                currentTab === idx
                  ? "text-[#1E5C3A] scale-105 font-bold"
                  : "text-[#A09880] hover:text-[#6B6458]"
              }`}
            >
              <item.icon className="w-5 h-5 stroke-[2]" />
              <span className="text-[8px] font-bold uppercase tracking-wider truncate w-full text-center">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);

  useEffect(() => {
    try {
      if (localStorage.getItem("surjob_onboarded")) setShowOnboarding(false);
    } catch (e) {
      console.warn("localStorage unavailable", e);
    }
  }, []);

  if (showOnboarding) {
    return (
      <div className="h-[100dvh] bg-[#FDFBF7] flex flex-col">
        <OnboardingView
          onComplete={() => {
            try { localStorage.setItem("surjob_onboarded", "true"); } catch (e) {}
            setShowOnboarding(false);
          }}
        />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}