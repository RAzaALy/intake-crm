"use client";

import { useState } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { useContacts } from "@/features/contacts/api/queries";
import { CONTACT_STATUSES, type Contact, type ContactStatus } from "@/features/contacts/schema";
import { useFailureSimulated } from "@/lib/useFailureSimulated";
import { groupByStatus } from "../board";
import { usePipelineMove } from "../usePipelineMove";
import { Column } from "./Column";
import { PipelineSkeleton } from "./PipelineSkeleton";

/** The /pipeline screen below the h1: loading, error, or three columns. */
export function Board() {
  const { data: contacts, isPending, isFetching, refetch } = useContacts();
  const failureSimulated = useFailureSimulated();
  const move = usePipelineMove();
  // The card whose Move button gets focus after a menu move lands it in its new column.
  const [focusId, setFocusId] = useState<string | null>(null);

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

  function handleMenuMove(contact: Contact, to: ContactStatus) {
    setFocusId(contact.id);
    move(contact, to);
  }

  const columns = groupByStatus(contacts);
  // One clock per render, so every card agrees on "now".
  const now = new Date();

  return (
    <>
      {/* Phones: one row that scrolls sideways and snaps to a column. 768px up: a three-column grid. */}
      <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:snap-none md:grid-cols-3 md:overflow-visible md:px-0">
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
    </>
  );
}
