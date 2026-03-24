"use client";

import { useState, useEffect } from "react";
import { getRandomQuestions } from "@/lib/questions";
import { markFlashcardSeen } from "@/lib/storage";
import { Question, Category, CATEGORY_LABELS, CATEGORY_COLORS } from "@/types/question";

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [depth, setDepth] = useState<"light" | "deep" | "senior">("light");
  const [category, setCategory] = useState<Category | undefined>();

  useEffect(() => {
    setCards(getRandomQuestions(999, category));
    setCurrent(0);
    setFlipped(false);
  }, [category]);

  const card = cards[current];

  const next = () => {
    if (card) markFlashcardSeen(card.id);
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

  if (!card) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--muted)]">No cards available for this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Flashcards</h1>
        <span className="text-sm text-[var(--muted)]">{current + 1}/{cards.length}</span>
      </div>

      {/* Category Filter - horizontal scroll */}
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
        className="card min-h-[280px] cursor-pointer flex flex-col justify-center"
        onClick={() => setFlipped(!flipped)}
      >
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className="category-badge" style={{ background: CATEGORY_COLORS[card.category] + "20", color: CATEGORY_COLORS[card.category] }}>
            {CATEGORY_LABELS[card.category]}
          </span>
          <span className="text-[10px] text-[var(--muted)]">{card.difficulty}</span>
          {card.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--card-border)] text-[var(--muted)]">
              #{tag}
            </span>
          ))}
        </div>

        {!flipped ? (
          <div>
            <p className="text-base font-medium leading-relaxed">{card.question}</p>
            <p className="text-[10px] text-[var(--muted)] mt-3">tap to flip</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Depth Toggle */}
            <div className="flex gap-1.5">
              <button
                onClick={(e) => { e.stopPropagation(); setDepth("light"); }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${depth === "light" ? "bg-[var(--accent)] text-white" : "bg-[var(--card-border)] text-[var(--muted)]"}`}
              >
                Light
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setDepth("deep"); }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${depth === "deep" ? "bg-[var(--warning)] text-white" : "bg-[var(--card-border)] text-[var(--muted)]"}`}
              >
                Deep
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setDepth("senior"); }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${depth === "senior" ? "bg-[var(--success)] text-white" : "bg-[var(--card-border)] text-[var(--muted)]"}`}
              >
                Senior
              </button>
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
              <p className="text-xs text-[var(--muted)] leading-relaxed">{card.explanation}</p>
            )}
            {depth === "deep" && (
              <p className="text-xs text-[var(--muted)] leading-relaxed">{card.deepDive || card.seniorTip}</p>
            )}
            {depth === "senior" && (
              <p className="text-xs text-[var(--muted)] leading-relaxed">{card.seniorTip}</p>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button onClick={prev} disabled={current === 0} className="btn-secondary flex-1 disabled:opacity-30">
          Prev
        </button>
        <button onClick={next} disabled={current >= cards.length - 1} className="btn-primary flex-1 disabled:opacity-30">
          Next
        </button>
      </div>
    </div>
  );
}
