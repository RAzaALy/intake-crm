import { Suspense } from "react";
import type { Metadata } from "next";
import { ContactDetails } from "@/features/contacts/components/ContactDetails";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    // With cacheComponents on, useParams waits for the request, so it needs a Suspense boundary.
    <Suspense>
      <ContactDetails />
    </Suspense>
  );
}
