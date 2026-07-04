import { kv } from "@vercel/kv";
import { todayKey } from "./date";
import type { Challenge } from "./openai";

// @vercel/kv throws at call-time (not import-time) if these aren't set, so
// local dev without a provisioned KV store would otherwise 500 on every
// request. Detect that case and just skip caching instead of crashing —
// challenges will regenerate on every request, which is fine for local dev
// and expected to be replaced by real KV in production (see README).
const KV_CONFIGURED = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

function cacheKey(frameworkId: string): string {
  return `challenge:${todayKey()}:${frameworkId}`;
}

export async function getCachedChallenge(frameworkId: string): Promise<Challenge | null> {
  if (!KV_CONFIGURED) return null;

  try {
    const value = await kv.get<Challenge>(cacheKey(frameworkId));
    return value ?? null;
  } catch (err) {
    console.warn("KV read failed, continuing without cache:", err);
    return null;
  }
}

export async function setCachedChallenge(frameworkId: string, challenge: Challenge): Promise<void> {
  if (!KV_CONFIGURED) {
    console.warn(
      "KV_REST_API_URL / KV_REST_API_TOKEN not set — skipping cache write. " +
        "Every request will regenerate today's challenge. Set these (see .env.example) to fix."
    );
    return;
  }

  try {
    // Expire a little after a day so a slow clock skew can't strand a stale
    // entry — the date-scoped key is what actually rotates content daily.
    await kv.set(cacheKey(frameworkId), challenge, { ex: 60 * 60 * 30 });
  } catch (err) {
    console.warn("KV write failed, continuing without cache:", err);
  }
}
