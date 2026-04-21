import { QuizResult, StudyProgress } from "@/types/question";

const STORAGE_KEY = "devsenior_progress";
const API_KEY_STORAGE = "devsenior_api_key";
const BOOKMARK_KEY = "devsenior_bookmarks";
const VIEW_KEY = "devsenior_views";
const SRS_KEY = "devsenior_srs";
const STREAK_KEY = "devsenior_streak";

// ========== Progress ==========
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
  updateStreak();
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

// 카테고리별 약점 분석 (정답률 낮은 순)
export function getWeakCategories(limit = 3): Array<{ category: string; rate: number; total: number }> {
  const stats = getCategoryStats();
  return Object.entries(stats)
    .filter(([, s]) => s.total >= 3) // 최소 3문제 풀어야 분석
    .map(([cat, s]) => ({ category: cat, rate: s.correct / s.total, total: s.total }))
    .sort((a, b) => a.rate - b.rate)
    .slice(0, limit);
}

export function markFlashcardSeen(questionId: string) {
  const progress = getProgress();
  progress.flashcardsSeen[questionId] = true;
  saveProgress(progress);
  updateStreak();
}

export function getFlashcardsSeen(): Record<string, boolean> {
  return getProgress().flashcardsSeen;
}

// ========== API Key (temp disabled) ==========
export function getApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(API_KEY_STORAGE) || "";
}

export function setApiKey(key: string) {
  localStorage.setItem(API_KEY_STORAGE, key);
}

// ========== Bookmarks ==========
export function getBookmarks(): string[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(BOOKMARK_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export function toggleBookmark(questionId: string): boolean {
  const bookmarks = getBookmarks();
  const idx = bookmarks.indexOf(questionId);
  if (idx >= 0) bookmarks.splice(idx, 1);
  else bookmarks.push(questionId);
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks));
  return idx < 0;
}

export function isBookmarked(questionId: string): boolean {
  return getBookmarks().includes(questionId);
}

// ========== View count ==========
export function getViewCounts(): Record<string, number> {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(VIEW_KEY);
  if (!raw) return {};
  return JSON.parse(raw);
}

export function incrementView(questionId: string): number {
  const views = getViewCounts();
  views[questionId] = (views[questionId] || 0) + 1;
  localStorage.setItem(VIEW_KEY, JSON.stringify(views));
  updateStreak();
  return views[questionId];
}

export function getViewCount(questionId: string): number {
  return getViewCounts()[questionId] || 0;
}

// ========== SRS (Spaced Repetition System) ==========
// SM-2 알고리즘 기반 단순화 버전
export type SRSGrade = "again" | "hard" | "good" | "easy";

export interface SRSData {
  ease: number;       // easiness factor (1.3 ~ 2.5)
  interval: number;   // 다음 복습까지 일수
  repetitions: number; // 연속 맞춘 횟수
  nextReview: number; // 다음 복습 timestamp
  lastReview: number; // 마지막 복습 timestamp
}

function getDefaultSRS(): SRSData {
  return { ease: 2.5, interval: 0, repetitions: 0, nextReview: Date.now(), lastReview: 0 };
}

export function getAllSRS(): Record<string, SRSData> {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(SRS_KEY);
  return raw ? JSON.parse(raw) : {};
}

export function getSRS(questionId: string): SRSData {
  return getAllSRS()[questionId] || getDefaultSRS();
}

export function recordSRS(questionId: string, grade: SRSGrade): SRSData {
  const all = getAllSRS();
  const data = all[questionId] || getDefaultSRS();
  const now = Date.now();

  // SM-2 simplified
  let { ease, interval, repetitions } = data;

  if (grade === "again") {
    repetitions = 0;
    interval = 0; // 같은 날 다시
    ease = Math.max(1.3, ease - 0.2);
  } else if (grade === "hard") {
    repetitions += 1;
    interval = Math.max(1, Math.round(interval * 1.2));
    ease = Math.max(1.3, ease - 0.15);
  } else if (grade === "good") {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 3;
    else interval = Math.round(interval * ease);
  } else if (grade === "easy") {
    repetitions += 1;
    if (repetitions === 1) interval = 3;
    else if (repetitions === 2) interval = 7;
    else interval = Math.round(interval * ease * 1.3);
    ease = Math.min(3.0, ease + 0.15);
  }

  const newData: SRSData = {
    ease,
    interval,
    repetitions,
    nextReview: now + interval * 24 * 60 * 60 * 1000,
    lastReview: now,
  };

  all[questionId] = newData;
  localStorage.setItem(SRS_KEY, JSON.stringify(all));
  updateStreak();
  return newData;
}

// 복습 예정 카드들 (due date 지난 것)
export function getDueCards(): string[] {
  const all = getAllSRS();
  const now = Date.now();
  return Object.entries(all)
    .filter(([, data]) => data.nextReview <= now && data.repetitions > 0)
    .sort((a, b) => a[1].nextReview - b[1].nextReview)
    .map(([id]) => id);
}

