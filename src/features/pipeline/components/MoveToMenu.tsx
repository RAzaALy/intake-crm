import { useEffect, useRef } from "react";
import { DropdownMenu } from "radix-ui";
import { buttonStyles } from "@/components/ui/Button";
import { STATUS_LABELS } from "@/features/contacts/labels";
import { CONTACT_STATUSES, type Contact, type ContactStatus } from "@/features/contacts/schema";
import { cn } from "@/lib/cn";

type MoveToMenuProps = {
  contact: Contact;
  onMove: (contact: Contact, to: ContactStatus) => void;
  /** True right after a menu move: the card has a new parent, so this is a fresh button to focus. */
  autoFocus: boolean;
};

/**
 * The keyboard and phone way to move a card. Radix gives the menu roles, arrow keys,
 * typeahead and Escape. Unlike StatusMenu, nothing is disabled while saving: the move is
 * optimistic, so the menu already reflects the new column.
 */
export function MoveToMenu({ contact, onMove, autoFocus }: MoveToMenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const others = CONTACT_STATUSES.filter((status) => status !== contact.status);

  // The card remounts in its new column, so Radix cannot return focus to the old trigger.
  // On phones, focus without scrolling: the board stays on the column the person is working
  // through, and the toast says where the card went.
  useEffect(() => {
    if (!autoFocus) return;
    const phone = window.matchMedia("(max-width: 767px)").matches;
    triggerRef.current?.focus({ preventScroll: phone });
  }, [autoFocus]);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        ref={triggerRef}
        aria-label={`Move ${contact.fullName}`}
        className={buttonStyles({ variant: "ghost", size: "sm" })}
      >
        Move
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-30 min-w-44 rounded-panel border border-line bg-surface p-1 shadow-float"
        >
          <DropdownMenu.Label className="px-3 pt-1.5 pb-1 text-meta text-ink-faint">
            Move to
          </DropdownMenu.Label>
          {others.map((status) => (
            <DropdownMenu.Item
              key={status}
              onSelect={() => onMove(contact, status)}
              className={cn(
                "flex h-11 cursor-pointer items-center rounded-control px-3 text-body text-ink outline-none md:h-9",
                "data-highlighted:bg-sunken",
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
