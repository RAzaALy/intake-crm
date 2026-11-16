"use client";

import type { KeyboardEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/cn";
import { NOTE_MAX_LENGTH, noteBodySchema } from "@/features/contacts/schema";

const noteFormSchema = z.object({ body: noteBodySchema });
type NoteFormValues = z.input<typeof noteFormSchema>;

// The counter is only announced near the limit; on every keystroke it would drown out typing.
const ANNOUNCE_BELOW = 100;

type NoteFormProps = {
  /** Saves the note. Throwing means it failed, and the text goes back in the box. */
  onAdd: (body: string) => Promise<void>;
  /** True while a note is saving. Blocks a second submit, which would replace the pending one. */
  adding: boolean;
};

export function NoteForm({ onAdd, adding }: NoteFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    setFocus,
    control,
    formState: { errors },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: { body: "" },
  });

  const count = useWatch({ control, name: "body" }).length;
  const remaining = NOTE_MAX_LENGTH - count;

  async function handleValid({ body }: NoteFormValues) {
    // Optimistic: the box clears at once and the note shows as "Saving…" in the list.
    reset({ body: "" });
    // The button disables while saving, which would drop focus to the page. Keep it in the box.
    setFocus("body");
    try {
      await onAdd(body);
    } catch {
      // Never lose words typed on a call. If the person already started the next note,
      // keep that too, under the one that failed.
      const typedSince = getValues("body");
      setValue("body", typedSince ? `${body}\n\n${typedSince}` : body);
      setFocus("body");
    }
  }

  const submit = handleSubmit(handleValid);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      if (!adding) void submit();
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-2">
      <Field label="Add a note" hint="Ctrl+Enter or Cmd+Enter to add" error={errors.body?.message}>
        {(fieldProps) => (
          <Textarea
            {...fieldProps}
            {...register("body")}
            rows={3}
            placeholder="What was discussed and what happens next"
            onKeyDown={handleKeyDown}
          />
        )}
      </Field>
      <div className="flex items-center justify-between gap-3">
        <p
          aria-hidden="true"
          className={cn("text-meta tabular-nums", remaining < 0 ? "text-danger" : "text-ink-faint")}
        >
          {count} / {NOTE_MAX_LENGTH}
        </p>
        <p role="status" className="sr-only">
          {remaining < ANNOUNCE_BELOW ? `${Math.max(remaining, 0)} characters left` : ""}
        </p>
        <Button type="submit" loading={adding}>
          {adding ? "Adding…" : "Add note"}
        </Button>
      </div>
    </form>
  );
}
