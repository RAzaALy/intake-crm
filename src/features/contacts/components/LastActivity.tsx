import { RelativeTime } from "@/components/ui/RelativeTime";
import type { Contact } from "../schema";
import { getStaleDays } from "../stale";

type LastActivityProps = {
  contact: Contact;
  /** Passed in so every row in one render uses the same clock. */
  now: Date;
};

/** "3 days ago" with the exact time for hover and screen readers, and the call-back hint for quiet leads. */
export function LastActivity({ contact, now }: LastActivityProps) {
  const staleDays = getStaleDays(contact, now);
  return (
    <span className="flex flex-col">
      <RelativeTime iso={contact.lastActivityAt} now={now} />
      {staleDays !== null && (
        <span className="text-meta text-accent">No contact in {staleDays} days</span>
      )}
    </span>
  );
}
