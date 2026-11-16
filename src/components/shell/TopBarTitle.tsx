"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { titleForPath } from "./navItems";

function CurrentTitle() {
  const pathname = usePathname();
  return <>{titleForPath(pathname)}</>;
}

/** Visual copy of the page h1 for phones. Hidden from screen readers, which get the real h1. */
export function TopBarTitle() {
  return (
    <span aria-hidden="true" className="truncate text-base font-semibold">
      <Suspense fallback="Intake">
        <CurrentTitle />
      </Suspense>
    </span>
  );
}
