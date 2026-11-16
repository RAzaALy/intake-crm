"use client";

import { toast } from "sonner";
import { Panel } from "@/components/ui/Panel";
import { useAddNote } from "@/features/contacts/api/queries";
import type { Note } from "@/features/contacts/schema";
import { NoteForm } from "./NoteForm";
import { NoteList } from "./NoteList";

type NotesProps = {
  contactId: string;
  notes: Note[];
  now: Date;
};

/**
 * Add-note box on top (during a call the coordinator writes, not reads), then the notes.
 *
 * Optimistic insert without touching the cache: while the mutation is pending, its
 * variables (the note text) render as a "Saving…" entry. If the save fails the mutation
 * stops pending and the entry disappears, so rollback needs no code. useAddNote keeps
 * the mutation pending until the refetch lands, so the pending and real note never both show.
 */
export function Notes({ contactId, notes, now }: NotesProps) {
  const addNote = useAddNote(contactId);

  async function handleAdd(body: string) {
    try {
      await addNote.mutateAsync(body);
      toast("Note added.");
    } catch (error) {
      toast.error("Note not saved. Your text is still in the box. Try again.");
      throw error;
    }
  }

  return (
    <Panel title="Notes">
      <NoteForm onAdd={handleAdd} adding={addNote.isPending} />
      {/* A rule separates the box from the record so far. */}
      <div className="border-t border-line pt-4">
        <NoteList
          notes={notes}
          pendingBody={addNote.isPending ? addNote.variables : null}
          now={now}
        />
      </div>
    </Panel>
  );
}
