"use client";

import { useSyncExternalStore } from "react";
import { isFailureSimulated, subscribeToFailureSimulation } from "./simulate";

/**
 * Whether "Simulate API failure" is on. The switch, the shell badge and the error hint
 * all read it, and all update together without a Context.
 * useSyncExternalStore renders the server value (false) during hydration and only then
 * reads localStorage, so server and client HTML always match.
 */
export function useFailureSimulated(): boolean {
  return useSyncExternalStore(subscribeToFailureSimulation, isFailureSimulated, () => false);
}
