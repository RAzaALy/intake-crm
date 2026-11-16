import { simulateLatency } from "@/lib/delay";
import { throwIfFailureSimulated } from "@/lib/simulate";
import { DATABASE_KEY, readItem, writeItem } from "@/lib/storage";
import {
  contactInputSchema,
  databaseSchema,
  editableFieldSchema,
  noteBodySchema,
  type Contact,
  type ContactFormValues,
  type ContactStatus,
  type Database,
  type EditableField,
  type Note,
} from "../schema";
import type { ContactWithHistory } from "../types";
import { buildSeedDatabase } from "./seed";

// The only module that touches stored contacts. Every function is async and behaves like a
// network call (latency, failures), so moving to Supabase means rewriting this file only.

export class ContactNotFoundError extends Error {
  constructor(id: string) {
    super(`Contact ${id} not found`);
    this.name = "ContactNotFoundError";
  }
}

/** The form maps this to "Another contact already uses this email." on the email field. */
export class DuplicateEmailError extends Error {
  constructor() {
    super("Another contact already uses this email");
    this.name = "DuplicateEmailError";
  }
}

/** Every call starts here: wait like a real request, then fail if the demo switch is on. */
async function request(): Promise<void> {
  await simulateLatency();
  throwIfFailureSimulated();
}

/** Loads the database, seeding it the first time (or when stored data is unreadable). */
function load(): Database {
  const stored = readItem(DATABASE_KEY, databaseSchema);
  if (stored) return stored;

  const seeded = buildSeedDatabase(new Date());
  writeItem(DATABASE_KEY, seeded);
  return seeded;
}

function save(db: Database): void {
  writeItem(DATABASE_KEY, db);
}

function findContact(db: Database, id: string): Contact {
  const contact = db.contacts.find((c) => c.id === id);
  if (!contact) throw new ContactNotFoundError(id);
  return contact;
}

function assertEmailIsFree(db: Database, email: string, ignoreId?: string): void {
  const normalized = email.toLowerCase();
  const taken = db.contacts.some(
    (c) => c.id !== ignoreId && c.email.toLowerCase() === normalized,
  );
  if (taken) throw new DuplicateEmailError();
}

/** The fields every activity shares. Callers add the type and, where needed, its meta. */
function activityBase(contactId: string, createdAt: string) {
  return { id: crypto.randomUUID(), contactId, createdAt };
}

function newestFirst<T extends { createdAt: string }>(items: T[]): T[] {
  // Reverse first: sort is stable, so two entries saved in the same millisecond
  // (an edit plus a status change) still come out with the later-saved one on top.
  return [...items].reverse().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Every form field except status, which gets its own "status_changed" activity.
// Derived from the schema, so a new field is logged without touching this file.
const TRACKED_FIELDS: EditableField[] = editableFieldSchema.options.filter(
  (field) => field !== "status",
);

export async function listContacts(): Promise<Contact[]> {
  await request();
  return load().contacts;
}

/** Returns null for an unknown id, so the page can show "Contact not found" instead of an error. */
export async function getContact(id: string): Promise<ContactWithHistory | null> {
  await request();
  const db = load();
  const contact = db.contacts.find((c) => c.id === id);
  if (!contact) return null;

  return {
    contact,
    notes: newestFirst(db.notes.filter((n) => n.contactId === id)),
    activities: newestFirst(db.activities.filter((a) => a.contactId === id)),
  };
}

export async function createContact(values: ContactFormValues): Promise<Contact> {
  await request();
  const input = contactInputSchema.parse(values);
  const db = load();
  assertEmailIsFree(db, input.email);

  const now = new Date().toISOString();
  const contact: Contact = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
  };

  db.contacts.push(contact);
  db.activities.push({ ...activityBase(contact.id, now), type: "created" });
  save(db);
  return contact;
}

export async function updateContact(id: string, values: ContactFormValues): Promise<Contact> {
  await request();
  const input = contactInputSchema.parse(values);
  const db = load();
  const current = findContact(db, id);
  assertEmailIsFree(db, input.email, id);

  const changedFields = TRACKED_FIELDS.filter((field) => current[field] !== input[field]);
  const statusChanged = current.status !== input.status;
  // A save with no changes writes nothing, so the timeline only shows real edits.
  if (changedFields.length === 0 && !statusChanged) return current;

  const now = new Date().toISOString();
  const updated: Contact = { ...current, ...input, updatedAt: now, lastActivityAt: now };

  db.contacts = db.contacts.map((c) => (c.id === id ? updated : c));
  if (changedFields.length > 0) {
    db.activities.push({ ...activityBase(id, now), type: "edited", meta: { fields: changedFields } });
  }
  if (statusChanged) {
    db.activities.push({
      ...activityBase(id, now),
      type: "status_changed",
      meta: { from: current.status, to: input.status },
    });
  }
  save(db);
  return updated;
}

export async function moveContact(id: string, status: ContactStatus): Promise<Contact> {
  await request();
  const db = load();
  const current = findContact(db, id);
  if (current.status === status) return current;

  const now = new Date().toISOString();
  const updated: Contact = { ...current, status, updatedAt: now, lastActivityAt: now };

  db.contacts = db.contacts.map((c) => (c.id === id ? updated : c));
  db.activities.push({
    ...activityBase(id, now),
    type: "status_changed",
    meta: { from: current.status, to: status },
  });
  save(db);
  return updated;
}

export async function addNote(contactId: string, body: string): Promise<Note> {
  await request();
  const cleanBody = noteBodySchema.parse(body);
  const db = load();
  const contact = findContact(db, contactId);

  const now = new Date().toISOString();
  const note: Note = { id: crypto.randomUUID(), contactId, body: cleanBody, createdAt: now };

  db.notes.push(note);
  db.activities.push({ ...activityBase(contactId, now), type: "note_added" });
  // A note is activity on the contact, but not a change to its details, so updatedAt stays.
  db.contacts = db.contacts.map((c) =>
    c.id === contactId ? { ...contact, lastActivityAt: now } : c,
  );
  save(db);
  return note;
}
