import { sortContacts } from "@/features/contacts/filters";
import { STATUS_LABELS } from "@/features/contacts/labels";
import type { Contact, ContactStatus } from "@/features/contacts/schema";

// Pure helpers for the pipeline: no React, no storage, no clock.

export type PipelineColumns = Record<ContactStatus, Contact[]>;

/** One list per column, newest activity first, so the card someone just touched is on top. */
export function groupByStatus(contacts: Contact[]): PipelineColumns {
  const columns: PipelineColumns = { lead: [], active: [], closed: [] };
  for (const contact of sortContacts(contacts, "activity")) {
    columns[contact.status].push(contact);
  }
  return columns;
}

/** Screen reader text for a column heading: "Lead, 8 contacts". */
export function columnHeadingLabel(status: ContactStatus, count: number): string {
  // The deck has no singular key for this; it follows list.filter.chip.sr.one, as Raza agreed.
  const noun = count === 1 ? "contact" : "contacts";
  return `${STATUS_LABELS[status]}, ${count} ${noun}`;
}

/** A flagged conflict going to Active is allowed, but the toast warns about it. */
export function isFlaggedToActive(contact: Contact, to: ContactStatus): boolean {
  return to === "active" && contact.conflictCheck === "flagged";
}

/** The toast after a move. */
export function movedMessage(contact: Contact, to: ContactStatus): string {
  if (isFlaggedToActive(contact, to)) {
    return `${contact.fullName} moved to Active. Conflict check is still flagged.`;
  }
  return `${contact.fullName} moved to ${STATUS_LABELS[to]}.`;
}

// The messages below take the contact as it was before the move, so contact.status is where it came from.

export function moveFailedMessage(contact: Contact): string {
  return `Couldn't move ${contact.fullName}. The card is back in ${STATUS_LABELS[contact.status]}. Try again.`;
}

export function undoneMessage(contact: Contact): string {
  return `Move undone. ${contact.fullName} is back in ${STATUS_LABELS[contact.status]}.`;
}

export function undoFailedMessage(contact: Contact, movedTo: ContactStatus): string {
  return `Couldn't undo the move. ${contact.fullName} is still in ${STATUS_LABELS[movedTo]}.`;
}
