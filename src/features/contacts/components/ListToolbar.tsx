"use client";

import { useId, type RefObject } from "react";
import { Select } from "@/components/ui/Select";
import { isSortKey, SORT_KEYS, type ListParams, type StatusCounts } from "../filters";
import { SORT_LABELS } from "../labels";
import { SearchBox } from "./SearchBox";
import { StatusFilter } from "./StatusFilter";

type ListToolbarProps = {
  params: ListParams;
  counts: StatusCounts;
  /** Contacts shown after search and status filter. */
  resultCount: number;
  onChange: (changes: Partial<ListParams>) => void;
  onSearch: (query: string) => void;
  searchRef: RefObject<HTMLInputElement | null>;
};

function announcement(count: number): string {
  if (count === 0) return "No contacts found";
  if (count === 1) return "1 contact found";
  return `${count} contacts found`;
}

export function ListToolbar({
  params,
  counts,
  resultCount,
  onChange,
  onSearch,
  searchRef,
}: ListToolbarProps) {
  const sortId = useId();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="md:flex-1">
          <SearchBox value={params.query} onSearch={onSearch} inputRef={searchRef} />
        </div>
        <div className="flex flex-col gap-1.5 md:w-48">
          <label htmlFor={sortId} className="text-body font-medium text-ink">
            Sort by
          </label>
          <Select
            id={sortId}
            value={params.sort}
            onChange={(event) => {
              if (isSortKey(event.target.value)) onChange({ sort: event.target.value });
            }}
          >
            {SORT_KEYS.map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <StatusFilter value={params.status} counts={counts} onChange={(status) => onChange({ status })} />
        <p aria-hidden="true" className="hidden shrink-0 text-body text-ink-muted tabular-nums md:block">
          {resultCount === 1 ? "1 contact" : `${resultCount} contacts`}
        </p>
      </div>

      {/* Follows the URL, which only changes after the debounce, so it is not read out per keystroke. */}
      <p role="status" className="sr-only">
        {announcement(resultCount)}
      </p>
    </div>
  );
}
