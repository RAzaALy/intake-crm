"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type DefaultValues, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, buttonStyles } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { DuplicateEmailError } from "../api/repository";
import { contactInputSchema, type ContactFormValues, type ContactInput } from "../schema";
import { useUnsavedChangesGuard } from "../useUnsavedChangesGuard";
import { ContactFormFields } from "./ContactFormFields";
import { SaveErrorAlert } from "./SaveErrorAlert";
import { UnsavedChangesDialog } from "./UnsavedChangesDialog";

// "saved" keeps the form busy while the page navigates away, so nothing can be pressed twice.
type SaveState = "idle" | "saving" | "saved" | "failed";

const SUBMIT_LABELS = {
  create: { idle: "Create contact", busy: "Creating…" },
  edit: { idle: "Save contact", busy: "Saving…" },
} as const;

function errorSummary(count: number): string {
  return count === 1
    ? "1 field needs fixing before you can save."
    : `${count} fields need fixing before you can save.`;
}

type ContactFormProps = {
  variant: "create" | "edit";
  defaultValues: DefaultValues<ContactFormValues>;
  /** Where Cancel goes: the list for a new contact, the contact itself when editing. */
  cancelHref: string;
  /** Saves and navigates. Throwing keeps the form on screen with every value. */
  onSubmit: (values: ContactInput) => Promise<void>;
};

export function ContactForm({ variant, defaultValues, cancelHref, onSubmit }: ContactFormProps) {
  const router = useRouter();
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [summary, setSummary] = useState("");
  // Where the person tried to go with unsaved changes. Non-null opens the confirm dialog.
  const [leaveHref, setLeaveHref] = useState<string | null>(null);
  const leaveLinkRef = useRef<HTMLAnchorElement | null>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<ContactFormValues, unknown, ContactInput>({
    resolver: zodResolver(contactInputSchema),
    defaultValues,
    // Errors appear when a field is left, then update as the person types the fix.
    mode: "onTouched",
  });

  const busy = saveState === "saving" || saveState === "saved";

  useUnsavedChangesGuard(isDirty && saveState !== "saved", (link, href) => {
    // While saving, leaving would race the save's own redirect, so the click does nothing.
    if (busy) return;
    leaveLinkRef.current = link;
    setLeaveHref(href);
  });

  /** Clear first, so the live region speaks even when the text is the same as last time. */
  function announce(message: string) {
    setSummary("");
    requestAnimationFrame(() => setSummary(message));
  }

  async function handleValid(values: ContactInput) {
    setSummary("");
    setSaveState("saving");
    try {
      await onSubmit(values);
      setSaveState("saved");
    } catch (error) {
      if (error instanceof DuplicateEmailError) {
        // Only the repository knows every email, so this check runs on save, not on blur.
        setSaveState("idle");
        setError(
          "email",
          { type: "duplicate", message: "Another contact already uses this email." },
          { shouldFocus: true },
        );
        announce(errorSummary(1));
      } else {
        setSaveState("failed");
        // The button was disabled while saving, which drops keyboard focus to <body>.
        requestAnimationFrame(() => submitRef.current?.focus());
      }
    }
  }

  // React Hook Form has already focused the first invalid field; this tells screen readers how many.
  function handleInvalid(fieldErrors: FieldErrors<ContactFormValues>) {
    setSaveState("idle");
    announce(errorSummary(Object.keys(fieldErrors).length));
  }

  const labels = SUBMIT_LABELS[variant];

  return (
    <>
      {/* noValidate: Zod owns validation, so the browser's own email bubble never appears. */}
      <form
        noValidate
        // Built inside the handler: handleValid reads a ref, which must not happen during render.
        onSubmit={(event) => void handleSubmit(handleValid, handleInvalid)(event)}
        className="flex max-w-160 flex-col gap-6"
      >
        <ContactFormFields register={register} errors={errors} />

        <p role="status" className="sr-only">
          {summary}
        </p>
        {saveState === "failed" && <SaveErrorAlert />}

        <div className="flex flex-col gap-2 md:flex-row">
          <Button ref={submitRef} type="submit" loading={busy}>
            {busy ? labels.busy : labels.idle}
          </Button>
          {/* With unsaved changes, the guard turns this click into the confirm dialog. */}
          <Link
            href={cancelHref}
            aria-disabled={busy || undefined}
            tabIndex={busy ? -1 : undefined}
            className={cn(buttonStyles({ variant: "secondary" }), busy && "pointer-events-none opacity-60")}
          >
            Cancel
          </Link>
        </div>
      </form>
      <UnsavedChangesDialog
        open={leaveHref !== null}
        onOpenChange={(open) => {
          if (!open) setLeaveHref(null);
        }}
        onDiscard={() => {
          if (leaveHref) router.push(leaveHref);
        }}
        returnFocusRef={leaveLinkRef}
      />
    </>
  );
}
