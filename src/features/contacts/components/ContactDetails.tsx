"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { buttonStyles } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { useFailureSimulated } from "@/lib/useFailureSimulated";
import { useContact } from "../api/queries";
import { ContactNotFound } from "./ContactNotFound";

// TODO(phase 6): placeholder so a saved form has a page to land on.
// Phase 6 replaces the body with the header, notes, details and timeline.
export function ContactDetails() {
  const { id } = useParams<{ id: string }>();
  const { data, isPending, isFetching, refetch } = useContact(id);
  const failureSimulated = useFailureSimulated();

  if (isPending) {
    return (
      <div className="flex flex-col gap-3">
        <p role="status" className="sr-only">
          Loading contact…
        </p>
        <Skeleton className="h-8 w-56" />
      </div>
    );
  }

  // Only when there is nothing to show: a failed background refetch keeps the old data.
  if (data === undefined) {
    return (
      <ErrorState
        title="This contact didn't load"
        body={
          failureSimulated
            ? "Simulate API failure is on, so every request fails. Turn it off to load data again."
            : "We couldn't load this contact. Check your connection and try again."
        }
        retryLabel="Try again"
        onRetry={() => void refetch()}
        retrying={isFetching}
      />
    );
  }

  if (data === null) return <ContactNotFound />;

  const { contact } = data;
  return (
    <>
      <Link href="/contacts" className="mb-4 inline-block text-body text-primary underline-offset-2 hover:underline">
        Back to contacts
      </Link>
      <PageHeader
        title={contact.fullName}
        actions={
          <Link
            href={`/contacts/${contact.id}/edit`}
            aria-label={`Edit ${contact.fullName}`}
            className={buttonStyles({ variant: "secondary" })}
          >
            Edit
          </Link>
        }
      />
    </>
  );
}
