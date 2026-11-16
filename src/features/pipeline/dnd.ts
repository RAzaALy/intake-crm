import {
  pointerWithin,
  rectIntersection,
  type Announcements,
  type CollisionDetection,
  type KeyboardCoordinateGetter,
  type ScreenReaderInstructions,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { STATUS_LABELS } from "@/features/contacts/labels";
import {
  CONTACT_STATUSES,
  contactStatusSchema,
  type Contact,
  type ContactStatus,
} from "@/features/contacts/schema";

// dnd-kit setup for the board. Draggables use the contact id; droppables use the status.

/** A droppable id back to a status, or null when the card is not over a column. */
export function statusFromDroppable(id: UniqueIdentifier | undefined): ContactStatus | null {
  const parsed = contactStatusSchema.safeParse(id);
  return parsed.success ? parsed.data : null;
}

/** Mouse: the column under the pointer. Keyboard has no pointer, so fall back to overlap. */
export const columnCollision: CollisionDetection = (args) => {
  const underPointer = pointerWithin(args);
  return underPointer.length > 0 ? underPointer : rectIntersection(args);
};

/**
 * Left and Right jump a whole column. dnd-kit's default nudges 25px per key press, which takes
 * a dozen presses to cross a column. Up and Down do nothing: a column is sorted by date.
 */
export const columnKeyboardCoordinates: KeyboardCoordinateGetter = (
  event,
  { currentCoordinates, context },
) => {
  const step = event.code === "ArrowRight" ? 1 : event.code === "ArrowLeft" ? -1 : 0;
  if (step === 0) return undefined;
  event.preventDefault();

  const current = statusFromDroppable(context.over?.id);
  if (!current) return undefined;
  const target = CONTACT_STATUSES[CONTACT_STATUSES.indexOf(current) + step];
  const targetRect = target ? context.droppableRects.get(target) : undefined;
  if (!targetRect) return undefined;

  // Centre the card in the target column, at the same height.
  const cardWidth = context.collisionRect?.width ?? 0;
  return { x: targetRect.left + (targetRect.width - cardWidth) / 2, y: currentCoordinates.y };
};

export const screenReaderInstructions: ScreenReaderInstructions = {
  draggable:
    "To move a contact, press Space to pick it up, use the arrow keys to choose a column, then press Space to drop it. Press Escape to cancel. You can also use the Move button on each card.",
};

/** What a screen reader hears during a drag, from the pipeline.dnd.* copy. */
export function buildAnnouncements(findContact: (id: UniqueIdentifier) => Contact | undefined): Announcements {
  function describe(id: UniqueIdentifier) {
    const contact = findContact(id);
    return contact
      ? { name: contact.fullName, from: STATUS_LABELS[contact.status], status: contact.status }
      : null;
  }

  return {
    onDragStart({ active }) {
      const card = describe(active.id);
      return card ? `Picked up ${card.name} from ${card.from}.` : undefined;
    },
    onDragOver({ active, over }) {
      const card = describe(active.id);
      if (!card) return undefined;
      const to = statusFromDroppable(over?.id);
      return to ? `${card.name} is over ${STATUS_LABELS[to]}.` : `${card.name} is not over a column.`;
    },
    onDragEnd({ active, over }) {
      const card = describe(active.id);
      if (!card) return undefined;
      const to = statusFromDroppable(over?.id);
      if (!to) return `Move cancelled. ${card.name} stays in ${card.from}.`;
      if (to === card.status) return `${card.name} dropped back in ${card.from}. No change.`;
      return `${card.name} dropped in ${STATUS_LABELS[to]}.`;
    },
    onDragCancel({ active }) {
      const card = describe(active.id);
      return card ? `Move cancelled. ${card.name} stays in ${card.from}.` : undefined;
    },
  };
}
