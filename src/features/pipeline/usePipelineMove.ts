import { toast } from "sonner";
import { useMoveContactOptimistic } from "@/features/contacts/api/queries";
import type { Contact, ContactStatus } from "@/features/contacts/schema";
import { isFlaggedToActive, moveFailedMessage, movedMessage } from "./board";

/**
 * One move: optimistic update, then a toast for the result.
 * The repository writes the status_changed activity, so nothing here touches the timeline.
 */
export function usePipelineMove() {
  const mutation = useMoveContactOptimistic();

  // mutateAsync, not mutate with callbacks: TanStack only runs mutate()'s callbacks for the
  // latest call, so two quick moves would lose the first toast. Each promise settles on its own.

  function move(contact: Contact, to: ContactStatus) {
    if (contact.status === to) return;
    mutation.mutateAsync({ id: contact.id, status: to }).then(
      () => {
        if (isFlaggedToActive(contact, to)) {
          // The warning icon is a second cue besides the words, for the one risky move.
          toast.warning(movedMessage(contact, to));
        } else {
          toast(movedMessage(contact, to));
        }
      },
      () =>
        toast.error(moveFailedMessage(contact), {
          action: { label: "Try again", onClick: () => move(contact, to) },
        }),
    );
  }

  return move;
}
