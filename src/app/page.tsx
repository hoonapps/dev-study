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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Level Up to <span className="text-[var(--accent)]">Senior</span>
        </h1>
        <p className="text-[var(--muted)]">
          {totalQuestions}개의 문제 | {totalAnswered}개 풀었음 | 정답률 {totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0}%
        </p>
      </div>

      {/* Daily Insights */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Today&apos;s Insights</h2>
        <div className="space-y-4">
          {insights.map((q) => (
            <div key={q.id} className="card cursor-pointer" onClick={() => setFlipped(p => ({ ...p, [q.id]: !p[q.id] }))}>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="category-badge"
                  style={{ background: CATEGORY_COLORS[q.category] + "20", color: CATEGORY_COLORS[q.category] }}
                >
                  {CATEGORY_LABELS[q.category]}
                </span>
                <span className="text-xs text-[var(--muted)]">{q.difficulty}</span>
              </div>
              <p className="font-medium mb-2">{q.question}</p>
              {flipped[q.id] && (
                <div className="mt-3 pt-3 border-t border-[var(--card-border)]">
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-[var(--accent)] mb-1">Light</p>
                    <p className="text-sm text-[var(--muted)]">{q.explanation}</p>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-[var(--warning)] mb-1">Deep Dive</p>
                    <p className="text-sm text-[var(--muted)]">{q.deepDive || q.seniorTip}</p>
                  </div>
                  {q.deepDive && (
                    <div>
                      <p className="text-sm font-semibold text-[var(--success)] mb-1">Senior Tip</p>
                      <p className="text-sm text-[var(--muted)]">{q.seniorTip}</p>
                    </div>
                  )}
                </div>
              )}
              {!flipped[q.id] && (
                <p className="text-xs text-[var(--muted)]">tap to reveal</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Category Progress */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Category Progress</h2>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => {
            const s = stats[cat];
            const pct = s ? Math.round((s.correct / s.total) * 100) : 0;
            return (
              <div key={cat} className="card p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: CATEGORY_COLORS[cat] }}>
                    {CATEGORY_LABELS[cat]}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {s ? `${s.correct}/${s.total}` : "0/0"}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--card-border)]">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${pct}%`, background: CATEGORY_COLORS[cat] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="flex gap-4">
        <a href="/quiz" className="btn-primary flex-1 text-center block">Quiz Start</a>
        <a href="/flashcards" className="btn-secondary flex-1 text-center block">Flashcards</a>
        <a href="/review" className="btn-secondary flex-1 text-center block">Review</a>
      </section>
    </div>
  );
}
