"use client";

import { useId } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { setFailureSimulated } from "@/lib/simulate";
import { useFailureSimulated } from "@/lib/useFailureSimulated";

/** For reviewers: makes every repository call fail, so the error states can be seen. */
export function DemoSwitch() {
  const id = useId();
  const on = useFailureSimulated();
  const queryClient = useQueryClient();

  function handleToggle() {
    const next = !on;
    setFailureSimulated(next);
    toast(
      next
        ? "Failure simulation on. Every request will fail until you turn it off."
        : "Failure simulation off.",
    );
    // Refetch what is on screen now, so the change shows without a reload.
    void queryClient.invalidateQueries();
  }

  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-hint`}
        onClick={handleToggle}
        // 44px tap area on phones around a 20px track.
        className="-my-3 flex h-11 shrink-0 items-center md:my-0 md:h-5"
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex h-5 w-9 items-center rounded-full border p-0.5 transition-colors duration-150 ease-out",
            // On is a selected state, like the current nav item, so it uses the primary.
            on ? "border-primary bg-primary" : "border-line-input bg-line-input",
          )}
        >
          <span
            className={cn(
              "size-3.5 rounded-full bg-surface transition-transform duration-150 ease-out",
              on && "translate-x-4",
            )}
          />
        </span>
      </button>
      <div className="flex flex-col gap-0.5">
        <span id={`${id}-label`} className="text-secondary font-medium text-ink">
          Simulate API failure
        </span>
        <span id={`${id}-hint`} className="text-meta text-ink-muted">
          For reviewers: makes every request fail, so you can see the error states.
        </span>
      </div>
    </div>
  );
}
