"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getQuestionById } from "@/lib/questions";
import { getCodingProblem } from "@/lib/coding";
import { getViewCount, getAllCoding } from "@/lib/storage";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/types/question";
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS_CODING } from "@/types/coding";
import roadmapData from "@/data/coding-roadmap.json";

type Tier = "beginner" | "intermediate" | "patterns" | "real";

interface Day {
  day: number;
  topic: string;
  summary: string;
  questionIds: string[];
  problemIds: string[];
}

interface Week {
  week: number;
  title: string;
  subtitle: string;
  tier: Tier;
  days: Day[];
}

const TIER_LABELS: Record<Tier, string> = {
  beginner: "Java 기초",
  intermediate: "코테용 Java",
  patterns: "알고리즘 패턴",
  real: "실전",
};

const TIER_COLORS: Record<Tier, string> = {
  beginner: "#22c55e",
  intermediate: "#3b82f6",
  patterns: "#f59e0b",
  real: "#ef4444",
};

export default function CodingRoadmapPage() {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const [views, setViews] = useState<Record<string, number>>({});
  const [codingProgress, setCodingProgress] = useState<Record<string, { status: string }>>({});

  useEffect(() => {
    const weeks = roadmapData as Week[];
    const v: Record<string, number> = {};
    for (const w of weeks) {
      for (const d of w.days) {
        for (const qid of d.questionIds) v[qid] = getViewCount(qid);
      }
    }
    setViews(v);
    setCodingProgress(getAllCoding() as Record<string, { status: string }>);
  }, []);

  const getDayProgress = (day: Day) => {
    const qDone = day.questionIds.filter((q) => (views[q] || 0) > 0).length;
    const pDone = day.problemIds.filter((p) => codingProgress[p]?.status === "solved").length;
    const total = day.questionIds.length + day.problemIds.length;
    const done = qDone + pDone;
    return { done, total };
  };

  const getWeekProgress = (w: Week) => {
    let done = 0, total = 0;
    for (const d of w.days) {
      const dp = getDayProgress(d);
      done += dp.done;
      total += dp.total;
    }
    return total === 0 ? 0 : Math.round((done / total) * 100);
  };

  const weeks = roadmapData as Week[];

  // Total progress
  let totalDone = 0, totalAll = 0;
  for (const w of weeks) {
    for (const d of w.days) {
      const dp = getDayProgress(d);
      totalDone += dp.done;
      totalAll += dp.total;
    }
  }
  const totalPct = totalAll === 0 ? 0 : Math.round((totalDone / totalAll) * 100);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <Link href="/coding" className="text-xs text-[var(--muted)]">← 문제 목록</Link>
        <h1 className="text-xl font-bold mt-1">코테 로드맵</h1>
        <p className="text-xs text-[var(--muted)]">12주 커리큘럼 · 노베이스 → 대기업 코테</p>
      </div>

      {/* Overall progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">전체 진행률</span>
          <span className="text-sm font-bold text-[var(--accent)]">{totalPct}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[var(--card-border)]">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-[var(--success)] via-[var(--accent)] to-[var(--error)] transition-all"
            style={{ width: `${totalPct}%` }}
          />
        </div>
        <p className="text-[10px] text-[var(--muted)] mt-2">
          {totalDone} / {totalAll} 완료
        </p>
      </div>

      {/* Weeks */}
      {weeks.map((w) => {
        const isOpen = expandedWeek === w.week;
        const pct = getWeekProgress(w);
        const tierColor = TIER_COLORS[w.tier];

        return (
          <div key={w.week} className="card p-0 overflow-hidden">
            <div
              className="p-3 cursor-pointer"
              onClick={() => setExpandedWeek(isOpen ? null : w.week)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: tierColor }}
                  >
                    W{w.week}
                  </span>
                  <span className="text-sm font-semibold">{w.title}</span>
                </div>
                <span className="text-[10px] text-[var(--muted)]">{pct}%</span>
              </div>
              <p className="text-[11px] text-[var(--muted)] ml-9">{w.subtitle}</p>
              <div className="flex items-center gap-2 ml-9 mt-2">
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded"
                  style={{ background: tierColor + "20", color: tierColor }}
                >
                  {TIER_LABELS[w.tier]}
                </span>
                <div className="flex-1 h-1 rounded-full bg-[var(--card-border)]">
                  <div className="h-1 rounded-full transition-all" style={{ width: `${pct}%`, background: tierColor }} />
                </div>
              </div>
            </div>

            {isOpen && (
              <div className="border-t border-[var(--card-border)]">
                {w.days.map((d) => {
                  const dp = getDayProgress(d);
                  const allDone = dp.done === dp.total && dp.total > 0;
                  return (
                    <div
                      key={d.day}
                      className="border-b border-[var(--card-border)] last:border-b-0 px-3 py-3"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            allDone ? "bg-[var(--success)] text-white" : "bg-[var(--card-border)] text-[var(--muted)]"
                          }`}
                        >
                          {allDone ? "✓" : d.day}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{d.topic}</p>
                          <p className="text-[10px] text-[var(--muted)] mt-0.5">{d.summary}</p>
                        </div>
                        <span className="text-[10px] text-[var(--muted)] shrink-0">
                          {dp.done}/{dp.total}
                        </span>
                      </div>

                      {/* Q cards */}
                      {d.questionIds.length > 0 && (
                        <div className="ml-7 space-y-1 mb-2">
                          <p className="text-[9px] font-semibold text-[var(--muted)] uppercase">📚 개념 카드</p>
                          {d.questionIds.map((qid) => {
                            const q = getQuestionById(qid);
                            const viewed = (views[qid] || 0) > 0;
                            if (!q) {
                              return (
                                <div key={qid} className="text-[10px] text-[var(--muted)] py-0.5">
                                  {qid} (not found)
                                </div>
                              );
                            }
                            return (
                              <Link
                                key={qid}
                                href={`/flashcards?category=${q.category}`}
                                className="flex items-center gap-2 py-1 px-2 rounded bg-[var(--bg)] border border-[var(--card-border)] hover:border-[var(--accent)] transition"
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                    viewed ? "bg-[var(--success)]" : "bg-[var(--card-border)]"
                                  }`}
                                />
                                <span
                                  className="text-[9px] px-1.5 py-0.5 rounded shrink-0"
                                  style={{
                                    background: CATEGORY_COLORS[q.category] + "20",
                                    color: CATEGORY_COLORS[q.category],
                                  }}
                                >
                                  {CATEGORY_LABELS[q.category]}
                                </span>
                                <span className="text-[10px] leading-tight line-clamp-1 flex-1">{q.question}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {/* Problems */}
                      {d.problemIds.length > 0 && (
                        <div className="ml-7 space-y-1">
                          <p className="text-[9px] font-semibold text-[var(--muted)] uppercase">💻 실전 문제</p>
                          {d.problemIds.map((pid) => {
                            const p = getCodingProblem(pid);
                            const status = codingProgress[pid]?.status || "unsolved";
                            if (!p) {
                              return (
                                <div key={pid} className="text-[10px] text-[var(--muted)] py-0.5">
                                  {pid} (not found)
                                </div>
                              );
                            }
                            return (
                              <Link
                                key={pid}
                                href={`/coding/${pid}`}
                                className="flex items-center gap-2 py-1 px-2 rounded bg-[var(--bg)] border border-[var(--card-border)] hover:border-[var(--accent)] transition"
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                    status === "solved"
                                      ? "bg-[var(--success)]"
                                      : status === "attempted"
                                      ? "bg-[var(--warning)]"
                                      : "bg-[var(--card-border)]"
                                  }`}
                                />
                                <span
                                  className="text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0"
                                  style={{
                                    background: DIFFICULTY_COLORS[p.difficulty] + "20",
                                    color: DIFFICULTY_COLORS[p.difficulty],
                                  }}
                                >
                                  {DIFFICULTY_LABELS_CODING[p.difficulty]}
                                </span>
                                <span className="text-[10px] leading-tight line-clamp-1 flex-1">{p.titleKo}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
