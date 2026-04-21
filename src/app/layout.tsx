import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
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
        <main className="max-w-lg mx-auto px-4 pt-4 pb-20 min-h-screen">
          {children}
        </main>

        {/* Bottom Tab Bar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg)] border-t border-[var(--card-border)] z-50">
          <div className="max-w-lg mx-auto grid grid-cols-6 py-2">
            <Link href="/" className="flex flex-col items-center gap-0.5 py-1 text-[var(--muted)] hover:text-[var(--accent)] transition">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
              <span className="text-[9px]">Home</span>
            </Link>
            <Link href="/roadmap" className="flex flex-col items-center gap-0.5 py-1 text-[var(--muted)] hover:text-[var(--accent)] transition">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
              <span className="text-[9px]">Road</span>
            </Link>
            <Link href="/flashcards" className="flex flex-col items-center gap-0.5 py-1 text-[var(--muted)] hover:text-[var(--accent)] transition">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
              <span className="text-[9px]">Cards</span>
            </Link>
            <Link href="/quiz" className="flex flex-col items-center gap-0.5 py-1 text-[var(--muted)] hover:text-[var(--accent)] transition">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
              <span className="text-[9px]">Quiz</span>
            </Link>
            <Link href="/browse" className="flex flex-col items-center gap-0.5 py-1 text-[var(--muted)] hover:text-[var(--accent)] transition">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <span className="text-[9px]">Browse</span>
            </Link>
            <Link href="/bookmarks" className="flex flex-col items-center gap-0.5 py-1 text-[var(--muted)] hover:text-[var(--accent)] transition">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span className="text-[9px]">Saved</span>
            </Link>
          </div>
        </nav>
      </body>
    </html>
  );
}
