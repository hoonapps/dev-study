"use client";

import { useState, useEffect } from "react";
import {
  clearAllProgress,
  exportData,
  importData,
  getStreak,
  getNotificationSettings,
  setNotificationSettings,
  StreakData,
  NotificationSettings,
} from "@/lib/storage";

export default function SettingsPage() {
  const [streak, setStreak] = useState<StreakData>({ current: 0, longest: 0, lastStudyDate: "" });
  const [importMessage, setImportMessage] = useState("");
  const [notif, setNotif] = useState<NotificationSettings>({ enabled: false, hour: 21, minute: 0 });
  const [permission, setPermission] = useState<string>("default");

  useEffect(() => {
    setStreak(getStreak());
    setNotif(getNotificationSettings());
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
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

  const handleToggleNotif = async (enabled: boolean) => {
    if (enabled) {
      if (!("Notification" in window)) {
        alert("이 브라우저는 알림을 지원하지 않아요.");
        return;
      }
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") {
        alert("알림 권한이 필요해요. 브라우저 설정에서 허용해주세요.");
        return;
      }

      // 테스트 알림
      new Notification("DevSenior", {
        body: "알림이 설정됐어요! 매일 21시에 알려드릴게요.",
        icon: "/dev-study/icon-192.png",
      });
    }
    const next = { ...notif, enabled };
    setNotif(next);
    setNotificationSettings(next);
  };

  const handleTimeChange = (hour: number, minute: number) => {
    const next = { ...notif, hour, minute };
    setNotif(next);
    setNotificationSettings(next);
  };

  const permissionLabel = {
    granted: "✓ 허용됨",
    denied: "✗ 차단됨 (브라우저 설정 필요)",
    default: "요청 전",
  }[permission] || "";

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

      {/* Notifications */}
      <div className="card space-y-3">
        <div>
          <h3 className="text-sm font-semibold mb-1">일일 학습 알림</h3>
          <p className="text-[11px] text-[var(--muted)]">
            매일 설정한 시간에 아직 학습 안 했으면 알려드려요.
          </p>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-xs">알림 켜기</span>
          <label className="relative inline-block w-10 h-5">
            <input
              type="checkbox"
              checked={notif.enabled}
              onChange={(e) => handleToggleNotif(e.target.checked)}
              className="peer sr-only"
            />
            <span className="absolute inset-0 rounded-full bg-[var(--card-border)] peer-checked:bg-[var(--accent)] transition" />
            <span className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition peer-checked:translate-x-5" />
          </label>
        </div>

        {notif.enabled && (
          <>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs">알림 시간</span>
              <input
                type="time"
                value={`${String(notif.hour).padStart(2, "0")}:${String(notif.minute).padStart(2, "0")}`}
                onChange={(e) => {
                  const [h, m] = e.target.value.split(":").map(Number);
                  handleTimeChange(h, m);
                }}
                className="bg-[var(--bg)] border border-[var(--card-border)] rounded px-2 py-1 text-xs"
              />
            </div>

            <p className="text-[10px] text-[var(--muted)]">
              권한: {permissionLabel}
            </p>
            <p className="text-[10px] text-[var(--warning)]">
              ⚠️ 브라우저 특성상 앱이 열려있거나 홈화면에 설치된 상태에서만 알림이 울려요.
              홈화면에 추가하면 가장 안정적이에요.
            </p>
          </>
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
