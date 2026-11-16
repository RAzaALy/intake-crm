import { differenceInSeconds, format, formatDistanceStrict } from "date-fns";

/**
 * "Just now", "5 minutes ago", "3 days ago". Rounds down, so it never disagrees
 * with the stale hint ("No contact in 9 days" next to "10 days ago").
 */
export function formatRelativeTime(iso: string, now: Date): string {
  const date = new Date(iso);
  if (differenceInSeconds(now, date) < 60) return "Just now";
  return formatDistanceStrict(date, now, { addSuffix: true, roundingMethod: "floor" });
}

/** "12 Nov 2026, 2:05 pm", for the title tooltip on relative times. */
export function formatExactTime(iso: string): string {
  return format(new Date(iso), "d MMM yyyy, h:mm aaa");
}
