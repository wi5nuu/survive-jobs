import { useState, useEffect } from "react";
import { Home, MessageSquare, Users, Trophy, BarChart3 } from "lucide-react";
import HomeView from "./components/HomeView";
import ChatView from "./components/ChatView";
import CommunityView from "./components/CommunityView";
import LeaderboardView from "./components/LeaderboardView";
import ResultView from "./components/ResultView";
import OnboardingView from "./components/OnboardingView";
import { AnalyzeResponse } from "./types";

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [chatModePreset, setChatModePreset] = useState<string>("Cerita bebas");
  const [reportState, setReportState] = useState<AnalyzeResponse | null>(null);

  useEffect(() => {
    try {
      const hasOnboarded = localStorage.getItem("surjob_onboarded");
      if (hasOnboarded) {
        setShowOnboarding(false);
      }
    } catch (e) {
      console.warn("localStorage not available", e);
    }
  }, []);

  const handleOnboardingComplete = () => {
    try {
      localStorage.setItem("surjob_onboarded", "true");
    } catch (e) {
      console.warn("localStorage not available", e);
    }
    setShowOnboarding(false);
  };

  // Navigate to standard tabs plus load custom initial modes into AI analyser
  const handleNavigateToTab = (tabIndex: number, modePreset?: string) => {
    setCurrentTab(tabIndex);
    if (modePreset) {
      setChatModePreset(modePreset);
    } else {
      setChatModePreset("Cerita bebas");
    }
  };

  // Triggers when AI report generation completes, shifts viewport to results
  const handleAnalysisGenerated = (report: AnalyzeResponse) => {
    setReportState(report);
    setCurrentTab(4); // Switch to "Hasil" view automatically
  };

  // Render sub-view component depending on the active bottom navbar selection
  const renderActiveScreen = () => {
    switch (currentTab) {
      case 0:
        return <HomeView onNavigateToTab={handleNavigateToTab} />;
      case 1:
        return (
          <ChatView
            onBackToHome={() => setCurrentTab(0)}
            onAnalysisGenerated={handleAnalysisGenerated}
            presetMode={chatModePreset}
          />
        );
      case 2:
        return <CommunityView />;
      case 3:
        return <LeaderboardView />;
      case 4:
        return (
          <ResultView
            report={reportState}
            onNavigateToChat={() => setCurrentTab(1)}
          />
        );
      default:
        return <HomeView onNavigateToTab={handleNavigateToTab} />;
    }
  };

  if (showOnboarding) {
    return (
      <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[#F7F3EC] flex flex-col text-[#2C2A26]">
        <OnboardingView onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[#F7F3EC] flex flex-col text-[#2C2A26]">
      {/* SCROLLABLE INNER SECTION FOR DEVICE PORTABILITY */}
      <div className={`flex-1 w-full relative min-h-0 overflow-x-hidden ${currentTab === 1 ? 'flex flex-col' : 'overflow-y-auto px-4 py-5'}`}>
        <div className={`w-full max-w-md mx-auto flex-1 flex flex-col ${currentTab === 1 ? 'h-full' : ''}`}>
          {renderActiveScreen()}
        </div>
      </div>

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <nav 
        className="w-full shrink-0 h-[68px] sm:h-16 bg-white border-t border-[#E2DDD4] flex items-center justify-around z-50 shadow-[0_-4px_15px_-4px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]"
        id="main-bottom-navigation"
      >
        <div className="max-w-md w-full mx-auto flex justify-between px-2">
          {/* Tab 1: Beranda */}
          <button
            onClick={() => handleNavigateToTab(0)}
            className={`flex-1 flex flex-col items-center gap-1.5 justify-center py-1 transition-all cursor-pointer min-w-0 ${
              currentTab === 0 ? "text-[#1E5C3A] scale-105 font-bold" : "text-[#A09880] hover:text-[#6B6458]"
            }`}
          >
            <Home className="w-5 h-5 stroke-[2] shrink-0" />
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider truncate w-full text-center px-0.5">Beranda</span>
          </button>

          {/* Tab 2: Analisis */}
          <button
            onClick={() => handleNavigateToTab(1)}
            className={`flex-1 flex flex-col items-center gap-1.5 justify-center py-1 transition-all cursor-pointer min-w-0 ${
              currentTab === 1 ? "text-[#1E5C3A] scale-105 font-bold" : "text-[#A09880] hover:text-[#6B6458]"
            }`}
          >
            <MessageSquare className="w-5 h-5 stroke-[2] shrink-0" />
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider truncate w-full text-center px-0.5">Analisis</span>
          </button>

          {/* Tab 3: Komunitas */}
          <button
            onClick={() => handleNavigateToTab(2)}
            className={`flex-1 flex flex-col items-center gap-1.5 justify-center py-1 transition-all cursor-pointer min-w-0 ${
              currentTab === 2 ? "text-[#1E5C3A] scale-105 font-bold" : "text-[#A09880] hover:text-[#6B6458]"
            }`}
          >
            <Users className="w-5 h-5 stroke-[2] shrink-0" />
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider truncate w-full text-center px-0.5">Komunitas</span>
          </button>

          {/* Tab 4: Leaderboard */}
          <button
            onClick={() => handleNavigateToTab(3)}
            className={`flex-1 flex flex-col items-center gap-1.5 justify-center py-1 transition-all cursor-pointer min-w-0 ${
              currentTab === 3 ? "text-[#1E5C3A] scale-105 font-bold" : "text-[#A09880] hover:text-[#6B6458]"
            }`}
          >
            <Trophy className="w-5 h-5 stroke-[2] shrink-0" />
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider truncate w-full text-center px-0.5">Peringkat</span>
          </button>

          {/* Tab 5: Hasil */}
          <button
            onClick={() => handleNavigateToTab(4)}
            className={`flex-1 flex flex-col items-center gap-1.5 justify-center py-1 transition-all cursor-pointer min-w-0 ${
              currentTab === 4 ? "text-[#1E5C3A] scale-105 font-bold" : "text-[#A09880] hover:text-[#6B6458]"
            }`}
          >
            <BarChart3 className="w-5 h-5 stroke-[2] shrink-0" />
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider truncate w-full text-center px-0.5">Hasil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
