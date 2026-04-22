"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getQuestionById } from "@/lib/questions";
import { getCodingProblem } from "@/lib/coding";
import {
  getViewCount,
  getAllCoding,
  incrementView,
  markFlashcardSeen,
  isBookmarked,
  toggleBookmark,
  getCodingProgress,
  setCodingStatus,
  markCodingViewed,
} from "@/lib/storage";
import { CATEGORY_COLORS, CATEGORY_LABELS, Question } from "@/types/question";
import { CodingProblem, DIFFICULTY_COLORS, DIFFICULTY_LABELS_CODING, PATTERN_LABELS } from "@/types/coding";
import roadmapData from "@/data/coding-roadmap.json";
import CodeBlock from "@/components/CodeBlock";
import MemoBox from "@/components/MemoBox";

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

interface StudyItem {
  type: "question" | "problem";
  id: string;
  question?: Question;
  problem?: CodingProblem;
}

type Phase = "list" | "study" | "complete";

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
  const [phase, setPhase] = useState<Phase>("list");
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const [views, setViews] = useState<Record<string, number>>({});
  const [codingProgress, setCodingProgress] = useState<Record<string, { status: string }>>({});

  // Study session state
  const [studyItems, setStudyItems] = useState<StudyItem[]>([]);
  const [studyTitle, setStudyTitle] = useState("");
  const [studySummary, setStudySummary] = useState("");
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [depth, setDepth] = useState<"light" | "deep" | "senior">("light");
  const [bookmarked, setBookmarked] = useState(false);
  const [codeStatus, setCodeStatus] = useState<string>("unsolved");
  const [showHints, setShowHints] = useState(0);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    refreshProgress();
  }, []);

  const refreshProgress = () => {
    const weeks = roadmapData as Week[];
    const v: Record<string, number> = {};
    for (const w of weeks) {
      for (const d of w.days) {
        for (const qid of d.questionIds) v[qid] = getViewCount(qid);
      }
    }
    setViews(v);
    setCodingProgress(getAllCoding() as Record<string, { status: string }>);
  };

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

  const startDay = (week: Week, day: Day) => {
    const items: StudyItem[] = [];
    for (const qid of day.questionIds) {
      const q = getQuestionById(qid);
      if (q) items.push({ type: "question", id: qid, question: q });
    }
    for (const pid of day.problemIds) {
      const p = getCodingProblem(pid);
      if (p) items.push({ type: "problem", id: pid, problem: p });
    }
    if (items.length === 0) return;
    setStudyItems(items);
    setStudyTitle(`W${week.week}D${day.day}: ${day.topic}`);
    setStudySummary(day.summary);
    setCurrent(0);
    setFlipped(false);
    setDepth("light");
    setShowHints(0);
    setShowCode(false);
    setPhase("study");
  };

  const startWeek = (week: Week) => {
    const items: StudyItem[] = [];
    for (const day of week.days) {
      for (const qid of day.questionIds) {
        const q = getQuestionById(qid);
        if (q) items.push({ type: "question", id: qid, question: q });
      }
      for (const pid of day.problemIds) {
        const p = getCodingProblem(pid);
        if (p) items.push({ type: "problem", id: pid, problem: p });
      }
    }
    if (items.length === 0) return;
    setStudyItems(items);
    setStudyTitle(`W${week.week}: ${week.title}`);
    setStudySummary(week.subtitle);
    setCurrent(0);
    setFlipped(false);
    setDepth("light");
    setShowHints(0);
    setShowCode(false);
    setPhase("study");
  };

  const currentItem = studyItems[current];

  useEffect(() => {
    if (!currentItem) return;
    if (currentItem.type === "question" && currentItem.question) {
      setBookmarked(isBookmarked(currentItem.question.id));
    }
    if (currentItem.type === "problem" && currentItem.problem) {
      markCodingViewed(currentItem.problem.id);
      setCodeStatus(getCodingProgress(currentItem.problem.id).status);
    }
  }, [currentItem]);

  const handleFlip = () => {
    if (!flipped && currentItem?.question) {
      incrementView(currentItem.question.id);
      markFlashcardSeen(currentItem.question.id);
    }
    setFlipped(!flipped);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentItem?.question) {
      const added = toggleBookmark(currentItem.question.id);
      setBookmarked(added);
    }
  };

  const handleCodingStatus = (newStatus: "attempted" | "solved" | "unsolved") => {
    if (!currentItem?.problem) return;
    setCodingStatus(currentItem.problem.id, newStatus);
    setCodeStatus(newStatus);
  };

  const next = () => {
    if (current + 1 < studyItems.length) {
      setCurrent(current + 1);
      setFlipped(false);
      setDepth("light");
      setShowHints(0);
      setShowCode(false);
    } else {
      setPhase("complete");
      refreshProgress();
    }
  };

  const prev = () => {
    if (current > 0) {
      setCurrent(current - 1);
      setFlipped(false);
      setDepth("light");
      setShowHints(0);
      setShowCode(false);
    }
  };

  const backToList = () => {
    setPhase("list");
    refreshProgress();
  };

  // ====== COMPLETE ======
  if (phase === "complete") {
    return (
      <div className="space-y-4 text-center py-8">
        <div className="text-5xl">🎉</div>
        <h1 className="text-xl font-bold">완료!</h1>
        <p className="text-sm text-[var(--muted)]">
          {studyTitle} · {studyItems.length}개 항목
        </p>
        <div className="flex gap-2 justify-center mt-4">
          <button onClick={backToList} className="btn-secondary px-4 py-2 text-sm">
            로드맵으로
          </button>
          <Link href="/coding" className="btn-primary px-4 py-2 text-sm">
            문제 목록
          </Link>
        </div>
      </div>
    );
  }

  // ====== STUDY - QUESTION CARD ======
  if (phase === "study" && currentItem?.type === "question" && currentItem.question) {
    const q = currentItem.question;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={backToList} className="text-xs text-[var(--muted)]">← 목록</button>
          <span className="text-xs text-[var(--muted)]">
            {current + 1}/{studyItems.length}
          </span>
        </div>

        <div>
          <h2 className="text-base font-bold">{studyTitle}</h2>
          <p className="text-[10px] text-[var(--muted)] mt-1">{studySummary}</p>
        </div>

        <div className="flex gap-1">
          {studyItems.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < current ? "bg-[var(--success)]" : i === current ? "bg-[var(--accent)]" : "bg-[var(--card-border)]"
              }`}
            />
          ))}
        </div>

        <div className="card min-h-[280px] cursor-pointer flex flex-col justify-center" onClick={handleFlip}>
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--accent)]20 text-[var(--accent)]">
              📚 개념
            </span>
            <span
              className="category-badge"
              style={{ background: CATEGORY_COLORS[q.category] + "20", color: CATEGORY_COLORS[q.category] }}
            >
              {CATEGORY_LABELS[q.category]}
            </span>
            <span className="text-[10px] text-[var(--muted)]">{q.difficulty}</span>
            <button onClick={handleBookmark} className="ml-auto text-lg">
              {bookmarked ? (
                <span style={{ color: "var(--warning)" }}>★</span>
              ) : (
                <span style={{ color: "var(--muted)" }}>☆</span>
              )}
            </button>
          </div>

          {!flipped ? (
            <div>
              <p className="text-base font-medium leading-relaxed">{q.question}</p>
              <p className="text-[10px] text-[var(--muted)] mt-3">tap to flip</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-1.5">
                {(["light", "deep", "senior"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDepth(d);
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium ${
                      depth === d
                        ? d === "light"
                          ? "bg-[var(--accent)] text-white"
                          : d === "deep"
                          ? "bg-[var(--warning)] text-white"
                          : "bg-[var(--success)] text-white"
                        : "bg-[var(--card-border)] text-[var(--muted)]"
                    }`}
                  >
                    {d === "light" ? "Light" : d === "deep" ? "Deep" : "Senior"}
                  </button>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--success)] mb-0.5">Answer</p>
                <p className="text-sm">
                  {q.type === "multiple-choice" && q.options
                    ? q.options[q.answer as number]
                    : String(q.answer)}
                </p>
              </div>
              {depth === "light" && (
                <p className="text-xs text-[var(--muted)] leading-relaxed">{q.explanation}</p>
              )}
              {depth === "deep" && (
                <p className="text-xs text-[var(--muted)] leading-relaxed">{q.deepDive || q.seniorTip}</p>
              )}
              {depth === "senior" && (
                <p className="text-xs text-[var(--muted)] leading-relaxed">{q.seniorTip}</p>
              )}
            </div>
          )}
        </div>

        {flipped && <MemoBox id={q.id} />}

        <div className="flex gap-3">
          <button onClick={prev} disabled={current === 0} className="btn-secondary flex-1 disabled:opacity-30">
            ← Prev
          </button>
          <button onClick={next} className="btn-primary flex-1">
            {current + 1 >= studyItems.length ? "완료" : "Next →"}
          </button>
        </div>
      </div>
    );
  }

  // ====== STUDY - CODING PROBLEM ======
  if (phase === "study" && currentItem?.type === "problem" && currentItem.problem) {
    const p = currentItem.problem;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={backToList} className="text-xs text-[var(--muted)]">← 목록</button>
          <span className="text-xs text-[var(--muted)]">
            {current + 1}/{studyItems.length}
          </span>
        </div>

        <div>
          <h2 className="text-base font-bold">{studyTitle}</h2>
          <p className="text-[10px] text-[var(--muted)] mt-1">{studySummary}</p>
        </div>

        <div className="flex gap-1">
          {studyItems.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < current ? "bg-[var(--success)]" : i === current ? "bg-[var(--accent)]" : "bg-[var(--card-border)]"
              }`}
            />
          ))}
        </div>

        {/* Problem header */}
        <div className="card">
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#e11d48]20 text-[#e11d48]">
              💻 코딩 문제
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{
                background: DIFFICULTY_COLORS[p.difficulty] + "20",
                color: DIFFICULTY_COLORS[p.difficulty],
              }}
            >
              {DIFFICULTY_LABELS_CODING[p.difficulty]}
            </span>
            {p.companies.slice(0, 2).map((c) => (
              <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent)]15 text-[var(--accent)]">
                {c}
              </span>
            ))}
          </div>
          <p className="text-sm font-semibold mb-1">{p.titleKo}</p>
          <p className="text-[10px] text-[var(--muted)] mb-2">{p.title}</p>
          <div className="flex gap-1 flex-wrap">
            {p.patterns.slice(0, 4).map((pt) => (
              <span key={pt} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--card-border)] text-[var(--muted)]">
                {PATTERN_LABELS[pt] || pt}
              </span>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="flex gap-1.5">
          <button
            onClick={() => handleCodingStatus("unsolved")}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium ${
              codeStatus === "unsolved"
                ? "bg-[var(--card-border)] text-[var(--fg)]"
                : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]"
            }`}
          >
            미풀이
          </button>
          <button
            onClick={() => handleCodingStatus("attempted")}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium ${
              codeStatus === "attempted"
                ? "bg-[var(--warning)] text-white"
                : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]"
            }`}
          >
            시도중
          </button>
          <button
            onClick={() => handleCodingStatus("solved")}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium ${
              codeStatus === "solved"
                ? "bg-[var(--success)] text-white"
                : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]"
            }`}
          >
            ✓ 솔브
          </button>
        </div>

        {/* Description */}
        <div className="card">
          <p className="text-[10px] font-semibold text-[var(--muted)] uppercase mb-1">문제 설명</p>
          <p className="text-xs leading-relaxed whitespace-pre-wrap">{p.description}</p>
          {p.examples && p.examples.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <p className="text-[10px] font-semibold text-[var(--muted)] uppercase">예시</p>
              {p.examples.slice(0, 2).map((ex, i) => (
                <div key={i} className="bg-[var(--bg)] border border-[var(--card-border)] rounded p-2 text-[11px] font-mono space-y-0.5">
                  <p><span className="text-[var(--muted)]">In:</span> {ex.input}</p>
                  <p><span className="text-[var(--muted)]">Out:</span> {ex.output}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hints - progressive */}
        {p.hints && p.hints.length > 0 && (
          <div className="card">
            <p className="text-[10px] font-semibold text-[var(--warning)] uppercase mb-2">💡 힌트</p>
            {p.hints.slice(0, showHints).map((h, i) => (
              <div key={i} className="border-l-2 border-[var(--warning)] pl-2 mb-2 last:mb-0">
                <p className="text-[10px] font-semibold text-[var(--warning)]">힌트 {i + 1}</p>
                <p className="text-xs mt-0.5">{h}</p>
              </div>
            ))}
            {showHints < p.hints.length && (
              <button
                onClick={() => setShowHints(showHints + 1)}
                className="btn-secondary text-xs px-3 py-1.5 mt-1"
              >
                힌트 {showHints + 1} 보기
              </button>
            )}
          </div>
        )}

        {/* Code toggle */}
        <div>
          <button
            onClick={() => setShowCode(!showCode)}
            className="btn-secondary w-full py-2 text-xs"
          >
            {showCode ? "코드 숨기기" : "💻 정답 코드 보기"}
          </button>
        </div>

        {showCode && (
          <>
            <CodeBlock
              code={p.code}
              language={p.patterns.includes("sql") ? "sql" : "java"}
            />
            <div className="card">
              <p className="text-[10px] font-semibold text-[var(--success)] uppercase mb-1">해설</p>
              <p className="text-xs text-[var(--muted)] leading-relaxed whitespace-pre-wrap">{p.walkthrough}</p>
            </div>
            <div className="card border-l-4 border-l-[var(--warning)]">
              <p className="text-[10px] font-semibold text-[var(--warning)] uppercase mb-1">🎯 풀이 비법</p>
              <p className="text-xs text-[var(--muted)] leading-relaxed whitespace-pre-wrap">{p.secret}</p>
            </div>
          </>
        )}

        <MemoBox id={p.id} placeholder="풀이 메모, 실수 포인트" />

        <div className="flex gap-2 text-[11px]">
          <Link
            href={`/coding/${p.id}`}
            target="_blank"
            className="flex-1 text-center py-1.5 rounded bg-[var(--card-border)] text-[var(--muted)]"
          >
            상세 페이지 ↗
          </Link>
        </div>

        <div className="flex gap-3">
          <button onClick={prev} disabled={current === 0} className="btn-secondary flex-1 disabled:opacity-30">
            ← Prev
          </button>
          <button onClick={next} className="btn-primary flex-1">
            {current + 1 >= studyItems.length ? "완료" : "Next →"}
          </button>
        </div>
      </div>
    );
  }

  // ====== LIST MODE ======
  const weeks = roadmapData as Week[];
  let totalDone = 0,
    totalAll = 0;
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
      <div>
        <Link href="/coding" className="text-xs text-[var(--muted)]">← 문제 목록</Link>
        <h1 className="text-xl font-bold mt-1">코테 로드맵</h1>
        <p className="text-xs text-[var(--muted)]">12주 커리큘럼 · 노베이스 → 대기업 코테</p>
      </div>

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

      {weeks.map((w) => {
        const isOpen = expandedWeek === w.week;
        const pct = getWeekProgress(w);
        const tierColor = TIER_COLORS[w.tier];
        const totalItems = w.days.reduce(
          (n, d) => n + d.questionIds.length + d.problemIds.length,
          0
        );

        return (
          <div key={w.week} className="card p-0 overflow-hidden">
            <div className="p-3 cursor-pointer" onClick={() => setExpandedWeek(isOpen ? null : w.week)}>
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
                  <div
                    className="h-1 rounded-full transition-all"
                    style={{ width: `${pct}%`, background: tierColor }}
                  />
                </div>
              </div>
            </div>

            {isOpen && (
              <div className="border-t border-[var(--card-border)]">
                {/* Week start button */}
                <button
                  onClick={() => startWeek(w)}
                  className="w-full p-3 border-b border-[var(--card-border)] flex items-center justify-between hover:bg-[var(--card-border)] transition"
                >
                  <div className="text-left">
                    <p className="text-xs font-semibold">▶ 이번 주 전체 시작</p>
                    <p className="text-[10px] text-[var(--muted)]">{totalItems}개 항목을 순서대로</p>
                  </div>
                  <span className="text-[10px] text-[var(--accent)] font-semibold">Start →</span>
                </button>

                {w.days.map((d) => {
                  const dp = getDayProgress(d);
                  const allDone = dp.done === dp.total && dp.total > 0;
                  const totalD = d.questionIds.length + d.problemIds.length;
                  return (
                    <button
                      key={d.day}
                      onClick={() => startDay(w, d)}
                      disabled={totalD === 0}
                      className="w-full border-b border-[var(--card-border)] last:border-b-0 px-3 py-3 text-left hover:bg-[var(--card-border)] transition disabled:opacity-50"
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            allDone ? "bg-[var(--success)] text-white" : "bg-[var(--card-border)] text-[var(--muted)]"
                          }`}
                        >
                          {allDone ? "✓" : d.day}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{d.topic}</p>
                          <p className="text-[10px] text-[var(--muted)] mt-0.5 line-clamp-2">{d.summary}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-[var(--muted)]">
                              📚 {d.questionIds.length} · 💻 {d.problemIds.length}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-[var(--muted)] block">
                            {dp.done}/{dp.total}
                          </span>
                          {totalD > 0 && (
                            <p className="text-[10px] text-[var(--accent)] font-semibold">Start →</p>
                          )}
                        </div>
                      </div>
                    </button>
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
