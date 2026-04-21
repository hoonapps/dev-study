"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllQuestions, getQuestionById } from "@/lib/questions";
import {
  getDueCards,
  getStreak,
  getWeakCategories,
  getCategoryStats,
  getBookmarks,
  getSRS,
  recordSRS,
  incrementView,
  markFlashcardSeen,
  isBookmarked,
  toggleBookmark,
  SRSGrade,
  StreakData,
} from "@/lib/storage";
import { Question, Category, CATEGORY_LABELS, CATEGORY_COLORS } from "@/types/question";
import { getDailyCodingProblem } from "@/lib/coding";
import { CodingProblem, DIFFICULTY_COLORS, DIFFICULTY_LABELS_CODING, PATTERN_LABELS } from "@/types/coding";

type Tab = "summary" | "study";

export default function TodayPage() {
  const [tab, setTab] = useState<Tab>("summary");
  const [streak, setStreak] = useState<StreakData>({ current: 0, longest: 0, lastStudyDate: "" });
  const [dueCards, setDueCards] = useState<Question[]>([]);
  const [newCards, setNewCards] = useState<Question[]>([]);
  const [weakCategories, setWeakCategories] = useState<Array<{ category: string; rate: number; total: number }>>([]);
  const [studyList, setStudyList] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [depth, setDepth] = useState<"light" | "deep" | "senior">("light");
  const [bookmarked, setBookmarked] = useState(false);
  const [finished, setFinished] = useState(false);
  const [todayCoding, setTodayCoding] = useState<CodingProblem | undefined>();

  useEffect(() => {
    setTodayCoding(getDailyCodingProblem());
    setStreak(getStreak());
    const due = getDueCards()
      .map((id) => getQuestionById(id))
      .filter((q): q is Question => !!q);
    setDueCards(due);
    setWeakCategories(getWeakCategories(3));

    // 오늘 추천 신규 카드: 최근에 안 푼 카드 중 약점 카테고리 위주로 3개
    const all = getAllQuestions();
    const stats = getCategoryStats();
    const weakCats = getWeakCategories(3).map((w) => w.category);
    const pool = all.filter((q) => {
      const srs = getSRS(q.id);
      return srs.repetitions === 0; // 아직 한번도 풀지 않은 것
    });
    const weighted = pool.sort((a, b) => {
      const aw = weakCats.includes(a.category) ? 0 : 1;
      const bw = weakCats.includes(b.category) ? 0 : 1;
      return aw - bw;
    });
    const shuffled = [...weighted].sort(() => Math.random() - 0.5).slice(0, 100);
    // 약점 2개 + 랜덤 1개
    const recommendations = [...shuffled.filter((_, i) => i < 3)];
    setNewCards(recommendations.slice(0, 3));
  }, []);

  const startStudy = () => {
    const combined = [...dueCards, ...newCards];
    if (combined.length === 0) return;
    setStudyList(combined);
    setCurrent(0);
    setFlipped(false);
    setDepth("light");
    setFinished(false);
    setTab("study");
  };

  const card = studyList[current];

  useEffect(() => {
    if (card) setBookmarked(isBookmarked(card.id));
  }, [card]);

  const handleFlip = () => {
    if (!flipped && card) {
      incrementView(card.id);
      markFlashcardSeen(card.id);
    }
    setFlipped(!flipped);
  };

  const handleSRS = (grade: SRSGrade) => {
    if (!card) return;
    recordSRS(card.id, grade);
    if (current + 1 < studyList.length) {
      setCurrent(current + 1);
      setFlipped(false);
      setDepth("light");
    } else {
      setFinished(true);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (card) {
      const added = toggleBookmark(card.id);
      setBookmarked(added);
    }
  };

  // ========= STUDY MODE =========
  if (tab === "study") {
    if (finished) {
      return (
        <div className="space-y-5 text-center py-12">
          <div className="text-5xl">🎉</div>
          <h1 className="text-2xl font-bold">오늘 학습 완료!</h1>
          <p className="text-sm text-[var(--muted)]">{studyList.length}개 카드를 복습했어요</p>
          <div className="flex gap-2 justify-center mt-4">
            <button onClick={() => { setTab("summary"); setFinished(false); }} className="btn-secondary px-6 py-2 text-sm">
              Today 홈
            </button>
            <Link href="/flashcards" className="btn-primary px-6 py-2 text-sm">
              더 학습하기
            </Link>
          </div>
        </div>
      );
    }

    if (!card) return null;
    const srs = getSRS(card.id);
    const isNew = srs.repetitions === 0 && !dueCards.find((d) => d.id === card.id);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setTab("summary")} className="text-xs text-[var(--muted)]">← Back</button>
          <span className="text-xs text-[var(--muted)]">{current + 1}/{studyList.length}</span>
        </div>

        <div className="flex gap-1">
          {studyList.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= current ? "bg-[var(--accent)]" : "bg-[var(--card-border)]"}`} />
          ))}
        </div>

        <div className="card min-h-[280px] cursor-pointer flex flex-col justify-center" onClick={handleFlip}>
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span className="category-badge" style={{ background: CATEGORY_COLORS[card.category] + "20", color: CATEGORY_COLORS[card.category] }}>
              {CATEGORY_LABELS[card.category]}
            </span>
            <span className="text-[10px] text-[var(--muted)]">{card.difficulty}</span>
            {isNew ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent)]20 text-[var(--accent)]">NEW</span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--warning)]20 text-[var(--warning)]">복습</span>
            )}
            <button onClick={handleBookmark} className="ml-auto text-lg">
              {bookmarked ? <span style={{color: "var(--warning)"}}>★</span> : <span style={{color: "var(--muted)"}}>☆</span>}
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
                    className={`px-2.5 py-1 rounded text-[11px] font-medium ${
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

              {depth === "light" && <p className="text-xs text-[var(--muted)] leading-relaxed">{card.explanation}</p>}
              {depth === "deep" && <p className="text-xs text-[var(--muted)] leading-relaxed">{card.deepDive || card.seniorTip}</p>}
              {depth === "senior" && <p className="text-xs text-[var(--muted)] leading-relaxed">{card.seniorTip}</p>}
            </div>
          )}
        </div>

        {flipped && (
          <div className="grid grid-cols-4 gap-1.5">
            <button onClick={() => handleSRS("again")} className="py-2 rounded-lg bg-[var(--error)] text-white text-[11px] font-medium">
              <div>Again</div><div className="text-[9px] opacity-70">오늘</div>
            </button>
            <button onClick={() => handleSRS("hard")} className="py-2 rounded-lg bg-[var(--warning)] text-white text-[11px] font-medium">
              <div>Hard</div><div className="text-[9px] opacity-70">내일</div>
            </button>
            <button onClick={() => handleSRS("good")} className="py-2 rounded-lg bg-[var(--accent)] text-white text-[11px] font-medium">
              <div>Good</div><div className="text-[9px] opacity-70">{srs.repetitions < 2 ? "3일" : `${Math.round(srs.interval * srs.ease)}일`}</div>
            </button>
            <button onClick={() => handleSRS("easy")} className="py-2 rounded-lg bg-[var(--success)] text-white text-[11px] font-medium">
              <div>Easy</div><div className="text-[9px] opacity-70">1주+</div>
            </button>
          </div>
        )}
      </div>
    );
  }

  // ========= SUMMARY MODE =========
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][today.getDay()];
  const alreadyStudiedToday = streak.lastStudyDate === today.toISOString().split("T")[0];
  const totalToday = dueCards.length + newCards.length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Today</h1>
        <p className="text-xs text-[var(--muted)]">{month}월 {day}일 ({weekday})</p>
      </div>

      {/* Streak Banner */}
      <div className="card" style={{ background: "linear-gradient(135deg, var(--warning)20, var(--accent)20)" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[var(--muted)]">🔥 스트릭</p>
            <p className="text-3xl font-bold text-[var(--warning)]">{streak.current}<span className="text-sm text-[var(--muted)] ml-1">일</span></p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[var(--muted)]">최장 기록</p>
            <p className="text-xl font-semibold text-[var(--success)]">{streak.longest}일</p>
          </div>
        </div>
        {alreadyStudiedToday ? (
          <p className="text-[11px] text-[var(--success)] mt-2">✓ 오늘 학습 완료</p>
        ) : (
          <p className="text-[11px] text-[var(--warning)] mt-2">오늘 학습하지 않았어요</p>
        )}
      </div>

      {/* Study CTA */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold">오늘의 학습</p>
            <p className="text-[11px] text-[var(--muted)]">복습 {dueCards.length}개 · 신규 {newCards.length}개</p>
          </div>
          <p className="text-3xl font-bold text-[var(--accent)]">{totalToday}</p>
        </div>
        <button
          onClick={startStudy}
          disabled={totalToday === 0}
          className="btn-primary w-full py-3 text-sm disabled:opacity-30"
        >
          {totalToday > 0 ? `▶ ${totalToday}개 학습 시작` : "학습할 카드가 없어요"}
        </button>
      </div>

      {/* Today's Coding Problem */}
      {todayCoding && (
        <section>
          <h2 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
            오늘의 코테
          </h2>
          <Link href={`/coding/${todayCoding.id}`} className="card block">
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                style={{ background: DIFFICULTY_COLORS[todayCoding.difficulty] + "20", color: DIFFICULTY_COLORS[todayCoding.difficulty] }}
              >
                {DIFFICULTY_LABELS_CODING[todayCoding.difficulty]}
              </span>
              <span className="text-[10px] text-[var(--muted)]">{todayCoding.id}</span>
              {todayCoding.companies.slice(0, 2).map((c) => (
                <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent)]15 text-[var(--accent)]">{c}</span>
              ))}
            </div>
            <p className="text-sm font-semibold mb-0.5">{todayCoding.titleKo}</p>
            <p className="text-[11px] text-[var(--muted)] mb-2">{todayCoding.title}</p>
            <div className="flex gap-1 flex-wrap">
              {todayCoding.patterns.slice(0, 3).map((pt) => (
                <span key={pt} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--card-border)] text-[var(--muted)]">
                  {PATTERN_LABELS[pt] || pt}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-[var(--accent)] mt-2">풀러 가기 →</p>
          </Link>
        </section>
      )}

      {/* Due cards preview */}
      {dueCards.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
            복습 ({dueCards.length})
          </h2>
          <div className="space-y-1.5">
            {dueCards.slice(0, 5).map((q) => {
              const srs = getSRS(q.id);
              return (
                <div key={q.id} className="card py-2 px-3">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="category-badge" style={{ background: CATEGORY_COLORS[q.category] + "20", color: CATEGORY_COLORS[q.category] }}>
                      {CATEGORY_LABELS[q.category]}
                    </span>
                    <span className="text-[9px] text-[var(--muted)]">{srs.repetitions}회</span>
                  </div>
                  <p className="text-xs font-medium line-clamp-2">{q.question}</p>
                </div>
              );
            })}
            {dueCards.length > 5 && (
              <p className="text-[10px] text-[var(--muted)] text-center pt-1">
                + {dueCards.length - 5}개 더
              </p>
            )}
          </div>
        </section>
      )}

      {/* New cards preview */}
      {newCards.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            신규 추천 ({newCards.length})
          </h2>
          <div className="space-y-1.5">
            {newCards.map((q) => (
              <div key={q.id} className="card py-2 px-3">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="category-badge" style={{ background: CATEGORY_COLORS[q.category] + "20", color: CATEGORY_COLORS[q.category] }}>
                    {CATEGORY_LABELS[q.category]}
                  </span>
                  <span className="text-[9px] text-[var(--muted)]">{q.difficulty}</span>
                </div>
                <p className="text-xs font-medium line-clamp-2">{q.question}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Weak categories */}
      {weakCategories.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--error)]" />
            약점 카테고리
          </h2>
          <div className="space-y-1.5">
            {weakCategories.map((w) => {
              const cat = w.category as Category;
              return (
                <Link
                  key={cat}
                  href={`/quiz?category=${cat}`}
                  className="card p-2.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ color: CATEGORY_COLORS[cat] || "var(--fg)" }}>
                      {CATEGORY_LABELS[cat] || cat}
                    </span>
                    <span className="text-[10px] text-[var(--muted)]">{w.total}문제</span>
                  </div>
                  <span className="text-xs text-[var(--error)]">{Math.round(w.rate * 100)}% →</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {totalToday === 0 && weakCategories.length === 0 && dueCards.length === 0 && (
        <div className="card text-center py-6">
          <p className="text-sm text-[var(--muted)]">
            학습 데이터가 없어요.<br />
            <Link href="/flashcards" className="text-[var(--accent)]">플래시카드</Link>나{" "}
            <Link href="/quiz" className="text-[var(--accent)]">퀴즈</Link>로 시작해보세요.
          </p>
        </div>
      )}
    </div>
  );
}
