"use client";

import { useFailureSimulated } from "@/lib/useFailureSimulated";

/** Shown beside the product name, so nobody mistakes simulated errors for a broken build. */
export function FailureIndicator() {
  const on = useFailureSimulated();
  if (!on) return null;
  // A 6px rectangle, not a pill, so it does not read as a status badge.
  return (
    <span className="inline-flex h-6 items-center rounded-control bg-notice-bg px-2 text-meta font-medium whitespace-nowrap text-notice-text">
      Failure simulation on
    </span>
  );
}