// ========== Streak ==========
export interface StreakData {
  current: number;
  longest: number;
  lastStudyDate: string; // YYYY-MM-DD
}

export function getStreak(): StreakData {
  if (typeof window === "undefined") return { current: 0, longest: 0, lastStudyDate: "" };
  const raw = localStorage.getItem(STREAK_KEY);
  if (!raw) return { current: 0, longest: 0, lastStudyDate: "" };
  return JSON.parse(raw);
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterdayDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function updateStreak() {
  const today = getTodayDate();
  const data = getStreak();
  if (data.lastStudyDate === today) return; // 이미 오늘 학습

  if (data.lastStudyDate === getYesterdayDate()) {
    data.current += 1;
  } else if (data.lastStudyDate === "") {
    data.current = 1;
  } else {
    data.current = 1; // 스트릭 끊김
  }

  if (data.current > data.longest) data.longest = data.current;
  data.lastStudyDate = today;
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

// ========== Backup/Restore ==========
export function exportData(): string {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    progress: getProgress(),
    bookmarks: getBookmarks(),
    views: getViewCounts(),
    srs: getAllSRS(),
    streak: getStreak(),
  };
  return JSON.stringify(data, null, 2);
}

export function importData(json: string): boolean {
  try {
    const data = JSON.parse(json);
    if (!data.version) return false;
    if (data.progress) localStorage.setItem(STORAGE_KEY, JSON.stringify(data.progress));
    if (data.bookmarks) localStorage.setItem(BOOKMARK_KEY, JSON.stringify(data.bookmarks));
    if (data.views) localStorage.setItem(VIEW_KEY, JSON.stringify(data.views));
    if (data.srs) localStorage.setItem(SRS_KEY, JSON.stringify(data.srs));
    if (data.streak) localStorage.setItem(STREAK_KEY, JSON.stringify(data.streak));
    return true;
  } catch {
    return false;
  }
}

export function clearAllProgress() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(VIEW_KEY);
  localStorage.removeItem(SRS_KEY);
  localStorage.removeItem(STREAK_KEY);
  // bookmarks는 유지
}

// ========== Notification Settings ==========
const NOTIF_KEY = "devsenior_notification";
const NOTIF_LAST_SHOWN = "devsenior_notif_last";

export interface NotificationSettings {
  enabled: boolean;
  hour: number; // 0-23
  minute: number; // 0-59
}

export function getNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") return { enabled: false, hour: 21, minute: 0 };
  const raw = localStorage.getItem(NOTIF_KEY);
  if (!raw) return { enabled: false, hour: 21, minute: 0 };
  return JSON.parse(raw);
}

export function setNotificationSettings(s: NotificationSettings) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(s));
}

export function getLastNotifDate(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(NOTIF_LAST_SHOWN) || "";
}

export function setLastNotifDate(date: string) {
  localStorage.setItem(NOTIF_LAST_SHOWN, date);
}

// ========== Coding Problem Tracking ==========
const CODING_KEY = "devsenior_coding";

export type CodingStatus = "unsolved" | "attempted" | "solved";

export interface CodingProgress {
  status: CodingStatus;
  attempts: number;
  solvedAt?: number;
  lastViewedAt: number;
}

export function getAllCoding(): Record<string, CodingProgress> {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(CODING_KEY);
  return raw ? JSON.parse(raw) : {};
}

export function getCodingProgress(id: string): CodingProgress {
  return getAllCoding()[id] || { status: "unsolved", attempts: 0, lastViewedAt: 0 };
}

export function setCodingStatus(id: string, status: CodingStatus) {
  const all = getAllCoding();
  const cur = all[id] || { status: "unsolved", attempts: 0, lastViewedAt: 0 };
  cur.status = status;
  if (status === "attempted") cur.attempts += 1;
  if (status === "solved" && !cur.solvedAt) cur.solvedAt = Date.now();
  cur.lastViewedAt = Date.now();
  all[id] = cur;
  localStorage.setItem(CODING_KEY, JSON.stringify(all));
  updateStreak();
}

export function markCodingViewed(id: string) {
  const all = getAllCoding();
  const cur = all[id] || { status: "unsolved", attempts: 0, lastViewedAt: 0 };
  cur.lastViewedAt = Date.now();
  all[id] = cur;
  localStorage.setItem(CODING_KEY, JSON.stringify(all));
}

export function getCodingStats(): { solved: number; attempted: number; total: number } {
  const all = getAllCoding();
  let solved = 0, attempted = 0;
  for (const p of Object.values(all)) {
    if (p.status === "solved") solved++;
    else if (p.status === "attempted") attempted++;
  }
  return { solved, attempted, total: Object.keys(all).length };
}
