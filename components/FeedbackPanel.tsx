"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import type { Framework } from "@/lib/frameworks";

interface FeedbackPanelProps {
  feedback: string;
  solution: string;
  language: Framework["language"];
  completedEarly: boolean;
  onRetry: () => void;
}

export function FeedbackPanel({ feedback, solution, language, completedEarly, onRetry }: FeedbackPanelProps) {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="rounded-md border border-border bg-surface p-6">
      <p className="mb-4 text-xs uppercase tracking-wide text-muted">
        {completedEarly ? "Reviewed — submitted with time to spare" : "Reviewed — time ran out before you finished"}
      </p>
      <div className="space-y-3 text-sm leading-relaxed text-foreground">
        {feedback.split("\n\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {solution && (
        <div className="mt-6">
          <button
            onClick={() => setShowSolution((v) => !v)}
            className="rounded-md border border-border px-4 py-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            {showSolution ? "Hide result" : "See result"}
          </button>
          {showSolution && (
            <div className="mt-3 min-h-64">
              <CodeEditor value={solution} onChange={() => {}} language={language} readOnly />
            </div>
          )}
        </div>
      )}

      <button
        onClick={onRetry}
        className="mt-6 rounded-md border border-amber-dim bg-amber/10 px-4 py-2 text-sm text-amber transition-colors hover:bg-amber/20"
      >
        Try again — fresh timer, same challenge
      </button>
    </div>
  );
}
