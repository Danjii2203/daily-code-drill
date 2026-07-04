"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getFramework } from "@/lib/frameworks";
import type { Challenge } from "@/lib/openai";
import { useTimer, DRILL_SECONDS } from "@/hooks/useTimer";
import { CodeEditor } from "@/components/CodeEditor";
import { Timer } from "@/components/Timer";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { todayKey } from "@/lib/date";

type LoadState = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; challenge: Challenge };

export default function ChallengePage() {
  const params = useParams<{ framework: string }>();
  const framework = getFramework(params.framework);
  const dateKey = useMemo(() => todayKey(), []);

  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { secondsRemaining, isLocked, start } = useTimer(framework?.id ?? "unknown", dateKey);

  useEffect(() => {
    if (!framework) return;
    let cancelled = false;

    fetch(`/api/challenge?framework=${framework.id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error ?? "Failed to load challenge.");
        return res.json() as Promise<Challenge>;
      })
      .then((challenge) => {
        if (!cancelled) {
          setLoad({ status: "ready", challenge });
          start(); // begins (or resumes, via localStorage) the 10-minute clock
        }
      })
      .catch((err) => {
        if (!cancelled) setLoad({ status: "error", message: err.message });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [framework?.id]);

  if (!framework) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-sm text-critical">Unknown framework.</p>
        <Link href="/" className="text-sm text-amber underline">
          Back to framework list
        </Link>
      </main>
    );
  }

  async function handleSubmit() {
    if (load.status !== "ready") return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frameworkId: framework!.id,
          challenge: load.challenge,
          code,
          completedEarly: secondsRemaining > 0,
          secondsRemainingAtSubmit: secondsRemaining,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Review failed.");
      const data = (await res.json()) as { feedback: string };
      setFeedback(data.feedback);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetry() {
    setCode("");
    setFeedback(null);
    setSubmitError(null);
    start();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-xs text-muted hover:text-foreground">
          ← all frameworks
        </Link>
        <Timer secondsRemaining={load.status === "ready" ? secondsRemaining : DRILL_SECONDS} />
      </div>

      {load.status === "loading" && <p className="text-sm text-muted">Loading today's {framework.label} challenge…</p>}

      {load.status === "error" && <p className="text-sm text-critical">{load.message}</p>}

      {load.status === "ready" && (
        <>
          <h1 className="mb-2 text-xl font-semibold">{load.challenge.title}</h1>
          <div className="mb-6 whitespace-pre-wrap rounded-md border border-border bg-surface p-4 text-sm text-muted">
            {load.challenge.prompt}
          </div>

          {feedback ? (
            <FeedbackPanel feedback={feedback} completedEarly={secondsRemaining > 0} onRetry={handleRetry} />
          ) : (
            <>
              <div className="h-80">
                <CodeEditor value={code} onChange={setCode} language={framework.language} readOnly={isLocked} />
              </div>
              <div className="mt-4 flex items-center gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || code.trim().length === 0}
                  className="rounded-md bg-amber px-5 py-2 text-sm font-medium text-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? "Reviewing…" : isLocked ? "Submit what you have" : "Submit"}
                </button>
                {isLocked && (
                  <span className="text-xs text-critical">Time's up — the editor is locked, but you can still submit.</span>
                )}
                {submitError && <span className="text-xs text-critical">{submitError}</span>}
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}
