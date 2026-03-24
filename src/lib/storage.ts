import { QuizResult, StudyProgress } from "@/types/question";

const STORAGE_KEY = "devsenior_progress";
const API_KEY_STORAGE = "devsenior_api_key";

function getProgress(): StudyProgress {
  if (typeof window === "undefined") return { results: [], flashcardsSeen: {} };
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { results: [], flashcardsSeen: {} };
  return JSON.parse(raw);
}

function saveProgress(progress: StudyProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function addResult(result: QuizResult) {
  const progress = getProgress();
  progress.results.push(result);
  saveProgress(progress);
}

export function getResults(): QuizResult[] {
  return getProgress().results;
}

export function getWrongResults(): QuizResult[] {
  const results = getProgress().results;
  const latestByQuestion = new Map<string, QuizResult>();
  for (const r of results) {
    latestByQuestion.set(r.questionId, r);
  }
  return Array.from(latestByQuestion.values()).filter((r) => !r.correct);
}

export function getCategoryStats(): Record<string, { total: number; correct: number }> {
  const results = getProgress().results;
  const stats: Record<string, { total: number; correct: number }> = {};

  for (const r of results) {
    const cat = r.questionId.split("-")[0];
    if (!stats[cat]) stats[cat] = { total: 0, correct: 0 };
    stats[cat].total++;
    if (r.correct) stats[cat].correct++;
  }
  return stats;
}

export function markFlashcardSeen(questionId: string) {
  const progress = getProgress();
  progress.flashcardsSeen[questionId] = true;
  saveProgress(progress);
}

export function getFlashcardsSeen(): Record<string, boolean> {
  return getProgress().flashcardsSeen;
}

export function getApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(API_KEY_STORAGE) || "";
}

export function setApiKey(key: string) {
  localStorage.setItem(API_KEY_STORAGE, key);
}

export function clearAllProgress() {
  localStorage.removeItem(STORAGE_KEY);
}
