import { z } from "zod";
import { readItem, SIMULATE_FAILURE_KEY, writeItem } from "./storage";

/** Thrown by every repository call while "Simulate API failure" is on. */
export class SimulatedFailureError extends Error {
  constructor() {
    super("Simulated API failure");
    this.name = "SimulatedFailureError";
  }
}

export function isFailureSimulated(): boolean {
  return readItem(SIMULATE_FAILURE_KEY, z.boolean()) ?? false;
}

export function setFailureSimulated(on: boolean): void {
  writeItem(SIMULATE_FAILURE_KEY, on);
}

export function throwIfFailureSimulated(): void {
  if (isFailureSimulated()) throw new SimulatedFailureError();
}
