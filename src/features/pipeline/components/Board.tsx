"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { ErrorState } from "@/components/ui/ErrorState";
import { useContacts } from "@/features/contacts/api/queries";
import { CONTACT_STATUSES, type Contact, type ContactStatus } from "@/features/contacts/schema";
import { useFailureSimulated } from "@/lib/useFailureSimulated";
import { groupByStatus } from "../board";
import {
  buildAnnouncements,
  columnCollision,
  columnKeyboardCoordinates,
  screenReaderInstructions,
  statusFromDroppable,
} from "../dnd";
import { usePipelineMove } from "../usePipelineMove";
import { Column } from "./Column";
import { PipelineCardPreview } from "./PipelineCardPreview";
import { PipelineSkeleton } from "./PipelineSkeleton";

/** The /pipeline screen below the h1: loading, error, or three columns. */
export function Board() {
  const { data: contacts, isPending, isFetching, refetch } = useContacts();
  const failureSimulated = useFailureSimulated();
  const move = usePipelineMove();
  // The card whose Move button gets focus after a menu move or keyboard drop lands it in its new column.
  const [focusId, setFocusId] = useState<string | null>(null);
  // The card being dragged, for the preview that follows the pointer.
  const [draggingId, setDraggingId] = useState<UniqueIdentifier | null>(null);

  // Mouse and keyboard only. No touch sensor, so on a phone a swipe always scrolls the board.
  // The 8px distance lets a click on the name or the Move button stay a click.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: columnKeyboardCoordinates }),
  );

  if (isPending) return <PipelineSkeleton />;

  // Only when there is nothing to show. After a failed move the refetch fails too, but TanStack
  // keeps the last good list, so the board stays up and the toast reports the failure.
  if (!contacts) {
    return (
      <ErrorState
        title="Pipeline didn't load"
        // "Check your connection" would mislead when the demo switch caused the failure.
        body={
          failureSimulated
            ? "Simulate API failure is on, so every request fails. Turn it off to load data again."
            : "We couldn't load the pipeline. Check your connection and try again."
        }
        retryLabel="Try again"
        onRetry={() => void refetch()}
        retrying={isFetching}
      />
    );
  }

  const findContact = (id: UniqueIdentifier) => contacts.find((contact) => contact.id === id);

  function handleMenuMove(contact: Contact, to: ContactStatus) {
    setFocusId(contact.id);
    move(contact, to);
  }

  function handleDragStart({ active }: DragStartEvent) {
    // Forget the last focus target, or a mouse drag of that card would pull focus to it.
    setFocusId(null);
    setDraggingId(active.id);
  }

  function handleDragEnd({ active, over, activatorEvent }: DragEndEvent) {
    setDraggingId(null);
    const contact = findContact(active.id);
    const to = statusFromDroppable(over?.id);
    if (!contact || !to || to === contact.status) return;
    // dnd-kit refocuses the grip, but the card remounts in its new column just after that,
    // so a keyboard drop would leave focus on <body>. Same fix as the menu. Mouse drags leave focus alone.
    if (activatorEvent instanceof KeyboardEvent) setFocusId(contact.id);
    move(contact, to);
  }

  const columns = groupByStatus(contacts);
  // One clock per render, so every card agrees on "now".
  const now = new Date();
  const dragging = draggingId === null ? undefined : findContact(draggingId);

  return (
    <DndContext
      // A fixed id instead of dnd-kit's counter, so its aria ids stay stable.
      id="pipeline"
      sensors={sensors}
      collisionDetection={columnCollision}
      accessibility={{ announcements: buildAnnouncements(findContact), screenReaderInstructions }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDraggingId(null)}
    >
      {/* Phones: one row that scrolls sideways and snaps to a column. 768px up: a three-column grid
          that fills the rest of the screen, one row tall, and each column scrolls on its own. */}
      <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:min-h-0 md:flex-1 md:snap-none md:grid-cols-3 md:grid-rows-1 md:overflow-visible md:px-0 md:pb-0">
        {CONTACT_STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            contacts={columns[status]}
            now={now}
            onMove={handleMenuMove}
            focusId={focusId}
          />
        ))}
      </div>
      {/* No drop animation: it would fly the preview back to the old column before the card moves. */}
      <DragOverlay dropAnimation={null}>
        {dragging && <PipelineCardPreview contact={dragging} now={now} />}
      </DragOverlay>
    </DndContext>
  );
}
