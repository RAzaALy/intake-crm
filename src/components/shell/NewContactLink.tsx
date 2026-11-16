"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonStyles } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Placement = "sidebar" | "topbar";

const NEW_CONTACT_PATH = "/contacts/new";

function NewContactLinkView({ placement, current }: { placement: Placement; current: boolean }) {
  // On the form itself this is "you are here", not a second primary action next to "Create contact".
  const className = cn(
    buttonStyles({ size: placement === "topbar" ? "sm" : "md" }),
    placement === "sidebar" && "w-full",
    current && "bg-primary-soft font-semibold text-primary hover:bg-primary-soft",
  );

  return (
    <Link
      href={NEW_CONTACT_PATH}
      aria-current={current ? "page" : undefined}
      // The phone label is "New", so the full name comes from aria-label.
      aria-label={placement === "topbar" ? "New contact" : undefined}
      className={className}
    >
      {placement === "topbar" ? (
        <>
          <span className="md:hidden">New</span>
          <span className="hidden md:inline">New contact</span>
        </>
      ) : (
        "New contact"
      )}
    </Link>
  );
}

function CurrentNewContactLink({ placement }: { placement: Placement }) {
  const pathname = usePathname();
  return <NewContactLinkView placement={placement} current={pathname === NEW_CONTACT_PATH} />;
}

/** The shell's New contact button. Same Suspense fallback pattern as MainNav, for dynamic routes. */
export function NewContactLink({ placement }: { placement: Placement }) {
  return (
    <Suspense fallback={<NewContactLinkView placement={placement} current={false} />}>
      <CurrentNewContactLink placement={placement} />
    </Suspense>
  );
}
