"use client";

import type { RefObject } from "react";
import { AlertDialog } from "radix-ui";
import { buttonStyles } from "@/components/ui/Button";

type UnsavedChangesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
  /** The link that opened the dialog. There is no Radix Trigger, so focus is returned by hand. */
  returnFocusRef: RefObject<HTMLAnchorElement | null>;
};

/**
 * Confirm before leaving with unsaved edits. Radix AlertDialog gives role="alertdialog",
 * wires title and description, traps focus, and always starts on Cancel ("Keep editing"),
 * wherever it sits in the DOM, so pressing Enter by reflex keeps the work.
 */
export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onDiscard,
  returnFocusRef,
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-40 bg-ink/40" />
        <AlertDialog.Content
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocusRef.current?.focus();
          }}
          className="fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-(--spacing(8)))] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-panel border border-line bg-surface p-6 shadow-float"
        >
          <div className="flex flex-col gap-1">
            <AlertDialog.Title className="text-base font-semibold text-ink">
              Leave without saving?
            </AlertDialog.Title>
            <AlertDialog.Description className="text-body text-ink-muted">
              Your changes to this contact will be lost.
            </AlertDialog.Description>
          </div>
          {/* DOM order matches what is seen on wider screens, so Tab moves left to right.
              On phones column-reverse puts "Keep editing" on top. */}
          <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
            <AlertDialog.Action className={buttonStyles({ variant: "danger" })} onClick={onDiscard}>
              Discard changes
            </AlertDialog.Action>
            <AlertDialog.Cancel className={buttonStyles({ variant: "secondary" })}>
              Keep editing
            </AlertDialog.Cancel>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
