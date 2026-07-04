import Link from "next/link";
import { FRAMEWORKS } from "@/lib/frameworks";
import { todayKey } from "@/lib/date";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">{todayKey()} · today's drill</p>
      <h1 className="mb-2 text-3xl font-semibold">Daily Code Drill</h1>
      <p className="mb-10 max-w-md text-sm text-muted">
        One real problem, ten minutes, no AI in the loop while you write it. Pick a framework — when the clock
        hits zero, the editor locks and you submit whatever you have.
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {FRAMEWORKS.map((framework) => (
          <Link
            key={framework.id}
            href={`/challenge/${framework.id}`}
            className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-foreground transition-colors hover:border-amber-dim hover:bg-surface2"
          >
            {framework.label}
          </Link>
        ))}
      </div>
    </main>
  );
}
