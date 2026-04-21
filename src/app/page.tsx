"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDailyInsights, getAllQuestions, getQuestionById } from "@/lib/questions";
import {
  getCategoryStats,
  getStreak,
  getWeakCategories,
  getDueCards,
  StreakData,
} from "@/lib/storage";
import { Question, CATEGORY_LABELS, CATEGORY_COLORS, Category } from "@/types/question";

export default function Home() {
  const [insights, setInsights] = useState<Question[]>([]);
  const [stats, setStats] = useState<Record<string, { total: number; correct: number }>>({});
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [streak, setStreak] = useState<StreakData>({ current: 0, longest: 0, lastStudyDate: "" });
  const [weakCategories, setWeakCategories] = useState<Array<{ category: string; rate: number; total: number }>>([]);
  const [dueCount, setDueCount] = useState(0);
  const [todayReviews, setTodayReviews] = useState<Question[]>([]);

  useEffect(() => {
    setInsights(getDailyInsights(3));
    setStats(getCategoryStats());
    setTotalQuestions(getAllQuestions().length);
    setStreak(getStreak());
    setWeakCategories(getWeakCategories(3));
    const due = getDueCards();
    setDueCount(due.length);
    // 오늘 복습할 카드 최대 5개
    setTodayReviews(
      due
        .slice(0, 5)
        .map((id) => getQuestionById(id))
        .filter((q): q is Question => !!q)
    );
  }, []);

  const totalAnswered = Object.values(stats).reduce((a, b) => a + b.total, 0);
  const totalCorrect = Object.values(stats).reduce((a, b) => a + b.correct, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-1">
          Dev<span className="text-[var(--accent)]">Senior</span>
        </h1>
        <p className="text-sm text-[var(--muted)]">
          {totalQuestions}문제 · 정답률 {totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0}%
        </p>
      </div>

      {/* Streak + Due */}
      <div className="grid grid-cols-2 gap-2">
        <div className="card p-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-[var(--muted)]">스트릭</p>
            <span className="text-[10px] text-[var(--muted)]">최장 {streak.longest}</span>
          </div>
          <p className="text-2xl font-bold text-[var(--warning)]">{streak.current}일</p>
        </div>
        <Link href="/flashcards" className="card p-3 block">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-[var(--muted)]">복습 대기</p>
            {dueCount > 0 && <span className="text-[10px] text-[var(--accent)]">Start →</span>}
          </div>
          <p className="text-2xl font-bold text-[var(--accent)]">{dueCount}</p>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        <Link href="/quiz" className="btn-primary text-center block text-sm py-3">Quiz</Link>
        <Link href="/flashcards" className="btn-secondary text-center block text-sm py-3">Cards</Link>
        <Link href="/roadmap" className="btn-secondary text-center block text-sm py-3">Roadmap</Link>
      </div>

      {/* Today's Review (SRS due cards) */}
      {todayReviews.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold">오늘의 복습</h2>
            <Link href="/flashcards" className="text-[11px] text-[var(--accent)]">전체 보기 →</Link>
          </div>
          <div className="space-y-2">
            {todayReviews.map((q) => (
              <div key={q.id} className="card py-2 px-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="category-badge"
                    style={{ background: CATEGORY_COLORS[q.category] + "20", color: CATEGORY_COLORS[q.category] }}
                  >
                    {CATEGORY_LABELS[q.category]}
                  </span>
                  <span className="text-[9px] text-[var(--muted)]">{q.difficulty}</span>
                </div>
                <p className="text-xs font-medium line-clamp-2">{q.question}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Weak categories */}
      {weakCategories.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-2">내 약점</h2>
          <div className="space-y-1.5">
            {weakCategories.map((w) => {
              const cat = w.category as Category;
              return (
                <Link
                  key={cat}
                  href={`/quiz?category=${cat}`}
                  className="card p-2.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ color: CATEGORY_COLORS[cat] || "var(--fg)" }}>
                      {CATEGORY_LABELS[cat] || cat}
                    </span>
                    <span className="text-[10px] text-[var(--muted)]">{w.total}문제</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--error)]">{Math.round(w.rate * 100)}%</span>
                    <span className="text-[var(--muted)]">›</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Daily Insights */}
      <section>
        <h2 className="text-base font-semibold mb-2">Today&apos;s Insights</h2>
        <div className="space-y-3">
          {insights.map((q) => (
            <div key={q.id} className="card cursor-pointer" onClick={() => setFlipped((p) => ({ ...p, [q.id]: !p[q.id] }))}>
              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                <span
                  className="category-badge"
                  style={{ background: CATEGORY_COLORS[q.category] + "20", color: CATEGORY_COLORS[q.category] }}
                >
                  {CATEGORY_LABELS[q.category]}
                </span>
                <span className="text-[10px] text-[var(--muted)]">{q.difficulty}</span>
              </div>
              <p className="text-sm font-medium leading-relaxed">{q.question}</p>
              {flipped[q.id] && (
                <div className="mt-3 pt-3 border-t border-[var(--card-border)] space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-[var(--accent)] mb-1">Light</p>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">{q.explanation}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--warning)] mb-1">Deep Dive</p>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">{q.deepDive || q.seniorTip}</p>
                  </div>
                  {q.deepDive && (
                    <div>
                      <p className="text-xs font-semibold text-[var(--success)] mb-1">Senior Tip</p>
                      <p className="text-xs text-[var(--muted)] leading-relaxed">{q.seniorTip}</p>
                    </div>
                  )}
                </div>
              )}
              {!flipped[q.id] && <p className="text-[10px] text-[var(--muted)] mt-2">tap to reveal</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Category Progress */}
      <section>
        <h2 className="text-base font-semibold mb-2">Progress</h2>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => {
            const s = stats[cat];
            const pct = s ? Math.round((s.correct / s.total) * 100) : 0;
            return (
              <div key={cat} className="card p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium" style={{ color: CATEGORY_COLORS[cat] }}>
                    {CATEGORY_LABELS[cat]}
                  </span>
                  <span className="text-[10px] text-[var(--muted)]">{s ? `${s.correct}/${s.total}` : "0/0"}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[var(--card-border)]">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: `${pct}%`, background: CATEGORY_COLORS[cat] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
