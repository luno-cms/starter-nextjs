import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUNO starter — Next.js",
  description: "Blog powered by LUNO public API",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header className="site-header">
          <div className="site-header__inner">
            <Link href="/blog" className="site-logo">
              LUNO <span>Blog</span>
            </Link>
            <nav className="site-nav" aria-label="Main">
              <Link href="/blog">記事一覧</Link>
            </nav>
          </div>
        </header>
        <main className="site-main">{children}</main>
        <footer className="site-footer">
          Powered by{" "}
          <a href="https://luno.app" target="_blank" rel="noopener noreferrer">
            LUNO
          </a>
        </footer>
      </body>
    </html>
  );
}
