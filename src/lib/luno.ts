import { LunoClient } from "@luno-cms/sdk";

/** LUNO フォームセット slug（`LUNO_FORM_SET_SLUG`。旧名 `LUNO_BLOG_FORM_SET_SLUG` も可） */
export const formSetSlug =
  process.env.LUNO_FORM_SET_SLUG?.trim() ||
  process.env.LUNO_BLOG_FORM_SET_SLUG?.trim() ||
  "blog";

export function createLunoServer(cache?: { tags: readonly string[]; revalidateSeconds?: number }) {
  const apiUrl = process.env.LUNO_API_URL?.trim();
  if (!apiUrl) {
    throw new Error("Missing LUNO_API_URL");
  }
  const apiKey = process.env.LUNO_PUBLIC_API_KEY?.trim();
  const nextInit =
    cache && cache.tags.length > 0
      ? ({
          next: {
            tags: [...cache.tags],
            revalidate: cache.revalidateSeconds ?? 60,
          },
        } as RequestInit)
      : undefined;
  return new LunoClient({
    apiUrl,
    apiKey: apiKey || undefined,
    defaultRequestInit: nextInit,
  });
}
