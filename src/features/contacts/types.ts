import type { Activity, Contact, Note } from "./schema";

/** One contact with its notes and timeline, both newest first. What the details page needs. */
export interface ContactWithHistory {
  contact: Contact;
  notes: Note[];
  activities: Activity[];
}
