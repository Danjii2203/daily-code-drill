import { Redis } from "@upstash/redis";
import { todayKey } from "./date";
import type { Challenge } from "./openai";

// Vercel KV was sunset; Upstash Redis (via Vercel Marketplace) is the
// replacement. Redis.fromEnv() reads UPSTASH_REDIS_REST_URL /
// UPSTASH_REDIS_REST_TOKEN, which Vercel auto-populates once you connect
// the Upstash integration to this project.
const REDIS_CONFIGURED = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
const redis = REDIS_CONFIGURED ? Redis.fromEnv() : null;

function cacheKey(frameworkId: string): string {
  return `challenge:${todayKey()}:${frameworkId}`;
}

export async function getCachedChallenge(frameworkId: string): Promise<Challenge | null> {
  if (!redis) return null;

  try {
    const value = await redis.get<Challenge>(cacheKey(frameworkId));
    return value ?? null;
  } catch (err) {
    console.warn("Redis read failed, continuing without cache:", err);
    return null;
  }
}

export async function setCachedChallenge(frameworkId: string, challenge: Challenge): Promise<void> {
  if (!redis) {
    console.warn(
      "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — skipping cache write. " +
        "Every request will regenerate today's challenge. Set these (see .env.example) to fix."
    );
    return;
  }

  try {
    // Expire a little after a day so a slow clock skew can't strand a stale
    // entry — the date-scoped key is what actually rotates content daily.
    await redis.set(cacheKey(frameworkId), challenge, { ex: 60 * 60 * 30 });
  } catch (err) {
    console.warn("Redis write failed, continuing without cache:", err);
  }
}
