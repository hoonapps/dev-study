"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCodingProblem } from "@/lib/coding";
import { getCodingProgress, setCodingStatus, markCodingViewed } from "@/lib/storage";
import { CodingProblem, DIFFICULTY_COLORS, DIFFICULTY_LABELS_CODING, PATTERN_LABELS } from "@/types/coding";
import MarkdownText from "@/components/MarkdownText";
import CodeBlock from "@/components/CodeBlock";

type Tab = "problem" | "hints" | "code" | "walkthrough" | "secret" | "similar";

export default function CodingDetailClient({ id }: { id: string }) {
  const [problem, setProblem] = useState<CodingProblem | undefined>();
  const [tab, setTab] = useState<Tab>("problem");
  const [hintsShown, setHintsShown] = useState(0);
  const [status, setStatus] = useState<string>("unsolved");

  useEffect(() => {
    const p = getCodingProblem(id);
    setProblem(p);
    if (p) {
      markCodingViewed(p.id);
      setStatus(getCodingProgress(p.id).status);
    }
  }, [id]);

  const handleStatus = (newStatus: "attempted" | "solved" | "unsolved") => {
    if (!problem) return;
    setCodingStatus(problem.id, newStatus);
    setStatus(newStatus);
  };

  if (!problem) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--muted)] mb-4">문제를 찾을 수 없어요.</p>
        <Link href="/coding" className="btn-primary text-sm px-4 py-2">목록으로</Link>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "problem", label: "문제", icon: "📋" },
    { key: "hints", label: "힌트", icon: "💡" },
    { key: "code", label: "코드", icon: "💻" },
    { key: "walkthrough", label: "해설", icon: "🧠" },
    { key: "secret", label: "비법", icon: "🎯" },
    { key: "similar", label: "유사", icon: "🔗" },
  ];

  return (
    <div className="space-y-3">
      {/* Back */}
      <Link href="/coding" className="text-xs text-[var(--muted)]">← 목록</Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-medium"
            style={{ background: DIFFICULTY_COLORS[problem.difficulty] + "20", color: DIFFICULTY_COLORS[problem.difficulty] }}
          >
            {DIFFICULTY_LABELS_CODING[problem.difficulty]}
          </span>
          <span className="text-[10px] text-[var(--muted)]">{problem.id}</span>
          {problem.year && <span className="text-[10px] text-[var(--muted)]">{problem.year}</span>}
        </div>
        <h1 className="text-lg font-bold">{problem.titleKo}</h1>
        <p className="text-xs text-[var(--muted)]">{problem.title}</p>
        <div className="flex gap-1 mt-2 flex-wrap">
          {problem.patterns.map((pt) => (
            <span key={pt} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--card-border)] text-[var(--muted)]">
              {PATTERN_LABELS[pt] || pt}
            </span>
          ))}
          {problem.companies.map((c) => (
            <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent)]15 text-[var(--accent)]">
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex gap-1.5">
        <button
          onClick={() => handleStatus("unsolved")}
          className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium ${status === "unsolved" ? "bg-[var(--card-border)] text-[var(--fg)]" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]"}`}
        >
          미풀이
        </button>
        <button
          onClick={() => handleStatus("attempted")}
          className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium ${status === "attempted" ? "bg-[var(--warning)] text-white" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]"}`}
        >
          시도중
        </button>
        <button
          onClick={() => handleStatus("solved")}
          className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium ${status === "solved" ? "bg-[var(--success)] text-white" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]"}`}
        >
          ✓ 솔브
        </button>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide border-b border-[var(--card-border)]">
        <div className="flex gap-1 w-max">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition ${
                tab === t.key ? "border-[var(--accent)] text-[var(--accent)]" : "border-transparent text-[var(--muted)]"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="card">
        {tab === "problem" && (
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-semibold text-[var(--muted)] uppercase mb-1">문제 설명</p>
              <MarkdownText text={problem.description} />
            </div>

            <div>
              <p className="text-[10px] font-semibold text-[var(--muted)] uppercase mb-2">예시</p>
              <div className="space-y-2">
                {problem.examples.map((ex, i) => (
                  <div key={i} className="bg-[var(--bg)] border border-[var(--card-border)] rounded p-2.5 text-xs space-y-1 font-mono">
                    <p><span className="text-[var(--muted)]">Input:</span> {ex.input}</p>
                    <p><span className="text-[var(--muted)]">Output:</span> {ex.output}</p>
                    {ex.explanation && <p className="text-[var(--muted)] font-sans mt-1">{ex.explanation}</p>}
                  </div>
                ))}
              </div>
            </div>

            {problem.constraints.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-[var(--muted)] uppercase mb-1">제약 조건</p>
                <ul className="text-xs text-[var(--muted)] space-y-0.5 list-disc list-inside">
                  {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {tab === "hints" && (
          <div className="space-y-3">
            <p className="text-[10px] text-[var(--muted)]">단계별로 공개돼요. 바로 답 보지 말고 생각해보세요.</p>
            {problem.hints.slice(0, hintsShown).map((h, i) => (
              <div key={i} className="border-l-2 border-[var(--warning)] pl-3">
                <p className="text-[10px] font-semibold text-[var(--warning)]">힌트 {i + 1}</p>
                <p className="text-sm mt-1">{h}</p>
              </div>
            ))}
            {hintsShown < problem.hints.length && (
              <button
                onClick={() => setHintsShown(hintsShown + 1)}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                힌트 {hintsShown + 1} 공개
              </button>
            )}
            {hintsShown >= problem.hints.length && (
              <div className="border-l-2 border-[var(--accent)] pl-3">
                <p className="text-[10px] font-semibold text-[var(--accent)]">접근법</p>
                <p className="text-sm mt-1">{problem.approach}</p>
              </div>
            )}
          </div>
        )}

        {tab === "code" && (
          <div className="space-y-3">
            <CodeBlock
              code={problem.code}
              language={problem.patterns.includes("sql") ? "sql" : "java"}
            />
            <div className="flex gap-2 text-[11px]">
              <span className="px-2 py-1 rounded bg-[var(--card-border)]">
                <span className="text-[var(--muted)]">Time:</span> <span className="font-mono">{problem.complexity.time}</span>
              </span>
              <span className="px-2 py-1 rounded bg-[var(--card-border)]">
                <span className="text-[var(--muted)]">Space:</span> <span className="font-mono">{problem.complexity.space}</span>
              </span>
            </div>
          </div>
        )}

        {tab === "walkthrough" && (
          <div>
            <p className="text-[10px] font-semibold text-[var(--muted)] uppercase mb-2">해설</p>
            <MarkdownText text={problem.walkthrough} />
          </div>
        )}

        {tab === "secret" && (
          <div>
            <p className="text-[10px] font-semibold text-[var(--warning)] uppercase mb-2">🎯 풀이 비법</p>
            <div className="border-l-2 border-[var(--warning)] pl-3">
              <MarkdownText text={problem.secret} />
            </div>
          </div>
        )}

        {tab === "similar" && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-[var(--muted)] uppercase mb-2">유사 문제</p>
            {problem.similar.length === 0 ? (
              <p className="text-xs text-[var(--muted)]">아직 연결된 문제가 없어요.</p>
            ) : (
              problem.similar.map((sid) => {
                const sp = getCodingProblem(sid);
                if (!sp) return null;
                return (
                  <Link key={sid} href={`/coding/${sid}`} className="card p-2.5 block">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: DIFFICULTY_COLORS[sp.difficulty] + "20", color: DIFFICULTY_COLORS[sp.difficulty] }}
                      >
                        {DIFFICULTY_LABELS_CODING[sp.difficulty]}
                      </span>
                      <span className="text-[10px] text-[var(--muted)]">{sp.id}</span>
                    </div>
                    <p className="text-sm font-medium">{sp.titleKo}</p>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
