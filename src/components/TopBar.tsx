"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getNotificationSettings,
  setNotificationSettings,
  getStreak,
  NotificationSettings,
} from "@/lib/storage";

export default function TopBar() {
  const [open, setOpen] = useState(false);
  const [notif, setNotif] = useState<NotificationSettings>({ enabled: false, hour: 21, minute: 0 });
  const [streak, setStreak] = useState(0);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState("");

  useEffect(() => {
    setNotif(getNotificationSettings());
    setStreak(getStreak().current);
  }, [open]);

  const handleHardReload = () => {
    // 모든 캐시 삭제 후 재로드
    if ("caches" in window) {
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
    }
    window.location.reload();
  };

  const handleCheckUpdate = async () => {
    setChecking(true);
    setCheckResult("");
    try {
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
          setCheckResult(reg.waiting ? "새 버전 있음! 배너를 눌러 적용" : "최신 버전입니다");
        } else {
          setCheckResult("서비스 워커 없음");
        }
      }
    } catch {
      setCheckResult("업데이트 확인 실패");
    }
    setChecking(false);
    setTimeout(() => setCheckResult(""), 3000);
  };

  const toggleNotif = async () => {
    const next = !notif.enabled;
    if (next) {
      if (!("Notification" in window)) {
        alert("이 브라우저는 알림을 지원하지 않아요.");
        return;
      }
      const result = await Notification.requestPermission();
      if (result !== "granted") {
        alert("알림 권한이 필요해요. 브라우저 설정에서 허용해주세요.");
        return;
      }
      new Notification("DevSenior", {
        body: `알림이 켜졌어요! 매일 ${String(notif.hour).padStart(2, "0")}:${String(notif.minute).padStart(2, "0")}에 알려드릴게요.`,
        icon: "/dev-study/icon-192.png",
      });
    }
    const updated = { ...notif, enabled: next };
    setNotif(updated);
    setNotificationSettings(updated);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(":").map(Number);
    const updated = { ...notif, hour: h, minute: m };
    setNotif(updated);
    setNotificationSettings(updated);
  };

  const menuItems = [
    { href: "/", label: "홈", icon: "🏠" },
    { href: "/today", label: "오늘", icon: "☀️" },
    { href: "/stats", label: "통계", icon: "📊" },
    { href: "/roadmap", label: "학습 로드맵", icon: "🗺️" },
    { href: "/coding/roadmap", label: "코테 로드맵", icon: "💻" },
    { href: "/flashcards", label: "플래시카드", icon: "🃏" },
    { href: "/quiz", label: "퀴즈", icon: "❓" },
    { href: "/coding", label: "코딩 문제", icon: "⌨️" },
    { href: "/browse", label: "전체 둘러보기", icon: "🔍" },
    { href: "/bookmarks", label: "북마크", icon: "⭐" },
    { href: "/review", label: "오답 복습", icon: "📝" },
    { href: "/settings", label: "설정", icon: "⚙️" },
  ];

  return (
    <>
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 bg-[var(--bg)] border-b border-[var(--card-border)] z-40">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-base font-bold tracking-tight">
            Dev<span className="text-[var(--accent)]">Senior</span>
          </Link>
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <span className="text-[11px] text-[var(--warning)] font-semibold">
                🔥 {streak}
              </span>
            )}
            <button
              onClick={() => setOpen(true)}
              aria-label="Menu"
              className="p-1.5 -mr-1.5"
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-[var(--card)] border-l border-[var(--card-border)] z-50 overflow-y-auto">
            <div className="p-4 border-b border-[var(--card-border)] flex items-center justify-between">
              <span className="text-sm font-semibold">메뉴</span>
              <button onClick={() => setOpen(false)} className="text-lg" aria-label="Close">×</button>
            </div>

            {/* Quick settings */}
            <div className="p-4 border-b border-[var(--card-border)] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold">일일 알림</p>
                  <p className="text-[10px] text-[var(--muted)]">매일 학습 리마인더</p>
                </div>
                <label className="relative inline-block w-10 h-5 shrink-0">
                  <input
                    type="checkbox"
                    checked={notif.enabled}
                    onChange={toggleNotif}
                    className="peer sr-only"
                  />
                  <span className="absolute inset-0 rounded-full bg-[var(--card-border)] peer-checked:bg-[var(--accent)] transition" />
                  <span className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition peer-checked:translate-x-5" />
                </label>
              </div>

              {notif.enabled && (
                <div className="flex items-center justify-between">
                  <span className="text-xs">알림 시간</span>
                  <input
                    type="time"
                    value={`${String(notif.hour).padStart(2, "0")}:${String(notif.minute).padStart(2, "0")}`}
                    onChange={handleTimeChange}
                    className="bg-[var(--bg)] border border-[var(--card-border)] rounded px-2 py-0.5 text-xs"
                  />
                </div>
              )}
            </div>

            {/* Menu items */}
            <nav className="p-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--card-border)] transition"
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* App controls */}
            <div className="p-4 border-t border-[var(--card-border)] space-y-2">
              <button
                onClick={handleCheckUpdate}
                disabled={checking}
                className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--card-border)] transition text-sm disabled:opacity-50"
              >
                <span className="text-base">🔄</span>
                <span>{checking ? "확인 중..." : "업데이트 확인"}</span>
              </button>
              {checkResult && (
                <p className="text-[10px] text-[var(--accent)] px-3">{checkResult}</p>
              )}
              <button
                onClick={handleHardReload}
                className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--card-border)] transition text-sm"
              >
                <span className="text-base">⚡</span>
                <span>강제 새로고침</span>
              </button>
              <p className="text-[10px] text-[var(--muted)] px-3 leading-relaxed">
                데이터(학습 기록, 북마크 등)는 새로고침/업데이트에도 유지됩니다.
                만일을 대비해 설정에서 Export 백업을 권장해요.
              </p>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
