// Cache version - bump this on every deploy to force update detection
const CACHE_VERSION = "v3";
const CACHE = `devsenior-${CACHE_VERSION}`;
const BASE = "/dev-study";

self.addEventListener("install", () => {
  // 새 SW가 즉시 설치되지만 activate는 대기 상태로 감
  // (self.skipWaiting()은 message handler에서 호출)
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      // 오래된 캐시 삭제
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

// 앱에서 "업데이트 적용" 보내면 skipWaiting + reload
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  // HTML / 네비게이션: 네트워크 우선 (최신 버전 우선)
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return resp;
        })
        .catch(() =>
          caches.match(e.request).then((r) => r || caches.match(BASE + "/"))
        )
    );
    return;
  }

  // 정적 자원: 캐시 우선
  e.respondWith(
    caches.match(e.request).then(
      (cached) =>
        cached ||
        fetch(e.request).then((resp) => {
          if (resp.ok && resp.type === "basic") {
            const copy = resp.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return resp;
        })
    )
  );
});

// 알림 클릭
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl =
    (event.notification.data && event.notification.data.url) || BASE + "/today/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(BASE) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
