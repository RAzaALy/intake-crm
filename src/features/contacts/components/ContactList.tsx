"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useFailureSimulated } from "@/lib/useFailureSimulated";
import { useContacts } from "../api/queries";
import { applyListParams } from "../filters";
import { useListParams } from "../useListParams";
import { useListShortcuts } from "../useListShortcuts";
import { ContactCardList } from "./ContactCardList";
import { ContactListSkeleton } from "./ContactListSkeleton";
import { ContactTable } from "./ContactTable";
import { ListToolbar } from "./ListToolbar";
import { NoMatches } from "./NoMatches";

/** The /contacts screen below the h1. Picks one state: loading, error, no data, no matches or rows. */
export function ContactList() {
  const { data: contacts, isPending, isError, isFetching, refetch } = useContacts();
  const { params, setParams } = useListParams();
  const failureSimulated = useFailureSimulated();
  const searchRef = useRef<HTMLInputElement>(null);
  useListShortcuts(searchRef);

  // Stable, so the search box's debounce effect does not restart on every render.
  const handleSearch = useCallback((query: string) => setParams({ query }), [setParams]);

  if (isPending) return <ContactListSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Contacts didn't load"
        // "Check your connection" would mislead when the demo switch caused the failure.
        body={
          failureSimulated
            ? "Simulate API failure is on, so every request fails. Turn it off to load data again."
            : "We couldn't load contacts. Check your connection and try again."
        }
        retryLabel="Try again"
        onRetry={() => void refetch()}
        retrying={isFetching}
      />
    );
  }

  if (contacts.length === 0) {
    return (
      <EmptyState
        title="No contacts yet"
        body="New inquiries you add will appear here."
        action={
          <Link href="/contacts/new" className={buttonStyles()}>
            New contact
          </Link>
        }
      />
    );
  }

  const result = applyListParams(contacts, params);
  // One clock per render, so every row agrees on "now".
  const now = new Date();

  return (
    <div className="flex flex-col gap-4">
      <ListToolbar
        params={params}
        counts={result.counts}
        resultCount={result.contacts.length}
        onChange={setParams}
        onSearch={handleSearch}
        searchRef={searchRef}
      />
      {result.contacts.length === 0 ? (
        <NoMatches params={params} onClear={() => setParams({ query: "", status: "all" })} />
      ) : (
        <>
          <div className="hidden md:block">
            <ContactTable contacts={result.contacts} sort={params.sort} now={now} />
          </div>
          <div className="md:hidden">
            <ContactCardList contacts={result.contacts} now={now} />
          </div>
        </>
      )}
    </div>
  );
}
