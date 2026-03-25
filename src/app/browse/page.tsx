"use client";

import { useState, useEffect, useMemo } from "react";
import { getAllQuestions } from "@/lib/questions";
import { getResults, toggleBookmark, isBookmarked } from "@/lib/storage";
import { Question, QuizResult, Category, Difficulty, CATEGORY_LABELS, CATEGORY_COLORS, DIFFICULTY_LABELS } from "@/types/question";

const PAGE_SIZE = 20;

export default function BrowsePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [category, setCategory] = useState<Category | undefined>();
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showDeep, setShowDeep] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setQuestions(getAllQuestions());
    setResults(getResults());
  }, []);

  const resultMap = useMemo(() => {
    const map = new Map<string, QuizResult>();
    for (const r of results) map.set(r.questionId, r);
    return map;
  }, [results]);

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (category && q.category !== category) return false;
      if (difficulty && q.difficulty !== difficulty) return false;
      if (search) {
        const s = search.toLowerCase();
        const tags = Array.isArray(q.tags) ? q.tags : [];
        return (
          (q.question || "").toLowerCase().includes(s) ||
          tags.some((t) => (t || "").toLowerCase().includes(s)) ||
          (q.explanation || "").toLowerCase().includes(s) ||
          (q.seniorTip || "").toLowerCase().includes(s) ||
          (q.id || "").toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [questions, category, difficulty, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [category, difficulty, search]);

  const categoryCounts = useMemo(() => {
    return questions.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [questions]);

  const handleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const added = toggleBookmark(id);
    setBookmarks(prev => ({ ...prev, [id]: added }));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Browse</h1>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search questions, tags..."
        className="w-full p-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-[var(--fg)] text-sm focus:outline-none focus:border-[var(--accent)]"
      />

      {/* Category Filter */}
      <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-1.5 w-max">
          <button
            onClick={() => setCategory(undefined)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 transition ${!category ? "bg-[var(--accent)] text-white" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]"}`}
          >
            All ({questions.length})
          </button>
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 transition ${category === cat ? "text-white" : "border border-[var(--card-border)]"}`}
              style={category === cat ? { background: CATEGORY_COLORS[cat] } : { color: CATEGORY_COLORS[cat] }}
            >
              {CATEGORY_LABELS[cat]} ({categoryCounts[cat] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="flex gap-1.5">
        <button
          onClick={() => setDifficulty(undefined)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${!difficulty ? "bg-[var(--accent)] text-white" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]"}`}
        >
          All
        </button>
        {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((diff) => (
          <button
            key={diff}
            onClick={() => setDifficulty(diff)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${difficulty === diff ? "bg-[var(--accent)] text-white" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]"}`}
          >
            {DIFFICULTY_LABELS[diff]}
          </button>
        ))}
      </div>

      {/* Results Count + Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--muted)]">{filtered.length} questions</p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="text-xs px-2 py-1 rounded bg-[var(--card)] text-[var(--muted)] disabled:opacity-30">Prev</button>
            <span className="text-xs text-[var(--muted)]">{page}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="text-xs px-2 py-1 rounded bg-[var(--card)] text-[var(--muted)] disabled:opacity-30">Next</button>
          </div>
        )}
      </div>

      {/* Question List */}
      <div className="space-y-3">
        {paged.map((q) => {
          const result = resultMap.get(q.id);
          const isExpanded = expandedId === q.id;
          const isDeep = showDeep[q.id];
          const saved = bookmarks[q.id] ?? (typeof window !== "undefined" ? isBookmarked(q.id) : false);

          return (
            <div key={q.id} className="card">
              <div className="cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : q.id)}>
                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  <span className="category-badge" style={{ background: CATEGORY_COLORS[q.category] + "20", color: CATEGORY_COLORS[q.category] }}>
                    {CATEGORY_LABELS[q.category]}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--card-border)] text-[var(--muted)]">{q.difficulty}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--card-border)] text-[var(--muted)]">
                    {q.type === "multiple-choice" ? "MC" : q.type === "ox" ? "O/X" : "SA"}
                  </span>
                  {result && (
                    <span className={`text-[10px] font-bold ${result.correct ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
                      {result.correct ? "PASS" : "FAIL"}
                    </span>
                  )}
                  <button onClick={(e) => handleBookmark(e, q.id)} className="ml-auto text-sm">
                    {saved ? <span style={{color: "var(--warning)"}}>&#9733;</span> : <span style={{color: "var(--muted)"}}>&#9734;</span>}
                  </button>
                </div>
                <p className="text-sm font-medium">{q.question}</p>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-[var(--card-border)] space-y-2">
                  <div>
                    <p className="text-[10px] text-[var(--success)] font-medium mb-0.5">Answer</p>
                    <p className="text-xs">
                      {q.type === "multiple-choice" && q.options ? q.options[q.answer as number] : String(q.answer)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-[var(--accent)] mb-0.5">Light</p>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">{q.explanation}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDeep(prev => ({ ...prev, [q.id]: !prev[q.id] })); }}
                    className="text-xs text-[var(--warning)] underline"
                  >
                    {isDeep ? "Hide Deep Dive" : "Show Deep Dive"}
                  </button>
                  {isDeep && (
                    <>
                      <div>
                        <p className="text-[10px] font-semibold text-[var(--warning)] mb-0.5">Deep Dive</p>
                        <p className="text-xs text-[var(--muted)] leading-relaxed">{q.deepDive || q.seniorTip}</p>
                      </div>
                      {q.deepDive && (
                        <div>
                          <p className="text-[10px] font-semibold text-[var(--success)] mb-0.5">Senior Tip</p>
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

      {/* Bottom Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-30">Prev</button>
          <span className="text-sm text-[var(--muted)]">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="btn-primary text-xs px-3 py-1.5 disabled:opacity-30">Next</button>
        </div>
      )}
    </div>
  );
}
