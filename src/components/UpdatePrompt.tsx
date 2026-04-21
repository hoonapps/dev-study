"use client";

import { useEffect, useState } from "react";

export default function UpdatePrompt() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // SW 등록 완료 후 waiting worker 체크
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;

      // 이미 대기 중인 worker가 있으면 (다른 탭에서 업데이트됨)
      if (reg.waiting && navigator.serviceWorker.controller) {
        setWaitingWorker(reg.waiting);
        setVisible(true);
      }

      // 새 SW 설치 감지
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // 기존 SW가 있고, 새 SW가 설치 완료된 상태 = 업데이트 대기
            setWaitingWorker(newWorker);
            setVisible(true);
          }
        });
      });

      // 주기적으로 업데이트 체크 (앱이 오래 열려있을 때)
      const checkInterval = setInterval(() => {
        reg.update().catch(() => {});
      }, 60 * 60 * 1000); // 1시간마다

      return () => clearInterval(checkInterval);
    });

    // controller 변경 (새 SW 활성화됨) → 페이지 reload
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }, []);

  const handleUpdate = () => {
    if (!waitingWorker) return;
    waitingWorker.postMessage("SKIP_WAITING");
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed left-4 right-4 bottom-20 z-50 mx-auto max-w-md bg-[var(--accent)] text-white rounded-lg shadow-lg p-3 flex items-center gap-3"
      role="alert"
    >
      <span className="text-xl shrink-0">🎉</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">새 버전 업데이트 가능</p>
        <p className="text-[11px] opacity-90">데이터는 그대로 유지돼요</p>
      </div>
      <button
        onClick={handleDismiss}
        className="text-[11px] px-2 py-1 rounded bg-white/10 shrink-0"
      >
        나중에
      </button>
      <button
        onClick={handleUpdate}
        className="text-[11px] font-semibold px-3 py-1.5 rounded bg-white text-[var(--accent)] shrink-0"
      >
        적용
      </button>
    </div>
  );
}
