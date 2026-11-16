"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateContact } from "../api/queries";
import { NEW_CONTACT_VALUES } from "../formValues";
import type { ContactInput } from "../schema";
import { ContactForm } from "./ContactForm";

export function NewContact() {
  const router = useRouter();
  const createContact = useCreateContact();

  async function handleSave(values: ContactInput) {
    const contact = await createContact.mutateAsync(values);
    toast(`${contact.fullName} added to contacts.`);
    router.push(`/contacts/${contact.id}`);
  }

  return (
    <ContactForm
      variant="create"
      defaultValues={NEW_CONTACT_VALUES}
      cancelHref="/contacts"
      onSubmit={handleSave}
    />
  );
}
