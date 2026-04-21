"use client";

import { useState, useEffect } from "react";
import { clearAllProgress, exportData, importData, getStreak } from "@/lib/storage";

export default function SettingsPage() {
  const [streak, setStreak] = useState({ current: 0, longest: 0, lastStudyDate: "" });
  const [importMessage, setImportMessage] = useState("");

  useEffect(() => {
    setStreak(getStreak());
  }, []);

  const handleClear = () => {
    if (confirm("정말 모든 학습 기록을 삭제할까요? 되돌릴 수 없어요.")) {
      clearAllProgress();
      window.location.reload();
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devsenior-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const ok = importData(ev.target?.result as string);
        if (ok) {
          setImportMessage("복원 완료! 새로고침합니다.");
          setTimeout(() => window.location.reload(), 1000);
        } else {
          setImportMessage("파일 형식이 올바르지 않아요.");
        }
      } catch {
        setImportMessage("복원 실패. 파일을 확인해주세요.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Settings</h1>

      {/* Streak */}
      <div className="card">
        <h3 className="text-sm font-semibold mb-2">학습 스트릭</h3>
        <div className="flex items-center justify-around py-2">
          <div className="text-center">
            <p className="text-3xl font-bold text-[var(--warning)]">{streak.current}</p>
            <p className="text-[10px] text-[var(--muted)] mt-1">현재 연속</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[var(--success)]">{streak.longest}</p>
            <p className="text-[10px] text-[var(--muted)] mt-1">최장 기록</p>
          </div>
        </div>
        {streak.lastStudyDate && (
          <p className="text-[10px] text-center text-[var(--muted)] mt-2">
            마지막 학습: {streak.lastStudyDate}
          </p>
        )}
      </div>

      {/* Backup */}
      <div className="card space-y-3">
        <div>
          <h3 className="text-sm font-semibold mb-1">데이터 백업/복원</h3>
          <p className="text-[11px] text-[var(--muted)]">
            학습 기록, 북마크, 조회수, SRS 데이터를 JSON 파일로 내보내거나 복원해요.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary flex-1 text-xs py-2">Export</button>
          <label className="btn-secondary flex-1 text-xs py-2 text-center cursor-pointer">
            Import
            <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
          </label>
        </div>
        {importMessage && (
          <p className="text-[11px] text-[var(--accent)]">{importMessage}</p>
        )}
      </div>

      {/* Review page link */}
      <div className="card">
        <a href="/review" className="text-sm text-[var(--accent)]">틀린 문제 복습 →</a>
      </div>

      {/* Clear */}
      <div className="card space-y-3">
        <div>
          <h3 className="text-sm font-semibold mb-1">초기화</h3>
          <p className="text-[11px] text-[var(--muted)]">
            모든 학습 기록을 삭제해요. 백업 먼저 하는 걸 추천해요.
          </p>
        </div>
        <button onClick={handleClear} className="px-3 py-1.5 rounded-lg bg-[var(--error)] text-white text-xs font-medium">
          Clear All Progress
        </button>
      </div>

      {/* About */}
      <div className="card">
        <h3 className="text-sm font-semibold mb-2">About</h3>
        <p className="text-[11px] text-[var(--muted)] leading-relaxed">
          DevSenior는 시니어 개발자 수준의 지식을 트레이닝하는 학습 플랫폼이에요.
          카테고리별 문제, 플래시카드, 로드맵, 북마크, 간격 반복 학습을 지원해요.
        </p>
      </div>
    </div>
  );
}
