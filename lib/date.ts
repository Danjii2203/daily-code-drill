// Everything keys off UTC calendar date so "today's challenge" is
// unambiguous regardless of server region.
export function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}
