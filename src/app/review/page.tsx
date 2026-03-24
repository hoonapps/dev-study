"use client";

import { useState, useEffect } from "react";
import { getWrongResults, getResults } from "@/lib/storage";
import { getQuestionById } from "@/lib/questions";
import { Question, QuizResult, CATEGORY_LABELS, CATEGORY_COLORS } from "@/types/question";

export default function ReviewPage() {
  const [wrongResults, setWrongResults] = useState<QuizResult[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showDeep, setShowDeep] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setWrongResults(getWrongResults());
  }, []);

  if (wrongResults.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Review</h1>
        <p className="text-[var(--muted)]">No wrong answers yet. Take a quiz first!</p>
        <a href="/quiz" className="btn-primary inline-block mt-4">Start Quiz</a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Review Wrong Answers</h1>
        <span className="text-sm text-[var(--error)]">{wrongResults.length} questions</span>
      </div>

      <div className="space-y-3">
        {wrongResults.map((result) => {
          const q = getQuestionById(result.questionId);
          if (!q) return null;
          const isExpanded = expandedId === result.questionId;
          const isDeep = showDeep[result.questionId];

          return (
            <div key={result.questionId} className="card">
              <div
                className="cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : result.questionId)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="category-badge" style={{ background: CATEGORY_COLORS[q.category] + "20", color: CATEGORY_COLORS[q.category] }}>
                    {CATEGORY_LABELS[q.category]}
                  </span>
                  <span className="text-xs text-[var(--muted)]">{q.difficulty}</span>
                  <span className="text-xs text-[var(--error)]">X</span>
                </div>
                <p className="font-medium">{q.question}</p>
                {!isExpanded && (
                  <p className="text-xs text-[var(--muted)] mt-2">tap to expand</p>
                )}
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-[var(--card-border)] space-y-3">
                  <div>
                    <p className="text-xs text-[var(--error)] font-medium">Your answer:</p>
                    <p className="text-sm">{result.userAnswer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--success)] font-medium">Correct answer:</p>
                    <p className="text-sm">
                      {q.type === "multiple-choice" && q.options
                        ? q.options[q.answer as number]
                        : String(q.answer)}
                    </p>
                  </div>

                  {/* Light */}
                  <div>
                    <p className="text-sm font-semibold text-[var(--accent)] mb-1">Light</p>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">{q.explanation}</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeep(prev => ({ ...prev, [result.questionId]: !prev[result.questionId] }));
                    }}
                    className="text-sm text-[var(--warning)] underline"
                  >
                    {isDeep ? "Hide Deep Dive" : "Show Deep Dive"}
                  </button>

                  {isDeep && (
                    <>
                      <div>
                        <p className="text-sm font-semibold text-[var(--warning)] mb-1">Deep Dive</p>
                        <p className="text-sm text-[var(--muted)] leading-relaxed">{q.deepDive || q.seniorTip}</p>
                      </div>
                      {q.deepDive && (
                        <div>
                          <p className="text-sm font-semibold text-[var(--success)] mb-1">Senior Tip</p>
                          <p className="text-sm text-[var(--muted)] leading-relaxed">{q.seniorTip}</p>
                        </div>
                      )}
                    </>
                  )}

                  {result.aiFeedback && (
                    <div>
                      <p className="text-sm font-semibold text-[#ff6b35] mb-1">AI Coach</p>
                      <p className="text-sm text-[var(--muted)] leading-relaxed">{result.aiFeedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
