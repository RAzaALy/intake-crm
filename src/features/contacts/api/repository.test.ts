import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setFailureSimulated, SimulatedFailureError } from "@/lib/simulate";
import { DATABASE_KEY, readItem } from "@/lib/storage";
import { databaseSchema, type ContactFormValues } from "../schema";
import {
  addNote,
  ContactNotFoundError,
  createContact,
  DuplicateEmailError,
  getContact,
  listContacts,
  moveContact,
  updateContact,
} from "./repository";
import { SEED_CONTACTS } from "./seed";

vi.mock("@/lib/delay", () => ({
  simulateLatency: () => Promise.resolve(),
  delay: () => Promise.resolve(),
}));

const SEED_ID = "seed-01"; // first seed contact: a lead

const newContact: ContactFormValues = {
  fullName: "Nora Whitfield",
  email: "nora@example.com",
  phone: "555 010 9999",
  status: "lead",
  matterType: "property",
  source: "phone",
};

function readDb() {
  return readItem(DATABASE_KEY, databaseSchema);
}

function activitiesFor(contactId: string) {
  return readDb()?.activities.filter((a) => a.contactId === contactId) ?? [];
}

/** The form values that would be pre-filled when editing a stored contact. */
async function editValues(id: string): Promise<ContactFormValues> {
  const details = await getContact(id);
  if (!details) throw new Error("test setup: contact missing");
  const { fullName, email, phone, status, matterType, source, assignedTo, conflictCheck } =
    details.contact;
  return { fullName, email, phone, status, matterType, source, assignedTo, conflictCheck };
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("seeding", () => {
  it("seeds the seed contacts and writes them to storage when storage is empty", async () => {
    const contacts = await listContacts();

    expect(contacts).toHaveLength(SEED_CONTACTS.length);
    expect(readDb()?.contacts).toHaveLength(SEED_CONTACTS.length);
  });

  it("does not reseed on later calls, so a created contact survives", async () => {
    const created = await createContact(newContact);

    const contacts = await listContacts();

    expect(contacts).toHaveLength(SEED_CONTACTS.length + 1);
    expect(contacts.map((c) => c.id)).toContain(created.id);
  });

  it("does not overwrite existing stored data", async () => {
    await listContacts();
    const db = readDb();
    window.localStorage.setItem(
      DATABASE_KEY,
      JSON.stringify({ ...db, contacts: db?.contacts.slice(0, 1) }),
    );

    expect(await listContacts()).toHaveLength(1);
  });
});

describe("createContact", () => {
  it("persists the contact and writes a created activity", async () => {
    const created = await createContact(newContact);

    expect(readDb()?.contacts.find((c) => c.id === created.id)?.fullName).toBe("Nora Whitfield");
    expect(created.assignedTo).toBeNull();
    expect(created.conflictCheck).toBe("pending");
    expect(activitiesFor(created.id).map((a) => a.type)).toEqual(["created"]);
  });

  it("rejects a duplicate email regardless of case", async () => {
    await expect(
      createContact({ ...newContact, email: SEED_CONTACTS[0].email.toUpperCase() }),
    ).rejects.toBeInstanceOf(DuplicateEmailError);
  });
});

describe("updateContact", () => {
  it("lets a contact keep its own email", async () => {
    const values = await editValues(SEED_ID);

    const updated = await updateContact(SEED_ID, { ...values, phone: "555 010 0000" });

    expect(updated.phone).toBe("555 010 0000");
  });

  it("rejects another contact's email", async () => {
    const values = await editValues(SEED_ID);

    await expect(
      updateContact(SEED_ID, { ...values, email: SEED_CONTACTS[1].email }),
    ).rejects.toBeInstanceOf(DuplicateEmailError);
  });

  it("writes an edited activity listing only the changed fields", async () => {
    const values = await editValues(SEED_ID);

    await updateContact(SEED_ID, { ...values, phone: "555 010 0000", assignedTo: "Helen Marsh" });

    const edited = activitiesFor(SEED_ID).filter((a) => a.type === "edited").pop();
    expect(edited?.meta).toEqual({ fields: ["phone", "assignedTo"] });
  });

  it("writes a separate status_changed activity with from and to", async () => {
    const values = await editValues(SEED_ID);

    await updateContact(SEED_ID, { ...values, status: "active", phone: "555 010 0000" });

    const activities = activitiesFor(SEED_ID);
    expect(activities.filter((a) => a.type === "status_changed").pop()?.meta).toEqual({
      from: "lead",
      to: "active",
    });
    expect(activities.filter((a) => a.type === "edited").pop()?.meta).toEqual({
      fields: ["phone"],
    });
  });

  it("writes no activity when nothing changed", async () => {
    const values = await editValues(SEED_ID);
    const before = activitiesFor(SEED_ID).length;

    await updateContact(SEED_ID, values);

    expect(activitiesFor(SEED_ID)).toHaveLength(before);
  });
});

describe("moveContact", () => {
  it("changes status, writes status_changed with meta and bumps lastActivityAt", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2030-01-01T10:00:00.000Z"));

    const moved = await moveContact(SEED_ID, "closed");

    expect(moved.status).toBe("closed");
    expect(moved.lastActivityAt).toBe("2030-01-01T10:00:00.000Z");
    expect(activitiesFor(SEED_ID).pop()).toMatchObject({
      type: "status_changed",
      meta: { from: "lead", to: "closed" },
    });
  });

  it("writes nothing when moving to the current status", async () => {
    await listContacts();
    const before = activitiesFor(SEED_ID).length;

    await moveContact(SEED_ID, "lead");

    expect(activitiesFor(SEED_ID)).toHaveLength(before);
  });
});

