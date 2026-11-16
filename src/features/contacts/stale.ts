import { differenceInDays } from "date-fns";
import type { Contact } from "./schema";

/** A lead nobody has touched for this long shows "No contact in {n} days". */
export const STALE_AFTER_DAYS = 7;

/**
 * Whole days since a lead's last activity, or null when the hint should not show.
 * Only leads: an Active matter can be quiet for weeks, and Closed is done.
 */
export function getStaleDays(contact: Contact, now: Date): number | null {
  if (contact.status !== "lead") return null;
  const days = differenceInDays(now, new Date(contact.lastActivityAt));
  return days >= STALE_AFTER_DAYS ? days : null;
}
