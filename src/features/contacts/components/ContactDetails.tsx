"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { ErrorState } from "@/components/ui/ErrorState";
import { useFailureSimulated } from "@/lib/useFailureSimulated";
import { useContact } from "../api/queries";
import { ContactDetailsHeader } from "./ContactDetailsHeader";
import { ContactDetailsSkeleton } from "./ContactDetailsSkeleton";
import { ContactNotFound } from "./ContactNotFound";
import { DetailsPanel } from "./DetailsPanel";

/** The /contacts/[id] screen: load the contact, then show one state. */
export function ContactDetails() {
  const { id } = useParams<{ id: string }>();
  const { data, isPending, isFetching, refetch } = useContact(id);
  const failureSimulated = useFailureSimulated();

  const name = data?.contact.fullName;
  // The server cannot know the name (it lives in localStorage), so the tab title is set here.
  useEffect(() => {
    if (name) document.title = `${name} · Intake`;
  }, [name]);

  if (isPending) return <ContactDetailsSkeleton />;

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
  // One clock per render, so every relative time on the page agrees on "now".
  const now = new Date();

  return (
    <div className="flex flex-col gap-6">
      <ContactDetailsHeader contact={contact} />
      {/* DOM order is the phone order (Notes, Details, Activity). From 1024px Details moves
          to a right-hand column spanning both rows. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <DetailsPanel contact={contact} now={now} />
        </div>
      </div>
    </div>
  );
}
