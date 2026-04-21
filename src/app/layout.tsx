import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import NotificationManager from "@/components/NotificationManager";
import TopBar from "@/components/TopBar";
import UpdatePrompt from "@/components/UpdatePrompt";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevSenior",
  description: "시니어 개발자 지식 트레이닝",
  manifest: "/dev-study/manifest.json",
  icons: {
    icon: "/dev-study/icon-192.png",
    apple: "/dev-study/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DevSenior",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/dev-study/sw.js', { scope: '/dev-study/' }).catch(() => {});
              });
            }
          `}
        </Script>
        <NotificationManager />
        <UpdatePrompt />
        <TopBar />
        <main className="max-w-lg mx-auto px-4 pt-16 pb-20 min-h-screen">
          {children}
        </main>

        {/* Bottom Tab Bar - 4 essential tabs */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg)] border-t border-[var(--card-border)] z-40">
          <div className="max-w-lg mx-auto grid grid-cols-4 py-2">
            <Link href="/today" className="flex flex-col items-center gap-0.5 py-1 text-[var(--muted)] hover:text-[var(--accent)] transition">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              <span className="text-[10px]">Today</span>
            </Link>
            <Link href="/flashcards" className="flex flex-col items-center gap-0.5 py-1 text-[var(--muted)] hover:text-[var(--accent)] transition">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
              <span className="text-[10px]">Cards</span>
            </Link>
            <Link href="/coding" className="flex flex-col items-center gap-0.5 py-1 text-[var(--muted)] hover:text-[var(--accent)] transition">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              <span className="text-[10px]">Coding</span>
            </Link>
            <Link href="/quiz" className="flex flex-col items-center gap-0.5 py-1 text-[var(--muted)] hover:text-[var(--accent)] transition">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
              <span className="text-[10px]">Quiz</span>
            </Link>
          </div>
        </nav>
      </body>
    </html>
  );
}
