import type { PublicPublishedEntry } from "@luno-cms/sdk";
import { LunoClient } from "@luno-cms/sdk";

/** 一覧 API（`include_snapshot=true`）の published 拡張 */
export type ListItemPublished = {
  revisionId: string;
  revision: number;
  updatedAt: string;
  snapshot?: Record<string, unknown>;
  mediaUrls?: Record<string, string>;
};

export const LIST_WITH_SNAPSHOT_QUERY = { include_snapshot: "true" } as const;

function assetIdFromRef(ref: string): string | null {
  const prefix = "luno-asset:";
  if (!ref.startsWith(prefix)) return null;
  const parts = ref.slice(prefix.length).split(":");
  return parts[parts.length - 1] ?? null;
}

export function pickListThumbnail(
  published: ListItemPublished,
  luno?: LunoClient,
): string | null {
  const thumb = published.snapshot?.thumbnail;
  if (typeof thumb !== "string") return null;
  const assetId = assetIdFromRef(thumb);
  if (assetId && published.mediaUrls?.[assetId]) {
    return published.mediaUrls[assetId]!;
  }
  return luno ? resolveThumbnailUrl(thumb, luno) : null;
}

export function pickTitle(snapshot: Record<string, unknown> | undefined): string {
  const t = snapshot?.title;
  if (typeof t === "string" && t.trim()) return t.trim();
  return "Untitled";
}

export function pickExcerpt(snapshot: Record<string, unknown> | undefined): string {
  const excerpt = snapshot?.excerpt;
  if (typeof excerpt === "string" && excerpt.trim()) return excerpt.trim();
  const body = snapshot?.body;
  if (typeof body === "string" && body.trim()) return body.trim().slice(0, 160);
  if (body && typeof body === "object") return "リッチテキスト記事";
  return "";
}

export function pickCategory(snapshot: Record<string, unknown> | undefined): string | null {
  const category = snapshot?.category;
  return typeof category === "string" && category.trim() ? category.trim() : null;
}

export function pickTags(snapshot: Record<string, unknown> | undefined): string[] {
  const tags = snapshot?.tags;
  if (!Array.isArray(tags)) return [];
  return tags.filter((t): t is string => typeof t === "string" && t.trim().length > 0);
}

export function pickDescription(snapshot: Record<string, unknown> | undefined): string {
  const excerpt = pickExcerpt(snapshot);
  if (excerpt) return excerpt.slice(0, 280);
  return "";
}

export function pickOgDescription(entry: PublicPublishedEntry): string {
  const d = pickDescription(entry.published.snapshot as Record<string, unknown>);
  return d.length > 0 ? d : `${entry.formSet.name} — ${entry.entry.slug}`;
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" });
}

export function resolveThumbnailUrl(
  thumb: unknown,
  luno: LunoClient,
): string | null {
  if (typeof thumb !== "string" || !thumb.startsWith("luno-asset:")) return null;
  try {
    return luno.media.getUrl(thumb);
  } catch {
    return null;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type TiptapNode = {
  type?: string;
  text?: string;
  content?: TiptapNode[];
  attrs?: { level?: number };
};

function renderTiptapNode(node: TiptapNode): string {
  if (node.type === "text" && typeof node.text === "string") {
    return escapeHtml(node.text);
  }
  const inner = (node.content ?? []).map(renderTiptapNode).join("");
  switch (node.type) {
    case "paragraph":
      return inner ? `<p>${inner}</p>` : "";
    case "heading": {
      const level = Math.min(4, Math.max(2, node.attrs?.level ?? 2));
      return inner ? `<h${level}>${inner}</h${level}>` : "";
    }
    case "hardBreak":
      return "<br />";
    case "bulletList":
      return `<ul>${inner}</ul>`;
    case "orderedList":
      return `<ol>${inner}</ol>`;
    case "listItem":
      return `<li>${inner}</li>`;
    case "blockquote":
      return `<blockquote>${inner}</blockquote>`;
    default:
      return inner;
  }
}

/** Plain text or simple Tiptap JSON → HTML for starter display */
export function bodyToHtml(body: unknown): string | null {
  if (typeof body === "string" && body.trim()) {
    return body
      .trim()
      .split(/\n{2,}/)
      .map((p) => `<p>${escapeHtml(p.trim()).replace(/\n/g, "<br />")}</p>`)
      .join("");
  }
  if (body && typeof body === "object" && (body as TiptapNode).type === "doc") {
    const html = renderTiptapNode(body as TiptapNode);
    return html || null;
  }
  return null;
}
