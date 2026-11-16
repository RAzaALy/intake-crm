import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { buttonStyles } from "@/components/ui/Button";
import type { Contact } from "../schema";
import { MATTER_LABELS } from "../labels";
import { ConflictBadge } from "./ConflictBadge";
import { StatusBadge } from "./StatusBadge";
import { StatusMenu } from "./StatusMenu";

/**
 * Answers "where are we with this person" at a glance: name, status, conflict check, matter.
 * Not PageHeader: that hides the h1 on phones, where the top bar would only say "Intake".
 */
export function ContactDetailsHeader({ contact }: { contact: Contact }) {
  return (
    <header className="flex flex-col gap-4">
      <Link
        href="/contacts"
        className="inline-flex min-h-11 items-center gap-1 self-start text-body text-primary underline-offset-2 hover:underline md:min-h-0"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        Back to contacts
      </Link>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="font-serif text-title font-semibold break-words text-ink lg:text-title-lg">
            {contact.fullName}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={contact.status} />
            <ConflictBadge check={contact.conflictCheck} />
            <span className="text-body text-ink-muted">{MATTER_LABELS[contact.matterType]} matter</span>
          </div>
        </div>
        {/* Two equal buttons side by side on phones, natural width on wider screens. */}
        <div className="grid grid-cols-2 gap-2 md:flex">
          <Link
            href={`/contacts/${contact.id}/edit`}
            aria-label={`Edit ${contact.fullName}`}
            className={buttonStyles({ variant: "secondary" })}
          >
            Edit
          </Link>
          <StatusMenu contact={contact} />
        </div>
      </div>
    </header>
  );
}
