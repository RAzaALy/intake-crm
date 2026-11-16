import type { Metadata } from "next";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <>
      <PageHeader title="Page not found" />
      <div className="flex flex-col items-start gap-3">
        <p className="text-body text-ink">
          There&apos;s no page at this address. The link may be wrong or out of date.
        </p>
        <Link href="/contacts" className={buttonStyles({ variant: "secondary" })}>
          Go to contacts
        </Link>
      </div>
    </>
  );
}
