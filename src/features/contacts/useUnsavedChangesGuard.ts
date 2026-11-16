"use client";

import { useEffect, useEffectEvent } from "react";

/**
 * Stops the person losing unsaved edits while `active` is true.
 * - Refresh or tab close: the browser's own confirm (pages can no longer set its text).
 * - Any in-app link (sidebar, tabs, Cancel): the click is stopped and `onLeaveAttempt`
 *   gets the link, so the form can ask first. Next.js has no "route change" event in the
 *   App Router, so the link click is the only place to catch this.
 */
export function useUnsavedChangesGuard(
  active: boolean,
  onLeaveAttempt: (link: HTMLAnchorElement, href: string) => void,
) {
  // An effect event always sees the latest callback without re-adding the listeners.
  const handleLeaveAttempt = useEffectEvent(onLeaveAttempt);

  useEffect(() => {
    if (!active) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    function handleClick(event: MouseEvent) {
      // New tab, new window or download keeps this page, so there is nothing to lose.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;
      // a[href] skips placeholder anchors, whose empty href would make new URL() throw.
      const link = event.target.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target || link.hasAttribute("download")) return;

      const url = new URL(link.href);
      // Other sites go through beforeunload; same-page links (the skip link) leave nothing.
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;

      // Capture phase runs before Next.js Link, which skips navigation when this is set.
      event.preventDefault();
      handleLeaveAttempt(link, url.pathname + url.search + url.hash);
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, { capture: true });
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, [active]);
}
