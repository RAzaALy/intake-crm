import type { Contact } from "@/features/contacts/schema";

let counter = 0;

/** A valid contact; override only the fields a test cares about. */
export function makeContact(overrides: Partial<Contact> = {}): Contact {
  counter += 1;
  return {
    id: `c${counter}`,
    fullName: `Person ${counter}`,
    email: `person${counter}@example.com`,
    phone: "+1 555 000 0000",
    status: "lead",
    matterType: "family",
    source: "website",
    assignedTo: null,
    conflictCheck: "pending",
    createdAt: "2026-11-01T10:00:00.000Z",
    updatedAt: "2026-11-01T10:00:00.000Z",
    lastActivityAt: "2026-11-01T10:00:00.000Z",
    ...overrides,
  };
}
