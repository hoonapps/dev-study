"use client";

import { useState, useEffect, useCallback } from "react";
import { getRandomQuestions, getQuestionById } from "@/lib/questions";
import { addResult, getApiKey } from "@/lib/storage";
import { Question, Category, Difficulty, CATEGORY_LABELS, CATEGORY_COLORS, DIFFICULTY_LABELS } from "@/types/question";

type Phase = "setup" | "question" | "result" | "summary";

export default function QuizPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [category, setCategory] = useState<Category | undefined>();
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [results, setResults] = useState<{ questionId: string; correct: boolean }[]>([]);
  const [showDeep, setShowDeep] = useState(false);

  const q = questions[current];

  const startQuiz = () => {
    const qs = getRandomQuestions(10, category, difficulty);
    if (qs.length === 0) return;
    setQuestions(qs);
    setCurrent(0);
    setResults([]);
    setPhase("question");
  };

  const checkAnswer = useCallback(async () => {
    if (!q) return;
    let correct = false;

    if (q.type === "multiple-choice") {
      correct = selectedOption === q.answer;
    } else if (q.type === "ox") {
      correct = userAnswer.toUpperCase() === q.answer;
    } else {
      // short-answer: 키워드 매칭 (간단 버전)
      const answerStr = String(q.answer).toLowerCase();
      const userStr = userAnswer.toLowerCase();
      const keywords = answerStr.split(/[,、/]/);
      correct = keywords.some((kw) => userStr.includes(kw.trim()));
    }

    setIsCorrect(correct);
    setShowResult(true);
    setResults((prev) => [...prev, { questionId: q.id, correct }]);

    addResult({
      questionId: q.id,
      correct,
      userAnswer: q.type === "multiple-choice" ? String(selectedOption) : userAnswer,
      timestamp: Date.now(),
    });

    // AI Feedback for short-answer
    if (q.type === "short-answer") {
      const apiKey = getApiKey();
      if (apiKey) {
        setLoadingAI(true);
        try {
          const res = await fetch("/api/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: q.question,
              correctAnswer: q.answer,
              userAnswer,
              explanation: q.explanation,
              seniorTip: q.seniorTip,
              apiKey,
            }),
          });
          const data = await res.json();
          setAiFeedback(data.feedback || "");
        } catch {
          setAiFeedback("");
        }
        setLoadingAI(false);
      }
    }
  }, [q, selectedOption, userAnswer]);

  const nextQuestion = () => {
    if (current + 1 >= questions.length) {
      setPhase("summary");
      return;
    }
    setCurrent(current + 1);
    setUserAnswer("");
    setSelectedOption(null);
    setShowResult(false);
    setAiFeedback("");
    setShowDeep(false);
  };

  if (phase === "setup") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Quiz Setup</h1>

        <div>
          <h3 className="text-xs font-semibold mb-2 text-[var(--muted)]">CATEGORY</h3>
          <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
            <div className="flex gap-1.5 w-max">
              <button
                onClick={() => setCategory(undefined)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 transition ${!category ? "bg-[var(--accent)] text-white" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]"}`}
              >
                All
              </button>
              {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 transition ${category === cat ? "text-white" : "bg-[var(--card)] border border-[var(--card-border)]"}`}
                  style={category === cat ? { background: CATEGORY_COLORS[cat] } : { color: CATEGORY_COLORS[cat] }}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold mb-2 text-[var(--muted)]">DIFFICULTY</h3>
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
        </div>

        <button onClick={startQuiz} className="btn-primary w-full">
          Start Quiz (10 Questions)
        </button>
      </div>
    );
  }

  if (phase === "summary") {
    const correctCount = results.filter((r) => r.correct).length;
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Quiz Complete</h1>
        <div className="card text-center py-8">
          <p className="text-5xl font-bold mb-2" style={{ color: correctCount >= 7 ? "var(--success)" : correctCount >= 4 ? "var(--warning)" : "var(--error)" }}>
            {correctCount}/{results.length}
          </p>
          <p className="text-[var(--muted)]">
            {correctCount >= 7 ? "Excellent! Senior level!" : correctCount >= 4 ? "Good, keep studying!" : "Need more practice!"}
          </p>
        </div>
        <div className="space-y-2">
          {results.map((r, i) => {
            const question = getQuestionById(r.questionId);
            return (
              <div key={i} className="card p-3 flex items-center gap-3">
                <span className={`text-lg ${r.correct ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
                  {r.correct ? "O" : "X"}
                </span>
                <span className="text-sm flex-1">{question?.question}</span>
                <span className="category-badge text-xs" style={{ background: CATEGORY_COLORS[question?.category || "mysql"] + "20", color: CATEGORY_COLORS[question?.category || "mysql"] }}>
                  {CATEGORY_LABELS[question?.category || "mysql"]}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4">
          <button onClick={() => { setPhase("setup"); }} className="btn-primary flex-1">New Quiz</button>
          <a href="/review" className="btn-secondary flex-1 text-center">Review Wrong</a>
        </div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--muted)]">{current + 1}/{questions.length}</span>
        <div className="flex-1 h-2 rounded-full bg-[var(--card-border)]">
          <div className="h-2 rounded-full bg-[var(--accent)] transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
        <span className="category-badge" style={{ background: CATEGORY_COLORS[q.category] + "20", color: CATEGORY_COLORS[q.category] }}>
          {CATEGORY_LABELS[q.category]}
        </span>
      </div>

      {/* Question */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs px-2 py-0.5 rounded bg-[var(--card-border)] text-[var(--muted)]">{q.difficulty}</span>
          <span className="text-xs text-[var(--muted)]">{q.type === "multiple-choice" ? "Multiple Choice" : q.type === "ox" ? "O/X" : "Short Answer"}</span>
        </div>
        <p className="text-lg font-medium">{q.question}</p>
      </div>

      {/* Answer Input */}
      {!showResult && (
        <div className="space-y-3">
          {q.type === "multiple-choice" && q.options && (
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedOption(i)}
                  className={`w-full text-left p-4 rounded-lg border transition ${selectedOption === i ? "border-[var(--accent)] bg-[var(--accent)]10" : "border-[var(--card-border)] bg-[var(--card)]"}`}
                >
                  <span className="text-[var(--muted)] mr-3">{i + 1}.</span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {q.type === "ox" && (
            <div className="flex gap-4">
              <button
                onClick={() => setUserAnswer("O")}
                className={`flex-1 p-6 text-3xl font-bold rounded-lg border transition ${userAnswer === "O" ? "border-[var(--success)] bg-[var(--success)]10 text-[var(--success)]" : "border-[var(--card-border)] bg-[var(--card)]"}`}
              >
                O
              </button>
              <button
                onClick={() => setUserAnswer("X")}
                className={`flex-1 p-6 text-3xl font-bold rounded-lg border transition ${userAnswer === "X" ? "border-[var(--error)] bg-[var(--error)]10 text-[var(--error)]" : "border-[var(--card-border)] bg-[var(--card)]"}`}
              >
                X
              </button>
            </div>
          )}

          {q.type === "short-answer" && (
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Write your answer..."
              className="w-full p-4 rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-[var(--fg)] resize-none h-32 focus:outline-none focus:border-[var(--accent)]"
            />
          )}

          <button
            onClick={checkAnswer}
            disabled={(q.type === "multiple-choice" && selectedOption === null) || (q.type !== "multiple-choice" && !userAnswer)}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Answer
          </button>
        </div>
      )}

      {/* Result */}
      {showResult && (
        <div className="space-y-4">
          <div className={`card border-l-4 ${isCorrect ? "border-l-[var(--success)]" : "border-l-[var(--error)]"}`}>
            <p className={`text-lg font-bold mb-2 ${isCorrect ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
              {isCorrect ? "Correct!" : "Wrong!"}
            </p>
            {q.type === "multiple-choice" && !isCorrect && q.options && (
              <p className="text-sm mb-2">
                <span className="text-[var(--muted)]">Correct answer: </span>
                {q.options[q.answer as number]}
              </p>
            )}
            {q.type !== "multiple-choice" && !isCorrect && (
              <p className="text-sm mb-2">
                <span className="text-[var(--muted)]">Correct answer: </span>
                {String(q.answer)}
              </p>
            )}
          </div>

          {/* Light Explanation */}
          <div className="card">
            <p className="text-sm font-semibold text-[var(--accent)] mb-2">Light Explanation</p>
            <p className="text-sm text-[var(--muted)] leading-relaxed">{q.explanation}</p>
          </div>

          {/* Deep Dive Toggle */}
          <button
            onClick={() => setShowDeep(!showDeep)}
            className="btn-secondary w-full"
          >
            {showDeep ? "Hide Deep Dive" : "Show Deep Dive"}
          </button>

          {showDeep && (
            <>
              <div className="card border-l-4 border-l-[var(--warning)]">
                <p className="text-sm font-semibold text-[var(--warning)] mb-2">Deep Dive</p>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{q.deepDive || q.seniorTip}</p>
              </div>
              {q.deepDive && (
                <div className="card border-l-4 border-l-[var(--success)]">
                  <p className="text-sm font-semibold text-[var(--success)] mb-2">Senior Tip</p>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{q.seniorTip}</p>
                </div>
              )}
            </>
          )}

          {/* AI Feedback */}
          {loadingAI && (
            <div className="card">
              <p className="text-sm text-[var(--muted)] animate-pulse">AI is thinking...</p>
            </div>
          )}
          {aiFeedback && (
            <div className="card border-l-4 border-l-[#ff6b35]">
              <p className="text-sm font-semibold text-[#ff6b35] mb-2">AI Coach</p>
              <p className="text-sm text-[var(--muted)] leading-relaxed whitespace-pre-wrap">{aiFeedback}</p>
            </div>
          )}

          <button onClick={nextQuestion} className="btn-primary w-full">
            {current + 1 >= questions.length ? "See Results" : "Next Question"}
          </button>
        </div>
      )}
    </div>
  );
}
