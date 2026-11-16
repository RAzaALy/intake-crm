import { formatExactTime, formatRelativeTime } from "@/lib/format";
import type { Contact } from "../schema";
import { getStaleDays } from "../stale";

type LastActivityProps = {
  contact: Contact;
  /** Passed in so every row in one render uses the same clock. */
  now: Date;
};

/** "3 days ago", with the exact time on hover, and the call-back hint for quiet leads. */
export function LastActivity({ contact, now }: LastActivityProps) {
  const staleDays = getStaleDays(contact, now);
  return (
    <span className="flex flex-col">
      <time
        dateTime={contact.lastActivityAt}
        title={formatExactTime(contact.lastActivityAt)}
        className="tabular-nums"
      >
        {formatRelativeTime(contact.lastActivityAt, now)}
      </time>
      {staleDays !== null && (
        <span className="text-meta text-accent">No contact in {staleDays} days</span>
      )}
    </span>
  );
}
