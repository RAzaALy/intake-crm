import { describe, expect, it } from "vitest";
import { makeContact } from "@/test/factories";
import { columnHeadingLabel, groupByStatus, moveFailedMessage, movedMessage } from "./board";

describe("groupByStatus", () => {
  it("puts each contact in its status column, newest activity first", () => {
    const older = makeContact({ status: "lead", lastActivityAt: "2026-11-01T10:00:00.000Z" });
    const newer = makeContact({ status: "lead", lastActivityAt: "2026-11-10T10:00:00.000Z" });
    const active = makeContact({ status: "active" });

    const columns = groupByStatus([older, active, newer]);

    expect(columns.lead).toEqual([newer, older]);
    expect(columns.active).toEqual([active]);
    expect(columns.closed).toEqual([]);
  });
});

describe("columnHeadingLabel", () => {
  it("counts contacts, singular for one", () => {
    expect(columnHeadingLabel("lead", 8)).toBe("Lead, 8 contacts");
    expect(columnHeadingLabel("closed", 1)).toBe("Closed, 1 contact");
    expect(columnHeadingLabel("active", 0)).toBe("Active, 0 contacts");
  });
});

describe("move messages", () => {
  it("names the new column", () => {
    const contact = makeContact({ fullName: "Amna Siddiqui", status: "lead" });
    expect(movedMessage(contact, "closed")).toBe("Amna Siddiqui moved to Closed.");
  });

  it("warns when a flagged conflict goes to Active", () => {
    const contact = makeContact({ fullName: "Amna Siddiqui", conflictCheck: "flagged" });
    expect(movedMessage(contact, "active")).toBe(
      "Amna Siddiqui moved to Active. Conflict check is still flagged.",
    );
    expect(movedMessage(contact, "closed")).toBe("Amna Siddiqui moved to Closed.");
  });

  it("says where the card went back to on failure", () => {
    const contact = makeContact({ fullName: "Amna Siddiqui", status: "lead" });
    expect(moveFailedMessage(contact)).toBe(
      "Couldn't move Amna Siddiqui. The card is back in Lead. Try again.",
    );
  });
});
