interface TimerProps {
  secondsRemaining: number;
}

function format(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function Timer({ secondsRemaining }: TimerProps) {
  const urgent = secondsRemaining <= 60;
  const locked = secondsRemaining <= 0;

  return (
    <div className="flex items-center gap-3 font-mono">
      <div
        className={`h-2 w-2 rounded-full ${
          locked ? "bg-critical" : urgent ? "bg-amber animate-pulse" : "bg-good"
        }`}
      />
      <span
        className={`text-2xl tabular-nums ${
          locked ? "text-critical" : urgent ? "text-amber" : "text-foreground"
        }`}
      >
        {locked ? "TIME UP" : format(secondsRemaining)}
      </span>
    </div>
  );
}
