import { RelativeTime } from "@/components/ui/RelativeTime";
import type { Note } from "@/features/contacts/schema";

type NoteListProps = {
  /** Newest first, as the repository returns them. */
  notes: Note[];
  /** The body of a note that is still saving. Shown on top until the save settles. */
  pendingBody: string | null;
  now: Date;
};

const bodyStyles = "max-w-[70ch] text-body break-words whitespace-pre-wrap text-ink";

export function NoteList({ notes, pendingBody, now }: NoteListProps) {
  if (notes.length === 0 && pendingBody === null) {
    return (
      <p className="text-body text-ink-muted">
        No notes yet. Add what was discussed on the first call.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-line">
      {pendingBody !== null && (
        <li aria-busy="true" className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
          <p className={bodyStyles}>{pendingBody}</p>
          <p className="text-meta text-ink-faint">Saving…</p>
        </li>
      )}
      {notes.map((note) => (
        <li key={note.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
          <p className={bodyStyles}>{note.body}</p>
          <RelativeTime iso={note.createdAt} now={now} className="text-meta text-ink-faint" />
        </li>
      ))}
    </ul>
  );
}
