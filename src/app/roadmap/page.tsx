"use client";

import { useState, useEffect } from "react";
import { getQuestionById } from "@/lib/questions";
import { getViewCount } from "@/lib/storage";
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

export default function RoadmapPage() {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
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
            {/* Week Header */}
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
                <div
                  className="h-1 rounded-full bg-[var(--accent)] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Days */}
            {isOpen && (
              <div className="border-t border-[var(--card-border)]">
                {week.days.map((day) => {
                  const dayKey = `${week.week}-${day.day}`;
                  const isDayOpen = expandedDay === dayKey;
                  const dayProgress = getDayProgress(day);

                  return (
                    <div
                      key={dayKey}
                      className="border-b border-[var(--card-border)] last:border-b-0"
                    >
                      <div
                        className="px-3 py-2.5 cursor-pointer flex items-center gap-3"
                        onClick={() => setExpandedDay(isDayOpen ? null : dayKey)}
                      >
                        <span className="text-[10px] font-medium text-[var(--muted)] w-6">
                          D{day.day}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{day.topic}</p>
                        </div>
                        <span className="text-[10px] text-[var(--muted)]">
                          {dayProgress.viewed}/{dayProgress.total}
                        </span>
                      </div>

                      {isDayOpen && (
                        <div className="px-3 pb-3 space-y-2">
                          <p className="text-xs text-[var(--muted)] leading-relaxed ml-9">
                            {day.summary}
                          </p>
                          <div className="ml-9 space-y-1.5">
                            {day.questionIds.map((qid) => {
                              const q = getQuestionById(qid);
                              const views = completionMap[qid] || 0;
                              if (!q) return (
                                <div key={qid} className="text-[10px] text-[var(--muted)]">
                                  {qid} (not found)
                                </div>
                              );
                              return (
                                <a
                                  key={qid}
                                  href={`/flashcards?id=${qid}`}
                                  className="block p-2 rounded-lg bg-[var(--bg)] border border-[var(--card-border)] hover:border-[var(--accent)] transition"
                                >
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${views > 0 ? "bg-[var(--success)]" : "bg-[var(--card-border)]"}`} />
                                    <span className="text-[10px] text-[var(--muted)]">{qid}</span>
                                    {views > 0 && (
                                      <span className="text-[10px] text-[var(--accent)]">{views}회</span>
                                    )}
                                  </div>
                                  <p className="text-xs leading-relaxed">{q.question}</p>
                                </a>
                              );
                            })}
                          </div>
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
