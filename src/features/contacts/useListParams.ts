"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { parseListParams, toQueryString, type ListParams } from "./filters";

/**
 * Search, status and sort live in the URL, so a refresh, a shared link or the back
 * button all keep them. Callers must sit inside <Suspense> (useSearchParams).
 */
export function useListParams() {
  const searchParams = useSearchParams();

  const params = useMemo(
    () => parseListParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const setParams = useCallback((changes: Partial<ListParams>) => {
    // Read the URL as it is now, not as it was at the last render: a chip click during the
    // search debounce must not be overwritten by the search that fires after it.
    const current = parseListParams(new URLSearchParams(window.location.search));
    const queryString = toQueryString({ ...current, ...changes });
    const url = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
    // history.replaceState, not router.replace: Next.js applies it to useSearchParams at once,
    // without a server round-trip, so the URL can never lag behind the search box.
    // Replace, not push: a keystroke or chip click is not a page the back button should visit.
    window.history.replaceState(null, "", url);
  }, []);

  return { params, setParams };
}
