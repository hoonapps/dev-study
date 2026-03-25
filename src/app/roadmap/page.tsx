"use client";

import { useState, useEffect } from "react";
import { getQuestionById } from "@/lib/questions";
import { getViewCount, incrementView, isBookmarked, toggleBookmark } from "@/lib/storage";
import { Question, CATEGORY_LABELS, CATEGORY_COLORS } from "@/types/question";
import roadmapData from "@/data/roadmap.json";

interface RoadmapDay {
  day: number;
  topic: string;
  questionIds: string[];
  summary: string;
}

interface RoadmapWeek {
  week: number;
  title: string;
  subtitle: string;
  days: RoadmapDay[];
}

type Phase = "list" | "study";

export default function RoadmapPage() {
  const [phase, setPhase] = useState<Phase>("list");
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  // Study mode state
  const [studyQuestions, setStudyQuestions] = useState<Question[]>([]);
  const [studyTitle, setStudyTitle] = useState("");
  const [studySummary, setStudySummary] = useState("");
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [depth, setDepth] = useState<"light" | "deep" | "senior">("light");
  const [bookmarked, setBookmarked] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [completionMap, setCompletionMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const map: Record<string, number> = {};
    for (const week of roadmapData as RoadmapWeek[]) {
      for (const day of week.days) {
        for (const qid of day.questionIds) {
          map[qid] = getViewCount(qid);
        }
      }
    }
    setCompletionMap(map);
  }, []);

  const card = studyQuestions[current];

  useEffect(() => {
    if (card) {
      setBookmarked(isBookmarked(card.id));
      const count = incrementView(card.id);
      setViewCount(count);
    }
  }, [card]);

  const startStudy = (week: RoadmapWeek, day: RoadmapDay) => {
    const qs = day.questionIds
      .map((qid) => getQuestionById(qid))
      .filter((q): q is Question => !!q);
    if (qs.length === 0) return;
    setStudyQuestions(qs);
    setStudyTitle(`W${week.week}D${day.day}: ${day.topic}`);
    setStudySummary(day.summary);
    setCurrent(0);
    setFlipped(false);
    setDepth("light");
    setPhase("study");
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (card) {
      const added = toggleBookmark(card.id);
      setBookmarked(added);
    }
  };

  const next = () => {
    if (current + 1 < studyQuestions.length) {
      setCurrent(current + 1);
      setFlipped(false);
      setDepth("light");
    } else {
      // 마지막 카드 → 목록으로 복귀
      setPhase("list");
      // refresh completion
      const map: Record<string, number> = {};
      for (const week of roadmapData as RoadmapWeek[]) {
        for (const day of week.days) {
          for (const qid of day.questionIds) {
            map[qid] = getViewCount(qid);
          }
        }
      }
      setCompletionMap(map);
    }
  };

  const prev = () => {
    if (current > 0) {
      setCurrent(current - 1);
      setFlipped(false);
      setDepth("light");
    }
  };

  const getWeekProgress = (week: RoadmapWeek) => {
    const totalQs = week.days.reduce((sum, d) => sum + d.questionIds.length, 0);
    const viewedQs = week.days.reduce(
      (sum, d) => sum + d.questionIds.filter((qid) => (completionMap[qid] || 0) > 0).length,
      0
    );
    return totalQs > 0 ? Math.round((viewedQs / totalQs) * 100) : 0;
  };

  const getDayProgress = (day: RoadmapDay) => {
    const viewed = day.questionIds.filter((qid) => (completionMap[qid] || 0) > 0).length;
    return { viewed, total: day.questionIds.length };
  };

  // ========== STUDY MODE ==========
  if (phase === "study" && card) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => setPhase("list")} className="text-xs text-[var(--muted)]">
            &larr; Back
          </button>
          <span className="text-xs text-[var(--muted)]">{current + 1}/{studyQuestions.length}</span>
        </div>

        <div>
          <h2 className="text-base font-bold">{studyTitle}</h2>
          <p className="text-[10px] text-[var(--muted)] mt-1">{studySummary}</p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1">
          {studyQuestions.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= current ? "bg-[var(--accent)]" : "bg-[var(--card-border)]"}`}
            />
          ))}
        </div>

        {/* Card */}
        <div
          className="card min-h-[280px] cursor-pointer flex flex-col justify-center"
          onClick={() => setFlipped(!flipped)}
        >
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span className="category-badge" style={{ background: CATEGORY_COLORS[card.category] + "20", color: CATEGORY_COLORS[card.category] }}>
              {CATEGORY_LABELS[card.category]}
            </span>
            <span className="text-[10px] text-[var(--muted)]">{card.difficulty}</span>
            {viewCount > 1 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded text-[var(--accent)]">{viewCount}회</span>
            )}
            <button onClick={handleBookmark} className="ml-auto text-lg">
              {bookmarked ? <span style={{color: "var(--warning)"}}>&#9733;</span> : <span style={{color: "var(--muted)"}}>&#9734;</span>}
            </button>
          </div>

          {!flipped ? (
            <div>
              <p className="text-base font-medium leading-relaxed">{card.question}</p>
              <p className="text-[10px] text-[var(--muted)] mt-3">tap to flip</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-1.5">
                {(["light", "deep", "senior"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={(e) => { e.stopPropagation(); setDepth(d); }}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                      depth === d
                        ? d === "light" ? "bg-[var(--accent)] text-white"
                        : d === "deep" ? "bg-[var(--warning)] text-white"
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
                  {card.type === "multiple-choice" && card.options
                    ? card.options[card.answer as number]
                    : String(card.answer)}
                </p>
              </div>

              {depth === "light" && (
                <p className="text-xs text-[var(--muted)] leading-relaxed">{card.explanation}</p>
              )}
              {depth === "deep" && (
                <p className="text-xs text-[var(--muted)] leading-relaxed">{card.deepDive || card.seniorTip}</p>
              )}
              {depth === "senior" && (
                <p className="text-xs text-[var(--muted)] leading-relaxed">{card.seniorTip}</p>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button onClick={prev} disabled={current === 0} className="btn-secondary flex-1 disabled:opacity-30">
            Prev
          </button>
          <button onClick={next} className="btn-primary flex-1">
            {current + 1 >= studyQuestions.length ? "Complete" : "Next"}
          </button>
        </div>
      </div>
    );
  }

  // ========== LIST MODE ==========
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Learning Roadmap</h1>
        <p className="text-xs text-[var(--muted)] mt-1">8 weeks to senior level</p>
      </div>

      {(roadmapData as RoadmapWeek[]).map((week) => {
        const isOpen = expandedWeek === week.week;
        const progress = getWeekProgress(week);

        return (
          <div key={week.week} className="card p-0 overflow-hidden">
            <div
              className="p-3 cursor-pointer"
              onClick={() => setExpandedWeek(isOpen ? null : week.week)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--accent)] text-white">
                    W{week.week}
                  </span>
                  <span className="text-sm font-semibold">{week.title}</span>
                </div>
                <span className="text-[10px] text-[var(--muted)]">{progress}%</span>
              </div>
              <p className="text-[11px] text-[var(--muted)] ml-9">{week.subtitle}</p>
              <div className="w-full h-1 rounded-full bg-[var(--card-border)] mt-2">
                <div className="h-1 rounded-full bg-[var(--accent)] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {isOpen && (
              <div className="border-t border-[var(--card-border)]">
                {week.days.map((day) => {
                  const dayProgress = getDayProgress(day);
                  const allDone = dayProgress.viewed === dayProgress.total;

                  return (
                    <div
                      key={day.day}
                      className="border-b border-[var(--card-border)] last:border-b-0 px-3 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-[var(--card-border)]10 transition"
                      onClick={() => startStudy(week, day)}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${allDone ? "bg-[var(--success)] text-white" : "bg-[var(--card-border)] text-[var(--muted)]"}`}>
                        {allDone ? "✓" : day.day}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{day.topic}</p>
                        <p className="text-[10px] text-[var(--muted)]">{day.summary.slice(0, 50)}...</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[var(--muted)]">{dayProgress.viewed}/{dayProgress.total}</span>
                        <p className="text-[10px] text-[var(--accent)]">Start &rarr;</p>
                      </div>
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
