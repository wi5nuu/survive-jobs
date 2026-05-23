export interface PostReply {
  id: string;
  author: string;
  content: string;
  time: string;
  clientId?: string;
}

export interface Post {
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

export interface Pejuang {
  id: string;
  avatar: string;
  name: string;
  issue: string;
  status: string;
  solusiNyata?: string;
}

export interface LeaderboardData {
  curhatCount: number;
  topProblems: {
    lembur: number;
    toxicBoss: number;
    gaji: number;
    gaslighting: number;
    lainnya: number;
  };
  surviveCount: number;
  pejuangSurvive: Pejuang[];
}

export interface RedFlag {
  title: string;
  description: string;
  severity: "Tinggi" | "Sedang" | "Rendah" | string;
}

export interface AdviceStep {
  title: string;
  description: string;
}

export interface LaborRight {
  title: string;
  lawReference: string;
  details: string;
}

export interface AnalyzeResponse {
  score: number;
  category: string;
  redFlags: RedFlag[];
  steps: string[];
  rights: LaborRight[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "model" | "assistant";
  text: string;
  timestamp: string;
}
