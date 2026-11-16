"use client";

import { cn } from "@/lib/cn";
import type { StatusCounts, StatusFilter as StatusFilterValue } from "../filters";
import { STATUS_LABELS } from "../labels";

const OPTIONS: StatusFilterValue[] = ["all", "lead", "active", "closed"];

type StatusFilterProps = {
  value: StatusFilterValue;
  counts: StatusCounts;
  onChange: (status: StatusFilterValue) => void;
};

/** Toggle buttons, one pressed at a time. Each says how many contacts it would show. */
export function StatusFilter({ value, counts, onChange }: StatusFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter by status"
      // Phones: one row that scrolls sideways; the negative margin lets it reach the screen edge.
      className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0"
    >
      {OPTIONS.map((status) => {
        const label = STATUS_LABELS[status];
        const count = counts[status];
        const pressed = status === value;
        return (
          <button
            key={status}
            type="button"
            aria-pressed={pressed}
            aria-label={count === 1 ? `${label}, 1 contact` : `${label}, ${count} contacts`}
            onClick={() => onChange(status)}
            className={cn(
              "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-body font-medium md:h-8",
              "transition-colors duration-150 ease-out",
              pressed
                ? "border-primary bg-primary-soft text-primary"
                : "border-line bg-surface text-ink-muted hover:bg-sunken hover:text-ink",
            )}
          >
            {label}
            <span className={cn("tabular-nums", pressed ? "text-primary" : "text-ink-faint")}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
