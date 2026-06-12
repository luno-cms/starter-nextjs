/**
 * LUNO 外向き Webhook の `X-Luno-Signature: sha256=<hex>` を検証する。
 * 本文は **raw JSON 文字列**（改行・空白を変えないこと）で HMAC する。
 */
async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  const bytes = new Uint8Array(sig);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}

export async function verifyLunoWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string | undefined
): Promise<boolean> {
  if (!secret || !signatureHeader) return false;
  const m = /^sha256=([0-9a-f]+)$/i.exec(signatureHeader.trim());
  if (!m) return false;
  const expected = await hmacSha256Hex(secret, rawBody);
  return timingSafeEqualHex(expected.toLowerCase(), m[1].toLowerCase());
}
