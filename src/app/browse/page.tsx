"use client";

import { useState, useEffect } from "react";
import { getAllQuestions } from "@/lib/questions";
import { getResults } from "@/lib/storage";
import { Question, QuizResult, Category, Difficulty, CATEGORY_LABELS, CATEGORY_COLORS, DIFFICULTY_LABELS } from "@/types/question";

export default function BrowsePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [category, setCategory] = useState<Category | undefined>();
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showDeep, setShowDeep] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setQuestions(getAllQuestions());
    setResults(getResults());
  }, []);

  const resultMap = new Map<string, QuizResult>();
  for (const r of results) resultMap.set(r.questionId, r);

  const filtered = questions.filter((q) => {
    if (category && q.category !== category) return false;
    if (difficulty && q.difficulty !== difficulty) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        q.question.toLowerCase().includes(s) ||
        q.tags.some((t) => t.toLowerCase().includes(s)) ||
        q.explanation.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const categoryCounts = questions.reduce(
    (acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Browse All Questions</h1>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search questions, tags..."
        className="w-full p-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
      />

      {/* Category Filter */}
      <div>
        <h3 className="text-xs font-semibold text-[var(--muted)] mb-2">CATEGORY</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory(undefined)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${!category ? "bg-[var(--accent)] text-white" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]"}`}
          >
            All ({questions.length})
          </button>
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${category === cat ? "text-white" : "border border-[var(--card-border)]"}`}
              style={category === cat ? { background: CATEGORY_COLORS[cat] } : { color: CATEGORY_COLORS[cat] }}
            >
              {CATEGORY_LABELS[cat]} ({categoryCounts[cat] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div>
        <h3 className="text-xs font-semibold text-[var(--muted)] mb-2">DIFFICULTY</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setDifficulty(undefined)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${!difficulty ? "bg-[var(--accent)] text-white" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]"}`}
          >
            All
          </button>
          {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficulty(diff)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${difficulty === diff ? "bg-[var(--accent)] text-white" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]"}`}
            >
              {DIFFICULTY_LABELS[diff]}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-[var(--muted)]">{filtered.length} questions</p>

      {/* Question List */}
      <div className="space-y-3">
        {filtered.map((q) => {
          const result = resultMap.get(q.id);
          const isExpanded = expandedId === q.id;
          const isDeep = showDeep[q.id];

          return (
            <div key={q.id} className="card">
              <div
                className="cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="category-badge"
                    style={{ background: CATEGORY_COLORS[q.category] + "20", color: CATEGORY_COLORS[q.category] }}
                  >
                    {CATEGORY_LABELS[q.category]}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[var(--card-border)] text-[var(--muted)]">
                    {q.difficulty}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[var(--card-border)] text-[var(--muted)]">
                    {q.type === "multiple-choice" ? "MC" : q.type === "ox" ? "O/X" : "SA"}
                  </span>
                  {result && (
                    <span className={`text-xs font-bold ${result.correct ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
                      {result.correct ? "PASS" : "FAIL"}
                    </span>
                  )}
                </div>
                <p className="font-medium text-sm">{q.question}</p>
                {q.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {q.tags.slice(0, 5).map((tag) => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-[var(--card-border)] text-[var(--muted)]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-[var(--card-border)] space-y-3">
                  {/* Answer */}
                  <div>
                    <p className="text-xs text-[var(--success)] font-medium mb-1">Answer</p>
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
                      setShowDeep((prev) => ({ ...prev, [q.id]: !prev[q.id] }));
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
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
