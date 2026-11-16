import { describe, expect, it } from "vitest";
import { databaseSchema } from "../schema";
import { buildSeedDatabase, SEED_CONTACTS } from "./seed";

const NOW = new Date("2026-03-01T12:00:00.000Z");
const SIX_WEEKS_MS = 42 * 24 * 60 * 60 * 1000;

describe("seed data", () => {
  const db = buildSeedDatabase(NOW);

  it("has 8 leads, 6 active and 4 closed contacts", () => {
    const count = (status: string) => db.contacts.filter((c) => c.status === status).length;
    expect([count("lead"), count("active"), count("closed")]).toEqual([8, 6, 4]);
  });

  it("flags 2 or 3 conflicts", () => {
    const flagged = db.contacts.filter((c) => c.conflictCheck === "flagged").length;
    expect(flagged).toBeGreaterThanOrEqual(2);
    expect(flagged).toBeLessThanOrEqual(3);
  });

  it("assigns work to 3 different attorneys", () => {
    const attorneys = new Set(db.contacts.map((c) => c.assignedTo).filter(Boolean));
    expect(attorneys.size).toBe(3);
  });

  it("gives every contact a unique email", () => {
    const emails = db.contacts.map((c) => c.email.toLowerCase());
    expect(new Set(emails).size).toBe(emails.length);
  });

  it("passes the database schema", () => {
    expect(databaseSchema.safeParse(db).success).toBe(true);
  });

  it("lists each contact's events oldest first", () => {
    for (const seed of SEED_CONTACTS) {
      const daysAgo = seed.events.map((e) => e.daysAgo);
      expect(daysAgo, seed.fullName).toEqual([...daysAgo].sort((a, b) => b - a));
      expect(seed.createdDaysAgo, seed.fullName).toBeGreaterThanOrEqual(daysAgo[0] ?? 0);
    }
  });

  it("ends each contact on the status of its last status change", () => {
    for (const seed of SEED_CONTACTS) {
      const changes = seed.events.filter((e) => e.kind === "status");
      const last = changes[changes.length - 1];
      if (last?.kind === "status") expect(seed.status, seed.fullName).toBe(last.to);
    }
  });

  it("keeps every date within the last 6 weeks", () => {
    const dates = [
      ...db.contacts.flatMap((c) => [c.createdAt, c.updatedAt, c.lastActivityAt]),
      ...db.activities.map((a) => a.createdAt),
      ...db.notes.map((n) => n.createdAt),
    ];
    for (const date of dates) {
      const age = NOW.getTime() - new Date(date).getTime();
      expect(age).toBeGreaterThanOrEqual(0);
      expect(age).toBeLessThanOrEqual(SIX_WEEKS_MS);
    }
  });
});
