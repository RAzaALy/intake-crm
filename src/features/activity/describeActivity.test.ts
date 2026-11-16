import { describe, expect, it } from "vitest";
import type { Activity, EditableField } from "@/features/contacts/schema";
import { describeActivity, joinWithAnd } from "./describeActivity";

const base = { id: "a1", contactId: "c1", createdAt: "2026-11-01T10:00:00.000Z" };

function edited(fields: EditableField[]): Activity {
  return { ...base, type: "edited", meta: { fields } };
}

describe("joinWithAnd", () => {
  it("joins zero, one, two and three items", () => {
    expect(joinWithAnd([])).toBe("");
    expect(joinWithAnd(["a"])).toBe("a");
    expect(joinWithAnd(["a", "b"])).toBe("a and b");
    expect(joinWithAnd(["a", "b", "c"])).toBe("a, b and c");
  });
});

describe("describeActivity", () => {
  it("describes a created contact", () => {
    expect(describeActivity({ ...base, type: "created" })).toBe("Contact added.");
  });

  it("lists one edited field", () => {
    expect(describeActivity(edited(["email"]))).toBe("Updated email.");
  });

  it("lists two edited fields with and", () => {
    expect(describeActivity(edited(["email", "phone"]))).toBe("Updated email and phone.");
  });

  it("uses commas between all but the last pair", () => {
    expect(describeActivity(edited(["fullName", "email", "phone"]))).toBe(
      "Updated full name, email and phone.",
    );
  });

  it("says Details updated when no field is listed", () => {
    expect(describeActivity(edited([]))).toBe("Details updated.");
  });

  it("names both statuses in a status change", () => {
    const activity: Activity = { ...base, type: "status_changed", meta: { from: "lead", to: "active" } };
    expect(describeActivity(activity)).toBe("Status changed from Lead to Active.");
  });

  it("describes an added note", () => {
    expect(describeActivity({ ...base, type: "note_added" })).toBe("Note added.");
  });
});
