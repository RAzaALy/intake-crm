import Link from "next/link";
import { useDraggable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { ConflictBadge } from "@/features/contacts/components/ConflictBadge";
import { LastActivity } from "@/features/contacts/components/LastActivity";
import { MATTER_LABELS, UNASSIGNED_LABEL } from "@/features/contacts/labels";
import type { Contact, ContactStatus } from "@/features/contacts/schema";
import { cn } from "@/lib/cn";
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
 *
 * Drag: the mouse can grab the card anywhere. The keyboard picks it up only from the grip
 * button (the "activator"), so the card itself is not a button wrapped around a link and a menu.
 */
export function PipelineCard({ contact, now, onMove, focusMoveButton }: PipelineCardProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({
    id: contact.id,
  });

  return (
    // The card stays put during a drag, faded as a placeholder; PipelineCardPreview follows the pointer.
    <article
      ref={setNodeRef}
      {...listeners}
      className={cn(
        "relative flex flex-col gap-2 rounded-panel border border-line bg-surface p-3 md:cursor-grab",
        isDragging && "opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-body font-semibold text-ink">
          <Link
            href={`/contacts/${contact.id}`}
            // The name is a link, not a drag handle. A drag that started here would end with a
            // click on the link that dnd-kit swallows before Next sees it, so the browser does a
            // full page load and the move is lost. (The Move button is safe: Radix cancels its mousedown.)
            onMouseDown={(event) => event.stopPropagation()}
            // 44px tap area on phones; the negative margin keeps the card the same height.
            className="rounded-control hover:underline max-md:-my-3 max-md:inline-flex max-md:min-h-11 max-md:items-center"
          >
            {contact.fullName}
          </Link>
        </h3>
        {/* Hidden on phones: touch never drags there (scrolling wins), the Move menu does the job. */}
        <button
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          aria-label={`Drag ${contact.fullName}`}
          className="-my-1 -mr-1 hidden size-7 shrink-0 items-center justify-center rounded-control text-ink-faint hover:bg-sunken hover:text-ink md:inline-flex"
        >
          <GripVertical size={16} aria-hidden="true" />
        </button>
      </div>

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
