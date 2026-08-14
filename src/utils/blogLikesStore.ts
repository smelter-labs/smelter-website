import { getSecret } from "astro:env/server";
import { type VercelKV, createClient } from "@vercel/kv";

let client: VercelKV | null | undefined;

/**
 * KV client for the blog like counters, or `null` when the store is not
 * connected (local dev without `KV_REST_API_*`). Callers degrade to a read-only
 * zero instead of failing the page.
 */
export function blogLikesStore(): VercelKV | null {
  if (client !== undefined) return client;

  const url = getSecret("KV_REST_API_URL");
  const token = getSecret("KV_REST_API_TOKEN");

  if (!url || !token) {
    console.warn("[blog-likes] KV not configured — likes are disabled");
    client = null;
    return client;
  }

  client = createClient({ url, token });
  return client;
}

/**
 * Stable per-visitor id used to keep one like per person per post. IP + UA
 * hashed with SHA-256 — never stored in the clear, and not reversible into
 * either input on its own.
 */
export async function visitorFingerprint(request: Request): Promise<string> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${ip}|${userAgent}`)
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
