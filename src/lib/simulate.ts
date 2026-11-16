import { z } from "zod";
import { readItem, SIMULATE_FAILURE_KEY, writeItem } from "./storage";

/** Thrown by every repository call while "Simulate API failure" is on. */
export class SimulatedFailureError extends Error {
  constructor() {
    super("Simulated API failure");
    this.name = "SimulatedFailureError";
  }
}

// The "storage" event only fires in other tabs, so this tab needs its own signal.
const CHANGE_EVENT = "intake-crm:simulate-failure-change";

export function isFailureSimulated(): boolean {
  return readItem(SIMULATE_FAILURE_KEY, z.boolean()) ?? false;
}

export function setFailureSimulated(on: boolean): void {
  writeItem(SIMULATE_FAILURE_KEY, on);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function throwIfFailureSimulated(): void {
  if (isFailureSimulated()) throw new SimulatedFailureError();
}

/** Calls onChange when the switch flips, in this tab or another. Returns the unsubscribe. */
export function subscribeToFailureSimulation(onChange: () => void): () => void {
  function handleStorage(event: StorageEvent) {
    if (event.key === SIMULATE_FAILURE_KEY) onChange();
  }
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", handleStorage);
  };
}
