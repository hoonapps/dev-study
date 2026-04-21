"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getActivityMap,
  getCategoryStats,
  getStreak,
  getWeakCategories,
  getAllSRS,
  getCodingStats,
  getBookmarks,
  StreakData,
} from "@/lib/storage";
import { getAllQuestions } from "@/lib/questions";
import { CATEGORY_COLORS, CATEGORY_LABELS, Category } from "@/types/question";

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function daysBefore(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const COLOR_LEVELS = [
  "var(--card-border)",  // 0
  "#1e3a5f",             // 1-2
  "#2563eb",             // 3-5
  "#3b82f6",             // 6-10
  "#60a5fa",             // 11+
];

function levelOf(n: number): number {
  if (n === 0) return 0;
  if (n <= 2) return 1;
  if (n <= 5) return 2;
  if (n <= 10) return 3;
  return 4;
}

export default function StatsPage() {
  const [activity, setActivity] = useState<Record<string, number>>({});
  const [stats, setStats] = useState<Record<string, { total: number; correct: number }>>({});
  const [streak, setStreak] = useState<StreakData>({ current: 0, longest: 0, lastStudyDate: "" });
  const [weak, setWeak] = useState<Array<{ category: string; rate: number; total: number }>>([]);
  const [totalQs, setTotalQs] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [dueSoon, setDueSoon] = useState(0);
  const [dueLater, setDueLater] = useState(0);
  const [totalSRS, setTotalSRS] = useState(0);
  const [codingStats, setCodingStats] = useState({ solved: 0, attempted: 0, total: 0 });

  useEffect(() => {
    setActivity(getActivityMap());
    setStats(getCategoryStats());
    setStreak(getStreak());
    setWeak(getWeakCategories(5));
    setTotalQs(getAllQuestions().length);
    setBookmarkCount(getBookmarks().length);
    const srs = getAllSRS();
    const now = Date.now();
    const in24h = 24 * 60 * 60 * 1000;
    let soon = 0, later = 0;
    for (const s of Object.values(srs)) {
      if (s.nextReview <= now) soon++;
      else if (s.nextReview <= now + 7 * in24h) later++;
    }
    setDueSoon(soon);
    setDueLater(later);
    setTotalSRS(Object.keys(srs).length);
    setCodingStats(getCodingStats());
  }, []);

  // Last 12 weeks (84 days) heatmap
  const HEATMAP_DAYS = 84;
  const heatmapDays: Array<{ date: string; count: number }> = [];
  for (let i = HEATMAP_DAYS - 1; i >= 0; i--) {
    const d = daysBefore(i);
    const key = formatDate(d);
    heatmapDays.push({ date: key, count: activity[key] || 0 });
  }

  // Group into 12 columns of 7 days (weeks)
  const weeks: typeof heatmapDays[] = [];
  for (let i = 0; i < HEATMAP_DAYS; i += 7) {
    weeks.push(heatmapDays.slice(i, i + 7));
  }

  const totalAnswered = Object.values(stats).reduce((a, b) => a + b.total, 0);
  const totalCorrect = Object.values(stats).reduce((a, b) => a + b.correct, 0);
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  // Active days in last 30
  const activeLast30 = Object.keys(activity).filter((k) => {
    const diff = (Date.now() - new Date(k).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 30;
  }).length;

  // Top categories by activity
  const topCategories = Object.entries(stats)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Stats</h1>
        <p className="text-xs text-[var(--muted)]">학습 통계 · 동기부여</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="card p-3">
          <p className="text-[10px] text-[var(--muted)]">🔥 스트릭</p>
          <p className="text-2xl font-bold text-[var(--warning)]">{streak.current}<span className="text-sm text-[var(--muted)] ml-1">일</span></p>
          <p className="text-[10px] text-[var(--muted)] mt-1">최장 {streak.longest}일</p>
        </div>
        <div className="card p-3">
          <p className="text-[10px] text-[var(--muted)]">정답률</p>
          <p className="text-2xl font-bold text-[var(--accent)]">{accuracy}<span className="text-sm text-[var(--muted)] ml-0.5">%</span></p>
          <p className="text-[10px] text-[var(--muted)] mt-1">{totalAnswered}문제 답변</p>
        </div>
        <div className="card p-3">
          <p className="text-[10px] text-[var(--muted)]">최근 30일 활동</p>
          <p className="text-2xl font-bold text-[var(--success)]">{activeLast30}<span className="text-sm text-[var(--muted)] ml-1">/30</span></p>
          <p className="text-[10px] text-[var(--muted)] mt-1">활동한 날</p>
        </div>
        <div className="card p-3">
          <p className="text-[10px] text-[var(--muted)]">코테</p>
          <p className="text-2xl font-bold text-[#e11d48]">{codingStats.solved}<span className="text-sm text-[var(--muted)] ml-1">솔브</span></p>
          <p className="text-[10px] text-[var(--muted)] mt-1">시도 {codingStats.attempted}</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">활동 히트맵</h2>
          <span className="text-[10px] text-[var(--muted)]">최근 12주</span>
        </div>
        <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-1 w-max">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((d) => (
                  <div
                    key={d.date}
                    title={`${d.date}: ${d.count}`}
                    className="w-3 h-3 rounded-sm"
                    style={{ background: COLOR_LEVELS[levelOf(d.count)] }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3 text-[9px] text-[var(--muted)]">
          <span>Less</span>
          {COLOR_LEVELS.map((c, i) => (
            <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* SRS schedule */}
      <div className="card">
        <h2 className="text-sm font-semibold mb-3">SRS 복습 스케줄</h2>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-lg font-bold text-[var(--warning)]">{dueSoon}</p>
            <p className="text-[10px] text-[var(--muted)]">지금 복습</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[var(--accent)]">{dueLater}</p>
            <p className="text-[10px] text-[var(--muted)]">7일 내</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[var(--muted)]">{totalSRS}</p>
            <p className="text-[10px] text-[var(--muted)]">전체</p>
          </div>
        </div>
      </div>

      {/* Weak categories */}
      {weak.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold mb-3">약점 TOP 5</h2>
          <div className="space-y-2">
            {weak.map((w) => {
              const cat = w.category as Category;
              const pct = Math.round(w.rate * 100);
              return (
                <Link
                  key={cat}
                  href={`/quiz?category=${cat}`}
                  className="flex items-center gap-2"
                >
                  <span
                    className="text-[10px] w-24 shrink-0 truncate font-medium"
                    style={{ color: CATEGORY_COLORS[cat] || "var(--fg)" }}
                  >
                    {CATEGORY_LABELS[cat] || cat}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-[var(--card-border)]">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${pct}%`, background: "var(--error)" }}
                    />
                  </div>
                  <span className="text-[10px] text-[var(--error)] w-10 text-right shrink-0">{pct}%</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Top categories */}
      {topCategories.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold mb-3">많이 푼 카테고리</h2>
          <div className="space-y-2">
            {topCategories.map(([cat, s]) => {
              const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
              const color = CATEGORY_COLORS[cat as Category] || "var(--accent)";
              return (
                <div key={cat} className="flex items-center gap-2">
                  <span className="text-[10px] w-24 shrink-0 truncate font-medium" style={{ color }}>
                    {CATEGORY_LABELS[cat as Category] || cat}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-[var(--card-border)]">
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <span className="text-[10px] text-[var(--muted)] w-16 text-right shrink-0">
                    {s.correct}/{s.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="card">
        <h2 className="text-sm font-semibold mb-3">전체</h2>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">전체 문제</span>
            <span>{totalQs}개</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">북마크</span>
            <span>⭐ {bookmarkCount}개</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">코테 진행률</span>
            <span>{codingStats.solved + codingStats.attempted}/135</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">SRS 카드</span>
            <span>{totalSRS}개</span>
          </div>
        </div>
      </div>
    </div>
  );
}
