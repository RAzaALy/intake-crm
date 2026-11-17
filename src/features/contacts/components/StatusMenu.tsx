"use client";

import { ChevronDown, LoaderCircle } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { toast } from "sonner";
import { buttonStyles } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useMoveContact } from "../api/queries";
import { CONTACT_STATUSES, type Contact, type ContactStatus } from "../schema";
import { STATUS_LABELS } from "../labels";

/**
 * "Change status" menu on the details page. Not optimistic: the badge changes when the save
 * lands, about half a second, and the toast confirms it. Radix gives the menu roles, arrow-key
 * navigation, typeahead and Escape, and returns focus to the trigger when it closes.
 */
export function StatusMenu({ contact }: { contact: Contact }) {
  const moveContact = useMoveContact();
  const saving = moveContact.isPending;
  const current = STATUS_LABELS[contact.status];
  const others = CONTACT_STATUSES.filter((status) => status !== contact.status);

  function handleSelect(status: ContactStatus) {
    moveContact.mutate(
      { id: contact.id, status },
      {
        onSuccess: () => {
          if (status === "active" && contact.conflictCheck === "flagged") {
            toast.warning(`${contact.fullName} moved to Active. Conflict check is still flagged.`);
          } else {
            toast(`${contact.fullName} moved to ${STATUS_LABELS[status]}.`);
          }
        },
        onError: () => {
          toast.error(`Couldn't change the status. ${contact.fullName} is still ${current}. Try again.`);
        },
      },
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={`Change status, currently ${current}`}
        aria-busy={saving || undefined}
        className={buttonStyles({ variant: "secondary" })}
      >
        Change status
        {saving ? (
          <LoaderCircle size={16} aria-hidden="true" className="motion-safe:animate-spin" />
        ) : (
          <ChevronDown size={16} aria-hidden="true" />
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-30 min-w-44 rounded-panel border border-line bg-surface p-1 shadow-float"
        >
          {others.map((status) => (
            <DropdownMenu.Item
              key={status}
              // Items, not the trigger, are disabled while saving: a disabled trigger would drop focus.
              disabled={saving}
              onSelect={() => handleSelect(status)}
              className={cn(
                "flex h-11 cursor-pointer items-center rounded-control px-3 text-body text-ink outline-none md:h-9",
                "data-highlighted:bg-sunken data-disabled:cursor-default data-disabled:text-ink-faint",
              )}
            >
              Move to {STATUS_LABELS[status]}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
