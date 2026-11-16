"use client";

import { useEffect, useId, useState, type RefObject } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/Input";

export const SEARCH_DEBOUNCE_MS = 250;

type SearchBoxProps = {
  /** The query in the URL. */
  value: string;
  /** Called 250 ms after typing stops, or straight away when the box is cleared. */
  onSearch: (query: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
};

export function SearchBox({ value, onSearch, inputRef }: SearchBoxProps) {
  const id = useId();
  // What is in the box. It runs ahead of the URL while the debounce waits.
  const [draft, setDraft] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  // The URL changed. If it now differs from the box, the change came from elsewhere
  // (Clear filters, the Contacts nav link), so the box follows it. Our own writes land
  // at once (history.replaceState), so they always equal the draft and change nothing.
  if (value !== prevValue) {
    setPrevValue(value);
    if (value !== draft) setDraft(value);
  }

  useEffect(() => {
    if (draft === value) return;
    const timer = setTimeout(() => onSearch(draft), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draft, value, onSearch]);

  function handleClear() {
    setDraft("");
    onSearch("");
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-body font-medium text-ink">
        Search contacts
      </label>
      <div className="relative">
        <Search
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint"
        />
        <Input
          ref={inputRef}
          id={id}
          type="search"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Name, email or phone"
          autoComplete="off"
          spellCheck={false}
          aria-describedby={`${id}-shortcut`}
          className="pr-11 pl-9 [&::-webkit-search-cancel-button]:hidden"
        />
        <span id={`${id}-shortcut`} className="sr-only">
          Press / to search
        </span>
        {draft ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute top-1/2 right-0 flex size-11 -translate-y-1/2 items-center justify-center rounded-control text-ink-muted hover:text-ink md:size-9"
          >
            <X size={16} aria-hidden="true" />
          </button>
        ) : (
          <kbd
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-control border border-line px-1.5 font-sans text-meta text-ink-faint md:block"
          >
            /
          </kbd>
        )}
      </div>
    </div>
  );
}
