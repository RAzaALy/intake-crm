import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { NewContact } from "@/features/contacts/components/NewContact";

export const metadata: Metadata = {
  title: "New contact",
};

export default function NewContactPage() {
  return (
    <>
      <PageHeader title="New contact" />
      <NewContact />
    </>
  );
}