describe("addNote", () => {
  it("persists a trimmed note and writes note_added", async () => {
    const note = await addNote(SEED_ID, "  Left a voicemail.  ");

    expect(note.body).toBe("Left a voicemail.");
    expect(readDb()?.notes.some((n) => n.id === note.id)).toBe(true);
    expect(activitiesFor(SEED_ID).pop()?.type).toBe("note_added");
  });

  it("bumps lastActivityAt but not updatedAt", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2030-01-01T10:00:00.000Z"));
    const before = (await getContact(SEED_ID))?.contact;

    await addNote(SEED_ID, "Left a voicemail.");

    const after = (await getContact(SEED_ID))?.contact;
    expect(after?.lastActivityAt).toBe("2030-01-01T10:00:00.000Z");
    expect(after?.updatedAt).toBe(before?.updatedAt);
  });
});

describe("getContact", () => {
  it("returns null for an unknown id", async () => {
    expect(await getContact("nope")).toBeNull();
  });

  it("returns notes and activities newest first", async () => {
    await addNote(SEED_ID, "Newest note");

    const details = await getContact(SEED_ID);

    expect(details?.notes[0].body).toBe("Newest note");
    expect(details?.activities[0].type).toBe("note_added");
    const times = details?.activities.map((a) => a.createdAt) ?? [];
    expect(times).toEqual([...times].sort().reverse());
  });
});

describe("unknown contact", () => {
  it("makes update, move and addNote throw ContactNotFoundError", async () => {
    await expect(updateContact("nope", newContact)).rejects.toBeInstanceOf(ContactNotFoundError);
    await expect(moveContact("nope", "active")).rejects.toBeInstanceOf(ContactNotFoundError);
    await expect(addNote("nope", "Hello")).rejects.toBeInstanceOf(ContactNotFoundError);
  });
});

describe("simulated failure", () => {
  it("makes every function reject with SimulatedFailureError and leaves storage untouched", async () => {
    setFailureSimulated(true);

    const calls = [
      listContacts(),
      getContact(SEED_ID),
      createContact(newContact),
      updateContact(SEED_ID, newContact),
      moveContact(SEED_ID, "closed"),
      addNote(SEED_ID, "Hello"),
    ];

    for (const call of calls) {
      await expect(call).rejects.toBeInstanceOf(SimulatedFailureError);
    }
    expect(window.localStorage.getItem(DATABASE_KEY)).toBeNull();
  });
});
