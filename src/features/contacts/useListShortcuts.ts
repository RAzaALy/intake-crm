"use client";

import { useEffect, type RefObject } from "react";
import { useRouter } from "next/navigation";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/**
 * "/" focuses search and "n" opens New contact, so a coordinator on a call can stay
 * on the keyboard. Both are ignored while typing, and with Ctrl, Cmd or Alt held.
 */
export function useListShortcuts(searchRef: RefObject<HTMLInputElement | null>) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey || isTypingTarget(event.target)) return;
      // A held key repeats, and a menu or dialog may already have handled this one.
      if (event.repeat || event.defaultPrevented) return;

      if (event.key === "/") {
        // Without this the "/" would be typed into the box it just focused.
        event.preventDefault();
        searchRef.current?.focus();
      } else if (event.key === "n") {
        router.push("/contacts/new");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, searchRef]);
}
