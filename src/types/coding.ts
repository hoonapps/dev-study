export type CodingDifficulty = "easy" | "medium" | "hard";

export interface CodingExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface CodingComplexity {
  time: string;
  space: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  titleKo: string;
  difficulty: CodingDifficulty;
  patterns: string[];
  companies: string[];
  year?: string;
  description: string;
  examples: CodingExample[];
  constraints: string[];
  hints: string[];
  approach: string;
  code: string;
  complexity: CodingComplexity;
  walkthrough: string;
  secret: string;
  similar: string[];
}

export const DIFFICULTY_COLORS: Record<CodingDifficulty, string> = {
  easy: "#22c55e",
  medium: "#f59e0b",
  hard: "#ef4444",
};

export const DIFFICULTY_LABELS_CODING: Record<CodingDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export const PATTERN_LABELS: Record<string, string> = {
  "two-pointers": "Two Pointers",
  "sliding-window": "Sliding Window",
  "binary-search": "Binary Search",
  "bfs": "BFS",
  "dfs": "DFS",
  "dp": "DP",
  "backtracking": "Backtracking",
  "greedy": "Greedy",
  "heap": "Heap",
  "union-find": "Union-Find",
  "trie": "Trie",
  "bit": "Bit",
  "monotonic-stack": "Monotonic Stack",
  "hash-map": "HashMap",
  "implementation": "Implementation",
  "simulation": "Simulation",
  "design": "Design",
  "sql": "SQL",
  "window-function": "Window Function",
  "graph": "Graph",
  "tree": "Tree",
  "string": "String",
  "math": "Math",
  "linked-list": "Linked List",
  "stack": "Stack",
  "queue": "Queue",
};
