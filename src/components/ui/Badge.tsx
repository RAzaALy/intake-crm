import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Tones carry meaning, never decoration. The text label is required,
 * so status is never shown by colour alone.
 */
export type BadgeTone = "lead" | "active" | "closed" | "flagged" | "pending" | "cleared";

const toneStyles: Record<BadgeTone, string> = {
  lead: "bg-status-lead-bg text-status-lead-text",
  active: "bg-status-active-bg text-status-active-text",
  closed: "bg-status-closed-bg text-status-closed-text",
  flagged: "bg-conflict-flagged-bg text-conflict-flagged-text",
  pending: "bg-conflict-pending-bg text-conflict-pending-text",
  // Low emphasis on purpose: no background, the caller passes a check icon.
  cleared: "px-0 text-conflict-cleared-text",
};

type BadgeProps = {
  tone: BadgeTone;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function Badge({ tone, children, icon, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-meta font-medium whitespace-nowrap",
        toneStyles[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
