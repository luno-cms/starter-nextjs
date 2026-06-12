import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty-state">
      <h1 style={{ marginBottom: "0.5rem" }}>404</h1>
      <p style={{ marginBottom: "1rem" }}>記事が見つかりませんでした。</p>
      <Link href="/blog">← 記事一覧へ</Link>
    </div>
  );
}
