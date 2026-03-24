import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevSenior",
  description: "10년차 시니어 개발자 수준의 지식을 만드는 학습 플랫폼",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <main className="max-w-lg mx-auto px-4 pt-4 pb-20 min-h-screen">
          {children}
        </main>

        {/* Bottom Tab Bar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg)] border-t border-[var(--card-border)] z-50">
          <div className="max-w-lg mx-auto flex justify-around py-2">
            <a href="/" className="flex flex-col items-center gap-0.5 px-2 py-1 text-[var(--muted)] hover:text-[var(--accent)] transition">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
              <span className="text-[10px]">Home</span>
            </a>
            <a href="/quiz" className="flex flex-col items-center gap-0.5 px-2 py-1 text-[var(--muted)] hover:text-[var(--accent)] transition">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
              <span className="text-[10px]">Quiz</span>
            </a>
            <a href="/flashcards" className="flex flex-col items-center gap-0.5 px-2 py-1 text-[var(--muted)] hover:text-[var(--accent)] transition">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
              <span className="text-[10px]">Cards</span>
            </a>
            <a href="/browse" className="flex flex-col items-center gap-0.5 px-2 py-1 text-[var(--muted)] hover:text-[var(--accent)] transition">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <span className="text-[10px]">Browse</span>
            </a>
            <a href="/review" className="flex flex-col items-center gap-0.5 px-2 py-1 text-[var(--muted)] hover:text-[var(--accent)] transition">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
              <span className="text-[10px]">Review</span>
            </a>
          </div>
        </nav>
      </body>
    </html>
  );
}
