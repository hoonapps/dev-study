"use client";

import { useEffect } from "react";
import {
  getNotificationSettings,
  getLastNotifDate,
  setLastNotifDate,
  getStreak,
  getDueCards,
} from "@/lib/storage";

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function buildMessage(): { title: string; body: string } {
  const streak = getStreak();
  const due = getDueCards();
  const today = getTodayDate();
  const studiedToday = streak.lastStudyDate === today;

  if (studiedToday) {
    return {
      title: "DevSenior 학습 체크",
      body: `🔥 ${streak.current}일 연속 학습 중! 오늘도 수고했어요.`,
    };
  }

  if (due.length > 0) {
    return {
      title: "⏰ 오늘의 복습",
      body: `복습할 카드 ${due.length}개가 대기 중이에요. 스트릭 유지해요!`,
    };
  }

  if (streak.current > 0) {
    return {
      title: "🔥 스트릭 유지!",
      body: `${streak.current}일 연속 학습 중. 오늘도 잠깐이라도 펼쳐봐요.`,
    };
  }

  return {
    title: "DevSenior",
    body: "오늘 10분만 투자해봐요. 시니어 지식은 작은 습관에서 시작돼요.",
  };
}

async function showNotification() {
  if (typeof window === "undefined") return;
  if (Notification.permission !== "granted") return;

  const { title, body } = buildMessage();

  // Service Worker를 통해 알림 표시 (더 안정적)
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification(title, {
          body,
          icon: "/dev-study/icon-192.png",
          badge: "/dev-study/icon-192.png",
          tag: "devsenior-daily",
          data: { url: "/dev-study/today/" },
        });
        return;
      }
    } catch {
      // fallback
    }
  }

  new Notification(title, { body, icon: "/dev-study/icon-192.png" });
}

export default function NotificationManager() {
  useEffect(() => {
    const settings = getNotificationSettings();
    if (!settings.enabled) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const checkAndNotify = () => {
      const now = new Date();
      const today = getTodayDate();
      const lastShown = getLastNotifDate();

      // 오늘 이미 알림 보냈으면 스킵
      if (lastShown === today) return;

      const hour = now.getHours();
      const minute = now.getMinutes();
      const settings = getNotificationSettings();

      // 설정된 시간 이후이고 오늘 학습 안 했으면 알림
      if (hour > settings.hour || (hour === settings.hour && minute >= settings.minute)) {
        const streak = getStreak();
        if (streak.lastStudyDate !== today) {
          showNotification();
          setLastNotifDate(today);
        }
      }
    };

    // 앱 로드 시 즉시 체크
    checkAndNotify();

    // 매 분마다 체크
    const interval = setInterval(checkAndNotify, 60 * 1000);

    // 앱이 visible 상태가 될 때마다 체크 (탭 전환 대응)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") checkAndNotify();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return null;
}
