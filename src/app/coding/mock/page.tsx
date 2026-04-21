"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getAllCodingProblems } from "@/lib/coding";
import { saveMockResult, getMockHistory, MockTestResult } from "@/lib/storage";
import { CodingProblem, DIFFICULTY_COLORS, DIFFICULTY_LABELS_CODING } from "@/types/coding";

type Phase = "setup" | "running" | "done";
type Level = "easy" | "medium" | "hard" | "mixed";

function fmtTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function MockPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [level, setLevel] = useState<Level>("mixed");
  const [count, setCount] = useState(3);
  const [minutes, setMinutes] = useState(120);
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [startedAt, setStartedAt] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [history, setHistory] = useState<MockTestResult[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setHistory(getMockHistory());
  }, []);

  const start = () => {
    const all = getAllCodingProblems();
    let pool = all;
    if (level !== "mixed") pool = all.filter((p) => p.difficulty === level);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
    if (shuffled.length < count) {
      alert(`${level} 난이도 문제가 부족해요.`);
      return;
    }
    setProblems(shuffled);
    setSolved(new Set());
    setStartedAt(Date.now());
    setElapsed(0);
    setPhase("running");

    // Start timer
    timerRef.current = window.setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
  };

  const finish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const end = Date.now();
    const result: MockTestResult = {
      id: `mock-${startedAt}`,
      startedAt,
      endedAt: end,
      problemIds: problems.map((p) => p.id),
      solved: Array.from(solved),
      totalMinutes: Math.round((end - startedAt) / 60000),
    };
    saveMockResult(result);
    setHistory(getMockHistory());
    setPhase("done");
  };

  const toggleSolved = (id: string) => {
    const n = new Set(solved);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    setSolved(n);
  };

  // Auto finish when time up
  useEffect(() => {
    if (phase !== "running") return;
    if (elapsed >= minutes * 60) {
      finish();
    }
  }, [elapsed, phase, minutes]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ======== SETUP ========
  if (phase === "setup") {
    return (
      <div className="space-y-4">
        <div>
          <Link href="/coding" className="text-xs text-[var(--muted)]">← 코딩</Link>
          <h1 className="text-xl font-bold mt-1">모의 코테</h1>
          <p className="text-xs text-[var(--muted)]">실전 타이머. 문제 랜덤 선별.</p>
        </div>

        {/* Setup */}
        <div className="card space-y-4">
          <div>
            <p className="text-xs font-semibold mb-2">난이도</p>
            <div className="flex gap-1.5">
              {(["easy", "medium", "hard", "mixed"] as Level[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`flex-1 py-1.5 rounded text-[11px] font-medium transition ${
                    level === l ? "bg-[var(--accent)] text-white" : "bg-[var(--card-border)] text-[var(--muted)]"
                  }`}
                >
                  {l === "mixed" ? "Mixed" : l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold mb-2">문제 수</p>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`flex-1 py-1.5 rounded text-[11px] font-medium ${
                    count === n ? "bg-[var(--accent)] text-white" : "bg-[var(--card-border)] text-[var(--muted)]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold mb-2">시간 (분)</p>
            <div className="flex gap-1.5">
              {[30, 60, 90, 120, 180].map((m) => (
                <button
                  key={m}
                  onClick={() => setMinutes(m)}
                  className={`flex-1 py-1.5 rounded text-[11px] font-medium ${
                    minutes === m ? "bg-[var(--accent)] text-white" : "bg-[var(--card-border)] text-[var(--muted)]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <button onClick={start} className="btn-primary w-full py-3 text-sm">
            ▶ 시작
          </button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="card">
            <h2 className="text-sm font-semibold mb-3">최근 기록</h2>
            <div className="space-y-2">
              {history.slice(0, 10).map((r) => (
                <div key={r.id} className="flex items-center justify-between text-xs border-b border-[var(--card-border)] pb-2 last:border-b-0 last:pb-0">
                  <div>
                    <p className="font-medium">
                      {r.solved.length}/{r.problemIds.length} 솔브
                    </p>
                    <p className="text-[10px] text-[var(--muted)]">
                      {new Date(r.startedAt).toLocaleString("ko-KR")}
                    </p>
                  </div>
                  <span className="text-[var(--muted)]">{r.totalMinutes}분</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ======== RUNNING ========
  if (phase === "running") {
    const remaining = minutes * 60 - elapsed;
    const lowTime = remaining <= 60;
    return (
      <div className="space-y-4">
        {/* Fixed timer */}
        <div className="card sticky top-16 z-20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[var(--muted)]">남은 시간</p>
              <p className={`text-3xl font-bold font-mono ${lowTime ? "text-[var(--error)] animate-pulse" : "text-[var(--fg)]"}`}>
                {fmtTime(Math.max(0, remaining))}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[var(--muted)]">진행</p>
              <p className="text-lg font-semibold">
                {solved.size}<span className="text-[var(--muted)]">/{problems.length}</span>
              </p>
            </div>
            <button onClick={finish} className="px-3 py-1.5 rounded bg-[var(--error)] text-white text-xs">
              종료
            </button>
          </div>
        </div>

        {/* Problem list */}
        <div className="space-y-2">
          {problems.map((p, i) => {
            const isSolved = solved.has(p.id);
            return (
              <div key={p.id} className="card">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-[var(--muted)]">Q{i + 1}</span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{ background: DIFFICULTY_COLORS[p.difficulty] + "20", color: DIFFICULTY_COLORS[p.difficulty] }}
                  >
                    {DIFFICULTY_LABELS_CODING[p.difficulty]}
                  </span>
                  <button
                    onClick={() => toggleSolved(p.id)}
                    className={`ml-auto px-3 py-1 rounded text-[11px] font-medium ${
                      isSolved ? "bg-[var(--success)] text-white" : "bg-[var(--card-border)] text-[var(--muted)]"
                    }`}
                  >
                    {isSolved ? "✓ 솔브" : "솔브 체크"}
                  </button>
                </div>
                <p className="text-sm font-semibold mb-2">{p.titleKo}</p>
                <Link
                  href={`/coding/${p.id}`}
                  target="_blank"
                  className="text-[11px] text-[var(--accent)]"
                >
                  문제 상세 →
                </Link>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-[var(--muted)] text-center">
          문제 보기는 새 창으로 열어요. 실제로 풀고 나서 체크하세요.
        </p>
      </div>
    );
  }

  // ======== DONE ========
  const lastResult = history[0];
  if (phase === "done" && lastResult) {
    const pct = lastResult.problemIds.length > 0 ? Math.round((lastResult.solved.length / lastResult.problemIds.length) * 100) : 0;
    return (
      <div className="space-y-4">
        <div className="card text-center py-6">
          <div className="text-5xl mb-3">{pct === 100 ? "🎉" : pct >= 50 ? "💪" : "🤔"}</div>
          <h1 className="text-xl font-bold mb-1">모의 코테 종료</h1>
          <p className="text-sm text-[var(--muted)]">
            {lastResult.solved.length}/{lastResult.problemIds.length} 솔브 · {lastResult.totalMinutes}분 소요
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <button onClick={() => setPhase("setup")} className="btn-primary text-sm px-4 py-2">
              다시
            </button>
            <Link href="/coding" className="btn-secondary text-sm px-4 py-2">
              목록
            </Link>
          </div>
        </div>

        {/* Per problem */}
        <div className="space-y-2">
          {problems.map((p, i) => {
            const isSolved = lastResult.solved.includes(p.id);
            return (
              <Link key={p.id} href={`/coding/${p.id}`} className="card flex items-center gap-2">
                <span className={`text-base ${isSolved ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
                  {isSolved ? "✓" : "✗"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{p.titleKo}</p>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{ background: DIFFICULTY_COLORS[p.difficulty] + "20", color: DIFFICULTY_COLORS[p.difficulty] }}
                  >
                    {DIFFICULTY_LABELS_CODING[p.difficulty]}
                  </span>
                </div>
                <span className="text-[10px] text-[var(--muted)]">풀이 보기 →</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
