import { cn } from "@/lib/cn";

/** A grey placeholder bar. Size it with className to match the content it stands in for. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("h-4 rounded-control bg-sunken motion-safe:animate-pulse", className)}
    />
  );
}
