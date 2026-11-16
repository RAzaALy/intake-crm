import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ContactFormValues, ContactStatus } from "../schema";
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
// Optimistic updates for moves and notes are added with the screens that need them.

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

export function useAddNote(contactId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => addNote(contactId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contactKeys.all }),
  });
}
