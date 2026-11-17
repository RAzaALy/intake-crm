import { ConflictBadge } from "@/features/contacts/components/ConflictBadge";
import { LastActivity } from "@/features/contacts/components/LastActivity";
import { MATTER_LABELS, UNASSIGNED_LABEL } from "@/features/contacts/labels";
import type { Contact } from "@/features/contacts/schema";

type PipelineCardPreviewProps = {
  contact: Contact;
  now: Date;
};

/**
 * The card that follows the pointer during a drag (dnd-kit's DragOverlay). The real card cannot
 * move itself: its column scrolls, and a scroll box clips anything that leaves it.
 * A picture only, with no link or buttons; screen readers hear the drag through dnd-kit's announcements.
 */
export function PipelineCardPreview({ contact, now }: PipelineCardPreviewProps) {
  return (
    <div
      aria-hidden="true"
      className="flex h-full cursor-grabbing flex-col gap-2 rounded-panel border border-line bg-surface p-3 shadow-float"
    >
      <p className="text-body font-semibold text-ink">{contact.fullName}</p>
      <p className="-mt-1 text-secondary text-ink-muted">
        {MATTER_LABELS[contact.matterType]} · {contact.assignedTo ?? UNASSIGNED_LABEL}
      </p>
      {contact.conflictCheck !== "cleared" && (
        <div>
          <ConflictBadge check={contact.conflictCheck} />
        </div>
      )}
      <p className="text-secondary text-ink-muted">
        <LastActivity contact={contact} now={now} />
      </p>
    </div>
  );
}
