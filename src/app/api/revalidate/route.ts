import { revalidatePath, revalidateTag } from "next/cache";
import { verifyLunoWebhookSignature } from "@/lib/verify-luno-webhook";

export async function POST(request: Request) {
  const secret = process.env.LUNO_REVALIDATE_SECRET?.trim();
  const raw = await request.text();
  const sig = request.headers.get("x-luno-signature");
  if (!(await verifyLunoWebhookSignature(raw, sig, secret))) {
    return new Response("invalid signature", { status: 401 });
  }

  let payload: { entry_slug?: string };
  try {
    payload = JSON.parse(raw) as { entry_slug?: string };
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  revalidateTag("blog-list");
  revalidatePath("/blog");
  if (typeof payload.entry_slug === "string" && payload.entry_slug.length > 0) {
    revalidateTag(`blog-${payload.entry_slug}`);
    revalidatePath(`/blog/${encodeURIComponent(payload.entry_slug)}`);
  }

  return Response.json({ revalidated: true, now: Date.now() });
}
