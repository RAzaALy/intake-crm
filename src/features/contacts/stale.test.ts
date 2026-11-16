import { describe, expect, it } from "vitest";
import { makeContact } from "@/test/factories";
import { getStaleDays } from "./stale";

// Local-time constructors, so the day arithmetic does not depend on the machine's time zone.
const now = new Date(2026, 10, 17, 12, 0);
const daysAgo = (days: number) => new Date(2026, 10, 17 - days, 12, 0).toISOString();

describe("getStaleDays", () => {
  it("returns null for a lead touched 6 days ago", () => {
    expect(getStaleDays(makeContact({ status: "lead", lastActivityAt: daysAgo(6) }), now)).toBeNull();
  });

  it("returns the day count from 7 days on", () => {
    expect(getStaleDays(makeContact({ status: "lead", lastActivityAt: daysAgo(7) }), now)).toBe(7);
    expect(getStaleDays(makeContact({ status: "lead", lastActivityAt: daysAgo(12) }), now)).toBe(12);
  });

  it("returns null for active and closed contacts however old", () => {
    expect(getStaleDays(makeContact({ status: "active", lastActivityAt: daysAgo(30) }), now)).toBeNull();
    expect(getStaleDays(makeContact({ status: "closed", lastActivityAt: daysAgo(30) }), now)).toBeNull();
  });
});
