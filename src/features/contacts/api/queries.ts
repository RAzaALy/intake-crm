import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Contact, ContactFormValues, ContactStatus } from "../schema";
import {
  addNote,
  createContact,
  getContact,
  listContacts,
  moveContact,
  updateContact,
} from "./repository";

// One place for query keys, so every invalidation targets the same arrays.
export const contactKeys = {
  all: ["contacts"] as const,
  list: () => [...contactKeys.all, "list"] as const,
  detail: (id: string) => [...contactKeys.all, "detail", id] as const,
};

export function useContacts() {
  return useQuery({ queryKey: contactKeys.list(), queryFn: listContacts });
}

export function useContact(id: string) {
  return useQuery({ queryKey: contactKeys.detail(id), queryFn: () => getContact(id) });
}

// Every write changes the list (last activity, status counts) and the contact's own page,
// so each mutation refreshes everything under "contacts". With ~20 contacts that is cheap.
// onSuccess returns the invalidation promise on purpose: the mutation stays pending until
// the refetch is done, so "Saving…" covers it and the next page opens with fresh data.
// The pipeline move below is the one optimistic write (see useMoveContactOptimistic).

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: ContactFormValues) => createContact(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contactKeys.all }),
  });
}

export function useUpdateContact(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: ContactFormValues) => updateContact(id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contactKeys.all }),
  });
}

export function useMoveContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactStatus }) => moveContact(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contactKeys.all }),
  });
}

const moveMutationKey = ["contacts", "move"] as const;

type MoveVariables = { id: string; status: ContactStatus };

/**
 * Pipeline moves: the card changes column at once and the save confirms it. The details page
 * keeps the plain useMoveContact. If the save fails, only the moved contact is put back, so a
 * second move still saving is not undone with it.
 */
export function useMoveContactOptimistic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: moveMutationKey,
    // Saves run one at a time, in click order. onMutate still runs at once, so cards move instantly.
    // Without this, two quick moves of one card could save out of order (latency is random).
    scope: { id: "contact-move" },
    mutationFn: ({ id, status }: MoveVariables) => moveContact(id, status),
    onMutate: async ({ id, status }) => {
      // A list fetch that lands after this point would paint the old status back.
      await queryClient.cancelQueries({ queryKey: contactKeys.list() });
      const previous = queryClient
        .getQueryData<Contact[]>(contactKeys.list())
        ?.find((contact) => contact.id === id);
      // lastActivityAt too, so the card lands at the top of its new column, where the save will put it.
      const now = new Date().toISOString();
      queryClient.setQueryData<Contact[]>(contactKeys.list(), (contacts) =>
        contacts?.map((c) => (c.id === id ? { ...c, status, lastActivityAt: now } : c)),
      );
      return { previous };
    },
    onError: (_error, { id, status }, context) => {
      const previous = context?.previous;
      if (!previous) return;
      // Only if nothing has moved the card since; a later move's state wins.
      queryClient.setQueryData<Contact[]>(contactKeys.list(), (contacts) =>
        contacts?.map((c) => (c.id === id && c.status === status ? previous : c)),
      );
    },
    onSettled: () => {
      // Refetch only when this is the last move saving: an earlier refetch would briefly
      // show the other card back in its old column. Not returned, so the toast does not wait for it.
      if (queryClient.isMutating({ mutationKey: moveMutationKey }) === 1) {
        void queryClient.invalidateQueries({ queryKey: contactKeys.all });
      }
    },
  });
}

export function useAddNote(contactId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => addNote(contactId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contactKeys.all }),
  });
}
