import { formatExactTime, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";

type RelativeTimeProps = {
  iso: string;
  /** Passed in so every time on one screen uses the same clock. */
  now: Date;
  className?: string;
};

/**
 * "3 days ago" on screen, the exact time in a hover tooltip. Screen readers get the exact
 * time as hidden text, because a title is not reliably read and a focusable <time> on every
 * row would add a tab stop per entry for keyboard users.
 */
export function RelativeTime({ iso, now, className }: RelativeTimeProps) {
  const exact = formatExactTime(iso);
  return (
    <time dateTime={iso} title={exact} className={cn("tabular-nums", className)}>
      {formatRelativeTime(iso, now)}
      <span className="sr-only">, {exact}</span>
    </time>
  );
}
