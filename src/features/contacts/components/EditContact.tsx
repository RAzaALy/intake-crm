"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { useFailureSimulated } from "@/lib/useFailureSimulated";
import { useContact, useUpdateContact } from "../api/queries";
import { toFormValues } from "../formValues";
import type { ContactInput } from "../schema";
import { ContactForm } from "./ContactForm";
import { ContactFormSkeleton } from "./ContactFormSkeleton";
import { ContactNotFound } from "./ContactNotFound";

/** The /contacts/[id]/edit screen: load the contact, then show one state. */
export function EditContact() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isPending, isFetching, refetch } = useContact(id);
  const updateContact = useUpdateContact(id);
  const failureSimulated = useFailureSimulated();

  const name = data?.contact.fullName;
  // The server cannot know the name (it lives in localStorage), so the tab title is set here.
  useEffect(() => {
    if (name) document.title = `Edit ${name} · Intake`;
  }, [name]);

  async function handleSave(values: ContactInput) {
    await updateContact.mutateAsync(values);
    toast(`Changes to ${values.fullName} saved.`);
    router.push(`/contacts/${id}`);
  }

  if (isPending) return <ContactFormSkeleton />;

  // A failed background refetch (say, the demo switch flipped mid-edit) keeps the old data.
  // Only show the error when there is nothing to edit, or the person's typing would be lost.
  if (data === undefined) {
    return (
      <>
        <PageHeader title="Edit contact" />
        <ErrorState
          title="This contact didn't load"
          body={
            failureSimulated
              ? "Simulate API failure is on, so every request fails. Turn it off to load data again."
              : "We couldn't load this contact for editing. Check your connection and try again."
          }
          retryLabel="Try again"
          onRetry={() => void refetch()}
          retrying={isFetching}
        />
      </>
    );
  }

  if (data === null) return <ContactNotFound />;

  return (
    <>
      <PageHeader title={`Edit ${data.contact.fullName}`} />
      <ContactForm
        // A different contact must start a fresh form, not keep the last one's values.
        key={data.contact.id}
        variant="edit"
        defaultValues={toFormValues(data.contact)}
        cancelHref={`/contacts/${id}`}
        onSubmit={handleSave}
      />
    </>
  );
}
