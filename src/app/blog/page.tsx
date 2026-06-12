import Link from "next/link";
import { LunoClient } from "@luno-cms/sdk";
import { formSetSlug, createLunoServer } from "@/lib/luno";
import {
  formatDate,
  LIST_WITH_SNAPSHOT_QUERY,
  pickCategory,
  pickExcerpt,
  pickListThumbnail,
  pickTitle,
  type ListItemPublished,
} from "@/lib/snapshot";

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const limit = 9;
  const luno = createLunoServer({ tags: ["blog-list"], revalidateSeconds: 60 });
  const { items, total } = await luno.entries.list(formSetSlug, {
    page,
    limit,
    extraQuery: LIST_WITH_SNAPSHOT_QUERY,
  });
  const pages = Math.max(1, Math.ceil(total / limit));

  const apiUrl = process.env.LUNO_API_URL?.trim();
  const apiKey = process.env.LUNO_PUBLIC_API_KEY?.trim();
  const mediaClient =
    apiUrl && apiKey ? new LunoClient({ apiUrl, apiKey }) : null;

  return (
    <>
      <section className="page-hero">
        <h1>記事一覧</h1>
        <p>LUNO で公開した記事を Next.js から取得して表示しています。</p>
      </section>

      <div className="page-meta">
        <span>{total} 件</span>
        <span>·</span>
        <span>
          {page} / {pages} ページ
        </span>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          公開済みの記事がありません。LUNO 管理画面で記事を公開してください。
        </div>
      ) : (
        <ul className="post-grid">
          {items.map((row) => {
            const published = row.published as ListItemPublished;
            const snap = published.snapshot ?? {};
            const title = pickTitle(snap) || row.entry.slug;
            const excerpt = pickExcerpt(snap);
            const category = pickCategory(snap);
            const thumbUrl = pickListThumbnail(published, mediaClient ?? undefined);

            return (
              <li key={row.entry.id} className="post-card">
                <Link
                  href={`/blog/${encodeURIComponent(row.entry.slug)}`}
                  className="post-card__link"
                >
                  <div className="post-card__thumb">
                    {thumbUrl ? <img src={thumbUrl} alt="" /> : null}
                  </div>
                  <div className="post-card__body">
                    <div className="post-card__meta">
                      {category ? <span className="badge">{category}</span> : null}
                      <time dateTime={row.published.updatedAt}>
                        {formatDate(row.published.updatedAt)}
                      </time>
                    </div>
                    <h2 className="post-card__title">{title}</h2>
                    {excerpt ? <p className="post-card__excerpt">{excerpt}</p> : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <nav className="pagination" aria-label="Pagination">
        {page > 1 ? (
          <Link href={`/blog?page=${page - 1}`}>← 前へ</Link>
        ) : (
          <span className="is-disabled">← 前へ</span>
        )}
        {page < pages ? (
          <Link href={`/blog?page=${page + 1}`}>次へ →</Link>
        ) : (
          <span className="is-disabled">次へ →</span>
        )}
      </nav>
    </>
  );
}
