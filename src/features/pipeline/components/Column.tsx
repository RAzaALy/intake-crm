import { useDroppable } from "@dnd-kit/core";
import { STATUS_LABELS } from "@/features/contacts/labels";
import type { Contact, ContactStatus } from "@/features/contacts/schema";
import { cn } from "@/lib/cn";
import { columnHeadingLabel } from "../board";
import { PipelineCard } from "./PipelineCard";

const EMPTY_TEXT: Record<ContactStatus, string> = {
  lead: "No inquiries waiting.",
  active: "No open matters.",
  closed: "Nothing closed yet.",
};

type ColumnProps = {
  status: ContactStatus;
  contacts: Contact[];
  now: Date;
  onMove: (contact: Contact, to: ContactStatus) => void;
  focusId: string | null;
};

/** 85% wide on phones so the next column peeks in and invites a swipe; a grid cell from 768px. */
export function Column({ status, contacts, now, onMove, focusId }: ColumnProps) {
  const headingId = `pipeline-column-${status}`;
  // The whole column is the drop target, not just its cards, so an empty column still takes a drop.
  const { setNodeRef, isOver, active } = useDroppable({ id: status });
  // Dropping a card back where it came from does nothing, so its own column does not light up.
  const isTarget = isOver && !contacts.some((contact) => contact.id === active?.id);

  return (
    // relative: the sr-only text inside is absolutely positioned. Without a positioned column it
    // escapes the board's sideways scroll and widens the whole page on phones.
    // From 768px the section is the column's scroll box and the heading sticks to its top.
    <section
      aria-labelledby={headingId}
      className={cn(
        "relative w-[85%] shrink-0 snap-start rounded-panel bg-sunken md:w-auto md:overflow-y-auto",
        "outline-2 -outline-offset-2 outline-transparent transition-[outline-color] duration-150 ease-out",
        isTarget && "outline-primary",
      )}
    >
      {/* The drop target sits inside the scroll box, not on it: dnd-kit auto-scrolls the scroll
          boxes *around* the target under the pointer, so a target that is its own scroll box never scrolls.
          min-h-full keeps the empty space below the cards a drop target too. */}
      <div ref={setNodeRef} className="flex min-h-full flex-col">
        <h2
          id={headingId}
          className="px-4 py-3 text-base font-semibold text-ink md:sticky md:top-0 md:z-10 md:bg-sunken"
        >
          <span aria-hidden="true">
            {STATUS_LABELS[status]}{" "}
            <span className="font-normal text-ink-muted tabular-nums">{contacts.length}</span>
          </span>
          <span className="sr-only">{columnHeadingLabel(status, contacts.length)}</span>
        </h2>

        <div className="px-3 pb-3">
          {contacts.length === 0 ? (
            <div className="flex flex-col gap-1 rounded-panel border border-dashed border-line-input p-4 text-body">
              <p className="text-ink">{EMPTY_TEXT[status]}</p>
              {/* Phones cannot drag (touch scrolls the board), so they only get the Move route. */}
              <p className="hidden text-ink-muted md:block">Drag a card here, or use Move on any card.</p>
              <p className="text-ink-muted md:hidden">Use Move on any card to bring it here.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <PipelineCard
                    contact={contact}
                    now={now}
                    onMove={onMove}
                    focusMoveButton={focusId === contact.id}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
