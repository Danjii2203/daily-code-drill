import { kv } from "@vercel/kv";
import { todayKey } from "./date";
import type { Challenge } from "./claude";

function cacheKey(frameworkId: string): string {
  return `challenge:${todayKey()}:${frameworkId}`;
}

export async function getCachedChallenge(frameworkId: string): Promise<Challenge | null> {
  const value = await kv.get<Challenge>(cacheKey(frameworkId));
  return value ?? null;
}

export async function setCachedChallenge(frameworkId: string, challenge: Challenge): Promise<void> {
  // Expire a little after a day so a slow clock skew can't strand a stale
  // entry — the date-scoped key is what actually rotates content daily.
  await kv.set(cacheKey(frameworkId), challenge, { ex: 60 * 60 * 30 });
}
