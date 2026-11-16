export const MIN_LATENCY_MS = 300;
export const MAX_LATENCY_MS = 600;

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Waits 300 to 600 ms, so loading states show the way they would with a real API. */
export function simulateLatency(): Promise<void> {
  const ms = MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS);
  return delay(ms);
}
