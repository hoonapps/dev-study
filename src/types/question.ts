export type QuestionType = "multiple-choice" | "short-answer" | "ox";
export type Difficulty = "junior" | "mid" | "senior";
export type Category =
  | "mysql"
  | "redis"
  | "kubernetes"
  | "terraform"
  | "nestjs"
  | "nodejs"
  | "network"
  | "architecture"
  | "devops"
  | "security"
  | "ai-llm"
  | "git"
  | "aws"
  | "ncnc"
  | "monitoring"
  | "argocd"
  | "opensearch"
  | "algorithm"
  | "design-pattern";

export interface Question {
  id: string;
  category: Category;
  difficulty: Difficulty;
  type: QuestionType;
  question: string;
  options?: string[];
  answer: string | number; // index for multiple-choice, string for short-answer, "O"/"X" for ox
  explanation: string;       // 라이트 해설 (핵심만)
  deepDive: string;          // 딥 해설 (꼬리에 꼬리를 무는 깊은 설명)
  seniorTip: string;         // 시니어 실무 팁
  tags: string[];
}

export interface QuizResult {
  questionId: string;
  correct: boolean;
  userAnswer: string;
  timestamp: number;
  aiFeedback?: string;
}

export interface StudyProgress {
  results: QuizResult[];
  flashcardsSeen: Record<string, boolean>;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  mysql: "MySQL/DB",
  redis: "Redis",
  kubernetes: "Kubernetes",
  terraform: "Terraform",
  nestjs: "NestJS",
  nodejs: "Node.js",
  network: "Network",
  architecture: "Architecture",
  devops: "DevOps/CI-CD",
  security: "Security",
  "ai-llm": "AI/LLM",
  git: "Git/Collaboration",
  aws: "AWS/EKS",
  ncnc: "My Work/Resume",
  monitoring: "Monitoring",
  argocd: "ArgoCD/GitOps",
  opensearch: "OpenSearch",
  algorithm: "Algorithm/DS",
  "design-pattern": "Design Pattern",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  mysql: "#3b82f6",
  redis: "#ef4444",
  kubernetes: "#326ce5",
  terraform: "#7b42bc",
  nestjs: "#e0234e",
  nodejs: "#339933",
  network: "#f59e0b",
  architecture: "#8b5cf6",
  devops: "#06b6d4",
  security: "#22c55e",
  "ai-llm": "#ff6b35",
  git: "#f05032",
  aws: "#ff9900",
  ncnc: "#14b8a6",
  monitoring: "#a855f7",
  argocd: "#ef6c35",
  opensearch: "#005eb8",
  algorithm: "#e11d48",
  "design-pattern": "#0891b2",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  junior: "Junior",
  mid: "Mid-Level",
  senior: "Senior",
};
