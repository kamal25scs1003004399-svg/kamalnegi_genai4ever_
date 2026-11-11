export function timeRemaining(deadlineIso: string): { ms: number; label: string; breached: boolean } {
  const deadline = new Date(deadlineIso).getTime();
  const now = Date.now();
  const ms = deadline - now;
  const breached = ms < 0;

  if (breached) {
    const overdueMs = Math.abs(ms);
    const hours = Math.floor(overdueMs / (1000 * 60 * 60));
    return { ms, label: `${hours}h overdue`, breached: true };
  }

  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours >= 1) {
    return { ms, label: `${hours}h ${minutes}m remaining`, breached: false };
  }
  return { ms, label: `${minutes}m remaining`, breached: false };
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = now - then;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
