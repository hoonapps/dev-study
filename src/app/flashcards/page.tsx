"use client";

import { useState, useEffect, useRef } from "react";
import { getRandomQuestions } from "@/lib/questions";
import {
  markFlashcardSeen,
  isBookmarked,
  toggleBookmark,
  incrementView,
  recordSRS,
  getSRS,
  SRSGrade,
} from "@/lib/storage";
import { Category, CATEGORY_LABELS, CATEGORY_COLORS, Question } from "@/types/question";

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [depth, setDepth] = useState<"light" | "deep" | "senior">("light");
  const [category, setCategory] = useState<Category | undefined>();
  const [bookmarked, setBookmarked] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [viewedInSession, setViewedInSession] = useState<Set<string>>(new Set());
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  useEffect(() => {
    setCards(getRandomQuestions(999, category));
    setCurrent(0);
    setFlipped(false);
  }, [category]);

  const card = cards[current];

  useEffect(() => {
    if (card) {
      setBookmarked(isBookmarked(card.id));
      setViewCount(getSRS(card.id).repetitions);
    }
  }, [card]);

  const handleFlip = () => {
    if (!flipped && card && !viewedInSession.has(card.id)) {
      incrementView(card.id);
      markFlashcardSeen(card.id);
      setViewedInSession((prev) => new Set(prev).add(card.id));
    }
    setFlipped(!flipped);
  };

  const next = () => {
    if (current + 1 < cards.length) {
      setCurrent(current + 1);
      setFlipped(false);
      setDepth("light");
    }
  };

  const prev = () => {
    if (current > 0) {
      setCurrent(current - 1);
      setFlipped(false);
      setDepth("light");
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (card) {
      const added = toggleBookmark(card.id);
      setBookmarked(added);
    }
  };

  const handleSRS = (grade: SRSGrade) => {
    if (!card) return;
    recordSRS(card.id, grade);
    next();
  };

  // 스와이프 제스처
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  };

  // 키보드 단축키
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        handleFlip();
      } else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "b" || e.key === "B") {
        if (card) {
          const added = toggleBookmark(card.id);
          setBookmarked(added);
        }
      } else if (flipped) {
        if (e.key === "1") handleSRS("again");
        else if (e.key === "2") handleSRS("hard");
        else if (e.key === "3") handleSRS("good");
        else if (e.key === "4") handleSRS("easy");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card, flipped, current, cards]);

  if (!card) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--muted)]">No cards available for this category.</p>
      </div>
    );
  }

  const srs = getSRS(card.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Flashcards</h1>
        <span className="text-sm text-[var(--muted)]">
          {current + 1}/{cards.length}
        </span>
      </div>

      {/* Category filter */}
      <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-1.5 w-max">
          <button
            onClick={() => setCategory(undefined)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 ${!category ? "bg-[var(--accent)] text-white" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]"}`}
          >
            All
          </button>
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 ${category === cat ? "text-white" : "border border-[var(--card-border)]"}`}
              style={category === cat ? { background: CATEGORY_COLORS[cat] } : { color: CATEGORY_COLORS[cat] }}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Card */}
      <div
        className="card min-h-[280px] cursor-pointer flex flex-col justify-center select-none"
        onClick={handleFlip}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className="category-badge" style={{ background: CATEGORY_COLORS[card.category] + "20", color: CATEGORY_COLORS[card.category] }}>
            {CATEGORY_LABELS[card.category]}
          </span>
          <span className="text-[10px] text-[var(--muted)]">{card.difficulty}</span>
          {srs.repetitions > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded text-[var(--accent)]">
              {srs.repetitions}회
            </span>
          )}
          {srs.interval > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--success)]20 text-[var(--success)]">
              +{srs.interval}일
            </span>
          )}
          <button onClick={handleBookmark} className="ml-auto text-lg">
            {bookmarked ? (
              <span style={{ color: "var(--warning)" }}>&#9733;</span>
            ) : (
              <span style={{ color: "var(--muted)" }}>&#9734;</span>
            )}
          </button>
        </div>

        {!flipped ? (
          <div>
            <p className="text-base font-medium leading-relaxed">{card.question}</p>
            <p className="text-[10px] text-[var(--muted)] mt-3">tap / spacebar to flip</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-1.5">
              {(["light", "deep", "senior"] as const).map((d) => (
                <button
                  key={d}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDepth(d);
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                    depth === d
                      ? d === "light"
                        ? "bg-[var(--accent)] text-white"
                        : d === "deep"
                        ? "bg-[var(--warning)] text-white"
                        : "bg-[var(--success)] text-white"
                      : "bg-[var(--card-border)] text-[var(--muted)]"
                  }`}
                >
                  {d === "light" ? "Light" : d === "deep" ? "Deep" : "Senior"}
                </button>
              ))}
            </div>

            {card.type === "multiple-choice" && card.options && (
              <p className="text-sm">
                <span className="font-semibold text-[var(--success)]">Answer: </span>
                {card.options[card.answer as number]}
              </p>
            )}
            {card.type !== "multiple-choice" && (
              <p className="text-sm">
                <span className="font-semibold text-[var(--success)]">Answer: </span>
                {String(card.answer)}
              </p>
            )}

            {depth === "light" && (
              <p className="text-sm text-[var(--muted)] leading-relaxed">{card.explanation}</p>
            )}
            {depth === "deep" && (
              <p className="text-sm text-[var(--muted)] leading-relaxed">{card.deepDive || card.seniorTip}</p>
            )}
            {depth === "senior" && (
              <p className="text-sm text-[var(--muted)] leading-relaxed">{card.seniorTip}</p>
            )}
          </div>
        )}
      </div>

      {/* SRS buttons (only when flipped) */}
      {flipped && (
        <div className="grid grid-cols-4 gap-1.5">
          <button onClick={() => handleSRS("again")} className="py-2 rounded-lg bg-[var(--error)] text-white text-[11px] font-medium">
            <div>Again</div>
            <div className="text-[9px] opacity-70">오늘</div>
          </button>
          <button onClick={() => handleSRS("hard")} className="py-2 rounded-lg bg-[var(--warning)] text-white text-[11px] font-medium">
            <div>Hard</div>
            <div className="text-[9px] opacity-70">내일</div>
          </button>
          <button onClick={() => handleSRS("good")} className="py-2 rounded-lg bg-[var(--accent)] text-white text-[11px] font-medium">
            <div>Good</div>
            <div className="text-[9px] opacity-70">{srs.repetitions < 2 ? "3일" : `${Math.round(srs.interval * srs.ease)}일`}</div>
          </button>
          <button onClick={() => handleSRS("easy")} className="py-2 rounded-lg bg-[var(--success)] text-white text-[11px] font-medium">
            <div>Easy</div>
            <div className="text-[9px] opacity-70">1주+</div>
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <button onClick={prev} disabled={current === 0} className="btn-secondary flex-1 disabled:opacity-30">
          ← Prev
        </button>
        <button onClick={next} disabled={current >= cards.length - 1} className="btn-primary flex-1 disabled:opacity-30">
          Next →
        </button>
      </div>

      <p className="text-center text-[10px] text-[var(--muted)]">
        swipe / ← → to navigate • space to flip • 1-4 to grade
      </p>
    </div>
  );
}
