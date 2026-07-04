"use client";

import { useCallback, useEffect, useState } from "react";

const DRILL_SECONDS = 10 * 60;

function storageKey(frameworkId: string, dateKey: string): string {
  return `drill-start:${dateKey}:${frameworkId}`;
}

interface UseTimerResult {
  secondsRemaining: number;
  isLocked: boolean;
  /** Call once when the challenge is first shown / retried to (re)start the clock. */
  start: () => void;
}

export function useTimer(frameworkId: string, dateKey: string): UseTimerResult {
  const key = storageKey(frameworkId, dateKey);
  const [secondsRemaining, setSecondsRemaining] = useState(DRILL_SECONDS);
  const [isLocked, setIsLocked] = useState(false);

  const computeRemaining = useCallback(() => {
    const startRaw = window.localStorage.getItem(key);
    if (!startRaw) return DRILL_SECONDS;
    const startedAt = Number(startRaw);
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    return Math.max(0, DRILL_SECONDS - elapsed);
  }, [key]);

  useEffect(() => {
    // On mount (including after a refresh), pick up wherever the stored
    // start-time says we should be rather than resetting to 10:00.
    const remaining = computeRemaining();
    setSecondsRemaining(remaining);
    setIsLocked(remaining <= 0);

    const interval = window.setInterval(() => {
      const next = computeRemaining();
      setSecondsRemaining(next);
      if (next <= 0) setIsLocked(true);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [computeRemaining]);

  const start = useCallback(() => {
    window.localStorage.setItem(key, String(Date.now()));
    setSecondsRemaining(DRILL_SECONDS);
    setIsLocked(false);
  }, [key]);

  return { secondsRemaining, isLocked, start };
}

export { DRILL_SECONDS };
