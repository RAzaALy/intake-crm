"use client";

import { useRef } from "react";
import Link from "next/link";
import { useCanScrollDown } from "@/lib/useCanScrollDown";
import { cn } from "@/lib/cn";
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

// The header's bottom line is an inset shadow, not a border: in a collapsed table a sticky
// header's border stays behind and scrolls away with the rows.
const headerCell =
  "px-4 py-2.5 text-left text-meta font-medium text-ink-muted shadow-[inset_0_-1px_0_var(--color-line)]";
const cell = "px-4 py-2 align-top";

/**
 * 768px and up. Below that, ContactCardList shows the same facts.
 * Only the rows scroll: the header sticks, and a fade at the bottom says there are more rows.
 */
export function ContactTable({ contacts, sort, now }: ContactTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const canScrollDown = useCanScrollDown(scrollRef);

  return (
    <div className="relative flex min-h-0 flex-col overflow-hidden rounded-panel border border-line bg-surface">
      {/* scroll-padding keeps a row reached by Tab clear of the sticky header (38px, plus the
          8px between the row's top and its name link) and of the fade at the bottom. */}
      <div ref={scrollRef} className="min-h-0 scroll-pt-12 scroll-pb-10 overflow-auto">
        <table className="w-full border-collapse text-body">
          <caption className="sr-only">Contacts, sorted by {SORT_LABELS[sort]}</caption>
          <thead className="sticky top-0 z-10 bg-surface">
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
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-surface to-transparent",
          "transition-opacity duration-150 ease-out",
          canScrollDown ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
