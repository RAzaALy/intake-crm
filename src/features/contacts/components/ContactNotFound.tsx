import Link from "next/link";
import { buttonStyles } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

/** An unknown contact id, on the details page and the edit form. */
export function ContactNotFound() {
  return (
    <>
      <PageHeader title="Contact not found" />
      <div className="flex flex-col items-start gap-3">
        <p className="text-body text-ink">
          This contact doesn&apos;t exist. The link may be wrong or out of date.
        </p>
        <Link href="/contacts" className={buttonStyles({ variant: "secondary" })}>
          Back to contacts
        </Link>
      </div>
    </>
  );
}
