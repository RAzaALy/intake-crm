import { Suspense } from "react";
import type { Metadata } from "next";
import { ContactFormSkeleton } from "@/features/contacts/components/ContactFormSkeleton";
import { EditContact } from "@/features/contacts/components/EditContact";

// The name is only known in the browser, so EditContact sets "Edit {name} · Intake" once loaded.
export const metadata: Metadata = {
  title: "Edit contact",
};

export default function EditContactPage() {
  return (
    // With cacheComponents on, useParams waits for the request, so it needs a Suspense boundary.
    <Suspense fallback={<ContactFormSkeleton />}>
      <EditContact />
    </Suspense>
  );
}
