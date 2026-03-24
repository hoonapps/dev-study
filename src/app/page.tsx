"use client";

import { useEffect, useState } from "react";
import { getDailyInsights, getAllQuestions } from "@/lib/questions";
import { getCategoryStats } from "@/lib/storage";
import { Question, CATEGORY_LABELS, CATEGORY_COLORS, Category } from "@/types/question";

export default function Home() {
  const [insights, setInsights] = useState<Question[]>([]);
  const [stats, setStats] = useState<Record<string, { total: number; correct: number }>>({});
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setInsights(getDailyInsights(3));
    setStats(getCategoryStats());
    setTotalQuestions(getAllQuestions().length);
  }, []);

  const totalAnswered = Object.values(stats).reduce((a, b) => a + b.total, 0);
  const totalCorrect = Object.values(stats).reduce((a, b) => a + b.correct, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-1">
          Dev<span className="text-[var(--accent)]">Senior</span>
        </h1>
        <p className="text-sm text-[var(--muted)]">
          {totalQuestions}문제 | {totalAnswered}풀었음 | 정답률 {totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0}%
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        <a href="/quiz" className="btn-primary text-center block text-sm py-3">Quiz</a>
        <a href="/flashcards" className="btn-secondary text-center block text-sm py-3">Cards</a>
        <a href="/browse" className="btn-secondary text-center block text-sm py-3">Browse</a>
      </div>

      {/* Daily Insights */}
      <section>
        <h2 className="text-base font-semibold mb-3">Today&apos;s Insights</h2>
        <div className="space-y-3">
          {insights.map((q) => (
            <div key={q.id} className="card cursor-pointer" onClick={() => setFlipped(p => ({ ...p, [q.id]: !p[q.id] }))}>
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
              {!flipped[q.id] && (
                <p className="text-[10px] text-[var(--muted)] mt-2">tap to reveal</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Category Progress */}
      <section>
        <h2 className="text-base font-semibold mb-3">Progress</h2>
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
                  <span className="text-[10px] text-[var(--muted)]">
                    {s ? `${s.correct}/${s.total}` : "0/0"}
                  </span>
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
