import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevSenior - Level Up Your Dev Knowledge",
  description: "10년차 시니어 개발자 수준의 지식을 만드는 학습 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <nav className="border-b border-[var(--card-border)] px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <a href="/" className="text-xl font-bold tracking-tight">
              Dev<span className="text-[var(--accent)]">Senior</span>
            </a>
            <div className="flex gap-4 text-sm">
              <a href="/quiz" className="hover:text-[var(--accent)] transition">Quiz</a>
              <a href="/flashcards" className="hover:text-[var(--accent)] transition">Cards</a>
              <a href="/browse" className="hover:text-[var(--accent)] transition">Browse</a>
              <a href="/review" className="hover:text-[var(--accent)] transition">Review</a>
              <a href="/settings" className="hover:text-[var(--accent)] transition">Settings</a>
            </div>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
