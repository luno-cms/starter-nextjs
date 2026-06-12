import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LunoClient } from "@luno-cms/sdk";
import { formSetSlug, createLunoServer } from "@/lib/luno";
import {
  bodyToHtml,
  formatDate,
  pickCategory,
  pickOgDescription,
  pickTags,
  pickTitle,
  resolveThumbnailUrl,
} from "@/lib/snapshot";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const url = process.env.LUNO_API_URL?.trim();
  const key = process.env.LUNO_PUBLIC_API_KEY?.trim();
  if (!url || !key) return [];
  try {
    const luno = new LunoClient({ apiUrl: url, apiKey: key });
    const { items } = await luno.entries.list(formSetSlug, { page: 1, limit: 200 });
    return items.map((it) => ({ slug: it.entry.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const luno = createLunoServer({ tags: [`blog-${slug}`], revalidateSeconds: 60 });
    const entry = await luno.entries.get(formSetSlug, slug);
    const title = pickTitle(entry.published.snapshot as Record<string, unknown>);
    return {
      title,
      description: pickOgDescription(entry),
      openGraph: { title, description: pickOgDescription(entry) },
    };
  } catch {
    return { title: slug };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  let entry;
  try {
    const luno = createLunoServer({ tags: [`blog-${slug}`], revalidateSeconds: 60 });
    entry = await luno.entries.get(formSetSlug, slug);
  } catch {
    notFound();
  }

  const snap = entry.published.snapshot as Record<string, unknown>;
  const title = pickTitle(snap);
  const category = pickCategory(snap);
  const tags = pickTags(snap);
  const html = bodyToHtml(snap.body);

  const apiUrl = process.env.LUNO_API_URL?.trim();
  const apiKey = process.env.LUNO_PUBLIC_API_KEY?.trim();
  let thumbUrl: string | null = null;
  if (apiUrl && snap.thumbnail) {
    try {
      thumbUrl = resolveThumbnailUrl(
        snap.thumbnail,
        new LunoClient({ apiUrl, apiKey: apiKey || undefined }),
      );
    } catch {
      thumbUrl = null;
    }
  }

  return (
    <article>
      <p className="article-back">
        <Link href="/blog">← 記事一覧</Link>
      </p>

      <header className="article-header">
        <h1>{title}</h1>
        <div className="article-meta">
          {category ? <span className="badge">{category}</span> : null}
          <time dateTime={entry.published.updatedAt}>
            更新 {formatDate(entry.published.updatedAt)}
          </time>
        </div>
        {tags.length > 0 ? (
          <ul className="tag-list" style={{ marginTop: "0.75rem" }}>
            {tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        ) : null}
      </header>

      {thumbUrl ? (
        <figure className="article-cover">
          <img src={thumbUrl} alt="" />
        </figure>
      ) : null}

      {html ? (
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div className="empty-state">本文フィールド（body）が空です。</div>
      )}
    </article>
  );
}
