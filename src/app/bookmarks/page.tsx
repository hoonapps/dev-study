"use client";

import { useState, useEffect } from "react";
import { getBookmarks, toggleBookmark } from "@/lib/storage";
import { getQuestionById } from "@/lib/questions";
import { Question, CATEGORY_LABELS, CATEGORY_COLORS } from "@/types/question";

export default function BookmarksPage() {
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showDeep, setShowDeep] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setBookmarkIds(getBookmarks());
  }, []);

  const handleRemove = (id: string) => {
    toggleBookmark(id);
    setBookmarkIds(getBookmarks());
  };

  const questions = bookmarkIds
    .map((id) => getQuestionById(id))
    .filter((q): q is Question => !!q);

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-bold mb-4">Bookmarks</h1>
        <p className="text-[var(--muted)] text-sm">No bookmarks yet.</p>
        <p className="text-[var(--muted)] text-xs mt-2">Tap the star on flashcards to save.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Bookmarks</h1>
        <span className="text-sm text-[var(--muted)]">{questions.length}</span>
      </div>

      <div className="space-y-3">
        {questions.map((q) => {
          const isExpanded = expandedId === q.id;
          const isDeep = showDeep[q.id];
          return (
            <div key={q.id} className="card">
              <div className="cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : q.id)}>
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  <span className="category-badge" style={{ background: CATEGORY_COLORS[q.category] + "20", color: CATEGORY_COLORS[q.category] }}>
                    {CATEGORY_LABELS[q.category]}
                  </span>
                  <span className="text-[10px] text-[var(--muted)]">{q.difficulty}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(q.id); }}
                    className="ml-auto text-lg"
                    style={{ color: "var(--warning)" }}
                  >
                    &#9733;
                  </button>
                </div>
                <p className="text-sm font-medium">{q.question}</p>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-[var(--card-border)] space-y-3">
                  <div>
                    <p className="text-xs text-[var(--success)] font-medium mb-1">Answer</p>
                    <p className="text-sm">
                      {q.type === "multiple-choice" && q.options
                        ? q.options[q.answer as number]
                        : String(q.answer)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--accent)] mb-1">Light</p>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">{q.explanation}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeep((prev) => ({ ...prev, [q.id]: !prev[q.id] }));
                    }}
                    className="text-xs text-[var(--warning)] underline"
                  >
                    {isDeep ? "Hide Deep Dive" : "Show Deep Dive"}
                  </button>
                  {isDeep && (
                    <>
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
                    </>
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
