import Link from "next/link";
import { MATTER_LABELS, UNASSIGNED_LABEL } from "../labels";
import type { Contact } from "../schema";
import { ConflictBadge } from "./ConflictBadge";
import { LastActivity } from "./LastActivity";
import { StatusBadge } from "./StatusBadge";
import { stretchedLinkStyles } from "./stretchedLink";

type ContactCardProps = {
  contact: Contact;
  now: Date;
};

/**
 * Phones. The same facts as a table row in four short lines, so about four cards fit
 * on screen. The labels are for screen readers; sighted users read the layout.
 */
export function ContactCard({ contact, now }: ContactCardProps) {
  return (
    <article className="relative flex flex-col gap-2 rounded-panel border border-line bg-surface p-4 transition-colors duration-150 ease-out active:bg-sunken">
      <div className="flex items-start justify-between gap-3">
        <h2 className="min-w-0 text-base font-semibold text-ink">
          <Link
            href={`/contacts/${contact.id}`}
            className={`${stretchedLinkStyles} focus-visible:after:rounded-panel`}
          >
            {contact.fullName}
          </Link>
        </h2>
        <StatusBadge status={contact.status} />
      </div>

      <p className="-mt-1.5 truncate text-secondary text-ink-muted">{contact.email}</p>

      <p className="text-secondary text-ink-muted">
        <span className="sr-only">Matter: </span>
        {MATTER_LABELS[contact.matterType]}
        <span aria-hidden="true"> · </span>
        <span className="sr-only">, Attorney: </span>
        {contact.assignedTo ?? UNASSIGNED_LABEL}
      </p>

      <div className="flex items-end justify-between gap-3 text-secondary text-ink-muted">
        <span>
          <span className="sr-only">Conflict check: </span>
          <ConflictBadge check={contact.conflictCheck} />
        </span>
        <span className="text-right">
          <span className="sr-only">Last activity: </span>
          <LastActivity contact={contact} now={now} />
        </span>
      </div>
    </article>
  );
}
