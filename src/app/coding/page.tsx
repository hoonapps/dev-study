"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getAllCodingProblems, getAllPatterns, getAllCompanies } from "@/lib/coding";
import { getAllCoding } from "@/lib/storage";
import { CodingProblem, CodingDifficulty, DIFFICULTY_COLORS, DIFFICULTY_LABELS_CODING, PATTERN_LABELS } from "@/types/coding";

type Status = "all" | "solved" | "attempted" | "unsolved";

const PAGE_SIZE = 30;

export default function CodingListPage() {
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [difficulty, setDifficulty] = useState<CodingDifficulty | undefined>();
  const [pattern, setPattern] = useState<string | undefined>();
  const [company, setCompany] = useState<string | undefined>();
  const [status, setStatus] = useState<Status>("all");
  const [search, setSearch] = useState("");
  const [progress, setProgress] = useState<Record<string, { status: string }>>({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    setProblems(getAllCodingProblems());
    setProgress(getAllCoding() as Record<string, { status: string }>);
  }, []);

  const patterns = useMemo(() => getAllPatterns(), []);
  const companies = useMemo(() => getAllCompanies(), []);

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      if (difficulty && p.difficulty !== difficulty) return false;
      if (pattern && !p.patterns.includes(pattern)) return false;
      if (company && !p.companies.includes(company)) return false;
      if (status !== "all") {
        const s = progress[p.id]?.status || "unsolved";
        if (status === "solved" && s !== "solved") return false;
        if (status === "attempted" && s !== "attempted") return false;
        if (status === "unsolved" && s !== "unsolved") return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.titleKo.includes(search) ||
          p.patterns.some((pt) => pt.includes(q))
        );
      }
      return true;
    });
  }, [problems, difficulty, pattern, company, status, search, progress]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [difficulty, pattern, company, status, search]);

  const solvedCount = Object.values(progress).filter((p) => p.status === "solved").length;
  const attemptedCount = Object.values(progress).filter((p) => p.status === "attempted").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Coding</h1>
        <p className="text-xs text-[var(--muted)]">{problems.length}문제 · {solvedCount}솔브 · {attemptedCount}시도</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card p-2.5 text-center">
          <p className="text-lg font-bold text-[var(--success)]">{solvedCount}</p>
          <p className="text-[10px] text-[var(--muted)]">Solved</p>
        </div>
        <div className="card p-2.5 text-center">
          <p className="text-lg font-bold text-[var(--warning)]">{attemptedCount}</p>
          <p className="text-[10px] text-[var(--muted)]">Attempted</p>
        </div>
        <div className="card p-2.5 text-center">
          <p className="text-lg font-bold text-[var(--muted)]">{problems.length - solvedCount - attemptedCount}</p>
          <p className="text-[10px] text-[var(--muted)]">Todo</p>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="문제 검색..."
        className="w-full p-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-[var(--fg)] text-sm focus:outline-none focus:border-[var(--accent)]"
      />

      {/* Difficulty */}
      <div className="flex gap-1.5">
        {([undefined, "easy", "medium", "hard"] as const).map((d) => (
          <button
            key={d || "all"}
            onClick={() => setDifficulty(d)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${difficulty === d ? "text-white" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]"}`}
            style={difficulty === d ? { background: d ? DIFFICULTY_COLORS[d] : "var(--accent)" } : {}}
          >
            {d ? DIFFICULTY_LABELS_CODING[d] : "All"}
          </button>
        ))}
      </div>

      {/* Status */}
      <div className="flex gap-1.5">
        {(["all", "unsolved", "attempted", "solved"] as Status[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${status === s ? "bg-[var(--accent)] text-white" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]"}`}
          >
            {s === "all" ? "전체" : s === "unsolved" ? "미풀이" : s === "attempted" ? "시도중" : "솔브"}
          </button>
        ))}
      </div>

      {/* Pattern */}
      <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-1.5 w-max">
          <button
            onClick={() => setPattern(undefined)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 ${!pattern ? "bg-[var(--accent)] text-white" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]"}`}
          >
            All patterns
          </button>
          {patterns.map((pt) => (
            <button
              key={pt}
              onClick={() => setPattern(pt)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 ${pattern === pt ? "bg-[var(--accent)] text-white" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]"}`}
            >
              {PATTERN_LABELS[pt] || pt}
            </button>
          ))}
        </div>
      </div>

      {/* Company */}
      <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-1.5 w-max">
          <button
            onClick={() => setCompany(undefined)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 ${!company ? "bg-[var(--accent)] text-white" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]"}`}
          >
            전체 회사
          </button>
          {companies.map((c) => (
            <button
              key={c}
              onClick={() => setCompany(c)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 ${company === c ? "bg-[var(--accent)] text-white" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-[var(--muted)]">{filtered.length}개 문제</p>

      {/* List */}
      <div className="space-y-2">
        {paged.map((p) => {
          const s = progress[p.id]?.status || "unsolved";
          return (
            <Link key={p.id} href={`/coding/${p.id}`} className="card p-3 block">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                  style={{ background: DIFFICULTY_COLORS[p.difficulty] + "20", color: DIFFICULTY_COLORS[p.difficulty] }}
                >
                  {DIFFICULTY_LABELS_CODING[p.difficulty]}
                </span>
                <span className="text-[10px] text-[var(--muted)]">{p.id}</span>
                {s === "solved" && <span className="text-[10px] text-[var(--success)]">✓ 솔브</span>}
                {s === "attempted" && <span className="text-[10px] text-[var(--warning)]">… 시도중</span>}
              </div>
              <p className="text-sm font-medium mb-1">{p.titleKo}</p>
              <p className="text-[11px] text-[var(--muted)]">{p.title}</p>
              <div className="flex gap-1 mt-2 flex-wrap">
                {p.patterns.slice(0, 3).map((pt) => (
                  <span key={pt} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--card-border)] text-[var(--muted)]">
                    {PATTERN_LABELS[pt] || pt}
                  </span>
                ))}
                {p.companies.slice(0, 2).map((c) => (
                  <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent)]15 text-[var(--accent)]">
                    {c}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-30">Prev</button>
          <span className="text-sm text-[var(--muted)]">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-primary text-xs px-3 py-1.5 disabled:opacity-30">Next</button>
        </div>
      )}
    </div>
  );
}
