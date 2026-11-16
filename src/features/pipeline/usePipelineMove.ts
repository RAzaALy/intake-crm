import { toast } from "sonner";
import { useMoveContactOptimistic } from "@/features/contacts/api/queries";
import type { Contact, ContactStatus } from "@/features/contacts/schema";
import {
  isFlaggedToActive,
  moveFailedMessage,
  movedMessage,
  undoFailedMessage,
  undoneMessage,
} from "./board";

// Long enough to read the sentence and reach Undo, including a thumb travelling down a phone screen.
const ACTION_TOAST_MS = 8000;

/**
 * One move from any source (menu or drag): optimistic update, then a toast for the result.
 * The repository writes the status_changed activity, so nothing here touches the timeline.
 */
export function usePipelineMove() {
  const mutation = useMoveContactOptimistic();

  // mutateAsync, not mutate with callbacks: TanStack only runs mutate()'s callbacks for the
  // latest call, so two quick moves would lose the first toast. Each promise settles on its own.
  //
  // Every toast for a contact shares one id, so a newer toast replaces the older one. Otherwise
  // Undo on an old toast could send the card back past a later move.

  function move(contact: Contact, to: ContactStatus) {
    if (contact.status === to) return;
    const id = `move-${contact.id}`;
    mutation.mutateAsync({ id: contact.id, status: to }).then(
      () => {
        const undoAction = { label: "Undo", onClick: () => undo(contact, to) };
        if (isFlaggedToActive(contact, to)) {
          // The warning icon is a second cue besides the words, for the one risky move.
          toast.warning(movedMessage(contact, to), { id, action: undoAction, duration: ACTION_TOAST_MS });
        } else {
          toast(movedMessage(contact, to), { id, action: undoAction, duration: ACTION_TOAST_MS });
        }
      },
      () =>
        toast.error(moveFailedMessage(contact), {
          id,
          action: { label: "Try again", onClick: () => move(contact, to) },
          duration: ACTION_TOAST_MS,
        }),
    );
  }

  /**
   * Undo is a second move back, not an erased first one, so the timeline shows both.
   * For an intake record that is the honest history.
   */
  function undo(contact: Contact, movedTo: ContactStatus) {
    // Updating a toast by id merges into the old one, so clear its Undo button and long duration.
    const replace = { id: `move-${contact.id}`, action: undefined, duration: undefined };
    mutation.mutateAsync({ id: contact.id, status: contact.status }).then(
      () => toast(undoneMessage(contact), replace),
      () => toast.error(undoFailedMessage(contact, movedTo), replace),
    );
  }

  return move;
}
