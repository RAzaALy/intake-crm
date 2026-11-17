import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactList } from "@/features/contacts/components/ContactList";
import { ContactListSkeleton } from "@/features/contacts/components/ContactListSkeleton";

export const metadata: Metadata = {
  title: "Contacts",
};

export default function ContactsPage() {
  return (
    // data-fill-viewport: from 768px the page is one screen tall and the table scrolls (see AppShell).
    <div data-fill-viewport className="md:flex md:min-h-0 md:flex-1 md:flex-col">
      <PageHeader title="Contacts" />
      {/* ContactList reads the URL (useSearchParams), so it renders in the browser. The h1 above
          is still in the server HTML, and the fallback is the same skeleton as the loading state. */}
      <Suspense fallback={<ContactListSkeleton />}>
        <ContactList />
      </Suspense>
    </div>
  );
}
