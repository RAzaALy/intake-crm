import Link from "next/link";
import { ConflictBadge } from "@/features/contacts/components/ConflictBadge";
import { LastActivity } from "@/features/contacts/components/LastActivity";
import { MATTER_LABELS, UNASSIGNED_LABEL } from "@/features/contacts/labels";
import type { Contact, ContactStatus } from "@/features/contacts/schema";
import { MoveToMenu } from "./MoveToMenu";

type PipelineCardProps = {
  contact: Contact;
  now: Date;
  onMove: (contact: Contact, to: ContactStatus) => void;
  focusMoveButton: boolean;
};

/**
 * Name first, then the reference line, then what needs attention: a conflict that is not
 * cleared, and the stale hint on quiet leads. Cleared conflicts are left off to keep cards short.
 */
export function PipelineCard({ contact, now, onMove, focusMoveButton }: PipelineCardProps) {
  return (
    <article className="flex flex-col gap-2 rounded-panel border border-line bg-surface p-3">
      <h3 className="text-body font-semibold text-ink">
        <Link href={`/contacts/${contact.id}`} className="rounded-control hover:underline">
          {contact.fullName}
        </Link>
      </h3>

      <p className="-mt-1 text-secondary text-ink-muted">
        <span className="sr-only">Matter: </span>
        {MATTER_LABELS[contact.matterType]}
        <span aria-hidden="true"> · </span>
        <span className="sr-only">, Attorney: </span>
        {contact.assignedTo ?? UNASSIGNED_LABEL}
      </p>

      {contact.conflictCheck !== "cleared" && (
        <div>
          <ConflictBadge check={contact.conflictCheck} />
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <span className="text-secondary text-ink-muted">
          <span className="sr-only">Last activity: </span>
          <LastActivity contact={contact} now={now} />
        </span>
        <MoveToMenu contact={contact} onMove={onMove} autoFocus={focusMoveButton} />
      </div>
    </article>
  );
}
