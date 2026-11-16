import Link from "next/link";
import type { SortKey } from "../filters";
import { MATTER_LABELS, SORT_LABELS, UNASSIGNED_LABEL } from "../labels";
import type { Contact } from "../schema";
import { ConflictBadge } from "./ConflictBadge";
import { LastActivity } from "./LastActivity";
import { StatusBadge } from "./StatusBadge";
import { stretchedLinkStyles } from "./stretchedLink";

type ContactTableProps = {
  contacts: Contact[];
  sort: SortKey;
  now: Date;
};

const headerCell = "px-4 py-2.5 text-left text-meta font-medium text-ink-muted";
const cell = "px-4 py-2 align-top";

/** 768px and up. Below that, ContactCardList shows the same facts. */
export function ContactTable({ contacts, sort, now }: ContactTableProps) {
  return (
    <div className="overflow-x-auto rounded-panel border border-line bg-surface">
      <table className="w-full border-collapse text-body">
        <caption className="sr-only">Contacts, sorted by {SORT_LABELS[sort]}</caption>
        <thead className="border-b border-line">
          <tr>
            <th scope="col" className={headerCell}>Name</th>
            <th scope="col" className={headerCell}>Status</th>
            <th scope="col" className={headerCell}>Matter</th>
            <th scope="col" className={headerCell}>Conflict check</th>
            <th scope="col" className={headerCell}>Assigned attorney</th>
            <th scope="col" className={headerCell}>Last activity</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            // relative makes the name link's ::after cover the row (see stretchedLink.ts).
            <tr
              key={contact.id}
              className="relative border-b border-line transition-colors duration-150 ease-out last:border-b-0 hover:bg-sunken"
            >
              <td className={cell}>
                <Link
                  href={`/contacts/${contact.id}`}
                  className={stretchedLinkStyles}
                >
                  {contact.fullName}
                </Link>
                <div className="text-secondary text-ink-muted">{contact.email}</div>
              </td>
              <td className={cell}>
                <StatusBadge status={contact.status} />
              </td>
              <td className={`${cell} text-ink-muted`}>{MATTER_LABELS[contact.matterType]}</td>
              <td className={cell}>
                <ConflictBadge check={contact.conflictCheck} />
              </td>
              <td className={`${cell} text-ink-muted`}>{contact.assignedTo ?? UNASSIGNED_LABEL}</td>
              <td className={`${cell} text-ink-muted`}>
                <LastActivity contact={contact} now={now} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
