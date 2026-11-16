import { CONTACT_STATUSES, type Contact, type ContactStatus } from "./schema";

// Pure functions only: no React, no storage, no clock. The list screen and the tests both use them.

export const SORT_KEYS = ["activity", "name", "added"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export type StatusFilter = ContactStatus | "all";

/** Everything the list screen keeps in the URL. */
export type ListParams = {
  query: string;
  status: StatusFilter;
  sort: SortKey;
};

export const DEFAULT_LIST_PARAMS: ListParams = { query: "", status: "all", sort: "activity" };

function isStatus(value: string | null): value is ContactStatus {
  return CONTACT_STATUSES.some((status) => status === value);
}

export function isSortKey(value: string | null): value is SortKey {
  return SORT_KEYS.some((key) => key === value);
}

/**
 * Reads ?q=&status=&sort= from the URL. Anything unknown (an old bookmark, a typo)
 * falls back to the default instead of showing an empty or broken list.
 */
export function parseListParams(params: URLSearchParams): ListParams {
  const status = params.get("status");
  const sort = params.get("sort");
  return {
    query: params.get("q") ?? "",
    status: isStatus(status) ? status : DEFAULT_LIST_PARAMS.status,
    sort: isSortKey(sort) ? sort : DEFAULT_LIST_PARAMS.sort,
  };
}

/** The reverse of parseListParams. Defaults are left out, so a fresh list is plain /contacts. */
export function toQueryString(params: ListParams): string {
  const search = new URLSearchParams();
  // Not trimmed: the search box would lose the space after "Amna " while someone types.
  if (params.query.trim()) search.set("q", params.query);
  if (params.status !== DEFAULT_LIST_PARAMS.status) search.set("status", params.status);
  if (params.sort !== DEFAULT_LIST_PARAMS.sort) search.set("sort", params.sort);
  return search.toString();
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Case-insensitive match on name, email or phone. Phone also matches on digits alone,
 * so "0104477" finds "+1 555 010 4477" however it was typed in.
 */
export function matchesQuery(contact: Contact, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  if (contact.fullName.toLowerCase().includes(needle)) return true;
  if (contact.email.toLowerCase().includes(needle)) return true;
  if (contact.phone.toLowerCase().includes(needle)) return true;

  // Only for number-like queries: "Amna 2" must not match every phone with a 2 in it.
  const looksLikePhone = /^[\d\s+\-()]+$/.test(needle);
  const needleDigits = digitsOnly(needle);
  return looksLikePhone && needleDigits.length >= 3 && digitsOnly(contact.phone).includes(needleDigits);
}

export function searchContacts(contacts: Contact[], query: string): Contact[] {
  return contacts.filter((contact) => matchesQuery(contact, query));
}

export function filterByStatus(contacts: Contact[], status: StatusFilter): Contact[] {
  if (status === "all") return contacts;
  return contacts.filter((contact) => contact.status === status);
}

const compareBy: Record<SortKey, (a: Contact, b: Contact) => number> = {
  // ISO strings in UTC sort correctly as text, newest first.
  activity: (a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt),
  name: (a, b) => a.fullName.localeCompare(b.fullName, "en", { sensitivity: "base" }),
  added: (a, b) => b.createdAt.localeCompare(a.createdAt),
};

/** Returns a new array; the query cache's array is never sorted in place. */
export function sortContacts(contacts: Contact[], sort: SortKey): Contact[] {
  return [...contacts].sort(compareBy[sort]);
}

export type StatusCounts = Record<StatusFilter, number>;

export function countByStatus(contacts: Contact[]): StatusCounts {
  const counts: StatusCounts = { all: contacts.length, lead: 0, active: 0, closed: 0 };
  for (const contact of contacts) counts[contact.status] += 1;
  return counts;
}

export type ListResult = {
  /** What the table shows: searched, filtered and sorted. */
  contacts: Contact[];
  /** Chip counts. They follow the search but not the status, so each chip says what clicking it would show. */
  counts: StatusCounts;
};

export function applyListParams(contacts: Contact[], params: ListParams): ListResult {
  const searched = searchContacts(contacts, params.query);
  return {
    contacts: sortContacts(filterByStatus(searched, params.status), params.sort),
    counts: countByStatus(searched),
  };
}
